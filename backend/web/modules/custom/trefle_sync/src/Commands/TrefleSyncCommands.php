<?php

declare(strict_types=1);

namespace Drupal\trefle_sync\Commands;

use Drupal\trefle_sync\TrefleSyncServiceInterface;
use Drush\Attributes as CLI;
use Drush\Commands\DrushCommands;

/**
 * Drush commands for Trefle Sync module.
 */
class TrefleSyncCommands extends DrushCommands {

  /**
   * Constructs a TrefleSyncCommands object.
   *
   * @param \Drupal\trefle_sync\TrefleSyncServiceInterface $trefleSyncService
   *   The Trefle sync service.
   */
  public function __construct(
    protected TrefleSyncServiceInterface $trefleSyncService,
  ) {
    parent::__construct();
  }

  /**
   * Search for plants in Trefle.io API.
   */
  #[CLI\Command(name: 'trefle:search', aliases: ['trs'])]
  #[CLI\Argument(name: 'query', description: 'The search query (plant name)')]
  #[CLI\Option(name: 'page', description: 'Page number', suggestedValues: ['1', '2', '3'])]
  #[CLI\Usage(name: 'trefle:search "lavender"', description: 'Search for lavender plants')]
  #[CLI\Usage(name: 'trefle:search "ginseng" --page=2', description: 'Search for ginseng, page 2')]
  public function search(string $query, array $options = ['page' => 1]): void {
    $page = (int) ($options['page'] ?? 1);

    try {
      $results = $this->trefleSyncService->searchPlants($query, $page);
      $plants = $results['data'] ?? [];
      $meta = $results['meta'] ?? [];

      if (empty($plants)) {
        $this->io()->warning('No plants found matching: ' . $query);
        return;
      }

      $this->io()->title('Search Results for: ' . $query);
      $this->io()->text(sprintf(
        'Found %d plants (page %d of %d)',
        $meta['total'] ?? count($plants),
        $page,
        ceil(($meta['total'] ?? count($plants)) / 20)
      ));

      $rows = [];
      foreach ($plants as $plant) {
        $trefleId = $plant['id'] ?? 0;
        $existingNode = $this->trefleSyncService->findExistingHerb($trefleId);

        $rows[] = [
          $trefleId,
          $plant['common_name'] ?? '-',
          $plant['scientific_name'] ?? '-',
          $plant['family'] ?? '-',
          $existingNode ? 'Yes (nid: ' . $existingNode->id() . ')' : 'No',
        ];
      }

      $this->io()->table(
        ['Trefle ID', 'Common Name', 'Scientific Name', 'Family', 'Imported'],
        $rows
      );
    }
    catch (\Exception $e) {
      $this->io()->error('Search failed: ' . $e->getMessage());
    }
  }

  /**
   * Import a single plant from Trefle by ID.
   */
  #[CLI\Command(name: 'trefle:import', aliases: ['tri'])]
  #[CLI\Argument(name: 'trefle_id', description: 'The Trefle plant ID')]
  #[CLI\Usage(name: 'trefle:import 12345', description: 'Import plant with Trefle ID 12345')]
  public function import(string $trefle_id): void {
    $trefleId = (int) $trefle_id;

    $this->io()->text('Importing plant with Trefle ID: ' . $trefleId);

    try {
      $node = $this->trefleSyncService->importPlant($trefleId);

      if ($node) {
        $this->io()->success(sprintf(
          'Successfully imported: %s (Node ID: %d)',
          $node->getTitle(),
          $node->id()
        ));
      }
      else {
        $existing = $this->trefleSyncService->findExistingHerb($trefleId);
        if ($existing) {
          $this->io()->warning(sprintf(
            'Plant already exists and update is disabled. Node ID: %d',
            $existing->id()
          ));
        }
        else {
          $this->io()->error('Failed to import plant. Check the logs for details.');
        }
      }
    }
    catch (\Exception $e) {
      $this->io()->error('Import failed: ' . $e->getMessage());
    }
  }

  /**
   * Batch import plants from Trefle.
   */
  #[CLI\Command(name: 'trefle:batch-import', aliases: ['trbi'])]
  #[CLI\Option(name: 'pages', description: 'Number of pages to import (20 plants per page)', suggestedValues: ['1', '5', '10'])]
  #[CLI\Usage(name: 'trefle:batch-import --pages=5', description: 'Import 5 pages (100 plants) from Trefle')]
  public function batchImport(array $options = ['pages' => 1]): void {
    $pages = (int) ($options['pages'] ?? 1);

    $this->io()->title('Batch Import from Trefle.io');
    $this->io()->text(sprintf('Importing %d page(s) of plants...', $pages));

    $progressCallback = function (array $stats): void {
      $total = $stats['imported'] + $stats['updated'] + $stats['skipped'] + $stats['failed'];
      $this->io()->text(sprintf(
        'Progress: %d processed (imported: %d, updated: %d, skipped: %d, failed: %d)',
        $total,
        $stats['imported'],
        $stats['updated'],
        $stats['skipped'],
        $stats['failed']
      ));
    };

    try {
      $stats = $this->trefleSyncService->batchImport($pages, $progressCallback);

      $this->io()->newLine();
      $this->io()->section('Import Complete');
      $this->io()->definitionList(
        ['Imported' => $stats['imported']],
        ['Updated' => $stats['updated']],
        ['Skipped' => $stats['skipped']],
        ['Failed' => $stats['failed']]
      );

      if ($stats['imported'] + $stats['updated'] > 0) {
        $this->io()->success('Batch import completed successfully!');
      }
      elseif ($stats['skipped'] > 0) {
        $this->io()->warning('All plants were already imported (skipped).');
      }
      else {
        $this->io()->error('No plants were imported.');
      }
    }
    catch (\Exception $e) {
      $this->io()->error('Batch import failed: ' . $e->getMessage());
    }
  }

  /**
   * Display Trefle sync statistics.
   */
  #[CLI\Command(name: 'trefle:stats', aliases: ['trst'])]
  #[CLI\Usage(name: 'trefle:stats', description: 'Show sync statistics')]
  public function stats(): void {
    $stats = $this->trefleSyncService->getStats();

    $this->io()->title('Trefle Sync Statistics');

    $this->io()->definitionList(
      ['Total Synced' => $stats['total_synced']],
      ['Imported' => $stats['imported']],
      ['Updated' => $stats['updated']],
      ['Failed' => $stats['failed']],
      ['Last Sync' => $stats['last_sync'] ? date('Y-m-d H:i:s', $stats['last_sync']) : 'Never'],
      ['Rate Limit Remaining' => $stats['rate_limit_remaining'] . '/120']
    );

    // Test connection.
    $this->io()->text('Testing API connection...');
    if ($this->trefleSyncService->testConnection()) {
      $this->io()->success('API connection is working.');
    }
    else {
      $this->io()->error('API connection failed. Check your API key configuration.');
    }
  }

  /**
   * Test the API connection.
   */
  #[CLI\Command(name: 'trefle:test', aliases: ['trt'])]
  #[CLI\Usage(name: 'trefle:test', description: 'Test the Trefle API connection')]
  public function testConnection(): void {
    $this->io()->text('Testing Trefle.io API connection...');

    if ($this->trefleSyncService->testConnection()) {
      $this->io()->success('Connection successful! The Trefle API is accessible.');
    }
    else {
      $this->io()->error('Connection failed. Please check your API key at /admin/config/services/trefle-sync');
    }
  }

  /**
   * Show cron sync status and queue info.
   */
  #[CLI\Command(name: 'trefle:cron-status', aliases: ['trcs'])]
  #[CLI\Usage(name: 'trefle:cron-status', description: 'Show cron sync status')]
  public function cronStatus(): void {
    $config = \Drupal::config('trefle_sync.settings');

    $this->io()->title('Trefle Cron Sync Status');

    $enabled = $config->get('cron_enabled') ? 'Yes' : 'No';
    $currentPage = $config->get('cron_current_page') ?: 1;
    $totalPages = $config->get('cron_total_pages') ?: 0;
    $itemsPerRun = $config->get('cron_items_per_run') ?: 10;

    $this->io()->definitionList(
      ['Enabled' => $enabled],
      ['Current Page' => $currentPage],
      ['Total Pages' => $totalPages > 0 ? $totalPages : 'Unlimited'],
      ['Items Per Run' => $itemsPerRun]
    );

    // Show queue status.
    $queue = \Drupal::queue('trefle_sync_import');
    $queueCount = $queue->numberOfItems();

    $this->io()->section('Queue Status');
    $this->io()->definitionList(
      ['Items in Queue' => $queueCount]
    );

    if ($queueCount > 0) {
      $this->io()->text('Run "drush queue:run trefle_sync_import" to process the queue.');
    }
  }

  /**
   * Manually trigger cron sync to queue plants.
   */
  #[CLI\Command(name: 'trefle:cron-run', aliases: ['trcr'])]
  #[CLI\Usage(name: 'trefle:cron-run', description: 'Manually trigger cron sync')]
  public function cronRun(): void {
    $config = \Drupal::config('trefle_sync.settings');

    if (!$config->get('cron_enabled')) {
      $this->io()->warning('Cron sync is disabled. Enable it at /admin/config/services/trefle-sync');
      return;
    }

    $this->io()->text('Triggering cron sync...');

    // Call the cron hook directly.
    trefle_sync_cron();

    // Show queue status.
    $queue = \Drupal::queue('trefle_sync_import');
    $queueCount = $queue->numberOfItems();

    $this->io()->success(sprintf('Cron sync triggered. %d items now in queue.', $queueCount));
    $this->io()->text('Run "drush queue:run trefle_sync_import" to process the queue.');
  }

  /**
   * Reset cron sync progress to page 1.
   */
  #[CLI\Command(name: 'trefle:cron-reset', aliases: ['trcrs'])]
  #[CLI\Usage(name: 'trefle:cron-reset', description: 'Reset cron sync to page 1')]
  public function cronReset(): void {
    \Drupal::configFactory()->getEditable('trefle_sync.settings')
      ->set('cron_current_page', 1)
      ->save();

    $this->io()->success('Cron sync progress reset to page 1.');
  }

  /**
   * Process the import queue immediately.
   */
  #[CLI\Command(name: 'trefle:process-queue', aliases: ['trpq'])]
  #[CLI\Option(name: 'limit', description: 'Maximum items to process', suggestedValues: ['10', '50', '100'])]
  #[CLI\Usage(name: 'trefle:process-queue --limit=50', description: 'Process up to 50 queued items')]
  public function processQueue(array $options = ['limit' => 50]): void {
    $limit = (int) ($options['limit'] ?? 50);
    $queue = \Drupal::queue('trefle_sync_import');
    $queueCount = $queue->numberOfItems();

    if ($queueCount === 0) {
      $this->io()->warning('Queue is empty. Run "drush trefle:cron-run" to queue plants first.');
      return;
    }

    $this->io()->text(sprintf('Processing up to %d items from queue (%d total in queue)...', $limit, $queueCount));

    $processed = 0;
    $failed = 0;

    /** @var \Drupal\Core\Queue\QueueWorkerManagerInterface $queueManager */
    $queueManager = \Drupal::service('plugin.manager.queue_worker');
    $queueWorker = $queueManager->createInstance('trefle_sync_import');

    while ($processed < $limit && ($item = $queue->claimItem())) {
      try {
        $queueWorker->processItem($item->data);
        $queue->deleteItem($item);
        $processed++;
        $this->io()->text(sprintf('Processed: %s', $item->data['common_name'] ?? $item->data['trefle_id']));
      }
      catch (\Exception $e) {
        $queue->releaseItem($item);
        $failed++;
        $this->io()->error(sprintf('Failed: %s - %s', $item->data['trefle_id'] ?? 'unknown', $e->getMessage()));
      }
    }

    $this->io()->newLine();
    $this->io()->success(sprintf('Processed %d items (%d failed). %d items remaining in queue.',
      $processed,
      $failed,
      $queue->numberOfItems()
    ));
  }

}

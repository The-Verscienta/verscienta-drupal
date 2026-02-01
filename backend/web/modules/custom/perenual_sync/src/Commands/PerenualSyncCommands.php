<?php

declare(strict_types=1);

namespace Drupal\perenual_sync\Commands;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\perenual_sync\PerenualSyncServiceInterface;
use Drush\Attributes as CLI;
use Drush\Commands\DrushCommands;

/**
 * Drush commands for Perenual Sync module.
 */
class PerenualSyncCommands extends DrushCommands {

  /**
   * Constructs a PerenualSyncCommands object.
   */
  public function __construct(
    protected PerenualSyncServiceInterface $perenualSyncService,
    protected EntityTypeManagerInterface $entityTypeManager,
  ) {
    parent::__construct();
  }

  /**
   * Search for plants in Perenual API.
   */
  #[CLI\Command(name: 'perenual:search', aliases: ['ps'])]
  #[CLI\Argument(name: 'query', description: 'The search query (plant name)')]
  #[CLI\Option(name: 'page', description: 'Page number')]
  #[CLI\Usage(name: 'perenual:search "lavender"', description: 'Search for lavender plants')]
  public function search(string $query, array $options = ['page' => 1]): void {
    $page = (int) ($options['page'] ?? 1);

    try {
      $results = $this->perenualSyncService->searchPlants($query, $page);
      $plants = $results['data'] ?? [];

      if (empty($plants)) {
        $this->io()->warning('No plants found matching: ' . $query);
        return;
      }

      $this->io()->title('Search Results for: ' . $query);
      $this->io()->text(sprintf(
        'Found %d plants (page %d of %d)',
        $results['total'] ?? count($plants),
        $page,
        $results['last_page'] ?? 1
      ));

      $rows = [];
      foreach ($plants as $plant) {
        $perenualId = $plant['id'] ?? 0;
        $scientificName = is_array($plant['scientific_name'] ?? NULL)
          ? ($plant['scientific_name'][0] ?? '-')
          : ($plant['scientific_name'] ?? '-');
        $medicinal = !empty($plant['medicinal']) && $plant['medicinal'] === TRUE ? 'Yes' : 'No';

        $rows[] = [
          $perenualId,
          $plant['common_name'] ?? '-',
          $scientificName,
          ucfirst($plant['cycle'] ?? '-'),
          $medicinal,
        ];
      }

      $this->io()->table(
        ['ID', 'Common Name', 'Scientific Name', 'Cycle', 'Medicinal'],
        $rows
      );
    }
    catch (\Exception $e) {
      $this->io()->error('Search failed: ' . $e->getMessage());
    }
  }

  /**
   * Import a single plant from Perenual by ID.
   */
  #[CLI\Command(name: 'perenual:import', aliases: ['pi'])]
  #[CLI\Argument(name: 'perenual_id', description: 'The Perenual plant ID')]
  #[CLI\Usage(name: 'perenual:import 1', description: 'Import plant with Perenual ID 1')]
  public function import(string $perenual_id): void {
    $perenualId = (int) $perenual_id;

    $this->io()->text('Importing plant with Perenual ID: ' . $perenualId);

    try {
      $node = $this->perenualSyncService->importPlant($perenualId);

      if ($node) {
        $this->io()->success(sprintf(
          'Successfully imported: %s (Node ID: %d)',
          $node->getTitle(),
          $node->id()
        ));
      }
      else {
        $this->io()->error('Failed to import plant. Check the logs for details.');
      }
    }
    catch (\Exception $e) {
      $this->io()->error('Import failed: ' . $e->getMessage());
    }
  }

  /**
   * Batch import plants from Perenual.
   */
  #[CLI\Command(name: 'perenual:batch-import', aliases: ['pbi'])]
  #[CLI\Option(name: 'pages', description: 'Number of pages to import (30 plants per page)')]
  #[CLI\Usage(name: 'perenual:batch-import --pages=3', description: 'Import 3 pages (90 plants) from Perenual')]
  public function batchImport(array $options = ['pages' => 1]): void {
    $pages = (int) ($options['pages'] ?? 1);

    $this->io()->title('Batch Import from Perenual');
    $this->io()->text(sprintf('Importing %d page(s) of plants...', $pages));
    $this->io()->warning('Note: Perenual free tier allows 100 requests/day.');

    $progressCallback = function (array $stats): void {
      $total = $stats['imported'] + $stats['updated'] + $stats['skipped'] + $stats['failed'];
      $this->io()->text(sprintf(
        'Progress: %d processed (imported: %d, updated: %d, skipped: %d)',
        $total,
        $stats['imported'],
        $stats['updated'],
        $stats['skipped']
      ));
    };

    try {
      $stats = $this->perenualSyncService->batchImport($pages, $progressCallback);

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
    }
    catch (\Exception $e) {
      $this->io()->error('Batch import failed: ' . $e->getMessage());
    }
  }

  /**
   * Enrich existing herbs with Perenual data.
   */
  #[CLI\Command(name: 'perenual:enrich', aliases: ['pe'])]
  #[CLI\Option(name: 'limit', description: 'Maximum number of herbs to enrich')]
  #[CLI\Usage(name: 'perenual:enrich --limit=10', description: 'Enrich up to 10 herbs with Perenual data')]
  public function enrich(array $options = ['limit' => 10]): void {
    $limit = (int) ($options['limit'] ?? 10);

    $this->io()->title('Enriching Herbs with Perenual Data');
    $this->io()->text(sprintf('Processing up to %d herbs...', $limit));

    // Load herbs that might need enrichment.
    $nodeStorage = $this->entityTypeManager->getStorage('node');
    $query = $nodeStorage->getQuery()
      ->condition('type', 'herb')
      ->accessCheck(FALSE)
      ->range(0, $limit);

    $nids = $query->execute();
    $nodes = $nodeStorage->loadMultiple($nids);

    $enriched = 0;
    $skipped = 0;

    foreach ($nodes as $node) {
      try {
        $result = $this->perenualSyncService->enrichHerbNode($node);
        if ($result) {
          $enriched++;
          $this->io()->text('Enriched: ' . $node->getTitle());
        }
        else {
          $skipped++;
        }
      }
      catch (\Exception $e) {
        $this->io()->warning('Failed to enrich ' . $node->getTitle() . ': ' . $e->getMessage());
        $skipped++;
      }
    }

    $this->io()->newLine();
    $this->io()->definitionList(
      ['Enriched' => $enriched],
      ['Skipped' => $skipped]
    );

    if ($enriched > 0) {
      $this->io()->success('Enrichment completed!');
    }
  }

  /**
   * Display Perenual sync statistics.
   */
  #[CLI\Command(name: 'perenual:stats', aliases: ['pst'])]
  #[CLI\Usage(name: 'perenual:stats', description: 'Show sync statistics')]
  public function stats(): void {
    $stats = $this->perenualSyncService->getStats();

    $this->io()->title('Perenual Sync Statistics');

    $this->io()->definitionList(
      ['Total Synced' => $stats['total_synced']],
      ['Imported' => $stats['imported']],
      ['Updated' => $stats['updated']],
      ['Enriched' => $stats['enriched'] ?? 0],
      ['Skipped' => $stats['skipped'] ?? 0],
      ['Failed' => $stats['failed']],
      ['Last Sync' => $stats['last_sync'] ? date('Y-m-d H:i:s', $stats['last_sync']) : 'Never'],
      ['API Requests Remaining Today' => $stats['rate_limit_remaining'] . '/100']
    );

    $this->io()->text('Testing API connection...');
    if ($this->perenualSyncService->testConnection()) {
      $this->io()->success('API connection is working.');
    }
    else {
      $this->io()->error('API connection failed. Check your API key.');
    }
  }

}

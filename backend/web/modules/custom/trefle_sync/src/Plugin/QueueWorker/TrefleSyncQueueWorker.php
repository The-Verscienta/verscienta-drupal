<?php

declare(strict_types=1);

namespace Drupal\trefle_sync\Plugin\QueueWorker;

use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\Queue\QueueWorkerBase;
use Drupal\trefle_sync\TrefleSyncServiceInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Processes Trefle plant imports from the queue.
 *
 * @QueueWorker(
 *   id = "trefle_sync_import",
 *   title = @Translation("Trefle Sync Import"),
 *   cron = {"time" = 60}
 * )
 */
class TrefleSyncQueueWorker extends QueueWorkerBase implements ContainerFactoryPluginInterface {

  /**
   * The Trefle sync service.
   *
   * @var \Drupal\trefle_sync\TrefleSyncServiceInterface
   */
  protected TrefleSyncServiceInterface $trefleSyncService;

  /**
   * The logger.
   *
   * @var \Psr\Log\LoggerInterface
   */
  protected LoggerInterface $logger;

  /**
   * Constructs a TrefleSyncQueueWorker object.
   *
   * @param array $configuration
   *   A configuration array containing information about the plugin instance.
   * @param string $plugin_id
   *   The plugin_id for the plugin instance.
   * @param mixed $plugin_definition
   *   The plugin implementation definition.
   * @param \Drupal\trefle_sync\TrefleSyncServiceInterface $trefle_sync_service
   *   The Trefle sync service.
   * @param \Psr\Log\LoggerInterface $logger
   *   The logger.
   */
  public function __construct(
    array $configuration,
    $plugin_id,
    $plugin_definition,
    TrefleSyncServiceInterface $trefle_sync_service,
    LoggerInterface $logger,
  ) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
    $this->trefleSyncService = $trefle_sync_service;
    $this->logger = $logger;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition): static {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('trefle_sync.service'),
      $container->get('logger.factory')->get('trefle_sync'),
    );
  }

  /**
   * {@inheritdoc}
   */
  public function processItem($data): void {
    if (!isset($data['trefle_id'])) {
      $this->logger->warning('Queue item missing trefle_id');
      return;
    }

    $trefleId = (int) $data['trefle_id'];

    try {
      $result = $this->trefleSyncService->importPlant($trefleId);

      if ($result['status'] === 'imported') {
        $this->logger->info('Cron imported plant @id: @title', [
          '@id' => $trefleId,
          '@title' => $result['node']->getTitle(),
        ]);
      }
      elseif ($result['status'] === 'updated') {
        $this->logger->info('Cron updated plant @id: @title', [
          '@id' => $trefleId,
          '@title' => $result['node']->getTitle(),
        ]);
      }
      elseif ($result['status'] === 'skipped') {
        $this->logger->notice('Cron skipped plant @id: @reason', [
          '@id' => $trefleId,
          '@reason' => $result['message'] ?? 'Already exists or filtered',
        ]);
      }
    }
    catch (\Exception $e) {
      $this->logger->error('Cron failed to import plant @id: @message', [
        '@id' => $trefleId,
        '@message' => $e->getMessage(),
      ]);
      // Re-throw to mark the queue item as failed.
      throw $e;
    }
  }

}

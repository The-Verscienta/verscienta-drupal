<?php

declare(strict_types=1);

namespace Drupal\perenual_sync;

use Drupal\node\NodeInterface;

/**
 * Interface for the Perenual Sync service.
 */
interface PerenualSyncServiceInterface {

  /**
   * The Perenual API base URL.
   */
  public const API_BASE_URL = 'https://perenual.com/api/v2';

  /**
   * Search for plants by name.
   *
   * @param string $query
   *   The search query.
   * @param int $page
   *   The page number (1-indexed).
   * @param array $filters
   *   Optional filters (edible, medicinal, etc.).
   *
   * @return array
   *   The search results containing 'data' and pagination info.
   */
  public function searchPlants(string $query, int $page = 1, array $filters = []): array;

  /**
   * Get detailed plant data by Perenual ID.
   *
   * @param int $perenualId
   *   The Perenual plant ID.
   *
   * @return array|null
   *   The plant data or NULL if not found.
   */
  public function getPlantDetails(int $perenualId): ?array;

  /**
   * Search for a plant by scientific name.
   *
   * @param string $scientificName
   *   The scientific name to search for.
   *
   * @return array|null
   *   The first matching plant data or NULL.
   */
  public function findByScientificName(string $scientificName): ?array;

  /**
   * Import a single plant from Perenual into Drupal.
   *
   * @param int $perenualId
   *   The Perenual plant ID.
   *
   * @return \Drupal\node\NodeInterface|null
   *   The created or updated node, or NULL on failure.
   */
  public function importPlant(int $perenualId): ?NodeInterface;

  /**
   * Enrich an existing herb node with data from Perenual.
   *
   * This fills in missing fields without overwriting existing data.
   *
   * @param \Drupal\node\NodeInterface $node
   *   The herb node to enrich.
   * @param array|null $perenualData
   *   Optional pre-fetched Perenual data. If NULL, will search by name.
   *
   * @return bool
   *   TRUE if the node was enriched and saved, FALSE otherwise.
   */
  public function enrichHerbNode(NodeInterface $node, ?array $perenualData = NULL): bool;

  /**
   * Batch import plants from Perenual.
   *
   * @param int $pages
   *   The number of pages to import.
   * @param callable|null $progressCallback
   *   Optional callback for progress updates.
   *
   * @return array
   *   Import statistics.
   */
  public function batchImport(int $pages = 1, ?callable $progressCallback = NULL): array;

  /**
   * Check if the API connection is working.
   *
   * @return bool
   *   TRUE if the connection is valid, FALSE otherwise.
   */
  public function testConnection(): bool;

  /**
   * Get sync statistics.
   *
   * @return array
   *   Statistics including total synced, last sync time, etc.
   */
  public function getStats(): array;

  /**
   * Check if a plant has nutritional or medicinal benefits.
   *
   * @param array $plantData
   *   The plant data from Perenual API.
   *
   * @return bool
   *   TRUE if the plant has benefits, FALSE otherwise.
   */
  public function hasNutritionalOrMedicinalBenefits(array $plantData): bool;

}

<?php

declare(strict_types=1);

namespace Drupal\trefle_sync;

use Drupal\node\NodeInterface;

/**
 * Interface for the Trefle Sync service.
 */
interface TrefleSyncServiceInterface {

  /**
   * The Trefle API base URL.
   */
  public const API_BASE_URL = 'https://trefle.io/api/v1';

  /**
   * Search for plants by name.
   *
   * @param string $query
   *   The search query.
   * @param int $page
   *   The page number (1-indexed).
   *
   * @return array
   *   The search results containing 'data' and 'meta' keys.
   *
   * @throws \Drupal\trefle_sync\Exception\TrefleSyncException
   */
  public function searchPlants(string $query, int $page = 1): array;

  /**
   * Get a single plant by its Trefle ID.
   *
   * @param int $trefleId
   *   The Trefle plant ID.
   *
   * @return array|null
   *   The plant data or NULL if not found.
   *
   * @throws \Drupal\trefle_sync\Exception\TrefleSyncException
   */
  public function getPlant(int $trefleId): ?array;

  /**
   * Get species details by Trefle ID.
   *
   * @param int $trefleId
   *   The Trefle species ID.
   *
   * @return array|null
   *   The species data or NULL if not found.
   *
   * @throws \Drupal\trefle_sync\Exception\TrefleSyncException
   */
  public function getSpecies(int $trefleId): ?array;

  /**
   * Import a single plant from Trefle into Drupal.
   *
   * @param int $trefleId
   *   The Trefle plant ID.
   *
   * @return \Drupal\node\NodeInterface|null
   *   The created or updated node, or NULL on failure.
   *
   * @throws \Drupal\trefle_sync\Exception\TrefleSyncException
   */
  public function importPlant(int $trefleId): ?NodeInterface;

  /**
   * Batch import plants from Trefle.
   *
   * @param int $pages
   *   The number of pages to import.
   * @param callable|null $progressCallback
   *   Optional callback for progress updates.
   *
   * @return array
   *   Import statistics with 'imported', 'updated', 'skipped', 'failed' counts.
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
   * Find an existing herb node by Trefle ID.
   *
   * @param int $trefleId
   *   The Trefle plant ID.
   *
   * @return \Drupal\node\NodeInterface|null
   *   The existing node or NULL if not found.
   */
  public function findExistingHerb(int $trefleId): ?NodeInterface;

  /**
   * Get a paginated list of plants from Trefle.
   *
   * @param int $page
   *   The page number (1-indexed).
   * @param array $filters
   *   Optional filters to apply (e.g., 'edible', 'vegetable').
   *
   * @return array
   *   The response containing 'data' and 'meta' keys.
   *
   * @throws \Drupal\trefle_sync\Exception\TrefleSyncException
   */
  public function getPlants(int $page = 1, array $filters = []): array;

  /**
   * Check if a plant has nutritional or medicinal benefits.
   *
   * @param array $plantData
   *   The plant data from Trefle API.
   *
   * @return bool
   *   TRUE if the plant has nutritional/medicinal benefits.
   */
  public function hasNutritionalOrMedicinalBenefits(array $plantData): bool;

}

<?php

declare(strict_types=1);

namespace Drupal\trefle_sync;

use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Logger\LoggerChannelFactoryInterface;
use Drupal\Core\State\StateInterface;
use Drupal\key\KeyRepositoryInterface;
use Drupal\node\NodeInterface;
use GuzzleHttp\ClientInterface;
use GuzzleHttp\Exception\GuzzleException;
use Psr\Log\LoggerInterface;

/**
 * Main service for syncing plant data from Trefle.io API.
 */
class TrefleSyncService implements TrefleSyncServiceInterface {

  /**
   * The logger.
   *
   * @var \Psr\Log\LoggerInterface
   */
  protected LoggerInterface $logger;

  /**
   * The configuration.
   *
   * @var \Drupal\Core\Config\ImmutableConfig
   */
  protected $config;

  /**
   * Constructs a TrefleSyncService object.
   *
   * @param \GuzzleHttp\ClientInterface $httpClient
   *   The HTTP client.
   * @param \Drupal\Core\Config\ConfigFactoryInterface $configFactory
   *   The config factory.
   * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entityTypeManager
   *   The entity type manager.
   * @param \Drupal\Core\Logger\LoggerChannelFactoryInterface $loggerFactory
   *   The logger factory.
   * @param \Drupal\Core\State\StateInterface $state
   *   The state service.
   * @param \Drupal\key\KeyRepositoryInterface $keyRepository
   *   The key repository.
   * @param \Drupal\trefle_sync\TrefleRateLimiter $rateLimiter
   *   The rate limiter.
   * @param \Drupal\trefle_sync\TrefleFieldMapper $fieldMapper
   *   The field mapper.
   * @param \Drupal\trefle_sync\TrefleImageHandler $imageHandler
   *   The image handler.
   */
  public function __construct(
    protected ClientInterface $httpClient,
    ConfigFactoryInterface $configFactory,
    protected EntityTypeManagerInterface $entityTypeManager,
    LoggerChannelFactoryInterface $loggerFactory,
    protected StateInterface $state,
    protected KeyRepositoryInterface $keyRepository,
    protected TrefleRateLimiter $rateLimiter,
    protected TrefleFieldMapper $fieldMapper,
    protected TrefleImageHandler $imageHandler,
  ) {
    $this->config = $configFactory->get('trefle_sync.settings');
    $this->logger = $loggerFactory->get('trefle_sync');
  }

  /**
   * {@inheritdoc}
   */
  public function searchPlants(string $query, int $page = 1): array {
    $params = [
      'q' => $query,
      'page' => $page,
    ];

    // Add edible filter if enabled.
    if ($this->config->get('filter_edible_only')) {
      $params['filter[edible]'] = 'true';
    }

    return $this->request('/plants/search', $params);
  }

  /**
   * {@inheritdoc}
   */
  public function getPlant(int $trefleId): ?array {
    try {
      $response = $this->request('/plants/' . $trefleId);
      return $response['data'] ?? NULL;
    }
    catch (\Exception $e) {
      $this->logger->warning('Failed to get plant @id: @message', [
        '@id' => $trefleId,
        '@message' => $e->getMessage(),
      ]);
      return NULL;
    }
  }

  /**
   * {@inheritdoc}
   */
  public function getSpecies(int $trefleId): ?array {
    try {
      $response = $this->request('/species/' . $trefleId);
      return $response['data'] ?? NULL;
    }
    catch (\Exception $e) {
      $this->logger->warning('Failed to get species @id: @message', [
        '@id' => $trefleId,
        '@message' => $e->getMessage(),
      ]);
      return NULL;
    }
  }

  /**
   * {@inheritdoc}
   */
  public function getPlants(int $page = 1, array $filters = []): array {
    $params = [
      'page' => $page,
    ];

    // Apply configured filters.
    if ($this->config->get('filter_edible_only')) {
      $params['filter[edible]'] = 'true';
    }
    if ($this->config->get('filter_vegetable')) {
      $params['filter[vegetable]'] = 'true';
    }

    // Merge any additional filters.
    $params = array_merge($params, $filters);

    return $this->request('/plants', $params);
  }

  /**
   * {@inheritdoc}
   */
  public function importPlant(int $trefleId): ?NodeInterface {
    // Check for existing node by Trefle ID.
    $existingNode = $this->findExistingHerb($trefleId);

    // If exists and update not enabled, skip.
    if ($existingNode && !$this->config->get('update_existing')) {
      $this->log('Skipping existing plant @id (update disabled)', ['@id' => $trefleId]);
      return NULL;
    }

    // Fetch plant data from Trefle.
    $plantData = $this->getPlant($trefleId);
    if (!$plantData) {
      $this->logger->error('Failed to fetch plant data for Trefle ID @id', ['@id' => $trefleId]);
      return NULL;
    }

    // Try to get more detailed species data.
    $speciesData = $this->getSpecies($trefleId);
    if ($speciesData) {
      $plantData = array_merge($plantData, $speciesData);
    }

    // Check if plant has nutritional/medicinal benefits.
    if (!$this->hasNutritionalOrMedicinalBenefits($plantData)) {
      $this->log('Skipping plant @id - no nutritional/medicinal benefits detected', [
        '@id' => $trefleId,
      ]);
      $this->incrementStat('skipped');
      return NULL;
    }

    // Check if herb already exists by name (scientific name or common name).
    if ($this->config->get('skip_existing_herbs') && !$existingNode) {
      $existingByName = $this->findExistingHerbByName($plantData);
      if ($existingByName) {
        $this->log('Skipping plant @id - herb "@name" already exists (Node ID: @nid)', [
          '@id' => $trefleId,
          '@name' => $existingByName->getTitle(),
          '@nid' => $existingByName->id(),
        ]);
        $this->incrementStat('skipped');
        return NULL;
      }
    }

    try {
      // Map data to node.
      $node = $this->fieldMapper->mapToNode($plantData, $existingNode);

      // Handle images if enabled.
      if ($this->config->get('sync_images')) {
        $imagesAttached = $this->imageHandler->attachImages($plantData, $node);
        $this->log('Attached @count images to plant @id', [
          '@count' => $imagesAttached,
          '@id' => $trefleId,
        ]);
      }

      // Save the node.
      $node->save();

      // Update statistics.
      $this->incrementStat($existingNode ? 'updated' : 'imported');

      $this->log('Successfully @action plant: @title (Trefle ID: @id)', [
        '@action' => $existingNode ? 'updated' : 'imported',
        '@title' => $node->getTitle(),
        '@id' => $trefleId,
      ]);

      // Use Perenual as fallback to fill in missing data.
      if ($this->config->get('use_perenual_fallback')) {
        $this->enrichWithPerenual($node);
      }

      return $node;
    }
    catch (\Exception $e) {
      $this->logger->error('Failed to save plant @id: @message', [
        '@id' => $trefleId,
        '@message' => $e->getMessage(),
      ]);
      $this->incrementStat('failed');
      return NULL;
    }
  }

  /**
   * {@inheritdoc}
   */
  public function batchImport(int $pages = 1, ?callable $progressCallback = NULL): array {
    $stats = [
      'imported' => 0,
      'updated' => 0,
      'skipped' => 0,
      'failed' => 0,
    ];

    $params = ['page' => 1];

    // Add edible filter to batch import.
    if ($this->config->get('filter_edible_only')) {
      $params['filter[edible]'] = 'true';
    }

    for ($page = 1; $page <= $pages; $page++) {
      try {
        $params['page'] = $page;
        $response = $this->request('/species', $params);
        $plants = $response['data'] ?? [];

        foreach ($plants as $plant) {
          $trefleId = $plant['id'] ?? NULL;
          if (!$trefleId) {
            continue;
          }

          // Quick check for nutritional benefits from list data.
          if (!$this->hasNutritionalOrMedicinalBenefits($plant)) {
            $stats['skipped']++;
            $this->log('Skipping plant @id from batch - no benefits', ['@id' => $trefleId]);
            continue;
          }

          $existingNode = $this->findExistingHerb($trefleId);

          if ($existingNode && !$this->config->get('update_existing')) {
            $stats['skipped']++;
            continue;
          }

          // Check if herb already exists by name.
          if ($this->config->get('skip_existing_herbs') && !$existingNode) {
            $existingByName = $this->findExistingHerbByName($plant);
            if ($existingByName) {
              $stats['skipped']++;
              continue;
            }
          }

          $result = $this->importPlant($trefleId);

          if ($result) {
            if ($existingNode) {
              $stats['updated']++;
            }
            else {
              $stats['imported']++;
            }
          }
          else {
            // Check if it was skipped or failed.
            // ImportPlant already incremented the stat.
          }

          if ($progressCallback) {
            $progressCallback($stats);
          }
        }
      }
      catch (\Exception $e) {
        $this->logger->error('Batch import error on page @page: @message', [
          '@page' => $page,
          '@message' => $e->getMessage(),
        ]);
      }
    }

    // Update last sync time.
    $this->state->set('trefle_sync.last_sync', time());

    return $stats;
  }

  /**
   * {@inheritdoc}
   */
  public function testConnection(): bool {
    try {
      $response = $this->request('/plants', ['page' => 1]);
      return isset($response['data']);
    }
    catch (\Exception $e) {
      $this->logger->error('API connection test failed: @message', [
        '@message' => $e->getMessage(),
      ]);
      return FALSE;
    }
  }

  /**
   * {@inheritdoc}
   */
  public function getStats(): array {
    return [
      'total_synced' => $this->state->get('trefle_sync.stats.imported', 0) + $this->state->get('trefle_sync.stats.updated', 0),
      'imported' => $this->state->get('trefle_sync.stats.imported', 0),
      'updated' => $this->state->get('trefle_sync.stats.updated', 0),
      'skipped' => $this->state->get('trefle_sync.stats.skipped', 0),
      'failed' => $this->state->get('trefle_sync.stats.failed', 0),
      'last_sync' => $this->state->get('trefle_sync.last_sync'),
      'rate_limit_remaining' => $this->rateLimiter->getRemainingRequests(),
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function findExistingHerb(int $trefleId): ?NodeInterface {
    $nodeStorage = $this->entityTypeManager->getStorage('node');

    $nodes = $nodeStorage->loadByProperties([
      'type' => 'herb',
      'field_trefle_id' => $trefleId,
    ]);

    return !empty($nodes) ? reset($nodes) : NULL;
  }

  /**
   * Find an existing herb by scientific name or common name.
   *
   * @param array $plantData
   *   The plant data from Trefle API.
   *
   * @return \Drupal\node\NodeInterface|null
   *   The existing node or NULL if not found.
   */
  public function findExistingHerbByName(array $plantData): ?NodeInterface {
    $nodeStorage = $this->entityTypeManager->getStorage('node');

    // Check by scientific name first.
    $scientificName = $plantData['scientific_name'] ?? NULL;
    if ($scientificName) {
      // Check field_scientific_name.
      $nodes = $nodeStorage->loadByProperties([
        'type' => 'herb',
        'field_scientific_name' => $scientificName,
      ]);
      if (!empty($nodes)) {
        return reset($nodes);
      }
    }

    // Check by common name (title).
    $commonName = $plantData['common_name'] ?? NULL;
    if ($commonName) {
      $nodes = $nodeStorage->loadByProperties([
        'type' => 'herb',
        'title' => $commonName,
      ]);
      if (!empty($nodes)) {
        return reset($nodes);
      }
    }

    return NULL;
  }

  /**
   * Check if a plant has nutritional or medicinal benefits.
   *
   * @param array $plantData
   *   The plant data from Trefle API.
   *
   * @return bool
   *   TRUE if the plant has benefits, FALSE otherwise.
   */
  public function hasNutritionalOrMedicinalBenefits(array $plantData): bool {
    // Check if edible.
    if (!empty($plantData['edible']) && $plantData['edible'] === TRUE) {
      return TRUE;
    }

    // Check if vegetable.
    if ($this->config->get('filter_vegetable') && !empty($plantData['vegetable']) && $plantData['vegetable'] === TRUE) {
      return TRUE;
    }

    // Check if has edible parts.
    if (!empty($plantData['edible_part']) && is_array($plantData['edible_part']) && count($plantData['edible_part']) > 0) {
      return TRUE;
    }

    // Check main_species for edibility info.
    $mainSpecies = $plantData['main_species'] ?? [];
    if (!empty($mainSpecies['edible']) && $mainSpecies['edible'] === TRUE) {
      return TRUE;
    }
    if (!empty($mainSpecies['edible_part']) && is_array($mainSpecies['edible_part']) && count($mainSpecies['edible_part']) > 0) {
      return TRUE;
    }
    if ($this->config->get('filter_vegetable') && !empty($mainSpecies['vegetable']) && $mainSpecies['vegetable'] === TRUE) {
      return TRUE;
    }

    // Check specifications for edibility.
    $specifications = $plantData['specifications'] ?? $mainSpecies['specifications'] ?? [];
    if (!empty($specifications['edible']) && $specifications['edible'] === TRUE) {
      return TRUE;
    }

    // Check for known medicinal plant families.
    $medicinalFamilies = [
      'Lamiaceae',      // Mint family (lavender, rosemary, thyme, sage, basil)
      'Asteraceae',     // Daisy family (chamomile, echinacea, calendula)
      'Apiaceae',       // Carrot family (fennel, dill, parsley, cilantro)
      'Zingiberaceae',  // Ginger family (ginger, turmeric)
      'Fabaceae',       // Legume family (licorice)
      'Rosaceae',       // Rose family (rose hips, hawthorn)
      'Valerianaceae',  // Valerian family
      'Papaveraceae',   // Poppy family
      'Solanaceae',     // Nightshade family (some medicinal, be careful)
    ];

    $family = $plantData['family'] ?? $mainSpecies['family'] ?? NULL;
    if ($family && in_array($family, $medicinalFamilies, TRUE)) {
      return TRUE;
    }

    return FALSE;
  }

  /**
   * Make an API request to Trefle.
   *
   * @param string $endpoint
   *   The API endpoint.
   * @param array $params
   *   Query parameters.
   *
   * @return array
   *   The response data.
   *
   * @throws \Exception
   *   If the request fails.
   */
  protected function request(string $endpoint, array $params = []): array {
    // Check rate limit.
    if (!$this->rateLimiter->waitForAvailability()) {
      throw new \Exception('Rate limit exceeded, please try again later.');
    }

    $token = $this->getApiToken();
    if (!$token) {
      throw new \Exception('API token not configured. Please configure the Trefle API key.');
    }

    // Add token to params.
    $params['token'] = $token;

    $url = self::API_BASE_URL . $endpoint;

    try {
      $response = $this->httpClient->request('GET', $url, [
        'query' => $params,
        'headers' => [
          'Accept' => 'application/json',
        ],
        'timeout' => 30,
      ]);

      // Record the request for rate limiting.
      $this->rateLimiter->recordRequest();

      $body = $response->getBody()->getContents();
      $data = json_decode($body, TRUE);

      if (json_last_error() !== JSON_ERROR_NONE) {
        throw new \Exception('Invalid JSON response from API');
      }

      return $data;
    }
    catch (GuzzleException $e) {
      $this->rateLimiter->recordRequest();
      throw new \Exception('API request failed: ' . $e->getMessage());
    }
  }

  /**
   * Get the API token from Key module.
   *
   * @return string|null
   *   The API token or NULL.
   */
  protected function getApiToken(): ?string {
    $keyId = $this->config->get('api_key_id');
    if (!$keyId) {
      return NULL;
    }

    $key = $this->keyRepository->getKey($keyId);
    if (!$key) {
      return NULL;
    }

    return $key->getKeyValue();
  }

  /**
   * Log a message if logging is enabled.
   *
   * @param string $message
   *   The message.
   * @param array $context
   *   The context.
   */
  protected function log(string $message, array $context = []): void {
    if ($this->config->get('enable_logging')) {
      $this->logger->info($message, $context);
    }
  }

  /**
   * Increment a statistics counter.
   *
   * @param string $stat
   *   The stat name.
   */
  protected function incrementStat(string $stat): void {
    $key = 'trefle_sync.stats.' . $stat;
    $current = $this->state->get($key, 0);
    $this->state->set($key, $current + 1);
  }

  /**
   * Enrich a node with data from Perenual if the module is available.
   *
   * @param \Drupal\node\NodeInterface $node
   *   The node to enrich.
   */
  protected function enrichWithPerenual(NodeInterface $node): void {
    // Check if perenual_sync module is enabled.
    if (!\Drupal::moduleHandler()->moduleExists('perenual_sync')) {
      return;
    }

    // Check if Perenual fallback is enabled in Perenual's config.
    $perenualConfig = \Drupal::config('perenual_sync.settings');
    if (!$perenualConfig->get('use_as_fallback')) {
      return;
    }

    try {
      $perenualService = \Drupal::service('perenual_sync.service');
      $enriched = $perenualService->enrichHerbNode($node);

      if ($enriched) {
        $this->log('Enriched plant @title with Perenual data', [
          '@title' => $node->getTitle(),
        ]);
      }
    }
    catch (\Exception $e) {
      // Perenual enrichment is optional, so just log and continue.
      $this->logger->notice('Perenual enrichment failed for @title: @message', [
        '@title' => $node->getTitle(),
        '@message' => $e->getMessage(),
      ]);
    }
  }

}

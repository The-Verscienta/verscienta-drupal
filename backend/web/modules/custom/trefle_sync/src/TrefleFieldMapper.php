<?php

declare(strict_types=1);

namespace Drupal\trefle_sync;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\node\NodeInterface;

/**
 * Maps Trefle API data to Drupal herb node fields.
 */
class TrefleFieldMapper {

  /**
   * Constructs a TrefleFieldMapper object.
   *
   * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entityTypeManager
   *   The entity type manager.
   */
  public function __construct(
    protected EntityTypeManagerInterface $entityTypeManager,
  ) {}

  /**
   * Map Trefle plant data to a node.
   *
   * @param array $plantData
   *   The plant data from Trefle API.
   * @param \Drupal\node\NodeInterface|null $existingNode
   *   An existing node to update, or NULL to create new.
   *
   * @return \Drupal\node\NodeInterface
   *   The mapped node (not yet saved).
   */
  public function mapToNode(array $plantData, ?NodeInterface $existingNode = NULL): NodeInterface {
    $nodeStorage = $this->entityTypeManager->getStorage('node');

    if ($existingNode) {
      $node = $existingNode;
    }
    else {
      $node = $nodeStorage->create([
        'type' => 'herb',
        'status' => 0, // Unpublished by default.
      ]);
    }

    // Title from common_name or scientific_name.
    $title = $plantData['common_name'] ?? $plantData['scientific_name'] ?? 'Unknown Plant';
    $node->setTitle($title);

    // Trefle ID for tracking.
    if ($node->hasField('field_trefle_id')) {
      $node->set('field_trefle_id', $plantData['id'] ?? NULL);
    }

    // Scientific name.
    if ($node->hasField('field_scientific_name') && !empty($plantData['scientific_name'])) {
      $node->set('field_scientific_name', $plantData['scientific_name']);
    }

    // Family.
    if ($node->hasField('field_family') && !empty($plantData['family'])) {
      $node->set('field_family', $plantData['family']);
    }

    // Genus.
    if ($node->hasField('field_genus') && !empty($plantData['genus'])) {
      $node->set('field_genus', $plantData['genus']);
    }

    // Species (parsed from scientific name).
    if ($node->hasField('field_species') && !empty($plantData['scientific_name'])) {
      $species = $this->parseSpeciesFromScientificName($plantData['scientific_name']);
      if ($species) {
        $node->set('field_species', $species);
      }
    }

    // Plant type from growth habit.
    if ($node->hasField('field_plant_type')) {
      $plantType = $this->mapGrowthHabit($plantData);
      if ($plantType) {
        $node->set('field_plant_type', $plantType);
      }
    }

    // Native region from distribution.
    if ($node->hasField('field_native_region')) {
      $nativeRegion = $this->mapNativeRegion($plantData);
      if ($nativeRegion) {
        $node->set('field_native_region', $nativeRegion);
      }
    }

    // Synonyms.
    if ($node->hasField('field_synonyms') && !empty($plantData['synonyms'])) {
      $synonyms = is_array($plantData['synonyms'])
        ? implode(', ', $plantData['synonyms'])
        : $plantData['synonyms'];
      $node->set('field_synonyms', $synonyms);
    }

    // Conservation status.
    if ($node->hasField('field_conservation_status') && !empty($plantData['status'])) {
      $node->set('field_conservation_status', $plantData['status']);
    }

    // Botanical description (composite field).
    if ($node->hasField('field_botanical_description')) {
      $description = $this->buildBotanicalDescription($plantData);
      if ($description) {
        $node->set('field_botanical_description', [
          'value' => $description,
          'format' => 'basic_html',
        ]);
      }
    }

    // Growing conditions (composite field).
    if ($node->hasField('field_growing_conditions')) {
      $growingConditions = $this->buildGrowingConditions($plantData);
      if ($growingConditions) {
        $node->set('field_growing_conditions', [
          'value' => $growingConditions,
          'format' => 'basic_html',
        ]);
      }
    }

    // Harvest season from bloom/fruit months.
    if ($node->hasField('field_harvest_season')) {
      $harvestSeason = $this->mapHarvestSeason($plantData);
      if ($harvestSeason) {
        $node->set('field_harvest_season', $harvestSeason);
      }
    }

    // Contraindications from toxicity.
    if ($node->hasField('field_contraindications') && !empty($plantData['toxicity'])) {
      $toxicity = is_array($plantData['toxicity'])
        ? implode(', ', array_map(fn($v) => htmlspecialchars((string) $v, ENT_QUOTES, 'UTF-8'), $plantData['toxicity']))
        : htmlspecialchars((string) $plantData['toxicity'], ENT_QUOTES, 'UTF-8');
      $node->set('field_contraindications', [
        'value' => '<p><strong>Toxicity:</strong> ' . $toxicity . '</p>',
        'format' => 'basic_html',
      ]);
    }

    // Parts used from edible_part.
    if ($node->hasField('field_parts_used') && !empty($plantData['edible_part'])) {
      $partsUsed = is_array($plantData['edible_part'])
        ? implode(', ', $plantData['edible_part'])
        : $plantData['edible_part'];
      $node->set('field_parts_used', $partsUsed);
    }

    return $node;
  }

  /**
   * Parse species epithet from scientific name.
   *
   * @param string $scientificName
   *   The full scientific name (e.g., "Lavandula angustifolia").
   *
   * @return string|null
   *   The species epithet or NULL.
   */
  protected function parseSpeciesFromScientificName(string $scientificName): ?string {
    $parts = explode(' ', trim($scientificName));
    return $parts[1] ?? NULL;
  }

  /**
   * Map growth habit to plant type.
   *
   * @param array $plantData
   *   The plant data.
   *
   * @return string|null
   *   The plant type or NULL.
   */
  protected function mapGrowthHabit(array $plantData): ?string {
    $growth = $plantData['growth'] ?? [];
    $habit = $growth['habit'] ?? $plantData['growth_habit'] ?? NULL;

    if (!$habit) {
      return NULL;
    }

    // Map common growth habits to plant types.
    $habitMap = [
      'tree' => 'Tree',
      'shrub' => 'Shrub',
      'herb' => 'Herb',
      'vine' => 'Vine',
      'grass' => 'Grass',
      'forb' => 'Herb',
      'subshrub' => 'Shrub',
      'graminoid' => 'Grass',
    ];

    $habitLower = strtolower($habit);
    return $habitMap[$habitLower] ?? ucfirst($habit);
  }

  /**
   * Map native distribution to region string.
   *
   * @param array $plantData
   *   The plant data.
   *
   * @return string|null
   *   The native region or NULL.
   */
  protected function mapNativeRegion(array $plantData): ?string {
    $distribution = $plantData['distribution'] ?? [];
    $native = $distribution['native'] ?? [];

    if (empty($native)) {
      return NULL;
    }

    if (is_array($native)) {
      return implode(', ', array_slice($native, 0, 10)); // Limit to 10 regions.
    }

    return $native;
  }

  /**
   * Build botanical description from plant data.
   *
   * @param array $plantData
   *   The plant data.
   *
   * @return string|null
   *   HTML formatted description or NULL.
   */
  protected function buildBotanicalDescription(array $plantData): ?string {
    $parts = [];

    // Main description if available.
    if (!empty($plantData['description'])) {
      $parts[] = '<p>' . $this->escape($plantData['description']) . '</p>';
    }

    // Flower information.
    $flower = $plantData['flower'] ?? [];
    if (!empty($flower['color']) || !empty($flower['conspicuous'])) {
      $flowerDesc = '<p><strong>Flower:</strong> ';
      $flowerParts = [];
      if (!empty($flower['color'])) {
        $colors = $this->escapeArray($flower['color']);
        $flowerParts[] = 'Color: ' . $colors;
      }
      if (isset($flower['conspicuous'])) {
        $flowerParts[] = $flower['conspicuous'] ? 'Conspicuous' : 'Inconspicuous';
      }
      $flowerDesc .= implode('; ', $flowerParts) . '</p>';
      $parts[] = $flowerDesc;
    }

    // Foliage information.
    $foliage = $plantData['foliage'] ?? [];
    if (!empty($foliage['color']) || !empty($foliage['texture'])) {
      $foliageDesc = '<p><strong>Foliage:</strong> ';
      $foliageParts = [];
      if (!empty($foliage['color'])) {
        $colors = $this->escapeArray($foliage['color']);
        $foliageParts[] = 'Color: ' . $colors;
      }
      if (!empty($foliage['texture'])) {
        $foliageParts[] = 'Texture: ' . $this->escape($foliage['texture']);
      }
      $foliageDesc .= implode('; ', $foliageParts) . '</p>';
      $parts[] = $foliageDesc;
    }

    // Fruit information.
    $fruit = $plantData['fruit_or_seed'] ?? $plantData['fruit'] ?? [];
    if (!empty($fruit['color']) || !empty($fruit['seed_persistence'])) {
      $fruitDesc = '<p><strong>Fruit/Seed:</strong> ';
      $fruitParts = [];
      if (!empty($fruit['color'])) {
        $colors = $this->escapeArray($fruit['color']);
        $fruitParts[] = 'Color: ' . $colors;
      }
      if (isset($fruit['seed_persistence'])) {
        $fruitParts[] = $fruit['seed_persistence'] ? 'Seeds persist' : 'Seeds do not persist';
      }
      $fruitDesc .= implode('; ', $fruitParts) . '</p>';
      $parts[] = $fruitDesc;
    }

    return !empty($parts) ? implode("\n", $parts) : NULL;
  }

  /**
   * Build growing conditions from plant data.
   *
   * @param array $plantData
   *   The plant data.
   *
   * @return string|null
   *   HTML formatted growing conditions or NULL.
   */
  protected function buildGrowingConditions(array $plantData): ?string {
    $parts = [];
    $growth = $plantData['growth'] ?? [];

    // Light requirements (numeric value expected).
    if (!empty($growth['light']) && is_numeric($growth['light'])) {
      $parts[] = '<p><strong>Light:</strong> ' . (int) $growth['light'] . '/9</p>';
    }

    // Water requirements (numeric value expected).
    if (!empty($growth['atmospheric_humidity']) && is_numeric($growth['atmospheric_humidity'])) {
      $parts[] = '<p><strong>Humidity:</strong> ' . (int) $growth['atmospheric_humidity'] . '/10</p>';
    }

    // Soil requirements.
    $soilParts = [];
    if (!empty($growth['soil_nutriments']) && is_numeric($growth['soil_nutriments'])) {
      $soilParts[] = 'Nutriments: ' . (int) $growth['soil_nutriments'] . '/9';
    }
    if (!empty($growth['soil_salinity']) && is_numeric($growth['soil_salinity'])) {
      $soilParts[] = 'Salinity tolerance: ' . (int) $growth['soil_salinity'] . '/9';
    }
    if (!empty($growth['soil_texture'])) {
      $soilParts[] = 'Texture: ' . $this->escape($growth['soil_texture']);
    }
    if (!empty($soilParts)) {
      $parts[] = '<p><strong>Soil:</strong> ' . implode('; ', $soilParts) . '</p>';
    }

    // Temperature (numeric values expected).
    if (!empty($growth['minimum_temperature']) || !empty($growth['maximum_temperature'])) {
      $tempParts = [];
      if (!empty($growth['minimum_temperature']['deg_c']) && is_numeric($growth['minimum_temperature']['deg_c'])) {
        $tempParts[] = 'Min: ' . (float) $growth['minimum_temperature']['deg_c'] . '°C';
      }
      if (!empty($growth['maximum_temperature']['deg_c']) && is_numeric($growth['maximum_temperature']['deg_c'])) {
        $tempParts[] = 'Max: ' . (float) $growth['maximum_temperature']['deg_c'] . '°C';
      }
      if (!empty($tempParts)) {
        $parts[] = '<p><strong>Temperature:</strong> ' . implode('; ', $tempParts) . '</p>';
      }
    }

    // pH range (numeric values expected).
    if (!empty($growth['ph_minimum']) || !empty($growth['ph_maximum'])) {
      $phRange = [];
      if (!empty($growth['ph_minimum']) && is_numeric($growth['ph_minimum'])) {
        $phRange[] = (float) $growth['ph_minimum'];
      }
      if (!empty($growth['ph_maximum']) && is_numeric($growth['ph_maximum'])) {
        $phRange[] = (float) $growth['ph_maximum'];
      }
      if (!empty($phRange)) {
        $parts[] = '<p><strong>pH Range:</strong> ' . implode(' - ', $phRange) . '</p>';
      }
    }

    // Height (numeric values expected).
    $specifications = $plantData['specifications'] ?? [];
    if (!empty($specifications['average_height']['cm']) && is_numeric($specifications['average_height']['cm'])) {
      $parts[] = '<p><strong>Average Height:</strong> ' . (float) $specifications['average_height']['cm'] . ' cm</p>';
    }
    elseif (!empty($specifications['maximum_height']['cm']) && is_numeric($specifications['maximum_height']['cm'])) {
      $parts[] = '<p><strong>Maximum Height:</strong> ' . (float) $specifications['maximum_height']['cm'] . ' cm</p>';
    }

    return !empty($parts) ? implode("\n", $parts) : NULL;
  }

  /**
   * Map bloom/fruit months to harvest season.
   *
   * @param array $plantData
   *   The plant data.
   *
   * @return string|null
   *   The harvest season or NULL.
   */
  protected function mapHarvestSeason(array $plantData): ?string {
    $growth = $plantData['growth'] ?? [];
    $parts = [];

    // Bloom months.
    if (!empty($growth['bloom_months'])) {
      $months = $this->escapeArray($growth['bloom_months']);
      $parts[] = 'Blooms: ' . $months;
    }

    // Fruit months.
    if (!empty($growth['fruit_months'])) {
      $months = $this->escapeArray($growth['fruit_months']);
      $parts[] = 'Fruits: ' . $months;
    }

    return !empty($parts) ? implode('; ', $parts) : NULL;
  }

  /**
   * Escape a string for HTML output.
   *
   * @param mixed $value
   *   The value to escape.
   *
   * @return string
   *   The escaped string.
   */
  protected function escape(mixed $value): string {
    return htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8');
  }

  /**
   * Escape an array or string and join with commas.
   *
   * @param mixed $value
   *   The value (array or string) to escape.
   *
   * @return string
   *   The escaped and joined string.
   */
  protected function escapeArray(mixed $value): string {
    if (is_array($value)) {
      return implode(', ', array_map(fn($v) => $this->escape($v), $value));
    }
    return $this->escape($value);
  }

}

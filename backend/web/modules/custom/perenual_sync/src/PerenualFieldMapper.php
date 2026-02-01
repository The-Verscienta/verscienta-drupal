<?php

declare(strict_types=1);

namespace Drupal\perenual_sync;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\node\NodeInterface;

/**
 * Maps Perenual API data to Drupal herb node fields.
 */
class PerenualFieldMapper {

  /**
   * Constructs a PerenualFieldMapper object.
   *
   * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entityTypeManager
   *   The entity type manager.
   */
  public function __construct(
    protected EntityTypeManagerInterface $entityTypeManager,
  ) {}

  /**
   * Map Perenual plant data to a node.
   *
   * @param array $plantData
   *   The plant data from Perenual API.
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
        'status' => 0,
      ]);
    }

    // Title from common_name or scientific_name.
    $title = $plantData['common_name'] ?? $plantData['scientific_name'][0] ?? 'Unknown Plant';
    $node->setTitle($title);

    // Perenual ID for tracking.
    if ($node->hasField('field_perenual_id')) {
      $node->set('field_perenual_id', $plantData['id'] ?? NULL);
    }

    // Scientific name (Perenual returns array).
    if ($node->hasField('field_scientific_name')) {
      $scientificName = is_array($plantData['scientific_name'] ?? NULL)
        ? ($plantData['scientific_name'][0] ?? NULL)
        : ($plantData['scientific_name'] ?? NULL);
      if ($scientificName) {
        $node->set('field_scientific_name', $scientificName);
      }
    }

    // Family.
    if ($node->hasField('field_family') && !empty($plantData['family'])) {
      $node->set('field_family', $plantData['family']);
    }

    // Genus.
    if ($node->hasField('field_genus') && !empty($plantData['genus'])) {
      $node->set('field_genus', $plantData['genus']);
    }

    // Species.
    if ($node->hasField('field_species') && !empty($plantData['species_epithet'])) {
      $node->set('field_species', $plantData['species_epithet']);
    }

    // Plant type from 'type' field.
    if ($node->hasField('field_plant_type') && !empty($plantData['type'])) {
      $node->set('field_plant_type', ucfirst($plantData['type']));
    }

    // Native region from 'origin'.
    if ($node->hasField('field_native_region') && !empty($plantData['origin'])) {
      $origin = is_array($plantData['origin'])
        ? implode(', ', $plantData['origin'])
        : $plantData['origin'];
      $node->set('field_native_region', $origin);
    }

    // Other names as synonyms.
    if ($node->hasField('field_synonyms') && !empty($plantData['other_name'])) {
      $otherNames = is_array($plantData['other_name'])
        ? implode(', ', $plantData['other_name'])
        : $plantData['other_name'];
      $node->set('field_synonyms', $otherNames);
    }

    // Description.
    if ($node->hasField('field_botanical_description') && !empty($plantData['description'])) {
      $node->set('field_botanical_description', [
        'value' => '<p>' . $this->escape($plantData['description']) . '</p>',
        'format' => 'basic_html',
      ]);
    }

    // Growing conditions.
    if ($node->hasField('field_growing_conditions')) {
      $growingConditions = $this->buildGrowingConditions($plantData);
      if ($growingConditions) {
        $node->set('field_growing_conditions', [
          'value' => $growingConditions,
          'format' => 'basic_html',
        ]);
      }
    }

    // Harvest season from flowering_season or fruiting_season.
    if ($node->hasField('field_harvest_season')) {
      $harvestSeason = $this->mapHarvestSeason($plantData);
      if ($harvestSeason) {
        $node->set('field_harvest_season', $harvestSeason);
      }
    }

    // Contraindications from poisonous info.
    if ($node->hasField('field_contraindications')) {
      $contraindications = $this->buildContraindications($plantData);
      if ($contraindications) {
        $node->set('field_contraindications', [
          'value' => $contraindications,
          'format' => 'basic_html',
        ]);
      }
    }

    // Parts used from edible parts.
    if ($node->hasField('field_parts_used')) {
      $partsUsed = $this->mapPartsUsed($plantData);
      if ($partsUsed) {
        $node->set('field_parts_used', $partsUsed);
      }
    }

    return $node;
  }

  /**
   * Enrich an existing node with missing data from Perenual.
   *
   * Only fills in fields that are currently empty.
   *
   * @param \Drupal\node\NodeInterface $node
   *   The node to enrich.
   * @param array $plantData
   *   The plant data from Perenual API.
   *
   * @return bool
   *   TRUE if any fields were updated, FALSE otherwise.
   */
  public function enrichNode(NodeInterface $node, array $plantData): bool {
    $updated = FALSE;

    // Perenual ID for tracking.
    if ($node->hasField('field_perenual_id') && $this->isFieldEmpty($node, 'field_perenual_id')) {
      $node->set('field_perenual_id', $plantData['id'] ?? NULL);
      $updated = TRUE;
    }

    // Scientific name.
    if ($node->hasField('field_scientific_name') && $this->isFieldEmpty($node, 'field_scientific_name')) {
      $scientificName = is_array($plantData['scientific_name'] ?? NULL)
        ? ($plantData['scientific_name'][0] ?? NULL)
        : ($plantData['scientific_name'] ?? NULL);
      if ($scientificName) {
        $node->set('field_scientific_name', $scientificName);
        $updated = TRUE;
      }
    }

    // Family.
    if ($node->hasField('field_family') && $this->isFieldEmpty($node, 'field_family') && !empty($plantData['family'])) {
      $node->set('field_family', $plantData['family']);
      $updated = TRUE;
    }

    // Genus.
    if ($node->hasField('field_genus') && $this->isFieldEmpty($node, 'field_genus') && !empty($plantData['genus'])) {
      $node->set('field_genus', $plantData['genus']);
      $updated = TRUE;
    }

    // Species.
    if ($node->hasField('field_species') && $this->isFieldEmpty($node, 'field_species') && !empty($plantData['species_epithet'])) {
      $node->set('field_species', $plantData['species_epithet']);
      $updated = TRUE;
    }

    // Plant type.
    if ($node->hasField('field_plant_type') && $this->isFieldEmpty($node, 'field_plant_type') && !empty($plantData['type'])) {
      $node->set('field_plant_type', ucfirst($plantData['type']));
      $updated = TRUE;
    }

    // Native region.
    if ($node->hasField('field_native_region') && $this->isFieldEmpty($node, 'field_native_region') && !empty($plantData['origin'])) {
      $origin = is_array($plantData['origin'])
        ? implode(', ', $plantData['origin'])
        : $plantData['origin'];
      $node->set('field_native_region', $origin);
      $updated = TRUE;
    }

    // Synonyms.
    if ($node->hasField('field_synonyms') && $this->isFieldEmpty($node, 'field_synonyms') && !empty($plantData['other_name'])) {
      $otherNames = is_array($plantData['other_name'])
        ? implode(', ', $plantData['other_name'])
        : $plantData['other_name'];
      $node->set('field_synonyms', $otherNames);
      $updated = TRUE;
    }

    // Description.
    if ($node->hasField('field_botanical_description') && $this->isFieldEmpty($node, 'field_botanical_description') && !empty($plantData['description'])) {
      $node->set('field_botanical_description', [
        'value' => '<p>' . $this->escape($plantData['description']) . '</p>',
        'format' => 'basic_html',
      ]);
      $updated = TRUE;
    }

    // Growing conditions.
    if ($node->hasField('field_growing_conditions') && $this->isFieldEmpty($node, 'field_growing_conditions')) {
      $growingConditions = $this->buildGrowingConditions($plantData);
      if ($growingConditions) {
        $node->set('field_growing_conditions', [
          'value' => $growingConditions,
          'format' => 'basic_html',
        ]);
        $updated = TRUE;
      }
    }

    // Harvest season.
    if ($node->hasField('field_harvest_season') && $this->isFieldEmpty($node, 'field_harvest_season')) {
      $harvestSeason = $this->mapHarvestSeason($plantData);
      if ($harvestSeason) {
        $node->set('field_harvest_season', $harvestSeason);
        $updated = TRUE;
      }
    }

    // Contraindications.
    if ($node->hasField('field_contraindications') && $this->isFieldEmpty($node, 'field_contraindications')) {
      $contraindications = $this->buildContraindications($plantData);
      if ($contraindications) {
        $node->set('field_contraindications', [
          'value' => $contraindications,
          'format' => 'basic_html',
        ]);
        $updated = TRUE;
      }
    }

    // Parts used.
    if ($node->hasField('field_parts_used') && $this->isFieldEmpty($node, 'field_parts_used')) {
      $partsUsed = $this->mapPartsUsed($plantData);
      if ($partsUsed) {
        $node->set('field_parts_used', $partsUsed);
        $updated = TRUE;
      }
    }

    return $updated;
  }

  /**
   * Check if a field is empty.
   *
   * @param \Drupal\node\NodeInterface $node
   *   The node.
   * @param string $fieldName
   *   The field name.
   *
   * @return bool
   *   TRUE if empty, FALSE otherwise.
   */
  protected function isFieldEmpty(NodeInterface $node, string $fieldName): bool {
    if (!$node->hasField($fieldName)) {
      return TRUE;
    }
    return $node->get($fieldName)->isEmpty();
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

    // Sunlight.
    if (!empty($plantData['sunlight'])) {
      $sunlight = is_array($plantData['sunlight'])
        ? implode(', ', $plantData['sunlight'])
        : $plantData['sunlight'];
      $parts[] = '<p><strong>Sunlight:</strong> ' . $this->escape($sunlight) . '</p>';
    }

    // Watering.
    if (!empty($plantData['watering'])) {
      $parts[] = '<p><strong>Watering:</strong> ' . $this->escape($plantData['watering']) . '</p>';
    }

    // Soil.
    if (!empty($plantData['soil'])) {
      $soil = is_array($plantData['soil'])
        ? implode(', ', $plantData['soil'])
        : $plantData['soil'];
      $parts[] = '<p><strong>Soil:</strong> ' . $this->escape($soil) . '</p>';
    }

    // Hardiness zones.
    $hardiness = $plantData['hardiness'] ?? [];
    if (!empty($hardiness['min']) || !empty($hardiness['max'])) {
      $zones = [];
      if (!empty($hardiness['min'])) {
        $zones[] = $hardiness['min'];
      }
      if (!empty($hardiness['max'])) {
        $zones[] = $hardiness['max'];
      }
      $parts[] = '<p><strong>Hardiness Zones:</strong> ' . implode(' - ', $zones) . '</p>';
    }

    // Growth rate.
    if (!empty($plantData['growth_rate'])) {
      $parts[] = '<p><strong>Growth Rate:</strong> ' . $this->escape($plantData['growth_rate']) . '</p>';
    }

    // Care level.
    if (!empty($plantData['care_level'])) {
      $parts[] = '<p><strong>Care Level:</strong> ' . $this->escape($plantData['care_level']) . '</p>';
    }

    // Dimensions.
    $dimensions = $plantData['dimensions'] ?? [];
    if (!empty($dimensions['max_height']) || !empty($dimensions['max_width'])) {
      $dimParts = [];
      if (!empty($dimensions['max_height']['cm'])) {
        $dimParts[] = 'Height: ' . (int) $dimensions['max_height']['cm'] . ' cm';
      }
      if (!empty($dimensions['max_width']['cm'])) {
        $dimParts[] = 'Width: ' . (int) $dimensions['max_width']['cm'] . ' cm';
      }
      if (!empty($dimParts)) {
        $parts[] = '<p><strong>Dimensions:</strong> ' . implode('; ', $dimParts) . '</p>';
      }
    }

    // Indoor/outdoor.
    if (isset($plantData['indoor'])) {
      $parts[] = '<p><strong>Indoor:</strong> ' . ($plantData['indoor'] ? 'Yes' : 'No') . '</p>';
    }

    // Cycle (perennial, annual, etc.).
    if (!empty($plantData['cycle'])) {
      $parts[] = '<p><strong>Life Cycle:</strong> ' . $this->escape(ucfirst($plantData['cycle'])) . '</p>';
    }

    // Propagation.
    if (!empty($plantData['propagation'])) {
      $propagation = is_array($plantData['propagation'])
        ? implode(', ', $plantData['propagation'])
        : $plantData['propagation'];
      $parts[] = '<p><strong>Propagation:</strong> ' . $this->escape($propagation) . '</p>';
    }

    return !empty($parts) ? implode("\n", $parts) : NULL;
  }

  /**
   * Map harvest season from plant data.
   *
   * @param array $plantData
   *   The plant data.
   *
   * @return string|null
   *   The harvest season or NULL.
   */
  protected function mapHarvestSeason(array $plantData): ?string {
    $parts = [];

    if (!empty($plantData['flowering_season'])) {
      $parts[] = 'Flowering: ' . $this->escape($plantData['flowering_season']);
    }

    if (!empty($plantData['fruiting_season'])) {
      $parts[] = 'Fruiting: ' . $this->escape($plantData['fruiting_season']);
    }

    return !empty($parts) ? implode('; ', $parts) : NULL;
  }

  /**
   * Build contraindications from poisonous data.
   *
   * @param array $plantData
   *   The plant data.
   *
   * @return string|null
   *   HTML formatted contraindications or NULL.
   */
  protected function buildContraindications(array $plantData): ?string {
    $parts = [];

    if (!empty($plantData['poisonous_to_humans']) && $plantData['poisonous_to_humans'] === TRUE) {
      $parts[] = '<p><strong>Warning:</strong> This plant may be poisonous to humans.</p>';
    }

    if (!empty($plantData['poisonous_to_pets']) && $plantData['poisonous_to_pets'] === TRUE) {
      $parts[] = '<p><strong>Pet Safety:</strong> This plant may be toxic to pets.</p>';
    }

    return !empty($parts) ? implode("\n", $parts) : NULL;
  }

  /**
   * Map edible parts to parts used.
   *
   * @param array $plantData
   *   The plant data.
   *
   * @return string|null
   *   The parts used or NULL.
   */
  protected function mapPartsUsed(array $plantData): ?string {
    $parts = [];

    if (!empty($plantData['edible_leaf']) && $plantData['edible_leaf'] === TRUE) {
      $parts[] = 'Leaves';
    }

    if (!empty($plantData['edible_fruit']) && $plantData['edible_fruit'] === TRUE) {
      $parts[] = 'Fruit';
    }

    if (!empty($plantData['flowers']) && $plantData['flowers'] === TRUE) {
      $parts[] = 'Flowers';
    }

    return !empty($parts) ? implode(', ', $parts) : NULL;
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

}

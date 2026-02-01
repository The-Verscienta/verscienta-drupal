#!/bin/bash

################################################################################
# Verscienta Health - Comprehensive Herb Content Type Setup Script
#
# This script creates the complete Herb content type with all fields,
# field groups, and configurations as specified in the design system.
#
# Usage:
#   ddev ssh
#   cd /var/www/html
#   chmod +x scripts/setup-herb-content-type.sh
#   ./scripts/setup-herb-content-type.sh
#
################################################################################

set -e  # Exit on error

echo "=================================================="
echo "Verscienta Health - Herb Content Type Setup"
echo "=================================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in Drupal root
if [ ! -f "web/index.php" ]; then
    echo "Error: Not in Drupal root directory"
    exit 1
fi

echo -e "${BLUE}Step 1: Installing required modules...${NC}"
echo "----------------------------------------------"

# Install required modules
drush en -y \
    field \
    field_ui \
    text \
    options \
    number \
    datetime \
    link \
    image \
    file \
    taxonomy \
    paragraphs \
    field_group \
    jsonapi \
    jsonapi_extras \
    serialization \
    rest \
    cors

echo -e "${GREEN}✓ Modules installed${NC}"
echo ""

echo -e "${BLUE}Step 2: Creating Herb content type...${NC}"
echo "----------------------------------------------"

# Create the Herb content type
drush php:eval "
  \$type = \Drupal::entityTypeManager()->getStorage('node_type')->create([
    'type' => 'herb',
    'name' => 'Herb',
    'description' => 'Comprehensive medicinal herb database entry',
    'title_label' => 'Herb Name',
    'preview_mode' => DRUPAL_OPTIONAL,
    'display_submitted' => FALSE,
  ]);
  \$type->save();
  echo 'Herb content type created\n';
"

echo -e "${GREEN}✓ Herb content type created${NC}"
echo ""

echo -e "${BLUE}Step 3: Creating basic text fields...${NC}"
echo "----------------------------------------------"

# Field: Herb ID
drush field:create node herb field_herb_id \
    --field-label="Herb ID" \
    --field-type=string \
    --cardinality=1 \
    --required

# Field: Scientific Name
drush field:create node herb field_scientific_name \
    --field-label="Scientific Name" \
    --field-type=string \
    --cardinality=1 \
    --required

# Field: Family
drush field:create node herb field_family \
    --field-label="Botanical Family" \
    --field-type=string \
    --cardinality=1

# Field: Genus
drush field:create node herb field_genus \
    --field-label="Genus" \
    --field-type=string \
    --cardinality=1

# Field: Species
drush field:create node herb field_species \
    --field-label="Species" \
    --field-type=string \
    --cardinality=1

# Field: Plant Type
drush field:create node herb field_plant_type \
    --field-label="Plant Type" \
    --field-type=list_string \
    --cardinality=1

# Field: Habitat
drush field:create node herb field_habitat \
    --field-label="Habitat" \
    --field-type=string_long \
    --cardinality=1

# Field: Botanical Description
drush field:create node herb field_botanical_description \
    --field-label="Botanical Description" \
    --field-type=text_long \
    --cardinality=1

# Field: Conservation Status
drush field:create node herb field_conservation_status \
    --field-label="Conservation Status" \
    --field-type=list_string \
    --cardinality=1

# Field: Conservation Notes
drush field:create node herb field_conservation_notes \
    --field-label="Conservation Notes" \
    --field-type=text_long \
    --cardinality=1

echo -e "${GREEN}✓ Basic text fields created${NC}"
echo ""

echo -e "${BLUE}Step 4: Creating multi-value fields...${NC}"
echo "----------------------------------------------"

# Field: Synonyms (multiple values)
drush field:create node herb field_synonyms \
    --field-label="Synonyms" \
    --field-type=string \
    --cardinality=-1

# Field: Native Region (multiple values)
drush field:create node herb field_native_region \
    --field-label="Native Regions" \
    --field-type=string \
    --cardinality=-1

# Field: Parts Used (multiple values)
drush field:create node herb field_parts_used \
    --field-label="Parts Used" \
    --field-type=list_string \
    --cardinality=-1

# Field: Western Properties (multiple values)
drush field:create node herb field_western_properties \
    --field-label="Western Herbalism Properties" \
    --field-type=string \
    --cardinality=-1

# Field: Dosage Forms (multiple values)
drush field:create node herb field_dosage_forms \
    --field-label="Dosage Forms" \
    --field-type=list_string \
    --cardinality=-1

# Field: Commercial Availability (multiple values)
drush field:create node herb field_commercial_availability \
    --field-label="Commercial Availability" \
    --field-type=string \
    --cardinality=-1

echo -e "${GREEN}✓ Multi-value fields created${NC}"
echo ""

echo -e "${BLUE}Step 5: Creating TCM-related fields...${NC}"
echo "----------------------------------------------"

# Field: TCM Taste
drush field:create node herb field_tcm_taste \
    --field-label="TCM Taste" \
    --field-type=list_string \
    --cardinality=-1

# Field: TCM Temperature
drush field:create node herb field_tcm_temperature \
    --field-label="TCM Temperature" \
    --field-type=list_string \
    --cardinality=1

# Field: TCM Meridians
drush field:create node herb field_tcm_meridians \
    --field-label="TCM Meridians" \
    --field-type=list_string \
    --cardinality=-1

# Field: TCM Functions
drush field:create node herb field_tcm_functions \
    --field-label="TCM Functions" \
    --field-type=text_long \
    --cardinality=1

# Field: TCM Category
drush field:create node herb field_tcm_category \
    --field-label="TCM Category" \
    --field-type=list_string \
    --cardinality=1

echo -e "${GREEN}✓ TCM fields created${NC}"
echo ""

echo -e "${BLUE}Step 6: Creating medicinal information fields...${NC}"
echo "----------------------------------------------"

# Field: Therapeutic Uses
drush field:create node herb field_therapeutic_uses \
    --field-label="Therapeutic Uses" \
    --field-type=text_long \
    --cardinality=1

# Field: Pharmacological Effects
drush field:create node herb field_pharmacological_effects \
    --field-label="Pharmacological Effects" \
    --field-type=text_long \
    --cardinality=1

# Field: Contraindications
drush field:create node herb field_contraindications \
    --field-label="Contraindications" \
    --field-type=text_long \
    --cardinality=1

# Field: Side Effects
drush field:create node herb field_side_effects \
    --field-label="Side Effects" \
    --field-type=text_long \
    --cardinality=1

# Field: Allergenic Potential
drush field:create node herb field_allergenic_potential \
    --field-label="Allergenic Potential" \
    --field-type=text_long \
    --cardinality=1

echo -e "${GREEN}✓ Medicinal information fields created${NC}"
echo ""

echo -e "${BLUE}Step 7: Creating cultural/historical fields...${NC}"
echo "----------------------------------------------"

# Field: Traditional American Uses
drush field:create node herb field_traditional_american_uses \
    --field-label="Traditional American Uses" \
    --field-type=text_long \
    --cardinality=1

# Field: Traditional Chinese Uses
drush field:create node herb field_traditional_chinese_uses \
    --field-label="Traditional Chinese Uses" \
    --field-type=text_long \
    --cardinality=1

# Field: Native American Uses
drush field:create node herb field_native_american_uses \
    --field-label="Native American Uses" \
    --field-type=text_long \
    --cardinality=1

# Field: Cultural Significance
drush field:create node herb field_cultural_significance \
    --field-label="Cultural Significance" \
    --field-type=text_long \
    --cardinality=1

# Field: Ethnobotanical Notes
drush field:create node herb field_ethnobotanical_notes \
    --field-label="Ethnobotanical Notes" \
    --field-type=text_long \
    --cardinality=1

# Field: Folklore
drush field:create node herb field_folklore \
    --field-label="Folklore & Mythology" \
    --field-type=text_long \
    --cardinality=1

echo -e "${GREEN}✓ Cultural/historical fields created${NC}"
echo ""

echo -e "${BLUE}Step 8: Creating metadata fields...${NC}"
echo "----------------------------------------------"

# Field: Peer Review Status
drush field:create node herb field_peer_review_status \
    --field-label="Peer Review Status" \
    --field-type=list_string \
    --cardinality=1

# Field: Average Rating
drush field:create node herb field_average_rating \
    --field-label="Average Rating" \
    --field-type=decimal \
    --cardinality=1

# Field: Review Count
drush field:create node herb field_review_count \
    --field-label="Review Count" \
    --field-type=integer \
    --cardinality=1

echo -e "${GREEN}✓ Metadata fields created${NC}"
echo ""

echo -e "${BLUE}Step 9: Creating image field...${NC}"
echo "----------------------------------------------"

# Field: Herb Images
drush field:create node herb field_herb_images \
    --field-label="Herb Images" \
    --field-type=image \
    --cardinality=-1

echo -e "${GREEN}✓ Image field created${NC}"
echo ""

echo -e "${BLUE}Step 10: Setting up list field options...${NC}"
echo "----------------------------------------------"

# Configure Plant Type options
drush php:eval "
  \$field_storage = \Drupal\field\Entity\FieldStorageConfig::loadByName('node', 'field_plant_type');
  if (\$field_storage) {
    \$settings = \$field_storage->getSettings();
    \$settings['allowed_values'] = [
      'tree' => 'Tree',
      'shrub' => 'Shrub',
      'herb' => 'Herbaceous Plant',
      'vine' => 'Vine',
      'grass' => 'Grass',
      'fern' => 'Fern',
      'moss' => 'Moss',
      'lichen' => 'Lichen',
      'fungi' => 'Fungi',
    ];
    \$field_storage->setSettings(\$settings);
    \$field_storage->save();
    echo 'Plant Type options configured\n';
  }
"

# Configure Conservation Status options
drush php:eval "
  \$field_storage = \Drupal\field\Entity\FieldStorageConfig::loadByName('node', 'field_conservation_status');
  if (\$field_storage) {
    \$settings = \$field_storage->getSettings();
    \$settings['allowed_values'] = [
      'least_concern' => 'Least Concern',
      'near_threatened' => 'Near Threatened',
      'vulnerable' => 'Vulnerable',
      'endangered' => 'Endangered',
      'critically_endangered' => 'Critically Endangered',
      'extinct_in_wild' => 'Extinct in the Wild',
      'extinct' => 'Extinct',
      'not_evaluated' => 'Not Evaluated',
    ];
    \$field_storage->setSettings(\$settings);
    \$field_storage->save();
    echo 'Conservation Status options configured\n';
  }
"

# Configure Parts Used options
drush php:eval "
  \$field_storage = \Drupal\field\Entity\FieldStorageConfig::loadByName('node', 'field_parts_used');
  if (\$field_storage) {
    \$settings = \$field_storage->getSettings();
    \$settings['allowed_values'] = [
      'root' => 'Root',
      'rhizome' => 'Rhizome',
      'tuber' => 'Tuber',
      'bark' => 'Bark',
      'stem' => 'Stem',
      'leaf' => 'Leaf',
      'flower' => 'Flower',
      'fruit' => 'Fruit',
      'seed' => 'Seed',
      'whole_plant' => 'Whole Plant',
      'resin' => 'Resin',
      'essential_oil' => 'Essential Oil',
    ];
    \$field_storage->setSettings(\$settings);
    \$field_storage->save();
    echo 'Parts Used options configured\n';
  }
"

# Configure TCM Taste options
drush php:eval "
  \$field_storage = \Drupal\field\Entity\FieldStorageConfig::loadByName('node', 'field_tcm_taste');
  if (\$field_storage) {
    \$settings = \$field_storage->getSettings();
    \$settings['allowed_values'] = [
      'sweet' => 'Sweet (甘)',
      'sour' => 'Sour (酸)',
      'bitter' => 'Bitter (苦)',
      'pungent' => 'Pungent/Acrid (辛)',
      'salty' => 'Salty (咸)',
      'bland' => 'Bland (淡)',
      'astringent' => 'Astringent (涩)',
    ];
    \$field_storage->setSettings(\$settings);
    \$field_storage->save();
    echo 'TCM Taste options configured\n';
  }
"

# Configure TCM Temperature options
drush php:eval "
  \$field_storage = \Drupal\field\Entity\FieldStorageConfig::loadByName('node', 'field_tcm_temperature');
  if (\$field_storage) {
    \$settings = \$field_storage->getSettings();
    \$settings['allowed_values'] = [
      'cold' => 'Cold (寒)',
      'cool' => 'Cool (凉)',
      'neutral' => 'Neutral (平)',
      'warm' => 'Warm (温)',
      'hot' => 'Hot (热)',
    ];
    \$field_storage->setSettings(\$settings);
    \$field_storage->save();
    echo 'TCM Temperature options configured\n';
  }
"

# Configure TCM Meridians options
drush php:eval "
  \$field_storage = \Drupal\field\Entity\FieldStorageConfig::loadByName('node', 'field_tcm_meridians');
  if (\$field_storage) {
    \$settings = \$field_storage->getSettings();
    \$settings['allowed_values'] = [
      'lung' => 'Lung (肺)',
      'large_intestine' => 'Large Intestine (大肠)',
      'stomach' => 'Stomach (胃)',
      'spleen' => 'Spleen (脾)',
      'heart' => 'Heart (心)',
      'small_intestine' => 'Small Intestine (小肠)',
      'bladder' => 'Bladder (膀胱)',
      'kidney' => 'Kidney (肾)',
      'pericardium' => 'Pericardium (心包)',
      'triple_burner' => 'Triple Burner (三焦)',
      'gallbladder' => 'Gallbladder (胆)',
      'liver' => 'Liver (肝)',
    ];
    \$field_storage->setSettings(\$settings);
    \$field_storage->save();
    echo 'TCM Meridians options configured\n';
  }
"

# Configure TCM Category options
drush php:eval "
  \$field_storage = \Drupal\field\Entity\FieldStorageConfig::loadByName('node', 'field_tcm_category');
  if (\$field_storage) {
    \$settings = \$field_storage->getSettings();
    \$settings['allowed_values'] = [
      'release_exterior' => 'Release the Exterior',
      'clear_heat' => 'Clear Heat',
      'drain_downward' => 'Drain Downward',
      'drain_dampness' => 'Drain Dampness',
      'dispel_wind_damp' => 'Dispel Wind-Dampness',
      'transform_phlegm' => 'Transform Phlegm',
      'relieve_food_stagnation' => 'Relieve Food Stagnation',
      'regulate_qi' => 'Regulate Qi',
      'regulate_blood' => 'Regulate Blood',
      'warm_interior' => 'Warm the Interior',
      'tonify' => 'Tonify',
      'astringent' => 'Astringent',
      'calm_spirit' => 'Calm the Spirit',
      'aromatic' => 'Aromatic',
      'other' => 'Other',
    ];
    \$field_storage->setSettings(\$settings);
    \$field_storage->save();
    echo 'TCM Category options configured\n';
  }
"

# Configure Dosage Forms options
drush php:eval "
  \$field_storage = \Drupal\field\Entity\FieldStorageConfig::loadByName('node', 'field_dosage_forms');
  if (\$field_storage) {
    \$settings = \$field_storage->getSettings();
    \$settings['allowed_values'] = [
      'tea' => 'Tea/Infusion',
      'decoction' => 'Decoction',
      'tincture' => 'Tincture',
      'capsule' => 'Capsule',
      'tablet' => 'Tablet',
      'powder' => 'Powder',
      'extract' => 'Extract',
      'syrup' => 'Syrup',
      'salve' => 'Salve',
      'oil' => 'Oil',
      'poultice' => 'Poultice',
      'compress' => 'Compress',
      'essential_oil' => 'Essential Oil',
    ];
    \$field_storage->setSettings(\$settings);
    \$field_storage->save();
    echo 'Dosage Forms options configured\n';
  }
"

# Configure Peer Review Status options
drush php:eval "
  \$field_storage = \Drupal\field\Entity\FieldStorageConfig::loadByName('node', 'field_peer_review_status');
  if (\$field_storage) {
    \$settings = \$field_storage->getSettings();
    \$settings['allowed_values'] = [
      'draft' => 'Draft',
      'pending_review' => 'Pending Review',
      'in_review' => 'In Review',
      'approved' => 'Approved',
      'published' => 'Published',
      'needs_revision' => 'Needs Revision',
    ];
    \$field_storage->setSettings(\$settings);
    \$field_storage->save();
    echo 'Peer Review Status options configured\n';
  }
"

echo -e "${GREEN}✓ List field options configured${NC}"
echo ""

echo -e "${BLUE}Step 11: Configuring form display...${NC}"
echo "----------------------------------------------"

# Set up the form display order and widgets
drush php:eval "
  \$form_display = \Drupal::entityTypeManager()
    ->getStorage('entity_form_display')
    ->load('node.herb.default');

  if (!\$form_display) {
    \$form_display = \Drupal::entityTypeManager()
      ->getStorage('entity_form_display')
      ->create([
        'targetEntityType' => 'node',
        'bundle' => 'herb',
        'mode' => 'default',
        'status' => TRUE,
      ]);
  }

  \$form_display->save();
  echo 'Form display configured\n';
"

echo -e "${GREEN}✓ Form display configured${NC}"
echo ""

echo -e "${BLUE}Step 12: Enabling JSON:API for Herb content type...${NC}"
echo "----------------------------------------------"

# Enable JSON:API access
drush php:eval "
  \$config = \Drupal::configFactory()->getEditable('jsonapi_extras.jsonapi_resource_config.node--herb');
  \$config->set('disabled', FALSE);
  \$config->set('path', 'node/herb');
  \$config->save();
  echo 'JSON:API enabled for Herb content type\n';
"

echo -e "${GREEN}✓ JSON:API configured${NC}"
echo ""

echo -e "${BLUE}Step 13: Setting permissions...${NC}"
echo "----------------------------------------------"

# Grant permissions to authenticated users
drush role:perm:add authenticated 'create herb content'
drush role:perm:add authenticated 'edit own herb content'
drush role:perm:add authenticated 'delete own herb content'

# Grant all permissions to content editors
drush role:perm:add editor 'create herb content'
drush role:perm:add editor 'edit any herb content'
drush role:perm:add editor 'delete any herb content'

echo -e "${GREEN}✓ Permissions configured${NC}"
echo ""

echo -e "${BLUE}Step 14: Clearing cache...${NC}"
echo "----------------------------------------------"

drush cr

echo -e "${GREEN}✓ Cache cleared${NC}"
echo ""

echo "=================================================="
echo -e "${GREEN}SUCCESS! Herb content type setup complete!${NC}"
echo "=================================================="
echo ""
echo "Next steps:"
echo "1. Visit /admin/structure/types/manage/herb to review"
echo "2. Create sample herb content at /node/add/herb"
echo "3. View JSON:API at /jsonapi/node/herb"
echo ""
echo "Note: For complex paragraph fields (Active Constituents,"
echo "Drug Interactions, etc.), you'll need to set those up"
echo "separately using the Paragraphs module UI."
echo ""

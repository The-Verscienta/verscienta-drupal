#!/bin/bash

################################################################################
# Verscienta Health - Complete Content Types Setup Script
#
# This script creates ALL content types for the Verscienta platform:
# - Modality
# - Condition
# - Practitioner
# - Formula
# - Review
# - Grok Insight
#
# Usage:
#   ddev ssh
#   cd /var/www/html
#   chmod +x scripts/setup-all-content-types.sh
#   ./scripts/setup-all-content-types.sh
#
################################################################################

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "=========================================================="
echo "Verscienta Health - All Content Types Setup"
echo "=========================================================="
echo ""

# Check if we're in Drupal root
if [ ! -f "web/index.php" ]; then
    echo "Error: Not in Drupal root directory"
    exit 1
fi

################################################################################
# MODALITY CONTENT TYPE
################################################################################

echo -e "${BLUE}Creating Modality content type...${NC}"

drush php:eval "
  \$type = \Drupal::entityTypeManager()->getStorage('node_type')->create([
    'type' => 'modality',
    'name' => 'Modality',
    'description' => 'Holistic health modality or healing practice',
    'title_label' => 'Modality Name',
    'preview_mode' => DRUPAL_OPTIONAL,
    'display_submitted' => FALSE,
  ]);
  \$type->save();
  echo 'Modality content type created\n';
"

# Modality fields
drush field:create node modality field_excels_at \
    --field-label="Excels At" \
    --field-type=string \
    --cardinality=-1

drush field:create node modality field_benefits \
    --field-label="Benefits" \
    --field-type=text_long \
    --cardinality=1

drush field:create node modality field_description \
    --field-label="Description" \
    --field-type=text_long \
    --cardinality=1

drush field:create node modality field_history \
    --field-label="History & Origins" \
    --field-type=text_long \
    --cardinality=1

drush field:create node modality field_techniques \
    --field-label="Techniques" \
    --field-type=text_long \
    --cardinality=1

drush field:create node modality field_what_to_expect \
    --field-label="What to Expect" \
    --field-type=text_long \
    --cardinality=1

drush field:create node modality field_modality_image \
    --field-label="Modality Image" \
    --field-type=image \
    --cardinality=1

echo -e "${GREEN}✓ Modality content type created${NC}"
echo ""

################################################################################
# CONDITION CONTENT TYPE
################################################################################

echo -e "${BLUE}Creating Condition content type...${NC}"

drush php:eval "
  \$type = \Drupal::entityTypeManager()->getStorage('node_type')->create([
    'type' => 'condition',
    'name' => 'Condition',
    'description' => 'Health condition or ailment',
    'title_label' => 'Condition Name',
    'preview_mode' => DRUPAL_OPTIONAL,
    'display_submitted' => FALSE,
  ]);
  \$type->save();
  echo 'Condition content type created\n';
"

# Condition fields
drush field:create node condition field_symptoms \
    --field-label="Symptoms" \
    --field-type=string \
    --cardinality=-1

drush field:create node condition field_severity \
    --field-label="Severity" \
    --field-type=list_string \
    --cardinality=1

drush field:create node condition field_condition_description \
    --field-label="Description" \
    --field-type=text_long \
    --cardinality=1

drush field:create node condition field_causes \
    --field-label="Common Causes" \
    --field-type=text_long \
    --cardinality=1

drush field:create node condition field_western_treatment \
    --field-label="Western Treatment Approaches" \
    --field-type=text_long \
    --cardinality=1

drush field:create node condition field_holistic_approaches \
    --field-label="Holistic Approaches" \
    --field-type=text_long \
    --cardinality=1

drush field:create node condition field_lifestyle_recommendations \
    --field-label="Lifestyle Recommendations" \
    --field-type=text_long \
    --cardinality=1

# Configure Severity options
drush php:eval "
  \$field_storage = \Drupal\field\Entity\FieldStorageConfig::loadByName('node', 'field_severity');
  if (\$field_storage) {
    \$settings = \$field_storage->getSettings();
    \$settings['allowed_values'] = [
      'mild' => 'Mild',
      'moderate' => 'Moderate',
      'severe' => 'Severe',
      'chronic' => 'Chronic',
      'acute' => 'Acute',
    ];
    \$field_storage->setSettings(\$settings);
    \$field_storage->save();
  }
"

echo -e "${GREEN}✓ Condition content type created${NC}"
echo ""

################################################################################
# PRACTITIONER CONTENT TYPE
################################################################################

echo -e "${BLUE}Creating Practitioner content type...${NC}"

drush php:eval "
  \$type = \Drupal::entityTypeManager()->getStorage('node_type')->create([
    'type' => 'practitioner',
    'name' => 'Practitioner',
    'description' => 'Holistic health practitioner',
    'title_label' => 'Practitioner Name',
    'preview_mode' => DRUPAL_OPTIONAL,
    'display_submitted' => FALSE,
  ]);
  \$type->save();
  echo 'Practitioner content type created\n';
"

# Practitioner fields
drush field:create node practitioner field_practice_type \
    --field-label="Practice Type" \
    --field-type=list_string \
    --cardinality=1

drush field:create node practitioner field_address \
    --field-label="Address" \
    --field-type=string_long \
    --cardinality=1

drush field:create node practitioner field_latitude \
    --field-label="Latitude" \
    --field-type=decimal \
    --cardinality=1

drush field:create node practitioner field_longitude \
    --field-label="Longitude" \
    --field-type=decimal \
    --cardinality=1

drush field:create node practitioner field_phone \
    --field-label="Phone" \
    --field-type=telephone \
    --cardinality=1

drush field:create node practitioner field_email \
    --field-label="Email" \
    --field-type=email \
    --cardinality=1

drush field:create node practitioner field_website \
    --field-label="Website" \
    --field-type=link \
    --cardinality=1

drush field:create node practitioner field_bio \
    --field-label="Biography" \
    --field-type=text_long \
    --cardinality=1

drush field:create node practitioner field_certifications \
    --field-label="Certifications" \
    --field-type=string \
    --cardinality=-1

drush field:create node practitioner field_years_experience \
    --field-label="Years of Experience" \
    --field-type=integer \
    --cardinality=1

drush field:create node practitioner field_accepting_new_patients \
    --field-label="Accepting New Patients" \
    --field-type=boolean \
    --cardinality=1

drush field:create node practitioner field_practitioner_photo \
    --field-label="Photo" \
    --field-type=image \
    --cardinality=1

# Configure Practice Type options
drush php:eval "
  \$field_storage = \Drupal\field\Entity\FieldStorageConfig::loadByName('node', 'field_practice_type');
  if (\$field_storage) {
    \$settings = \$field_storage->getSettings();
    \$settings['allowed_values'] = [
      'solo' => 'Solo Practice',
      'group' => 'Group Practice',
      'clinic' => 'Clinic',
      'hospital' => 'Hospital',
      'wellness_center' => 'Wellness Center',
    ];
    \$field_storage->setSettings(\$settings);
    \$field_storage->save();
  }
"

echo -e "${GREEN}✓ Practitioner content type created${NC}"
echo ""

################################################################################
# FORMULA CONTENT TYPE
################################################################################

echo -e "${BLUE}Creating Formula content type...${NC}"

drush php:eval "
  \$type = \Drupal::entityTypeManager()->getStorage('node_type')->create([
    'type' => 'formula',
    'name' => 'Formula',
    'description' => 'Herbal formula or combination',
    'title_label' => 'Formula Name',
    'preview_mode' => DRUPAL_OPTIONAL,
    'display_submitted' => FALSE,
  ]);
  \$type->save();
  echo 'Formula content type created\n';
"

# Formula fields
drush field:create node formula field_formula_description \
    --field-label="Description" \
    --field-type=text_long \
    --cardinality=1

drush field:create node formula field_preparation_instructions \
    --field-label="Preparation Instructions" \
    --field-type=text_long \
    --cardinality=1

drush field:create node formula field_dosage \
    --field-label="Dosage" \
    --field-type=string_long \
    --cardinality=1

drush field:create node formula field_total_weight \
    --field-label="Total Weight" \
    --field-type=decimal \
    --cardinality=1

drush field:create node formula field_total_weight_unit \
    --field-label="Total Weight Unit" \
    --field-type=list_string \
    --cardinality=1

drush field:create node formula field_use_cases \
    --field-label="Use Cases" \
    --field-type=string \
    --cardinality=-1

drush field:create node formula field_traditional_name \
    --field-label="Traditional Name" \
    --field-type=string \
    --cardinality=1

drush field:create node formula field_pinyin_name \
    --field-label="Pinyin Name" \
    --field-type=string \
    --cardinality=1

drush field:create node formula field_chinese_name \
    --field-label="Chinese Name" \
    --field-type=string \
    --cardinality=1

drush field:create node formula field_formula_category \
    --field-label="Formula Category" \
    --field-type=list_string \
    --cardinality=1

# Configure Total Weight Unit options
drush php:eval "
  \$field_storage = \Drupal\field\Entity\FieldStorageConfig::loadByName('node', 'field_total_weight_unit');
  if (\$field_storage) {
    \$settings = \$field_storage->getSettings();
    \$settings['allowed_values'] = [
      'g' => 'Grams (g)',
      'mg' => 'Milligrams (mg)',
      'oz' => 'Ounces (oz)',
      'lb' => 'Pounds (lb)',
    ];
    \$field_storage->setSettings(\$settings);
    \$field_storage->save();
  }
"

# Configure Formula Category options
drush php:eval "
  \$field_storage = \Drupal\field\Entity\FieldStorageConfig::loadByName('node', 'field_formula_category');
  if (\$field_storage) {
    \$settings = \$field_storage->getSettings();
    \$settings['allowed_values'] = [
      'classical' => 'Classical Formula',
      'modern' => 'Modern Formula',
      'patent' => 'Patent Medicine',
      'custom' => 'Custom Formula',
    ];
    \$field_storage->setSettings(\$settings);
    \$field_storage->save();
  }
"

echo -e "${GREEN}✓ Formula content type created${NC}"
echo ""

################################################################################
# REVIEW CONTENT TYPE
################################################################################

echo -e "${BLUE}Creating Review content type...${NC}"

drush php:eval "
  \$type = \Drupal::entityTypeManager()->getStorage('node_type')->create([
    'type' => 'review',
    'name' => 'Review',
    'description' => 'User review of herb, modality, or practitioner',
    'title_label' => 'Review Title',
    'preview_mode' => DRUPAL_OPTIONAL,
    'display_submitted' => TRUE,
  ]);
  \$type->save();
  echo 'Review content type created\n';
"

# Review fields
drush field:create node review field_rating \
    --field-label="Rating" \
    --field-type=decimal \
    --cardinality=1

drush field:create node review field_comment \
    --field-label="Comment" \
    --field-type=text_long \
    --cardinality=1

drush field:create node review field_verified_purchase \
    --field-label="Verified Experience" \
    --field-type=boolean \
    --cardinality=1

drush field:create node review field_helpful_count \
    --field-label="Helpful Count" \
    --field-type=integer \
    --cardinality=1

echo -e "${GREEN}✓ Review content type created${NC}"
echo ""

################################################################################
# GROK INSIGHT CONTENT TYPE
################################################################################

echo -e "${BLUE}Creating Grok Insight content type...${NC}"

drush php:eval "
  \$type = \Drupal::entityTypeManager()->getStorage('node_type')->create([
    'type' => 'grok_insight',
    'name' => 'Grok Insight',
    'description' => 'AI-generated health insight from symptom analysis',
    'title_label' => 'Insight Title',
    'preview_mode' => DRUPAL_OPTIONAL,
    'display_submitted' => TRUE,
  ]);
  \$type->save();
  echo 'Grok Insight content type created\n';
"

# Grok Insight fields
drush field:create node grok_insight field_user_symptoms \
    --field-label="User Symptoms" \
    --field-type=text_long \
    --cardinality=1

drush field:create node grok_insight field_ai_analysis \
    --field-label="AI Analysis" \
    --field-type=text_long \
    --cardinality=1

drush field:create node grok_insight field_confidence_score \
    --field-label="Confidence Score" \
    --field-type=decimal \
    --cardinality=1

drush field:create node grok_insight field_follow_up_questions \
    --field-label="Follow-up Questions" \
    --field-type=string_long \
    --cardinality=-1

echo -e "${GREEN}✓ Grok Insight content type created${NC}"
echo ""

################################################################################
# CONFIGURE PERMISSIONS
################################################################################

echo -e "${BLUE}Configuring permissions...${NC}"

# Modality permissions
drush role:perm:add authenticated 'create modality content,edit own modality content,delete own modality content'
drush role:perm:add editor 'create modality content,edit any modality content,delete any modality content'

# Condition permissions
drush role:perm:add authenticated 'create condition content,edit own condition content,delete own condition content'
drush role:perm:add editor 'create condition content,edit any condition content,delete any condition content'

# Practitioner permissions
drush role:perm:add authenticated 'create practitioner content,edit own practitioner content,delete own practitioner content'
drush role:perm:add editor 'create practitioner content,edit any practitioner content,delete any practitioner content'

# Formula permissions
drush role:perm:add authenticated 'create formula content,edit own formula content,delete own formula content'
drush role:perm:add editor 'create formula content,edit any formula content,delete any formula content'

# Review permissions
drush role:perm:add authenticated 'create review content,edit own review content,delete own review content'
drush role:perm:add editor 'create review content,edit any review content,delete any review content'

# Grok Insight permissions (admin only for creation)
drush role:perm:add administrator 'create grok_insight content,edit any grok_insight content,delete any grok_insight content'

echo -e "${GREEN}✓ Permissions configured${NC}"
echo ""

################################################################################
# CLEAR CACHE
################################################################################

echo -e "${BLUE}Clearing cache...${NC}"
drush cr
echo -e "${GREEN}✓ Cache cleared${NC}"
echo ""

echo "=========================================================="
echo -e "${GREEN}SUCCESS! All content types created!${NC}"
echo "=========================================================="
echo ""
echo "Created content types:"
echo "  - Modality (/node/add/modality)"
echo "  - Condition (/node/add/condition)"
echo "  - Practitioner (/node/add/practitioner)"
echo "  - Formula (/node/add/formula)"
echo "  - Review (/node/add/review)"
echo "  - Grok Insight (/node/add/grok_insight)"
echo ""
echo "JSON:API endpoints:"
echo "  - /jsonapi/node/modality"
echo "  - /jsonapi/node/condition"
echo "  - /jsonapi/node/practitioner"
echo "  - /jsonapi/node/formula"
echo "  - /jsonapi/node/review"
echo "  - /jsonapi/node/grok_insight"
echo ""

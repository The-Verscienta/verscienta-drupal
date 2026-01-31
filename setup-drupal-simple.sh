#!/bin/bash

################################################################################
# Verscienta Health - Simple Drupal Setup Script
#
# This is a minimal, robust setup script that creates the essential
# content types and fields without complex dependencies.
#
# Usage:
#   cd /home/pf1/verscienta-drupal
#   chmod +x setup-drupal-simple.sh
#   ./setup-drupal-simple.sh
#
################################################################################

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo ""
echo "============================================================"
echo "  Verscienta Health - Simple Setup"
echo "============================================================"
echo ""

# Check if DDEV is running
if ! ddev describe &> /dev/null; then
    echo -e "${YELLOW}DDEV is not running. Starting...${NC}"
    ddev start
fi

echo -e "${BLUE}Step 1: Enabling core modules...${NC}"
ddev drush en -y field field_ui text options datetime link image file taxonomy telephone node user

echo -e "${BLUE}Step 2: Enabling JSON:API...${NC}"
ddev drush en -y jsonapi serialization

echo -e "${BLUE}Step 3: Configuring CORS...${NC}"

# Make directory writable and use bash -c to write file
ddev exec bash -c "chmod u+w /var/www/html/web/sites/default && cat > /var/www/html/web/sites/default/services.yml << 'EOFINNER'
parameters:
  cors.config:
    enabled: true
    allowedHeaders: ['*']
    allowedMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS']
    allowedOrigins: ['http://localhost:3000', 'https://backend.ddev.site']
    exposedHeaders: false
    maxAge: 1000
    supportsCredentials: true
EOFINNER
chmod 444 /var/www/html/web/sites/default/services.yml
chmod 555 /var/www/html/web/sites/default"

echo -e "${GREEN}✓ CORS configured${NC}"

echo -e "${BLUE}Step 4: Creating Herb content type...${NC}"
ddev drush php:eval "
\$storage = \Drupal::entityTypeManager()->getStorage('node_type');
if (!\$storage->load('herb')) {
  \$type = \$storage->create([
    'type' => 'herb',
    'name' => 'Herb',
    'description' => 'Medicinal herb database entry',
  ]);
  \$type->save();
  echo 'Created Herb content type\n';
} else {
  echo 'Herb content type already exists\n';
}
"

echo -e "${BLUE}Step 5: Creating Modality content type...${NC}"
ddev drush php:eval "
\$storage = \Drupal::entityTypeManager()->getStorage('node_type');
if (!\$storage->load('modality')) {
  \$type = \$storage->create([
    'type' => 'modality',
    'name' => 'Modality',
    'description' => 'Holistic health modality',
  ]);
  \$type->save();
  echo 'Created Modality content type\n';
} else {
  echo 'Modality content type already exists\n';
}
"

echo -e "${BLUE}Step 6: Creating Condition content type...${NC}"
ddev drush php:eval "
\$storage = \Drupal::entityTypeManager()->getStorage('node_type');
if (!\$storage->load('condition')) {
  \$type = \$storage->create([
    'type' => 'condition',
    'name' => 'Condition',
    'description' => 'Health condition',
  ]);
  \$type->save();
  echo 'Created Condition content type\n';
} else {
  echo 'Condition content type already exists\n';
}
"

echo -e "${BLUE}Step 7: Creating Practitioner content type...${NC}"
ddev drush php:eval "
\$storage = \Drupal::entityTypeManager()->getStorage('node_type');
if (!\$storage->load('practitioner')) {
  \$type = \$storage->create([
    'type' => 'practitioner',
    'name' => 'Practitioner',
    'description' => 'Health practitioner',
  ]);
  \$type->save();
  echo 'Created Practitioner content type\n';
} else {
  echo 'Practitioner content type already exists\n';
}
"

echo -e "${BLUE}Step 8: Creating basic Herb fields...${NC}"

# Scientific Name
ddev drush php:eval "
use Drupal\field\Entity\FieldStorageConfig;
use Drupal\field\Entity\FieldConfig;

\$field_name = 'field_scientific_name';
\$entity_type = 'node';
\$bundle = 'herb';

if (!FieldStorageConfig::loadByName(\$entity_type, \$field_name)) {
  FieldStorageConfig::create([
    'field_name' => \$field_name,
    'entity_type' => \$entity_type,
    'type' => 'string',
  ])->save();
}

if (!FieldConfig::loadByName(\$entity_type, \$bundle, \$field_name)) {
  FieldConfig::create([
    'field_name' => \$field_name,
    'entity_type' => \$entity_type,
    'bundle' => \$bundle,
    'label' => 'Scientific Name',
    'required' => TRUE,
  ])->save();
  echo 'Created field_scientific_name\n';
}
"

# Family
ddev drush php:eval "
use Drupal\field\Entity\FieldStorageConfig;
use Drupal\field\Entity\FieldConfig;

\$field_name = 'field_family';
\$entity_type = 'node';
\$bundle = 'herb';

if (!FieldStorageConfig::loadByName(\$entity_type, \$field_name)) {
  FieldStorageConfig::create([
    'field_name' => \$field_name,
    'entity_type' => \$entity_type,
    'type' => 'string',
  ])->save();
}

if (!FieldConfig::loadByName(\$entity_type, \$bundle, \$field_name)) {
  FieldConfig::create([
    'field_name' => \$field_name,
    'entity_type' => \$entity_type,
    'bundle' => \$bundle,
    'label' => 'Botanical Family',
  ])->save();
  echo 'Created field_family\n';
}
"

# Description field (custom text_long field)
ddev drush php:eval "
use Drupal\field\Entity\FieldStorageConfig;
use Drupal\field\Entity\FieldConfig;

\$field_name = 'field_description';
\$entity_type = 'node';
\$bundle = 'herb';

if (!FieldStorageConfig::loadByName(\$entity_type, \$field_name)) {
  FieldStorageConfig::create([
    'field_name' => \$field_name,
    'entity_type' => \$entity_type,
    'type' => 'text_long',
  ])->save();
}

if (!FieldConfig::loadByName(\$entity_type, \$bundle, \$field_name)) {
  FieldConfig::create([
    'field_name' => \$field_name,
    'entity_type' => \$entity_type,
    'bundle' => \$bundle,
    'label' => 'Description',
  ])->save();
  echo 'Created field_description\n';
}
"

echo -e "${BLUE}Step 9: Creating basic Modality fields...${NC}"

# Excels At
ddev drush php:eval "
use Drupal\field\Entity\FieldStorageConfig;
use Drupal\field\Entity\FieldConfig;

\$field_name = 'field_excels_at';
\$entity_type = 'node';
\$bundle = 'modality';

if (!FieldStorageConfig::loadByName(\$entity_type, \$field_name)) {
  FieldStorageConfig::create([
    'field_name' => \$field_name,
    'entity_type' => \$entity_type,
    'type' => 'string',
    'cardinality' => -1,
  ])->save();
}

if (!FieldConfig::loadByName(\$entity_type, \$bundle, \$field_name)) {
  FieldConfig::create([
    'field_name' => \$field_name,
    'entity_type' => \$entity_type,
    'bundle' => \$bundle,
    'label' => 'Excels At',
  ])->save();
  echo 'Created field_excels_at\n';
}
"

# Benefits field
ddev drush php:eval "
use Drupal\field\Entity\FieldStorageConfig;
use Drupal\field\Entity\FieldConfig;

\$field_name = 'field_benefits';
\$entity_type = 'node';
\$bundle = 'modality';

if (!FieldStorageConfig::loadByName(\$entity_type, \$field_name)) {
  FieldStorageConfig::create([
    'field_name' => \$field_name,
    'entity_type' => \$entity_type,
    'type' => 'text_long',
  ])->save();
}

if (!FieldConfig::loadByName(\$entity_type, \$bundle, \$field_name)) {
  FieldConfig::create([
    'field_name' => \$field_name,
    'entity_type' => \$entity_type,
    'bundle' => \$bundle,
    'label' => 'Benefits',
  ])->save();
  echo 'Created field_benefits\n';
}
"

echo -e "${BLUE}Step 10: Creating Condition fields...${NC}"

# Symptoms
ddev drush php:eval "
use Drupal\field\Entity\FieldStorageConfig;
use Drupal\field\Entity\FieldConfig;

\$field_name = 'field_symptoms';
\$entity_type = 'node';
\$bundle = 'condition';

if (!FieldStorageConfig::loadByName(\$entity_type, \$field_name)) {
  FieldStorageConfig::create([
    'field_name' => \$field_name,
    'entity_type' => \$entity_type,
    'type' => 'string',
    'cardinality' => -1,
  ])->save();
}

if (!FieldConfig::loadByName(\$entity_type, \$bundle, \$field_name)) {
  FieldConfig::create([
    'field_name' => \$field_name,
    'entity_type' => \$entity_type,
    'bundle' => \$bundle,
    'label' => 'Symptoms',
  ])->save();
  echo 'Created field_symptoms\n';
}
"

echo -e "${BLUE}Step 11: Setting permissions...${NC}"
ddev drush role:perm:add anonymous 'access content' || true
ddev drush role:perm:add authenticated 'access content' || true

echo -e "${BLUE}Step 12: Clearing cache...${NC}"
ddev drush cr

echo ""
echo "============================================================"
echo -e "${GREEN}✓ SETUP COMPLETE!${NC}"
echo "============================================================"
echo ""
echo "Created content types:"
echo "  - Herb (with fields: Scientific Name, Family, Description)"
echo "  - Modality (with fields: Excels At, Benefits)"
echo "  - Condition (with fields: Symptoms)"
echo "  - Practitioner"
echo ""
echo "JSON:API endpoints available at:"
echo "  - https://backend.ddev.site/jsonapi/node/herb"
echo "  - https://backend.ddev.site/jsonapi/node/modality"
echo "  - https://backend.ddev.site/jsonapi/node/condition"
echo ""
echo "Next steps:"
echo "  1. Create content: ddev drush uli"
echo "  2. Start frontend: cd frontend && npm run dev"
echo ""
echo "============================================================"
echo ""

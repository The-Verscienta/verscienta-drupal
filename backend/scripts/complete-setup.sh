#!/bin/bash

################################################################################
# Verscienta Health - Complete Platform Setup Script
#
# This master script sets up the entire Drupal backend:
# 1. Installs all required modules
# 2. Creates all content types
# 3. Configures JSON:API
# 4. Sets up CORS
# 5. Configures permissions
# 6. Creates sample content (optional)
#
# Usage:
#   ddev ssh
#   cd /var/www/html
#   chmod +x scripts/complete-setup.sh
#   ./scripts/complete-setup.sh
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
echo "  Verscienta Health - Complete Platform Setup"
echo "============================================================"
echo ""
echo "This script will set up your entire Drupal backend."
echo ""

# Check if we're in Drupal root
if [ ! -f "web/index.php" ]; then
    echo -e "${RED}Error: Not in Drupal root directory${NC}"
    echo "Please run this from /var/www/html inside DDEV"
    exit 1
fi

# Confirm before proceeding
read -p "Continue with setup? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Setup cancelled."
    exit 1
fi

echo ""
echo "============================================================"
echo "PHASE 1: Installing Required Modules"
echo "============================================================"
echo ""

echo -e "${BLUE}Installing core field modules...${NC}"
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
    telephone

echo -e "${BLUE}Installing contrib modules...${NC}"
drush en -y \
    paragraphs \
    field_group \
    jsonapi \
    jsonapi_extras \
    serialization \
    rest \
    cors

echo -e "${GREEN}✓ All modules installed${NC}"
echo ""

echo "============================================================"
echo "PHASE 2: Configuring CORS"
echo "============================================================"
echo ""

echo -e "${BLUE}Setting up CORS for frontend access...${NC}"

# Create or update services.yml for CORS
cat > web/sites/default/services.yml << 'EOF'
parameters:
  cors.config:
    enabled: true
    allowedHeaders:
      - '*'
    allowedMethods:
      - GET
      - POST
      - PATCH
      - DELETE
      - OPTIONS
    allowedOrigins:
      - 'http://localhost:3000'
      - 'http://localhost:3001'
      - 'https://backend.ddev.site'
    exposedHeaders: false
    maxAge: 1000
    supportsCredentials: true
EOF

echo -e "${GREEN}✓ CORS configured${NC}"
echo ""

echo "============================================================"
echo "PHASE 3: Creating Content Types"
echo "============================================================"
echo ""

# Run the herb setup script
if [ -f "scripts/setup-herb-content-type.sh" ]; then
    echo -e "${BLUE}Running herb content type setup...${NC}"
    bash scripts/setup-herb-content-type.sh
else
    echo -e "${YELLOW}Warning: setup-herb-content-type.sh not found, skipping...${NC}"
fi

# Run the other content types setup script
if [ -f "scripts/setup-all-content-types.sh" ]; then
    echo -e "${BLUE}Running other content types setup...${NC}"
    bash scripts/setup-all-content-types.sh
else
    echo -e "${YELLOW}Warning: setup-all-content-types.sh not found, skipping...${NC}"
fi

echo ""
echo "============================================================"
echo "PHASE 4: Configuring JSON:API"
echo "============================================================"
echo ""

echo -e "${BLUE}Enabling JSON:API for all content types...${NC}"

# Enable JSON:API for each content type
for content_type in herb modality condition practitioner formula review grok_insight; do
    drush php:eval "
      \$config = \Drupal::configFactory()->getEditable('jsonapi_extras.jsonapi_resource_config.node--${content_type}');
      \$config->set('disabled', FALSE);
      \$config->set('path', 'node/${content_type}');
      \$config->save();
      echo 'JSON:API enabled for ${content_type}\n';
    "
done

echo -e "${GREEN}✓ JSON:API configured${NC}"
echo ""

echo "============================================================"
echo "PHASE 5: Creating User Roles"
echo "============================================================"
echo ""

echo -e "${BLUE}Creating custom roles...${NC}"

# Create Editor role
drush role:create editor "Editor" || true

# Create Practitioner role
drush role:create practitioner "Practitioner" || true

# Create Herbalist role
drush role:create herbalist "Herbalist" || true

echo -e "${GREEN}✓ Roles created${NC}"
echo ""

echo "============================================================"
echo "PHASE 6: Setting Permissions"
echo "============================================================"
echo ""

echo -e "${BLUE}Configuring role permissions...${NC}"

# Anonymous users - read only
drush role:perm:add anonymous 'access content,restful get jsonapi'

# Authenticated users - can create reviews and edit own content
drush role:perm:add authenticated 'access content,restful get jsonapi'

# Editor - full content management
drush role:perm:add editor 'access content,create herb content,edit any herb content,delete any herb content'
drush role:perm:add editor 'create modality content,edit any modality content,delete any modality content'
drush role:perm:add editor 'create condition content,edit any condition content,delete any condition content'
drush role:perm:add editor 'create formula content,edit any formula content,delete any formula content'

# Practitioner - manage own profile
drush role:perm:add practitioner 'create practitioner content,edit own practitioner content'

# Herbalist - manage herb content
drush role:perm:add herbalist 'create herb content,edit any herb content'
drush role:perm:add herbalist 'create formula content,edit any formula content'

echo -e "${GREEN}✓ Permissions configured${NC}"
echo ""

echo "============================================================"
echo "PHASE 7: Configuring Display Settings"
echo "============================================================"
echo ""

echo -e "${BLUE}Setting up default display modes...${NC}"

# Enable teaser view mode for all content types
for content_type in herb modality condition practitioner formula review grok_insight; do
    drush php:eval "
      \$view_display = \Drupal::entityTypeManager()
        ->getStorage('entity_view_display')
        ->create([
          'targetEntityType' => 'node',
          'bundle' => '${content_type}',
          'mode' => 'teaser',
          'status' => TRUE,
        ]);
      \$view_display->save();
      echo 'Teaser display created for ${content_type}\n';
    " || true
done

echo -e "${GREEN}✓ Display settings configured${NC}"
echo ""

echo "============================================================"
echo "PHASE 8: Creating Reference Fields"
echo "============================================================"
echo ""

echo -e "${BLUE}Creating entity reference fields...${NC}"

# Herb -> Conditions
drush field:create node herb field_conditions_treated \
    --field-label="Conditions Treated" \
    --field-type=entity_reference \
    --target-type=node \
    --target-bundle=condition \
    --cardinality=-1 || true

# Herb -> Related Species
drush field:create node herb field_related_species \
    --field-label="Related Species" \
    --field-type=entity_reference \
    --target-type=node \
    --target-bundle=herb \
    --cardinality=-1 || true

# Herb -> Substitute Herbs
drush field:create node herb field_substitute_herbs \
    --field-label="Substitute Herbs" \
    --field-type=entity_reference \
    --target-type=node \
    --target-bundle=herb \
    --cardinality=-1 || true

# Modality -> Conditions
drush field:create node modality field_conditions \
    --field-label="Conditions" \
    --field-type=entity_reference \
    --target-type=node \
    --target-bundle=condition \
    --cardinality=-1 || true

# Practitioner -> Modalities
drush field:create node practitioner field_modalities \
    --field-label="Modalities Practiced" \
    --field-type=entity_reference \
    --target-type=node \
    --target-bundle=modality \
    --cardinality=-1 || true

# Formula -> Conditions
drush field:create node formula field_formula_conditions \
    --field-label="Conditions" \
    --field-type=entity_reference \
    --target-type=node \
    --target-bundle=condition \
    --cardinality=-1 || true

# Review -> Entity being reviewed (universal)
drush field:create node review field_reviewed_entity \
    --field-label="Reviewed Entity" \
    --field-type=entity_reference \
    --target-type=node \
    --cardinality=1 || true

echo -e "${GREEN}✓ Reference fields created${NC}"
echo ""

echo "============================================================"
echo "PHASE 9: Final Configuration"
echo "============================================================"
echo ""

echo -e "${BLUE}Rebuilding cache and permissions...${NC}"

drush cr

echo -e "${GREEN}✓ Cache cleared${NC}"
echo ""

echo "============================================================"
echo -e "${GREEN}✓ SETUP COMPLETE!${NC}"
echo "============================================================"
echo ""
echo "Your Verscienta Health backend is now ready!"
echo ""
echo "Next steps:"
echo ""
echo "1. Create sample content:"
echo "   - Herbs: /node/add/herb"
echo "   - Modalities: /node/add/modality"
echo "   - Conditions: /node/add/condition"
echo "   - Practitioners: /node/add/practitioner"
echo "   - Formulas: /node/add/formula"
echo ""
echo "2. View JSON:API endpoints:"
echo "   - Herbs: https://backend.ddev.site/jsonapi/node/herb"
echo "   - Modalities: https://backend.ddev.site/jsonapi/node/modality"
echo "   - Conditions: https://backend.ddev.site/jsonapi/node/condition"
echo "   - Practitioners: https://backend.ddev.site/jsonapi/node/practitioner"
echo "   - Formulas: https://backend.ddev.site/jsonapi/node/formula"
echo ""
echo "3. Test frontend connection:"
echo "   - Start Next.js: cd frontend && npm run dev"
echo "   - Visit: http://localhost:3000"
echo ""
echo "4. Admin access:"
echo "   - URL: https://backend.ddev.site/admin"
echo "   - Username: admin"
echo "   - Password: admin"
echo ""
echo "============================================================"
echo ""

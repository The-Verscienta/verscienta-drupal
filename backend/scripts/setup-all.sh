#!/bin/bash

# ============================================================================
# Verscienta Health - Master Setup Script
# ============================================================================
# This script runs all setup scripts in the correct order.
# Safe to run multiple times - checks for existing content.
#
# Usage: ddev exec bash /var/www/html/scripts/setup-all.sh
# ============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "=============================================="
echo "Verscienta Health - Complete Backend Setup"
echo "=============================================="
echo ""

# Check if content types already exist
echo -e "${BLUE}Checking existing setup...${NC}"
MODALITY_EXISTS=$(drush php:eval "echo \Drupal::entityTypeManager()->getStorage('node_type')->load('modality') ? 'yes' : 'no';" 2>/dev/null || echo "no")

if [ "$MODALITY_EXISTS" = "yes" ]; then
    echo -e "${YELLOW}Content types already exist - skipping content type creation${NC}"
    SKIP_CONTENT_TYPES=true
else
    echo "Content types not found - will create them"
    SKIP_CONTENT_TYPES=false
fi

echo ""
echo "This script will run the following setup:"
if [ "$SKIP_CONTENT_TYPES" = "false" ]; then
    echo "  1. setup-all-content-types.sh - Create content types"
fi
echo "  2. setup-taxonomies.sh - Create taxonomy vocabularies"
echo "  3. setup-entity-references.sh - Create cross-linking fields"
echo "  4. setup-additional-fields.sh - Add extra fields to content types"
echo "  5. create-sample-content.sh - Populate with sample data"
echo ""
echo "Press Enter to continue or Ctrl+C to cancel..."
read -r

# Step 1: Content Types (if needed)
if [ "$SKIP_CONTENT_TYPES" = "false" ]; then
    echo ""
    echo "=============================================="
    echo "Step 1/5: Creating Content Types"
    echo "=============================================="
    bash "$SCRIPT_DIR/setup-all-content-types.sh" || {
        echo -e "${RED}Content type creation failed. They may already exist.${NC}"
    }
else
    echo ""
    echo "=============================================="
    echo "Step 1/5: Skipping Content Types (already exist)"
    echo "=============================================="
fi

# Step 2: Taxonomies
echo ""
echo "=============================================="
echo "Step 2/5: Creating Taxonomies"
echo "=============================================="
bash "$SCRIPT_DIR/setup-taxonomies.sh" || {
    echo -e "${YELLOW}Some taxonomies may already exist - continuing...${NC}"
}

# Step 3: Entity References
echo ""
echo "=============================================="
echo "Step 3/5: Creating Entity Reference Fields"
echo "=============================================="
bash "$SCRIPT_DIR/setup-entity-references.sh" || {
    echo -e "${YELLOW}Some fields may already exist - continuing...${NC}"
}

# Step 4: Additional Fields
echo ""
echo "=============================================="
echo "Step 4/5: Creating Additional Fields"
echo "=============================================="
bash "$SCRIPT_DIR/setup-additional-fields.sh" || {
    echo -e "${YELLOW}Some fields may already exist - continuing...${NC}"
}

# Step 5: Sample Content
echo ""
echo "=============================================="
echo "Step 5/5: Creating Sample Content"
echo "=============================================="
bash "$SCRIPT_DIR/create-sample-content.sh" || {
    echo -e "${YELLOW}Some content may already exist - continuing...${NC}"
}

# Final cache clear
echo ""
echo "=============================================="
echo "Final Cache Clear"
echo "=============================================="
drush cr

echo ""
echo -e "${GREEN}=============================================="
echo "Setup Complete!"
echo "==============================================${NC}"
echo ""
echo "Your Drupal backend is now configured with:"
echo "  - 7 content types (herb, modality, condition, practitioner, formula, review, grok_insight)"
echo "  - 6 taxonomy vocabularies with 150+ terms"
echo "  - 34 entity reference fields for cross-linking"
echo "  - 65+ additional fields for comprehensive data"
echo "  - Sample content for testing"
echo ""
echo "Next steps:"
echo "  1. Visit https://backend.ddev.site/admin/content to review content"
echo "  2. Configure field display settings"
echo "  3. Set up Views for custom JSON:API endpoints"
echo "  4. Export configuration: drush cex"
echo "  5. Start the frontend and test integration"
echo ""

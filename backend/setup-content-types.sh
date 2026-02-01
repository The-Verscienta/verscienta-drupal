#!/bin/bash
# Verscienta Health - Content Types Setup Script
# Run this after DDEV installation: ddev exec bash setup-content-types.sh

echo "🌿 Setting up Verscienta Health Content Types..."

# Enable required core modules
echo "📦 Enabling core modules..."
drush en -y jsonapi rest serialization content_translation locale

# Enable contrib modules
echo "📦 Enabling contrib modules..."
drush en -y search_api webform pathauto metatag json_field jsonapi_extras redis conditional_fields field_group token admin_toolbar

# Enable custom module
echo "📦 Enabling custom module..."
drush en -y holistic_hub

# Create taxonomies
echo "🏷️ Creating taxonomies..."

# Herb Family vocabulary
drush config:set -y language.negotiation url.prefixes.en ''
drush language:add es
drush language:add zh-hans

# Create content types using Drush generate or manual commands
echo "📄 Creating content types..."

# Note: Content type creation is better done through the UI or config files
# This script focuses on module enablement and basic setup

echo "✅ Basic setup complete!"
echo ""
echo "Next steps:"
echo "1. Create content types via Drupal admin UI:"
echo "   - Herbs (Structure > Content types > Add content type)"
echo "   - Modalities"
echo "   - Conditions"
echo "   - Practitioners"
echo "   - Symptoms"
echo "   - Reviews"
echo "   - Grok Insights"
echo ""
echo "2. Configure JSON:API at /admin/config/services/jsonapi"
echo "3. Set up Search API at /admin/config/search/search-api"
echo ""
echo "Or use the configuration import: ddev drush config:import --source=../config/sync"

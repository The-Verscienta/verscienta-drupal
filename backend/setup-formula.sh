#!/bin/bash
# Verscienta Health - Formula Content Type Setup
# Run with: ddev exec bash setup-formula.sh

set -e

echo "🌿 Setting up Formula content type..."

# Check if required modules are enabled
echo "📦 Checking and enabling required modules..."
drush en -y paragraphs entity_reference_revisions options text

# Apply the recipe
echo "📜 Applying Formula recipe..."
if [ -d "web/recipes/verscienta_formula" ]; then
    drush recipe web/recipes/verscienta_formula
elif [ -d "recipes/verscienta_formula" ]; then
    drush recipe recipes/verscienta_formula
else
    echo "❌ Recipe not found"
    echo "   Looking for: web/recipes/verscienta_formula or recipes/verscienta_formula"
    exit 1
fi

# Configure JSON:API
echo "🔧 Configuring JSON:API..."
drush en -y jsonapi jsonapi_extras

# Clear caches
echo "🧹 Clearing caches..."
drush cr

echo ""
echo "✅ Formula content type setup complete!"
echo ""
echo "Next steps:"
echo "1. Create some herb content first (node--herb)"
echo "2. Then create formulas at: /node/add/formula"
echo "3. Access via JSON:API: /jsonapi/node/formula"
echo ""
echo "To include herb ingredients in API response:"
echo "  /jsonapi/node/formula?include=field_herb_ingredients"

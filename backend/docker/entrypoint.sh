#!/bin/bash
set -e

SETTINGS_DIR="/var/www/html/web/sites/default"
SETTINGS_FILE="${SETTINGS_DIR}/settings.php"
LOCAL_SETTINGS="/var/www/html/web/sites/default/settings.local.php"

# Ensure settings.php exists (may have been removed or never created)
if [ ! -f "$SETTINGS_FILE" ]; then
  echo "Creating settings.php from default template..."
  cp "${SETTINGS_DIR}/default.settings.php" "$SETTINGS_FILE"
fi

# Ensure settings.local.php include is enabled in settings.php
if ! grep -q "^if (file_exists.*settings\.local\.php" "$SETTINGS_FILE"; then
  echo "Enabling settings.local.php include..."
  # Uncomment the include block
  sed -i 's/^# if (file_exists.*settings\.local\.php.*/if (file_exists($app_root . "\/" . $site_path . "\/settings.local.php")) {/' "$SETTINGS_FILE"
  sed -i 's/^#   include.*settings\.local\.php.*/  include $app_root . "\/" . $site_path . "\/settings.local.php";/' "$SETTINGS_FILE"
  sed -i 's/^# }$/}/' "$SETTINGS_FILE"
fi

# Always write settings.local.php from the bundled template
# This ensures env vars are always read, even if an old version exists
cp /var/www/html/docker/settings.local.php "$LOCAL_SETTINGS"

# Ensure correct permissions
chmod 644 "$SETTINGS_FILE"
chmod 644 "$LOCAL_SETTINGS"
chown www-data:www-data "$SETTINGS_FILE" "$LOCAL_SETTINGS"

# Ensure files directory exists and has correct permissions
mkdir -p "${SETTINGS_DIR}/files"
chown -R www-data:www-data "${SETTINGS_DIR}/files"

# Ensure private files directory exists
mkdir -p /var/www/private
chown -R www-data:www-data /var/www/private

# Wait for database to be ready
if [ -n "$DRUPAL_DATABASE_HOST" ]; then
  echo "Waiting for database..."
  until php -r "new PDO('mysql:host='.getenv('DRUPAL_DATABASE_HOST').';port='.getenv('DRUPAL_DATABASE_PORT').';dbname='.getenv('DRUPAL_DATABASE_NAME'), getenv('DRUPAL_DATABASE_USER'), getenv('DRUPAL_DATABASE_PASSWORD'));" 2>/dev/null; do
    sleep 2
  done
  echo "Database is ready!"
fi

# Start Apache
exec apache2-foreground

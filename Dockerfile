# Production Dockerfile for Drupal
# https://www.drupal.org/docs/system-requirements/php-requirements

# Build arguments for version control
ARG PHP_VERSION=8.3
ARG COMPOSER_VERSION=2
ARG NODE_VERSION=20

# ============================================
# Stage 1: Builder Stage
# ============================================
FROM php:${PHP_VERSION}-apache-bookworm AS builder

# Metadata labels
LABEL maintainer="your-email@example.com" \
      description="Production-ready Drupal CMS Docker image" \
      version="1.0.0" \
      org.opencontainers.image.source="https://github.com/verscienta/drupal" \
      org.opencontainers.image.vendor="Verscienta" \
      org.opencontainers.image.title="Drupal Production Image" \
      org.opencontainers.image.description="Optimized Drupal CMS for production deployment"

# Install system dependencies and PHP extensions
RUN set -eux; \
	\
	# Enable required Apache modules
	if command -v a2enmod; then \
		a2enmod expires rewrite headers deflate filter; \
	fi; \
	\
	savedAptMark="$(apt-mark showmanual)"; \
	\
	# Update and upgrade system packages for security
	apt-get update; \
	apt-get upgrade -y; \
	apt-get install -y --no-install-recommends --no-install-suggests \
		libfreetype6-dev \
		libjpeg-dev \
		libpng-dev \
		libpq-dev \
		libwebp-dev \
		libzip-dev \
		libicu-dev \
		libonig-dev \
		libmemcached-dev \
		libcurl4-openssl-dev \
		git \
		unzip \
		ca-certificates \
	; \
	\
	# Configure GD library with all image format support
	docker-php-ext-configure gd \
		--with-freetype \
		--with-jpeg=/usr \
		--with-webp \
	; \
	\
	# Configure intl extension for internationalization
	docker-php-ext-configure intl; \
	\
	# Install PHP extensions in parallel for faster builds
	docker-php-ext-install -j "$(nproc)" \
		gd \
		pdo_mysql \
		pdo_pgsql \
		zip \
		opcache \
		bcmath \
		exif \
		intl \
		mbstring \
		sockets \
		curl \
	; \
	\
	# Install PECL extensions for caching and performance
	pecl install redis memcached apcu; \
	docker-php-ext-enable redis memcached apcu; \
	\
	# Aggressive cleanup to minimize layer size
	pecl clear-cache; \
	rm -rf /tmp/pear ~/.pearrc; \
	apt-mark auto '.*' > /dev/null; \
	apt-mark manual $savedAptMark; \
	ldd "$(php -r 'echo ini_get("extension_dir");')"/*.so \
		| awk '/=>/ { so = $(NF-1); if (index(so, "/usr/local/") == 1) { next }; gsub("^/(usr/)?", "", so); printf "*%s\n", so }' \
		| sort -u \
		| xargs -r dpkg-query -S \
		| cut -d: -f1 \
		| sort -u \
		| xargs -rt apt-mark manual; \
	\
	apt-get purge -y --auto-remove -o APT::AutoRemove::RecommendsImportant=false; \
	apt-get clean; \
	rm -rf /var/lib/apt/lists/* /var/cache/apt/archives/*

# Copy composer for build stage only
COPY --from=composer:2 /usr/bin/composer /usr/local/bin/

ENV COMPOSER_ALLOW_SUPERUSER=1 \
    COMPOSER_NO_INTERACTION=1 \
    COMPOSER_PROCESS_TIMEOUT=600

WORKDIR /opt/drupal

# Install Drupal with error handling and optimization
RUN set -eux; \
	export COMPOSER_HOME="$(mktemp -d)"; \
	export COMPOSER_CACHE_DIR="$(mktemp -d)"; \
	\
	# Install Drupal CMS with all dependencies including dev
	echo "Installing Drupal CMS"; \
	composer create-project drupal/cms . --no-interaction; \
	\
	# Ensure all autoload files are generated properly
	composer dump-autoload --optimize --classmap-authoritative; \
	\
	# Verify installation and critical components
	[ -d "web" ] || { echo "Drupal web directory not found"; exit 1; }; \
	[ -f "web/index.php" ] || { echo "Drupal index.php not found"; exit 1; }; \
	[ -d "vendor" ] || { echo "Vendor directory not found"; exit 1; }; \
	[ -f "vendor/autoload.php" ] || { echo "Autoload file not found"; exit 1; }; \
	[ -d "vendor/symfony/yaml" ] || { echo "Symfony YAML not found, installing..."; composer require symfony/yaml; }; \
	composer check-platform-reqs || true; \
	\
	# Clean up composer caches and remove composer binary
	rm -rf "$COMPOSER_HOME" "$COMPOSER_CACHE_DIR" /usr/local/bin/composer; \
	\
	# Remove non-essential files but preserve important ones
	# IMPORTANT: Keep composer.json and composer.lock for proper autoloading
	find . -type f \( -name "*.txt" -o -name "*.md" \) ! -name "robots.txt" ! -name "LICENSE.txt" ! -name "CHANGELOG.txt" -delete 2>/dev/null || true; \
	find . -type f -name ".git*" -delete 2>/dev/null || true; \
	find . -type d -name ".git" -exec rm -rf {} + 2>/dev/null || true; \
	find . -type f -name "*.yml.dist" -delete 2>/dev/null || true; \
	find . -type f -name "*.xml.dist" -delete 2>/dev/null || true; \
	\
	# Set proper permissions for Drupal directories
	mkdir -p web/sites/default/files web/sites/default/private /opt/drupal/private; \
	chown -R www-data:www-data web/sites web/modules web/themes; \
	chmod -R 755 web/sites/default; \
	\
	# Ensure settings file has correct permissions if it exists
	if [ -f web/sites/default/default.settings.php ]; then \
		chmod 644 web/sites/default/default.settings.php; \
	fi; \
	\
	# Create a basic settings.php to prevent installation issues
	if [ ! -f web/sites/default/settings.php ]; then \
		cp web/sites/default/default.settings.php web/sites/default/settings.php 2>/dev/null || true; \
		chown www-data:www-data web/sites/default/settings.php 2>/dev/null || true; \
		chmod 666 web/sites/default/settings.php 2>/dev/null || true; \
	fi

# ============================================
# Stage 2: Production Runtime Stage
# ============================================
FROM php:${PHP_VERSION}-apache-bookworm

ARG PHP_VERSION
LABEL maintainer="your-email@example.com" \
      description="Production Drupal CMS Runtime" \
      php.version="${PHP_VERSION}" \
      org.opencontainers.image.created="$(date -u +'%Y-%m-%dT%H:%M:%SZ')"

# Install only runtime dependencies with security updates
RUN set -eux; \
	\
	# Enable required Apache modules and disable unnecessary ones
	if command -v a2enmod; then \
		a2enmod expires rewrite headers deflate filter negotiation; \
		a2dismod -f status autoindex; \
	fi; \
	\
	# Update and upgrade for security patches
	apt-get update; \
	apt-get upgrade -y; \
	apt-get install -y --no-install-recommends --no-install-suggests \
		libfreetype6 \
		libjpeg62-turbo \
		libpng16-16 \
		libpq5 \
		libwebp7 \
		libzip4 \
		libicu72 \
		libonig5 \
		libmemcached11 \
		libcurl4 \
		curl \
		ca-certificates \
	; \
	\
	# Clean up apt cache completely
	apt-get clean; \
	apt-get autoremove -y; \
	rm -rf /var/lib/apt/lists/* /var/cache/apt/archives/* /usr/share/doc/* /usr/share/man/*

# Copy PHP extensions from builder stage
COPY --from=builder /usr/local/lib/php/extensions/ /usr/local/lib/php/extensions/
COPY --from=builder /usr/local/etc/php/conf.d/ /usr/local/etc/php/conf.d/

# Production-optimized PHP configuration
RUN { \
		echo '; PHP Production Configuration'; \
		echo '; OPcache Settings - Optimized for Drupal'; \
		echo 'opcache.enable=1'; \
		echo 'opcache.memory_consumption=256'; \
		echo 'opcache.interned_strings_buffer=16'; \
		echo 'opcache.max_accelerated_files=20000'; \
		echo 'opcache.revalidate_freq=60'; \
		echo 'opcache.validate_timestamps=0'; \
		echo 'opcache.save_comments=1'; \
		echo 'opcache.fast_shutdown=1'; \
		echo 'opcache.enable_cli=0'; \
		echo 'opcache.file_cache_consistency_checks=0'; \
		echo 'opcache.file_update_protection=0'; \
		echo 'opcache.max_file_size=0'; \
		echo ''; \
		echo '; File Upload and Limits'; \
		echo 'upload_max_filesize=50M'; \
		echo 'post_max_size=50M'; \
		echo 'max_execution_time=60'; \
		echo 'max_input_time=60'; \
		echo 'memory_limit=256M'; \
		echo 'max_input_vars=3000'; \
		echo 'max_input_nesting_level=64'; \
		echo ''; \
		echo '; Error Handling'; \
		echo 'display_errors=Off'; \
		echo 'display_startup_errors=Off'; \
		echo 'log_errors=On'; \
		echo 'error_log=/var/log/php/error.log'; \
		echo 'error_reporting=E_ALL & ~E_DEPRECATED & ~E_STRICT & ~E_NOTICE'; \
		echo 'ignore_repeated_errors=On'; \
		echo ''; \
		echo '; Timezone'; \
		echo 'date.timezone=UTC'; \
	} > /usr/local/etc/php/conf.d/00-production.ini

# Security-hardened PHP configuration
RUN { \
		echo '; PHP Security Configuration'; \
		echo 'expose_php=Off'; \
		echo 'session.cookie_httponly=On'; \
		echo 'session.use_only_cookies=On'; \
		echo 'session.cookie_secure=On'; \
		echo 'session.cookie_samesite=Strict'; \
		echo 'session.use_strict_mode=On'; \
		echo 'session.sid_length=48'; \
		echo 'session.sid_bits_per_character=6'; \
		echo 'session.name=DRUPALSESSID'; \
		echo 'session.gc_probability=1'; \
		echo 'session.gc_divisor=100'; \
		echo 'session.gc_maxlifetime=2880'; \
		echo 'session.use_trans_sid=0'; \
		echo 'allow_url_fopen=On'; \
		echo 'allow_url_include=Off'; \
		echo 'open_basedir=/opt/drupal:/tmp:/var/log/php'; \
		echo 'disable_functions=exec,passthru,shell_exec,system,proc_open,popen,curl_exec,curl_multi_exec,parse_ini_file,show_source,phpinfo'; \
		echo 'enable_dl=Off'; \
		echo 'assert.active=0'; \
	} > /usr/local/etc/php/conf.d/01-security.ini

# APCu cache configuration for production
RUN { \
		echo '; APCu Cache Configuration'; \
		echo 'apc.enabled=1'; \
		echo 'apc.shm_size=128M'; \
		echo 'apc.ttl=7200'; \
		echo 'apc.user_ttl=7200'; \
		echo 'apc.num_files_hint=10000'; \
		echo 'apc.enable_cli=0'; \
		echo 'apc.use_request_time=0'; \
		echo 'apc.coredump_unmap=1'; \
		echo 'apc.serializer=php'; \
	} > /usr/local/etc/php/conf.d/02-apcu.ini

# Apache security and performance configuration
RUN { \
		echo '# Security Headers and Settings'; \
		echo 'ServerName localhost'; \
		echo 'ServerTokens Prod'; \
		echo 'ServerSignature Off'; \
		echo 'TraceEnable Off'; \
		echo 'FileETag MTime Size'; \
		echo 'Header always set X-Content-Type-Options "nosniff"'; \
		echo 'Header always set X-Frame-Options "DENY"'; \
		echo 'Header always set X-XSS-Protection "1; mode=block"'; \
		echo 'Header always set Referrer-Policy "strict-origin-when-cross-origin"'; \
		echo 'Header always set Content-Security-Policy "default-src '\''self'\''; script-src '\''self'\'' '\''unsafe-inline'\'' '\''unsafe-eval'\''; style-src '\''self'\'' '\''unsafe-inline'\''; img-src '\''self'\'' data: https:; font-src '\''self'\'' data:;"'; \
		echo 'Header always set Permissions-Policy "geolocation=(), microphone=(), camera=()"'; \
		echo 'Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"'; \
		echo 'Header always unset "X-Powered-By"'; \
		echo ''; \
		echo '# Compression Settings'; \
		echo 'AddOutputFilterByType DEFLATE text/plain text/css text/html text/xml text/javascript application/javascript application/json application/xml application/rss+xml application/atom+xml image/svg+xml'; \
		echo 'DeflateCompressionLevel 6'; \
		echo ''; \
		echo '# Browser Caching'; \
		echo 'ExpiresActive On'; \
		echo 'ExpiresByType image/jpeg "access plus 1 year"'; \
		echo 'ExpiresByType image/gif "access plus 1 year"'; \
		echo 'ExpiresByType image/png "access plus 1 year"'; \
		echo 'ExpiresByType image/webp "access plus 1 year"'; \
		echo 'ExpiresByType image/svg+xml "access plus 1 year"'; \
		echo 'ExpiresByType image/x-icon "access plus 1 year"'; \
		echo 'ExpiresByType video/mp4 "access plus 1 year"'; \
		echo 'ExpiresByType video/mpeg "access plus 1 year"'; \
		echo 'ExpiresByType text/css "access plus 1 month"'; \
		echo 'ExpiresByType text/javascript "access plus 1 month"'; \
		echo 'ExpiresByType application/javascript "access plus 1 month"'; \
		echo 'ExpiresByType application/pdf "access plus 1 month"'; \
		echo 'ExpiresByType application/x-shockwave-flash "access plus 1 month"'; \
		echo ''; \
		echo '# Directory Security'; \
		echo '<Directory /opt/drupal/web>'; \
		echo '    Options -Indexes +FollowSymLinks -MultiViews'; \
		echo '    AllowOverride All'; \
		echo '    Require all granted'; \
		echo '    DirectoryIndex index.php index.html'; \
		echo '</Directory>'; \
		echo ''; \
		echo '# Protect sensitive files'; \
		echo '<FilesMatch "\.(engine|inc|info|install|make|module|profile|test|po|sh|sql|theme|twig|tpl(\.php)?|xtmpl|yml|yaml)(~|\.sw[op]|\.bak|\.orig|\.save)?$|^(\..*|Entries.*|Repository|Root|Tag|Template|composer\.(json|lock))$|^#.*#$|\.php(~|\.sw[op]|\.bak|\.orig\.save)$">'; \
		echo '    Require all denied'; \
		echo '</FilesMatch>'; \
		echo ''; \
		echo '# Protect private files directory'; \
		echo '<Directory /opt/drupal/private>'; \
		echo '    Require all denied'; \
		echo '</Directory>'; \
	} > /etc/apache2/conf-available/drupal-security.conf \
	&& a2enconf drupal-security

# Configure Apache MPM for optimal performance
RUN { \
		echo '<IfModule mpm_prefork_module>'; \
		echo '    StartServers             5'; \
		echo '    MinSpareServers          5'; \
		echo '    MaxSpareServers          10'; \
		echo '    MaxRequestWorkers        150'; \
		echo '    MaxConnectionsPerChild   1000'; \
		echo '    ServerLimit              150'; \
		echo '</IfModule>'; \
		echo ''; \
		echo '# Timeout and KeepAlive settings'; \
		echo 'Timeout 60'; \
		echo 'KeepAlive On'; \
		echo 'MaxKeepAliveRequests 100'; \
		echo 'KeepAliveTimeout 5'; \
	} > /etc/apache2/mods-available/mpm_prefork.conf

# Copy Drupal application from builder stage with correct ownership
COPY --from=builder --chown=www-data:www-data /opt/drupal /opt/drupal

WORKDIR /opt/drupal

# Create necessary directories and set final permissions
RUN set -eux; \
	# Create required directories
	mkdir -p \
		/opt/drupal/web/sites/default/files \
		/opt/drupal/web/sites/default/files/private \
		/opt/drupal/private \
		/var/log/php \
		/var/log/apache2; \
	\
	# Set ownership
	chown -R www-data:www-data \
		/opt/drupal/web/sites \
		/opt/drupal/private \
		/var/log/php; \
	\
	# Set permissions
	chmod -R 770 /opt/drupal/web/sites/default/files; \
	chmod -R 770 /opt/drupal/private; \
	chmod 755 /opt/drupal/web/sites/default; \
	\
	# Remove default Apache site and create symlink to Drupal
	rm -rf /var/www/html; \
	ln -sf /opt/drupal/web /var/www/html; \
	\
	# Create custom error pages
	echo "<!DOCTYPE html><html><head><title>503 Service Unavailable</title></head><body><h1>Service Temporarily Unavailable</h1></body></html>" > /opt/drupal/web/503.html; \
	chown www-data:www-data /opt/drupal/web/503.html

# Switch to non-root user for security
USER www-data

# Health check with proper timeout and retry logic
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
	CMD curl -f http://localhost/ || curl -f http://localhost/core/install.php || exit 1

# Expose only necessary port
EXPOSE 80

# Set stop signal for graceful shutdown
STOPSIGNAL SIGTERM

# Add entrypoint script for initialization (optional)
# COPY --chown=www-data:www-data docker-entrypoint.sh /usr/local/bin/
# ENTRYPOINT ["docker-entrypoint.sh"]

# Default command
CMD ["apache2-foreground"]
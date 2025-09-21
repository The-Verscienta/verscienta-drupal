# Production Dockerfile for Drupal
# https://www.drupal.org/docs/system-requirements/php-requirements
FROM php:8.3-apache-bookworm AS builder

# Install system dependencies and PHP extensions
RUN set -eux; \
	\
	if command -v a2enmod; then \
		a2enmod expires rewrite headers deflate; \
	fi; \
	\
	savedAptMark="$(apt-mark showmanual)"; \
	\
	apt-get update; \
	apt-get install -y --no-install-recommends \
		libfreetype6-dev \
		libjpeg-dev \
		libpng-dev \
		libpq-dev \
		libwebp-dev \
		libzip-dev \
		libicu-dev \
		libonig-dev \
		libmemcached-dev \
		git \
		unzip \
	; \
	\
	# Configure GD library
	docker-php-ext-configure gd \
		--with-freetype \
		--with-jpeg=/usr \
		--with-webp \
	; \
	\
	# Configure intl extension
	docker-php-ext-configure intl; \
	\
	# Install PHP extensions
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
	; \
	\
	# Install PECL extensions
	pecl install redis memcached apcu; \
	docker-php-ext-enable redis memcached apcu; \
	\
	# Cleanup
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
	rm -rf /var/lib/apt/lists/*; \
	rm -rf /tmp/pear

# Copy composer for build stage only
COPY --from=composer:2 /usr/bin/composer /usr/local/bin/

ENV COMPOSER_ALLOW_SUPERUSER=1

WORKDIR /opt/drupal

# Install Drupal and production dependencies only
RUN set -eux; \
	export COMPOSER_HOME="$(mktemp -d)"; \
	# Install Drupal CMS without dev dependencies
	composer create-project drupal/cms . --no-interaction --no-dev || \
	composer create-project drupal/cms:^1.0 . --no-interaction --no-dev || \
	composer create-project drupal/recommended-project:^10 . --no-interaction --no-dev; \
	# Optimize autoloader for production
	composer dump-autoload --optimize --no-dev; \
	# Verify installation
	composer check-platform-reqs || true; \
	# Remove composer after installation
	rm -rf "$COMPOSER_HOME" /usr/local/bin/composer; \
	# Remove unnecessary files for production (but keep robots.txt)
	find . -type f \( -name "*.txt" -o -name "*.md" \) ! -name "robots.txt" -exec rm -f {} + 2>/dev/null || true; \
	find . -name ".git*" -exec rm -rf {} + 2>/dev/null || true; \
	# Set proper permissions for Drupal directories
	mkdir -p web/sites/default/files web/sites/default/private; \
	chown -R www-data:www-data web/sites web/modules web/themes; \
	chmod -R 755 web/sites/default; \
	# Handle settings file if it exists
	if [ -f web/sites/default/default.settings.php ]; then \
		chmod 644 web/sites/default/default.settings.php; \
	fi

# Production stage
FROM php:8.3-apache-bookworm

# Install runtime dependencies only
RUN set -eux; \
	\
	if command -v a2enmod; then \
		a2enmod expires rewrite headers deflate; \
		a2dismod -f status autoindex; \
	fi; \
	\
	savedAptMark="$(apt-mark showmanual)"; \
	\
	apt-get update; \
	apt-get install -y --no-install-recommends \
		libfreetype6 \
		libjpeg62-turbo \
		libpng16-16 \
		libpq5 \
		libwebp7 \
		libzip4 \
		libicu72 \
		libonig5 \
		libmemcached11 \
		curl \
	; \
	\
	# Cleanup
	apt-get clean; \
	rm -rf /var/lib/apt/lists/*

# Copy PHP extensions from builder
COPY --from=builder /usr/local/lib/php/extensions/ /usr/local/lib/php/extensions/
COPY --from=builder /usr/local/etc/php/conf.d/ /usr/local/etc/php/conf.d/

# Production PHP settings
RUN { \
		echo 'opcache.enable=1'; \
		echo 'opcache.memory_consumption=256'; \
		echo 'opcache.interned_strings_buffer=16'; \
		echo 'opcache.max_accelerated_files=10000'; \
		echo 'opcache.revalidate_freq=2'; \
		echo 'opcache.validate_timestamps=0'; \
		echo 'opcache.fast_shutdown=1'; \
		echo 'opcache.enable_cli=0'; \
		echo 'opcache.file_cache_consistency_checks=0'; \
		echo 'opcache.file_update_protection=0'; \
		echo 'upload_max_filesize=50M'; \
		echo 'post_max_size=50M'; \
		echo 'max_execution_time=60'; \
		echo 'memory_limit=256M'; \
		echo 'max_input_time=60'; \
		echo 'max_input_vars=3000'; \
		echo 'date.timezone=UTC'; \
		echo 'display_errors=Off'; \
		echo 'display_startup_errors=Off'; \
		echo 'error_reporting=E_ALL & ~E_DEPRECATED & ~E_STRICT'; \
		echo 'log_errors=On'; \
		echo 'error_log=/var/log/php_errors.log'; \
	} > /usr/local/etc/php/conf.d/opcache-production.ini

# Security settings
RUN { \
		echo 'expose_php=Off'; \
		echo 'session.cookie_httponly=On'; \
		echo 'session.use_only_cookies=On'; \
		echo 'session.cookie_secure=On'; \
		echo 'session.cookie_samesite=Strict'; \
		echo 'session.use_strict_mode=On'; \
		echo 'session.sid_length=48'; \
		echo 'session.sid_bits_per_character=6'; \
		echo 'allow_url_fopen=Off'; \
		echo 'allow_url_include=Off'; \
		echo 'disable_functions=exec,passthru,shell_exec,system,proc_open,popen,curl_exec,curl_multi_exec,parse_ini_file,show_source'; \
	} > /usr/local/etc/php/conf.d/security.ini

# APCu production settings
RUN { \
		echo 'apc.shm_size=128M'; \
		echo 'apc.enable_cli=0'; \
		echo 'apc.use_request_time=0'; \
		echo 'apc.coredump_unmap=1'; \
	} > /usr/local/etc/php/conf.d/apcu-production.ini

# Configure Apache security headers and performance
RUN { \
		echo 'ServerTokens Prod'; \
		echo 'ServerSignature Off'; \
		echo 'TraceEnable Off'; \
		echo 'FileETag None'; \
		echo 'Header always set X-Content-Type-Options "nosniff"'; \
		echo 'Header always set X-Frame-Options "DENY"'; \
		echo 'Header always set X-XSS-Protection "1; mode=block"'; \
		echo 'Header always set Referrer-Policy "strict-origin-when-cross-origin"'; \
		echo 'Header always set Content-Security-Policy "default-src '\''self'\''; script-src '\''self'\'' '\''unsafe-inline'\'' '\''unsafe-eval'\''; style-src '\''self'\'' '\''unsafe-inline'\''"'; \
		echo 'Header always set Permissions-Policy "geolocation=(), microphone=(), camera=()"'; \
		echo 'Header always unset "X-Powered-By"'; \
		echo '<Directory /opt/drupal/web>'; \
		echo '    Options -Indexes -FollowSymLinks'; \
		echo '    AllowOverride All'; \
		echo '    Require all granted'; \
		echo '</Directory>'; \
		echo '<FilesMatch "\.(yml|yaml|twig|module|inc|install|test|profile|theme|info|txt|md)$">'; \
		echo '    Require all denied'; \
		echo '</FilesMatch>'; \
	} > /etc/apache2/conf-available/security-production.conf \
	&& a2enconf security-production

# Configure Apache MPM for production
RUN { \
		echo '<IfModule mpm_prefork_module>'; \
		echo '    StartServers             5'; \
		echo '    MinSpareServers          5'; \
		echo '    MaxSpareServers          10'; \
		echo '    MaxRequestWorkers        150'; \
		echo '    MaxConnectionsPerChild   1000'; \
		echo '</IfModule>'; \
	} > /etc/apache2/mods-available/mpm_prefork.conf

# Copy Drupal from builder
COPY --from=builder --chown=www-data:www-data /opt/drupal /opt/drupal

WORKDIR /opt/drupal

# Create necessary directories and set permissions
RUN set -eux; \
	mkdir -p /opt/drupal/web/sites/default/files; \
	mkdir -p /opt/drupal/private; \
	chown -R www-data:www-data /opt/drupal/web/sites/default/files /opt/drupal/private; \
	chmod -R 770 /opt/drupal/web/sites/default/files /opt/drupal/private; \
	rmdir /var/www/html 2>/dev/null || true; \
	ln -sf /opt/drupal/web /var/www/html

# Run as non-root user
USER www-data

# Health check - checks if Apache and PHP are responding
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
	CMD curl -f http://localhost/ || curl -f http://localhost/core/install.php || exit 1

# Expose port
EXPOSE 80
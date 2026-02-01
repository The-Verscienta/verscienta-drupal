<?php

declare(strict_types=1);

namespace Drupal\trefle_sync\Exception;

/**
 * Exception thrown during Trefle sync operations.
 */
class TrefleSyncException extends \Exception {

  /**
   * Creates an exception for API connection errors.
   *
   * @param string $message
   *   The error message.
   * @param \Throwable|null $previous
   *   The previous exception.
   *
   * @return static
   *   The exception instance.
   */
  public static function connectionError(string $message, ?\Throwable $previous = NULL): static {
    return new static('API connection error: ' . $message, 0, $previous);
  }

  /**
   * Creates an exception for rate limit errors.
   *
   * @return static
   *   The exception instance.
   */
  public static function rateLimitExceeded(): static {
    return new static('Rate limit exceeded. Please wait before making more requests.');
  }

  /**
   * Creates an exception for missing configuration.
   *
   * @param string $configName
   *   The name of the missing configuration.
   *
   * @return static
   *   The exception instance.
   */
  public static function missingConfiguration(string $configName): static {
    return new static('Missing configuration: ' . $configName);
  }

  /**
   * Creates an exception for import errors.
   *
   * @param int $trefleId
   *   The Trefle plant ID.
   * @param string $message
   *   The error message.
   * @param \Throwable|null $previous
   *   The previous exception.
   *
   * @return static
   *   The exception instance.
   */
  public static function importError(int $trefleId, string $message, ?\Throwable $previous = NULL): static {
    return new static(sprintf('Failed to import plant %d: %s', $trefleId, $message), 0, $previous);
  }

}

<?php

declare(strict_types=1);

namespace Drupal\perenual_sync;

use Drupal\Core\State\StateInterface;

/**
 * Handles rate limiting for Perenual API requests.
 *
 * Perenual free tier allows 100 requests per day.
 * Premium tiers have higher limits.
 */
class PerenualRateLimiter {

  /**
   * Maximum requests allowed per day (free tier).
   */
  public const MAX_REQUESTS_PER_DAY = 100;

  /**
   * State key for storing request count.
   */
  protected const STATE_KEY_COUNT = 'perenual_sync.request_count';

  /**
   * State key for storing the date of the count.
   */
  protected const STATE_KEY_DATE = 'perenual_sync.request_date';

  /**
   * Constructs a PerenualRateLimiter object.
   *
   * @param \Drupal\Core\State\StateInterface $state
   *   The state service.
   */
  public function __construct(
    protected StateInterface $state,
  ) {}

  /**
   * Check if we can make another request.
   *
   * @return bool
   *   TRUE if a request can be made, FALSE if rate limited.
   */
  public function canMakeRequest(): bool {
    $this->resetIfNewDay();
    $count = $this->state->get(self::STATE_KEY_COUNT, 0);
    return $count < self::MAX_REQUESTS_PER_DAY;
  }

  /**
   * Record a request.
   */
  public function recordRequest(): void {
    $this->resetIfNewDay();
    $count = $this->state->get(self::STATE_KEY_COUNT, 0);
    $this->state->set(self::STATE_KEY_COUNT, $count + 1);
  }

  /**
   * Get the number of requests made today.
   *
   * @return int
   *   The number of requests.
   */
  public function getRequestCount(): int {
    $this->resetIfNewDay();
    return $this->state->get(self::STATE_KEY_COUNT, 0);
  }

  /**
   * Get the number of remaining requests.
   *
   * @return int
   *   The number of remaining requests.
   */
  public function getRemainingRequests(): int {
    return max(0, self::MAX_REQUESTS_PER_DAY - $this->getRequestCount());
  }

  /**
   * Reset the counter if it's a new day.
   */
  protected function resetIfNewDay(): void {
    $today = date('Y-m-d');
    $storedDate = $this->state->get(self::STATE_KEY_DATE, '');

    if ($storedDate !== $today) {
      $this->state->set(self::STATE_KEY_COUNT, 0);
      $this->state->set(self::STATE_KEY_DATE, $today);
    }
  }

}

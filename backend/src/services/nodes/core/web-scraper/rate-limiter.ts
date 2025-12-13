/**
 * Rate Limiter
 * Enforces delays and respects rate limits with auto-throttling
 */

export class RateLimiter {
  private lastRequestTime: number = 0;
  private requestTimes: number[] = [];
  private readonly minDelay: number;
  private readonly maxDelay: number;
  private readonly autoThrottle: boolean;
  private readonly windowSize: number = 10; // Track last N requests
  private averageResponseTime: number = 0;

  constructor(
    minDelay: number = 1000,
    maxDelay: number = 3000,
    autoThrottle: boolean = true
  ) {
    this.minDelay = minDelay;
    this.maxDelay = maxDelay;
    this.autoThrottle = autoThrottle;
  }

  /**
   * Wait before making next request
   */
  async wait(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    let delay = this.calculateDelay();

    // If we haven't waited long enough, wait the remainder
    if (timeSinceLastRequest < delay) {
      const remainingDelay = delay - timeSinceLastRequest;
      await this.sleep(remainingDelay);
    }

    this.lastRequestTime = Date.now();
  }

  /**
   * Calculate delay based on auto-throttle and randomization
   */
  private calculateDelay(): number {
    let baseDelay = this.minDelay;

    // Auto-throttle: adjust based on average response time
    if (this.autoThrottle && this.averageResponseTime > 0) {
      // If responses are slow, increase delay
      if (this.averageResponseTime > 2000) {
        baseDelay = Math.min(this.maxDelay, baseDelay * 1.5);
      } else if (this.averageResponseTime < 500) {
        // If responses are fast, slightly decrease delay (but not below min)
        baseDelay = Math.max(this.minDelay, baseDelay * 0.9);
      }
    }

    // Add randomization (human-like behavior)
    const randomFactor = 0.7 + Math.random() * 0.6; // 0.7 to 1.3
    return Math.floor(baseDelay * randomFactor);
  }

  /**
   * Record response time for auto-throttling
   */
  recordResponseTime(responseTime: number): void {
    this.requestTimes.push(responseTime);
    if (this.requestTimes.length > this.windowSize) {
      this.requestTimes.shift();
    }

    // Calculate average
    this.averageResponseTime = this.requestTimes.reduce((a, b) => a + b, 0) / this.requestTimes.length;
  }

  /**
   * Handle 429 rate limit response
   */
  async handleRateLimit(retryAfter?: number): Promise<void> {
    const delay = retryAfter 
      ? retryAfter * 1000 
      : this.maxDelay * 2; // Double max delay on rate limit

    console.log(`    ⚠️ Rate limited, waiting ${delay}ms`);
    await this.sleep(delay);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Reset rate limiter
   */
  reset(): void {
    this.lastRequestTime = 0;
    this.requestTimes = [];
    this.averageResponseTime = 0;
  }
}


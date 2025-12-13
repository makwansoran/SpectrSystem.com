/**
 * Retry Handler
 * Exponential backoff retry logic with circuit breaker
 */

export interface RetryOptions {
  maxRetries: number;
  baseDelay: number;
  retryOnStatus: number[];
  exponentialBackoff: boolean;
}

export class RetryHandler {
  private readonly maxRetries: number;
  private readonly baseDelay: number;
  private readonly retryOnStatus: number[];
  private readonly exponentialBackoff: boolean;
  private circuitBreakers: Map<string, { failures: number; lastFailure: number; isOpen: boolean }> = new Map();
  private readonly circuitBreakerThreshold: number = 5;
  private readonly circuitBreakerResetTime: number = 60000; // 1 minute

  constructor(options: RetryOptions) {
    this.maxRetries = options.maxRetries;
    this.baseDelay = options.baseDelay;
    this.retryOnStatus = options.retryOnStatus;
    this.exponentialBackoff = options.exponentialBackoff;
  }

  /**
   * Execute with retry
   */
  async execute<T>(
    fn: () => Promise<T>,
    domain?: string
  ): Promise<T> {
    if (domain && this.isCircuitOpen(domain)) {
      throw new Error(`Circuit breaker open for domain: ${domain}`);
    }

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const result = await fn();
        
        // Success - reset circuit breaker
        if (domain) {
          this.recordSuccess(domain);
        }
        
        return result;
      } catch (error: any) {
        lastError = error;

        // Check if we should retry
        const shouldRetry = this.shouldRetry(error, attempt);
        
        if (!shouldRetry) {
          if (domain) {
            this.recordFailure(domain);
          }
          throw error;
        }

        // Calculate delay
        const delay = this.calculateDelay(attempt, error);
        
        if (attempt < this.maxRetries) {
          console.log(`    ⚠️ Retry attempt ${attempt + 1}/${this.maxRetries} after ${delay}ms`);
          await this.sleep(delay);
        }
      }
    }

    // All retries exhausted
    if (domain) {
      this.recordFailure(domain);
    }
    throw lastError || new Error('Max retries exceeded');
  }

  /**
   * Check if we should retry
   */
  private shouldRetry(error: any, attempt: number): boolean {
    if (attempt >= this.maxRetries) {
      return false;
    }

    // Retry on network errors
    if (error.code === 'ECONNRESET' || 
        error.code === 'ETIMEDOUT' || 
        error.code === 'ENOTFOUND' ||
        error.message?.includes('timeout')) {
      return true;
    }

    // Retry on specific HTTP status codes
    if (error.response?.status && this.retryOnStatus.includes(error.response.status)) {
      return true;
    }

    // Don't retry on 4xx errors (except specific ones)
    if (error.response?.status >= 400 && error.response?.status < 500) {
      if (this.retryOnStatus.includes(error.response.status)) {
        return true;
      }
      return false; // Client errors usually shouldn't be retried
    }

    return true; // Retry on other errors
  }

  /**
   * Calculate delay with exponential backoff
   */
  private calculateDelay(attempt: number, error: any): number {
    // Handle 429 with Retry-After header
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'];
      if (retryAfter) {
        return parseInt(retryAfter) * 1000;
      }
    }

    if (this.exponentialBackoff) {
      // Exponential backoff: 2^attempt * baseDelay
      return Math.min(this.baseDelay * Math.pow(2, attempt), 30000); // Max 30 seconds
    }

    return this.baseDelay;
  }

  /**
   * Check if circuit breaker is open
   */
  private isCircuitOpen(domain: string): boolean {
    const breaker = this.circuitBreakers.get(domain);
    if (!breaker) {
      return false;
    }

    if (breaker.isOpen) {
      // Check if reset time has passed
      if (Date.now() - breaker.lastFailure > this.circuitBreakerResetTime) {
        breaker.isOpen = false;
        breaker.failures = 0;
        return false;
      }
      return true;
    }

    return false;
  }

  /**
   * Record success (close circuit breaker)
   */
  private recordSuccess(domain: string): void {
    const breaker = this.circuitBreakers.get(domain);
    if (breaker) {
      breaker.failures = 0;
      breaker.isOpen = false;
    }
  }

  /**
   * Record failure (may open circuit breaker)
   */
  private recordFailure(domain: string): void {
    let breaker = this.circuitBreakers.get(domain);
    if (!breaker) {
      breaker = { failures: 0, lastFailure: 0, isOpen: false };
      this.circuitBreakers.set(domain, breaker);
    }

    breaker.failures++;
    breaker.lastFailure = Date.now();

    if (breaker.failures >= this.circuitBreakerThreshold) {
      breaker.isOpen = true;
      console.warn(`    ⚠️ Circuit breaker opened for domain: ${domain}`);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}


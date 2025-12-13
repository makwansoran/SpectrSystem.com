/**
 * Scraping Metrics
 * Track performance and statistics
 */

export interface ScrapingMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  totalResponseTime: number;
  averageResponseTime: number;
  errorsByStatus: Record<number, number>;
  errorsByType: Record<string, number>;
  pagesScraped: number;
  bytesDownloaded: number;
  startTime: number;
  endTime?: number;
  duration?: number;
}

export class MetricsCollector {
  private metrics: ScrapingMetrics;

  constructor() {
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      totalResponseTime: 0,
      averageResponseTime: 0,
      errorsByStatus: {},
      errorsByType: {},
      pagesScraped: 0,
      bytesDownloaded: 0,
      startTime: Date.now(),
    };
  }

  /**
   * Record successful request
   */
  recordSuccess(responseTime: number, bytesDownloaded: number = 0): void {
    this.metrics.totalRequests++;
    this.metrics.successfulRequests++;
    this.metrics.pagesScraped++;
    this.metrics.totalResponseTime += responseTime;
    this.metrics.bytesDownloaded += bytesDownloaded;
    this.updateAverage();
  }

  /**
   * Record failed request
   */
  recordFailure(error: any): void {
    this.metrics.totalRequests++;
    this.metrics.failedRequests++;

    // Track by status code
    if (error.response?.status) {
      const status = error.response.status;
      this.metrics.errorsByStatus[status] = (this.metrics.errorsByStatus[status] || 0) + 1;
    }

    // Track by error type
    const errorType = error.code || error.name || 'Unknown';
    this.metrics.errorsByType[errorType] = (this.metrics.errorsByType[errorType] || 0) + 1;
  }

  /**
   * Update average response time
   */
  private updateAverage(): void {
    if (this.metrics.successfulRequests > 0) {
      this.metrics.averageResponseTime = 
        this.metrics.totalResponseTime / this.metrics.successfulRequests;
    }
  }

  /**
   * Get current metrics
   */
  getMetrics(): ScrapingMetrics {
    const now = Date.now();
    return {
      ...this.metrics,
      endTime: now,
      duration: now - this.metrics.startTime,
    };
  }

  /**
   * Get success rate
   */
  getSuccessRate(): number {
    if (this.metrics.totalRequests === 0) return 0;
    return (this.metrics.successfulRequests / this.metrics.totalRequests) * 100;
  }

  /**
   * Reset metrics
   */
  reset(): void {
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      totalResponseTime: 0,
      averageResponseTime: 0,
      errorsByStatus: {},
      errorsByType: {},
      pagesScraped: 0,
      bytesDownloaded: 0,
      startTime: Date.now(),
    };
  }

  /**
   * Export metrics as JSON
   */
  export(): string {
    return JSON.stringify(this.getMetrics(), null, 2);
  }
}


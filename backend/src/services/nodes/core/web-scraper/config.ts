/**
 * Web Scraper Configuration
 * Production-grade configuration with all advanced options
 */

export interface WebScraperConfig {
  // Basic
  url: string;
  selectors?: Array<{
    name: string;
    selector: string;
    attribute?: string;
    multiple?: boolean;
  }>;
  headers?: Record<string, string>;

  // Performance & Concurrency
  maxConcurrent?: number; // Default: 5
  timeout?: number; // Default: 60 seconds
  maxRetries?: number; // Default: 3
  retryDelay?: number; // Default: 1.0 seconds

  // Rate Limiting & Throttling
  rateLimitMin?: number; // Min delay between requests (seconds)
  rateLimitMax?: number; // Max delay between requests (seconds)
  autoThrottle?: boolean; // Dynamically adjust based on response times

  // Anti-Bot & Stealth
  rotateUserAgents?: boolean; // Rotate user agents
  randomizeDelays?: boolean; // Random delays between requests
  randomizeHeaders?: boolean; // Randomize request headers
  respectRobots?: boolean; // Check robots.txt (default: true)
  customUserAgent?: string; // Override user agent

  // Proxy Support
  useProxies?: boolean;
  proxyList?: string[]; // Format: ["http://user:pass@host:port", ...]
  proxyRotation?: boolean; // Rotate proxies
  proxyHealthCheck?: boolean; // Health check proxies

  // JavaScript Rendering
  enableJS?: boolean; // Use headless browser for JS-heavy sites
  waitForSelector?: string; // Wait for element before scraping
  waitForTimeout?: number; // Max wait time in ms
  handleInfiniteScroll?: boolean; // Auto-scroll for lazy loading
  viewportWidth?: number; // Browser viewport width
  viewportHeight?: number; // Browser viewport height

  // Crawling Strategy
  maxDepth?: number; // Max crawl depth (default: 1, single page)
  maxPages?: number; // Max pages to scrape (default: 1)
  followLinks?: boolean; // Follow links on page
  sameDomainOnly?: boolean; // Only follow same domain links
  crawlStrategy?: 'bfs' | 'dfs'; // Breadth-first or depth-first

  // Data Extraction
  extractStructuredData?: boolean; // JSON-LD, microdata, Open Graph
  cleanHTML?: boolean; // Remove scripts, styles, ads
  extractMetadata?: boolean; // Title, meta tags, headings
  saveRawHTML?: boolean; // Save raw HTML for debugging

  // Error Handling
  retryOnStatus?: number[]; // HTTP status codes to retry (default: [408, 429, 500, 502, 503, 504])
  circuitBreaker?: boolean; // Circuit breaker for failing domains
  continueOnError?: boolean; // Continue scraping other URLs on error

  // Output
  outputFormat?: 'json' | 'structured'; // Output format
  deduplicate?: boolean; // Deduplicate by URL or content hash

  // Monitoring
  enableMetrics?: boolean; // Track metrics
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
}

export const DEFAULT_CONFIG: Required<Omit<WebScraperConfig, 'url' | 'selectors' | 'headers'>> = {
  maxConcurrent: 5,
  timeout: 60000, // 60 seconds
  maxRetries: 3,
  retryDelay: 1000, // 1 second
  rateLimitMin: 1000, // 1 second
  rateLimitMax: 3000, // 3 seconds
  autoThrottle: true,
  rotateUserAgents: true,
  randomizeDelays: true,
  randomizeHeaders: true,
  respectRobots: true,
  customUserAgent: '',
  useProxies: false,
  proxyList: [],
  proxyRotation: false,
  proxyHealthCheck: true,
  enableJS: false,
  waitForSelector: '',
  waitForTimeout: 30000,
  handleInfiniteScroll: false,
  viewportWidth: 1920,
  viewportHeight: 1080,
  maxDepth: 1,
  maxPages: 1,
  followLinks: false,
  sameDomainOnly: true,
  crawlStrategy: 'bfs',
  extractStructuredData: true,
  cleanHTML: true,
  extractMetadata: true,
  saveRawHTML: false,
  retryOnStatus: [408, 429, 500, 502, 503, 504],
  circuitBreaker: true,
  continueOnError: false,
  outputFormat: 'structured',
  deduplicate: true,
  enableMetrics: true,
  logLevel: 'info',
};


# Production-Grade Web Scraper

Enterprise-level web scraper with advanced features for handling anti-bot measures, JavaScript rendering, and large-scale scraping operations.

## Features

### 🚀 Performance & Concurrency
- Async/await with configurable concurrency limits
- Connection pooling with persistent sessions
- Auto-throttling based on server response times
- Configurable concurrent request limits (default: 5)

### 🥷 Anti-Bot Detection & Stealth
- Rotating user agents from realistic browser pool
- Randomized request delays (configurable min/max)
- Request header randomization (Accept, Accept-Language, etc.)
- Cookie and session management
- Respects robots.txt by default
- Handles HTTP 429 with exponential backoff
- Fingerprint randomization support

### 🔄 Proxy & IP Rotation
- Support for proxy rotation (datacenter, residential, mobile)
- Proxy pool management with health checking
- Automatic proxy switching on failure
- Support for authenticated proxies

### 🌐 JavaScript & Dynamic Content
- Optional headless browser integration (Playwright)
- Lazy loading: only use browser when necessary
- Wait for specific elements before scraping
- Handle infinite scroll by injecting scroll scripts
- Auto-detect JavaScript-heavy sites

### 🛡️ Reliability & Error Handling
- Exponential backoff retry logic (3-5 retries default)
- Comprehensive error handling: timeouts, connection errors, DNS failures
- Automatic retry on: 408, 429, 500, 502, 503, 504
- Circuit breaker pattern for failing domains
- Graceful degradation when services fail

### 📊 Parsing & Data Extraction
- BeautifulSoup4-style parsing with Cheerio
- CSS selector support
- Automatic encoding detection
- Clean HTML: remove scripts, styles, nav, footer, ads
- Extract: title, meta tags, headings, paragraphs, links, images, tables
- Support for structured data (JSON-LD, microdata, Open Graph)
- Handle malformed HTML gracefully

### 📈 Monitoring & Logging
- Structured logging with levels (DEBUG, INFO, WARNING, ERROR)
- Request/response metrics: success rate, avg response time
- Progress tracking
- Bandwidth usage tracking
- Export metrics to JSON

## Configuration

The scraper accepts all standard `WebScraperConfig` fields plus these advanced options:

```typescript
{
  // Basic (required)
  url: string;
  selectors?: Array<{...}>;
  
  // Performance
  maxConcurrent?: number;        // Default: 5
  timeout?: number;              // Default: 60000ms
  maxRetries?: number;           // Default: 3
  retryDelay?: number;           // Default: 1000ms
  
  // Rate Limiting
  rateLimitMin?: number;         // Min delay (ms)
  rateLimitMax?: number;         // Max delay (ms)
  autoThrottle?: boolean;        // Default: true
  
  // Anti-Bot
  rotateUserAgents?: boolean;    // Default: true
  randomizeDelays?: boolean;     // Default: true
  randomizeHeaders?: boolean;    // Default: true
  respectRobots?: boolean;       // Default: true
  customUserAgent?: string;
  
  // Proxy
  useProxies?: boolean;          // Default: false
  proxyList?: string[];          // ["http://user:pass@host:port"]
  proxyRotation?: boolean;
  proxyHealthCheck?: boolean;    // Default: true
  
  // JavaScript
  enableJS?: boolean;             // Default: false
  waitForSelector?: string;
  waitForTimeout?: number;       // Default: 30000ms
  handleInfiniteScroll?: boolean;
  viewportWidth?: number;        // Default: 1920
  viewportHeight?: number;       // Default: 1080
  
  // Data Extraction
  extractStructuredData?: boolean; // Default: true
  cleanHTML?: boolean;            // Default: true
  extractMetadata?: boolean;       // Default: true
  saveRawHTML?: boolean;          // Default: false
  
  // Error Handling
  retryOnStatus?: number[];       // Default: [408, 429, 500, 502, 503, 504]
  circuitBreaker?: boolean;       // Default: true
  continueOnError?: boolean;      // Default: false
  
  // Output
  outputFormat?: 'json' | 'structured';
  deduplicate?: boolean;         // Default: true
  
  // Monitoring
  enableMetrics?: boolean;        // Default: true
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
}
```

## Usage Examples

### Basic Scraping
```typescript
const result = await executeWebScraper({
  url: 'https://example.com',
  selectors: [
    { name: 'title', selector: 'h1', attribute: 'text' },
    { name: 'links', selector: 'a', attribute: 'href', multiple: true }
  ]
}, context);
```

### With JavaScript Rendering
```typescript
const result = await executeWebScraper({
  url: 'https://spa-example.com',
  enableJS: true,
  waitForSelector: '.content',
  handleInfiniteScroll: true
}, context);
```

### With Proxy Rotation
```typescript
const result = await executeWebScraper({
  url: 'https://example.com',
  useProxies: true,
  proxyList: [
    'http://user:pass@proxy1.com:8080',
    'http://user:pass@proxy2.com:8080'
  ],
  proxyRotation: true
}, context);
```

### With Custom Rate Limiting
```typescript
const result = await executeWebScraper({
  url: 'https://example.com',
  rateLimitMin: 2000,  // 2 seconds
  rateLimitMax: 5000,  // 5 seconds
  autoThrottle: true
}, context);
```

## Optional Dependencies

### Playwright (for JavaScript rendering)
To enable JavaScript rendering, install Playwright:

```bash
npm install playwright
npx playwright install chromium
```

If Playwright is not installed, the scraper will fall back to regular HTTP requests.

## Architecture

The scraper is modular with separate components:

- **config.ts**: Configuration management
- **user-agents.ts**: User agent rotation
- **rate-limiter.ts**: Rate limiting and throttling
- **proxy-rotator.ts**: Proxy management
- **robots-checker.ts**: Robots.txt compliance
- **retry-handler.ts**: Retry logic with circuit breaker
- **parser.ts**: HTML parsing and extraction
- **browser-renderer.ts**: Headless browser integration
- **metrics.ts**: Performance metrics
- **index.ts**: Main scraper class

## Best Practices

1. **Always respect robots.txt**: Set `respectRobots: true` (default)
2. **Use rate limiting**: Configure appropriate delays to avoid overwhelming servers
3. **Monitor metrics**: Enable metrics to track success rates and performance
4. **Handle errors gracefully**: Use `continueOnError: true` for batch scraping
5. **Use proxies responsibly**: Only use proxies when necessary and from reputable providers
6. **Cache responses**: Implement caching to avoid redundant requests
7. **Identify yourself**: Use a descriptive User-Agent that identifies your scraper

## Security Considerations

- ✅ SSRF Protection: URL validation before requests
- ✅ SQL Injection: Not applicable (no database queries)
- ✅ XSS Protection: HTML sanitization in parser
- ⚠️ Code Injection: JavaScript execution is sandboxed (Playwright)
- ⚠️ Proxy Security: Validate proxy URLs before use

## Performance Tips

1. **Adjust concurrency**: Start with 5 concurrent requests, increase based on server capacity
2. **Enable auto-throttle**: Let the scraper adjust speed based on response times
3. **Use connection pooling**: Axios handles this automatically
4. **Cache robots.txt**: Already implemented (1 hour TTL)
5. **Deduplicate URLs**: Enabled by default to avoid redundant requests

## Troubleshooting

### "Playwright not installed" error
Install Playwright: `npm install playwright && npx playwright install chromium`

### High failure rate
- Check if site requires JavaScript (`enableJS: true`)
- Increase retry count (`maxRetries: 5`)
- Add delays (`rateLimitMin: 2000`)
- Use proxies if IP is blocked

### Slow scraping
- Increase concurrency (`maxConcurrent: 10`)
- Disable unnecessary features (`extractMetadata: false`)
- Use faster proxies

### Circuit breaker opened
- Domain is failing repeatedly
- Wait for reset (1 minute default)
- Check if site is down or blocking requests

## License

Part of the SPECTR SYSTEMS workflow automation platform.


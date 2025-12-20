/**
 * Production-Grade Web Scraper
 * Enterprise-level web scraping with all advanced features
 */

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import * as cheerio from 'cheerio';
import type { ExecutionContext } from '../../../executor';
import type { NodeExecutor } from '../../types';
import { interpolateVariables } from '../../utils';

// Import modules
import { WebScraperConfig, DEFAULT_CONFIG } from './config';
import { getRandomUserAgent, generateHeaders } from './user-agents';
import { RateLimiter } from './rate-limiter';
import { ProxyRotator, type Proxy as ProxyConfig } from './proxy-rotator';
import { RobotsChecker } from './robots-checker';
import { RetryHandler } from './retry-handler';
import { MetricsCollector } from './metrics';
import { parseContent, extractWithSelectors, extractLinks, normalizeUrl } from './parser';
import { renderWithBrowser, requiresJavaScript } from './browser-renderer';

// Extend WebScraperConfig to include all new options
interface EnhancedWebScraperConfig extends WebScraperConfig {
  // All options from config.ts are available
}

/**
 * Main Web Scraper Class
 */
class RobustWebScraper {
  private config: EnhancedWebScraperConfig;
  private rateLimiter: RateLimiter;
  private proxyRotator: ProxyRotator | null = null;
  private robotsChecker: RobotsChecker;
  private retryHandler: RetryHandler;
  private metrics: MetricsCollector;
  private axiosInstance: AxiosInstance;
  private userAgent: string;
  private seenUrls: Set<string> = new Set();

  constructor(config: EnhancedWebScraperConfig) {
    // Merge with defaults
    this.config = { ...DEFAULT_CONFIG, ...config } as any;
    
    // Initialize components
    this.rateLimiter = new RateLimiter(
      this.config.rateLimitMin,
      this.config.rateLimitMax,
      this.config.autoThrottle
    );

    if (this.config.useProxies && this.config.proxyList.length > 0) {
      this.proxyRotator = new ProxyRotator(this.config.proxyList, this.config.proxyHealthCheck);
    }

    this.robotsChecker = new RobotsChecker();
    this.retryHandler = new RetryHandler({
      maxRetries: this.config.maxRetries,
      baseDelay: this.config.retryDelay,
      retryOnStatus: this.config.retryOnStatus,
      exponentialBackoff: true,
    });

    this.metrics = new MetricsCollector();

    // Set user agent
    this.userAgent = this.config.customUserAgent || 
                    (this.config.rotateUserAgents ? getRandomUserAgent() : 
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    // Create axios instance with default config
    this.axiosInstance = axios.create({
      timeout: this.config.timeout,
      maxRedirects: 5,
      validateStatus: (status) => status < 500, // Don't throw on 4xx
    });
  }

  /**
   * Main scrape method
   */
  async scrape(url: string): Promise<any> {
    const startTime = Date.now();
    const normalizedUrl = normalizeUrl(url);

    // Check robots.txt
    if (this.config.respectRobots) {
      const isAllowed = await this.robotsChecker.isAllowed(normalizedUrl, this.userAgent);
      if (!isAllowed) {
        throw new Error(`URL blocked by robots.txt: ${normalizedUrl}`);
      }

      // Get crawl delay if specified
      const crawlDelay = await this.robotsChecker.getCrawlDelay(normalizedUrl, this.userAgent);
      if (crawlDelay) {
        await (this.rateLimiter as any).sleep(crawlDelay);
      }
    }

    // Rate limiting
    await this.rateLimiter.wait();

    // Check if URL already scraped (deduplication)
    if (this.config.deduplicate && this.seenUrls.has(normalizedUrl)) {
      console.log(`    ⏭️ Skipping duplicate URL: ${normalizedUrl}`);
      return { url: normalizedUrl, skipped: true, reason: 'duplicate' };
    }

    this.seenUrls.add(normalizedUrl);

    try {
      // Check if JavaScript rendering is needed
      let needsJS = this.config.enableJS;
      if (!needsJS && this.config.enableJS === false) {
        // Auto-detect if JS is needed
        needsJS = await requiresJavaScript(normalizedUrl);
      }

      let html: string;
      let responseTime: number;

      if (needsJS) {
        // Use browser rendering
        console.log(`    🌐 Rendering with browser: ${normalizedUrl}`);
        const renderStart = Date.now();
        html = await renderWithBrowser(normalizedUrl, {
          enableJS: true,
          waitForSelector: this.config.waitForSelector,
          waitForTimeout: this.config.waitForTimeout,
          handleInfiniteScroll: this.config.handleInfiniteScroll,
          viewportWidth: this.config.viewportWidth,
          viewportHeight: this.config.viewportHeight,
        });
        responseTime = Date.now() - renderStart;
      } else {
        // Regular HTTP request
        html = await this.fetchWithRetry(normalizedUrl);
        responseTime = Date.now() - startTime;
      }

      // Parse HTML
      const parsed = parseContent(html, this.config.cleanHTML);

      // Extract with selectors if provided
      const $ = cheerio.load(html);
      let extractedData: Record<string, unknown> = {};

      if (this.config.selectors && this.config.selectors.length > 0) {
        extractedData = extractWithSelectors($, this.config.selectors);
      }

      // Build result
      const result: any = {
        url: normalizedUrl,
        scraped: true,
        timestamp: new Date().toISOString(),
        data: extractedData,
      };

      // Add metadata if requested
      if (this.config.extractMetadata) {
        result.metadata = {
          title: parsed.title,
          description: parsed.description,
          metaTags: parsed.metaTags,
          headings: parsed.headings,
        };
      }

      // Add structured data if requested
      if (this.config.extractStructuredData) {
        result.structuredData = parsed.structuredData;
      }

      // Add links if following links
      if (this.config.followLinks) {
        result.links = extractLinks($, normalizedUrl, this.config.sameDomainOnly);
      }

      // Add raw HTML if requested
      if (this.config.saveRawHTML) {
        result.rawHTML = html;
      }

      // Record metrics
      this.metrics.recordSuccess(responseTime, Buffer.byteLength(html, 'utf8'));
      this.rateLimiter.recordResponseTime(responseTime);

      return result;
    } catch (error: any) {
      this.metrics.recordFailure(error);
      
      if (this.config.continueOnError) {
        console.error(`    ❌ Error scraping ${normalizedUrl}: ${error.message}`);
        return {
          url: normalizedUrl,
          scraped: false,
          error: error.message,
          timestamp: new Date().toISOString(),
        };
      }
      
      throw error;
    }
  }

  /**
   * Fetch URL with retry logic
   */
  private async fetchWithRetry(url: string): Promise<string> {
    const domain = new URL(url).hostname;

    return this.retryHandler.execute(async () => {
      // Get proxy if using proxies
      const proxy = this.proxyRotator?.getNextProxy() || null;
      let currentProxy: ProxyConfig | null = null;

      try {
        // Prepare request config
        const headers = this.config.randomizeHeaders 
          ? generateHeaders(this.config.rotateUserAgents ? getRandomUserAgent() : this.userAgent)
          : generateHeaders(this.userAgent);

        // Merge custom headers
        Object.assign(headers, this.config.headers || {});

        const requestConfig: AxiosRequestConfig = {
          url,
          method: 'GET',
          headers,
          timeout: this.config.timeout,
        };

        // Add proxy if available
        if (proxy) {
          currentProxy = proxy;
          const proxyUrl = new URL(proxy.url);
          requestConfig.proxy = {
            host: proxyUrl.hostname,
            port: parseInt(proxyUrl.port),
            auth: proxy.auth,
          };
        }

        // Make request
        const response = await this.axiosInstance.request(requestConfig);

        // Handle rate limit (429)
        if (response.status === 429) {
          const retryAfter = response.headers['retry-after'];
          await this.rateLimiter.handleRateLimit(
            retryAfter ? parseInt(retryAfter) : undefined
          );
          throw new Error('Rate limited');
        }

        // Record proxy success
        if (currentProxy) {
          this.proxyRotator?.recordSuccess(currentProxy);
        }

        return response.data;
      } catch (error: any) {
        // Record proxy failure
        if (currentProxy) {
          this.proxyRotator?.recordFailure(currentProxy);
        }

        // Re-throw to let retry handler deal with it
        throw error;
      }
    }, domain);
  }

  /**
   * Get metrics
   */
  getMetrics() {
    return this.metrics.getMetrics();
  }

  /**
   * Get success rate
   */
  getSuccessRate(): number {
    return this.metrics.getSuccessRate();
  }
}

/**
 * Execute Web Scraper Node
 */
export const executeWebScraper: NodeExecutor<WebScraperConfig> = async (
  config: WebScraperConfig,
  context: ExecutionContext
) => {
  if (!config.url) {
    throw new Error('Web Scraper node requires a URL');
  }

  const url = interpolateVariables(config.url, context);
  console.log(`    🔍 Scraping: ${url}`);

  try {
    // Create scraper instance (cast to enhanced config for advanced features)
    const scraper = new RobustWebScraper(config as EnhancedWebScraperConfig);

    // Scrape URL
    const result = await scraper.scrape(url);

    // Add metrics if enabled
    if (config.enableMetrics) {
      result.metrics = scraper.getMetrics();
      result.successRate = scraper.getSuccessRate();
    }

    return result;
  } catch (error: any) {
    throw new Error(`Failed to scrape ${url}: ${error.message}`);
  }
};


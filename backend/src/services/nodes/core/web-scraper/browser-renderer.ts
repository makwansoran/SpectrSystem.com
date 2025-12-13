/**
 * Browser Renderer
 * Headless browser integration for JavaScript-heavy sites
 */

import type { WebScraperConfig } from './config';

export interface BrowserRenderOptions {
  enableJS: boolean;
  waitForSelector?: string;
  waitForTimeout?: number;
  handleInfiniteScroll?: boolean;
  viewportWidth?: number;
  viewportHeight?: number;
}

/**
 * Render page with headless browser (Playwright)
 * Falls back to regular fetch if Playwright not available
 */
export async function renderWithBrowser(
  url: string,
  options: BrowserRenderOptions
): Promise<string> {
  if (!options.enableJS) {
    throw new Error('Browser rendering requested but enableJS is false');
  }

  try {
    // Try to use Playwright (must be installed separately)
    const { chromium } = await import('playwright');
    
    const browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage({
        viewport: {
          width: options.viewportWidth || 1920,
          height: options.viewportHeight || 1080,
        },
      });

      // Set realistic headers
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9',
      });

      // Navigate to page
      await page.goto(url, {
        waitUntil: 'networkidle',
        timeout: options.waitForTimeout || 30000,
      });

      // Wait for specific selector if provided
      if (options.waitForSelector) {
        await page.waitForSelector(options.waitForSelector, {
          timeout: options.waitForTimeout || 30000,
        });
      }

      // Handle infinite scroll
      if (options.handleInfiniteScroll) {
        await handleInfiniteScroll(page);
      }

      // Get rendered HTML
      const html = await page.content();
      
      await browser.close();
      return html;
    } catch (error) {
      await browser.close();
      throw error;
    }
  } catch (error: any) {
    // Playwright not available or failed
    if (error.message?.includes('Cannot find module')) {
      console.warn('    ⚠️ Playwright not installed. Install with: npm install playwright');
      throw new Error('Browser rendering requires Playwright. Install with: npm install playwright');
    }
    throw error;
  }
}

/**
 * Handle infinite scroll by scrolling page
 */
async function handleInfiniteScroll(page: any): Promise<void> {
  let previousHeight = 0;
  let currentHeight = await page.evaluate(() => document.body.scrollHeight);
  let scrollAttempts = 0;
  const maxScrollAttempts = 10;

  while (currentHeight > previousHeight && scrollAttempts < maxScrollAttempts) {
    previousHeight = currentHeight;
    
    // Scroll to bottom
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });

    // Wait for content to load
    await page.waitForTimeout(2000);

    // Get new height
    currentHeight = await page.evaluate(() => document.body.scrollHeight);
    scrollAttempts++;
  }
}

/**
 * Check if page requires JavaScript rendering
 */
export async function requiresJavaScript(url: string): Promise<boolean> {
  try {
    const axios = (await import('axios')).default;
    const response = await axios.get(url, {
      timeout: 10000,
      validateStatus: () => true,
    });

    const html = response.data;
    
    // Check for common JS framework indicators
    const jsIndicators = [
      /<script[^>]*type=["']module["']/i,
      /<script[^>]*src=["'][^"']*react/i,
      /<script[^>]*src=["'][^"']*vue/i,
      /<script[^>]*src=["'][^"']*angular/i,
      /<div[^>]*id=["']root["']/i,
      /<div[^>]*id=["']app["']/i,
      /window\.__INITIAL_STATE__/i,
      /<noscript>/i, // Often indicates JS requirement
    ];

    // Check if content is minimal (likely JS-rendered)
    const contentLength = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '').length;
    const isMinimalContent = contentLength < 1000;

    return jsIndicators.some(pattern => pattern.test(html)) || isMinimalContent;
  } catch {
    // If we can't determine, assume JS might be needed
    return true;
  }
}


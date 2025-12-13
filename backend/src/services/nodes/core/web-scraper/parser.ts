/**
 * HTML Parser
 * Advanced parsing with structured data extraction
 */

import * as cheerio from 'cheerio';
import type { CheerioAPI } from 'cheerio';

export interface ParsedContent {
  title?: string;
  description?: string;
  metaTags: Record<string, string>;
  headings: {
    h1: string[];
    h2: string[];
    h3: string[];
    h4: string[];
    h5: string[];
    h6: string[];
  };
  paragraphs: string[];
  links: Array<{ text: string; url: string }>;
  images: Array<{ alt: string; src: string }>;
  structuredData: {
    jsonLd: any[];
    microdata: any[];
    openGraph: Record<string, string>;
  };
  tables: Array<Array<string[]>>;
  cleanText: string;
}

/**
 * Parse HTML content with advanced extraction
 */
export function parseContent(html: string, cleanHTML: boolean = true): ParsedContent {
  const $ = cheerio.load(html);

  // Clean HTML if requested
  if (cleanHTML) {
    $('script, style, nav, footer, .ad, .ads, .advertisement, .popup, .modal').remove();
  }

  const result: ParsedContent = {
    metaTags: {},
    headings: { h1: [], h2: [], h3: [], h4: [], h5: [], h6: [] },
    paragraphs: [],
    links: [],
    images: [],
    structuredData: {
      jsonLd: [],
      microdata: [],
      openGraph: {},
    },
    tables: [],
    cleanText: '',
  };

  // Extract title
  result.title = $('title').text().trim() || $('h1').first().text().trim();

  // Extract meta tags
  $('meta').each((_, el) => {
    const name = $(el).attr('name') || $(el).attr('property') || $(el).attr('http-equiv');
    const content = $(el).attr('content');
    if (name && content) {
      result.metaTags[name] = content;
    }
  });

  // Extract description
  result.description = result.metaTags['description'] || 
                      result.metaTags['og:description'] ||
                      $('meta[name="description"]').attr('content') || '';

  // Extract headings
  for (let i = 1; i <= 6; i++) {
    $(`h${i}`).each((_, el) => {
      const text = $(el).text().trim();
      if (text) {
        result.headings[`h${i}` as keyof typeof result.headings].push(text);
      }
    });
  }

  // Extract paragraphs
  $('p').each((_, el) => {
    const text = $(el).text().trim();
    if (text) {
      result.paragraphs.push(text);
    }
  });

  // Extract links
  $('a[href]').each((_, el) => {
    const text = $(el).text().trim();
    const href = $(el).attr('href') || '';
    if (text && href) {
      result.links.push({ text, url: href });
    }
  });

  // Extract images
  $('img').each((_, el) => {
    const alt = $(el).attr('alt') || '';
    const src = $(el).attr('src') || $(el).attr('data-src') || '';
    if (src) {
      result.images.push({ alt, src });
    }
  });

  // Extract structured data (JSON-LD)
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const json = JSON.parse($(el).html() || '{}');
      result.structuredData.jsonLd.push(json);
    } catch {
      // Invalid JSON, skip
    }
  });

  // Extract Open Graph tags
  $('meta[property^="og:"]').each((_, el) => {
    const property = $(el).attr('property') || '';
    const content = $(el).attr('content') || '';
    if (property && content) {
      result.structuredData.openGraph[property] = content;
    }
  });

  // Extract tables
  $('table').each((_, table) => {
    const rows: string[][] = [];
    $(table).find('tr').each((_, tr) => {
      const cells: string[] = [];
      $(tr).find('td, th').each((_, cell) => {
        cells.push($(cell).text().trim());
      });
      if (cells.length > 0) {
        rows.push(cells);
      }
    });
    if (rows.length > 0) {
      result.tables.push(rows);
    }
  });

  // Extract clean text (body only, no scripts/styles)
  const body = $('body').clone();
  body.find('script, style').remove();
  result.cleanText = body.text().replace(/\s+/g, ' ').trim();

  return result;
}

/**
 * Extract data using CSS selectors
 */
export function extractWithSelectors(
  $: CheerioAPI,
  selectors: Array<{
    name: string;
    selector: string;
    attribute?: string;
    multiple?: boolean;
  }>
): Record<string, unknown> {
  const results: Record<string, unknown> = {};

  for (const selector of selectors) {
    const elements = $(selector.selector);

    if (selector.multiple) {
      const items: string[] = [];
      elements.each((_, el) => {
        const value = getElementValue($, $(el), selector.attribute);
        if (value) items.push(value);
      });
      results[selector.name] = items;
    } else {
      const value = getElementValue($, elements.first(), selector.attribute);
      results[selector.name] = value;
    }
  }

  return results;
}

/**
 * Get element value based on attribute type
 */
function getElementValue($: CheerioAPI, el: cheerio.Cheerio<any>, attribute?: string): string {
  switch (attribute) {
    case 'href':
      return el.attr('href') || '';
    case 'src':
      return el.attr('src') || '';
    case 'value':
      return el.val()?.toString() || '';
    case 'text':
    default:
      return el.text().trim();
  }
}

/**
 * Normalize URL
 */
export function normalizeUrl(url: string, baseUrl?: string): string {
  try {
    const urlObj = baseUrl ? new URL(url, baseUrl) : new URL(url);
    
    // Remove fragment
    urlObj.hash = '';
    
    // Sort query params
    const params = new URLSearchParams(urlObj.search);
    const sortedParams = Array.from(params.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    urlObj.search = new URLSearchParams(sortedParams).toString();
    
    // Lowercase domain
    urlObj.hostname = urlObj.hostname.toLowerCase();
    
    return urlObj.toString();
  } catch {
    return url;
  }
}

/**
 * Extract links from HTML
 */
export function extractLinks($: CheerioAPI, baseUrl: string, sameDomainOnly: boolean = true): string[] {
  const links: string[] = [];
  const baseDomain = new URL(baseUrl).hostname;

  $('a[href]').each((_, el) => {
    const href = $(el).attr('href');
    if (!href) return;

    try {
      const absoluteUrl = new URL(href, baseUrl).toString();
      const urlDomain = new URL(absoluteUrl).hostname;

      if (!sameDomainOnly || urlDomain === baseDomain) {
        links.push(normalizeUrl(absoluteUrl));
      }
    } catch {
      // Invalid URL, skip
    }
  });

  return [...new Set(links)]; // Deduplicate
}


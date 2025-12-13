/**
 * Robots.txt Checker
 * Respects robots.txt rules
 */

import axios from 'axios';

// Simple robots.txt parser (basic implementation)
// For production, consider using 'robots-parser' npm package

interface RobotsRule {
  userAgent: string;
  disallowed: string[];
  allowed: string[];
  crawlDelay?: number;
}

export class RobotsChecker {
  private cache: Map<string, { rules: RobotsRule[]; fetchedAt: number }> = new Map();
  private readonly cacheTTL: number = 3600000; // 1 hour

  /**
   * Check if URL is allowed by robots.txt
   */
  async isAllowed(url: string, userAgent: string = '*'): Promise<boolean> {
    try {
      const urlObj = new URL(url);
      const robotsUrl = `${urlObj.protocol}//${urlObj.host}/robots.txt`;

      const rules = await this.fetchRobotsTxt(robotsUrl);
      if (!rules || rules.length === 0) {
        return true; // No robots.txt = allow
      }

      // Find matching user agent rules
      const matchingRules = rules.filter(r => 
        r.userAgent === '*' || r.userAgent === userAgent
      );

      if (matchingRules.length === 0) {
        return true; // No matching rules = allow
      }

      // Check if path is disallowed
      const path = urlObj.pathname;
      for (const rule of matchingRules) {
        for (const disallowed of rule.disallowed) {
          if (this.matchesPath(path, disallowed)) {
            // Check if there's an allowed override
            const hasAllowed = rule.allowed.some(allowed => this.matchesPath(path, allowed));
            if (!hasAllowed) {
              return false; // Disallowed
            }
          }
        }
      }

      return true; // Allowed
    } catch (error) {
      // If robots.txt can't be fetched, allow by default
      console.warn(`    ⚠️ Could not check robots.txt: ${error}`);
      return true;
    }
  }

  /**
   * Get crawl delay for user agent
   */
  async getCrawlDelay(url: string, userAgent: string = '*'): Promise<number | null> {
    try {
      const urlObj = new URL(url);
      const robotsUrl = `${urlObj.protocol}//${urlObj.host}/robots.txt`;

      const rules = await this.fetchRobotsTxt(robotsUrl);
      const matchingRule = rules?.find(r => 
        r.userAgent === '*' || r.userAgent === userAgent
      );

      return matchingRule?.crawlDelay || null;
    } catch {
      return null;
    }
  }

  /**
   * Fetch and parse robots.txt
   */
  private async fetchRobotsTxt(robotsUrl: string): Promise<RobotsRule[] | null> {
    // Check cache
    const cached = this.cache.get(robotsUrl);
    if (cached && Date.now() - cached.fetchedAt < this.cacheTTL) {
      return cached.rules;
    }

    try {
      const response = await axios.get(robotsUrl, {
        timeout: 5000,
        headers: {
          'User-Agent': 'SPECTR-SYSTEMS-WebScraper/1.0',
        },
      });

      const rules = this.parseRobotsTxt(response.data);
      this.cache.set(robotsUrl, {
        rules,
        fetchedAt: Date.now(),
      });

      return rules;
    } catch (error: any) {
      if (error.response?.status === 404) {
        // No robots.txt = allow all
        this.cache.set(robotsUrl, {
          rules: [],
          fetchedAt: Date.now(),
        });
        return [];
      }
      return null;
    }
  }

  /**
   * Simple robots.txt parser
   */
  private parseRobotsTxt(content: string): RobotsRule[] {
    const rules: RobotsRule[] = [];
    const lines = content.split('\n');
    let currentUserAgent = '*';
    let currentRule: RobotsRule | null = null;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) {
        continue;
      }

      const [directive, ...valueParts] = trimmed.split(':');
      const value = valueParts.join(':').trim().toLowerCase();

      if (directive.toLowerCase() === 'user-agent') {
        // Save previous rule
        if (currentRule) {
          rules.push(currentRule);
        }

        // Start new rule
        currentUserAgent = value;
        currentRule = {
          userAgent: currentUserAgent,
          disallowed: [],
          allowed: [],
        };
      } else if (currentRule) {
        if (directive.toLowerCase() === 'disallow') {
          if (value) {
            currentRule.disallowed.push(value);
          }
        } else if (directive.toLowerCase() === 'allow') {
          if (value) {
            currentRule.allowed.push(value);
          }
        } else if (directive.toLowerCase() === 'crawl-delay') {
          currentRule.crawlDelay = parseFloat(value) * 1000; // Convert to ms
        }
      }
    }

    // Add last rule
    if (currentRule) {
      rules.push(currentRule);
    }

    return rules;
  }

  /**
   * Check if path matches pattern
   */
  private matchesPath(path: string, pattern: string): boolean {
    if (pattern === '/') {
      return true; // Disallow all
    }

    // Convert pattern to regex
    const regexPattern = pattern
      .replace(/\*/g, '.*')
      .replace(/\$/g, '\\$');
    
    const regex = new RegExp(`^${regexPattern}`);
    return regex.test(path);
  }
}


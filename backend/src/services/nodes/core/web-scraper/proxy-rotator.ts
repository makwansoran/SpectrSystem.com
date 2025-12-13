/**
 * Proxy Rotator
 * Manages proxy pool with health checking and rotation
 */

export interface Proxy {
  url: string;
  auth?: {
    username: string;
    password: string;
  };
  lastUsed?: number;
  failureCount: number;
  successCount: number;
  isHealthy: boolean;
}

export class ProxyRotator {
  private proxies: Proxy[] = [];
  private currentIndex: number = 0;
  private readonly healthCheckEnabled: boolean;
  private readonly maxFailures: number = 3;

  constructor(proxyList: string[] = [], healthCheck: boolean = true) {
    this.healthCheckEnabled = healthCheck;
    this.proxies = this.parseProxies(proxyList);
  }

  /**
   * Parse proxy strings into Proxy objects
   */
  private parseProxies(proxyList: string[]): Proxy[] {
    return proxyList.map(proxyUrl => {
      try {
        const url = new URL(proxyUrl);
        const proxy: Proxy = {
          url: `${url.protocol}//${url.hostname}:${url.port}`,
          failureCount: 0,
          successCount: 0,
          isHealthy: true,
        };

        if (url.username && url.password) {
          proxy.auth = {
            username: decodeURIComponent(url.username),
            password: decodeURIComponent(url.password),
          };
        }

        return proxy;
      } catch (error) {
        console.warn(`Invalid proxy URL: ${proxyUrl}`, error);
        return null;
      }
    }).filter((p): p is Proxy => p !== null);
  }

  /**
   * Get next proxy (round-robin with health check)
   */
  getNextProxy(): Proxy | null {
    if (this.proxies.length === 0) {
      return null;
    }

    // Filter healthy proxies
    const healthyProxies = this.proxies.filter(p => p.isHealthy);
    
    if (healthyProxies.length === 0) {
      // Reset all proxies if all are unhealthy
      this.proxies.forEach(p => {
        p.isHealthy = true;
        p.failureCount = 0;
      });
      return this.proxies[this.currentIndex % this.proxies.length];
    }

    // Get next healthy proxy
    const proxy = healthyProxies[this.currentIndex % healthyProxies.length];
    this.currentIndex = (this.currentIndex + 1) % healthyProxies.length;
    proxy.lastUsed = Date.now();

    return proxy;
  }

  /**
   * Record proxy success
   */
  recordSuccess(proxy: Proxy): void {
    proxy.successCount++;
    proxy.failureCount = 0;
    proxy.isHealthy = true;
  }

  /**
   * Record proxy failure
   */
  recordFailure(proxy: Proxy): void {
    proxy.failureCount++;
    
    if (proxy.failureCount >= this.maxFailures) {
      proxy.isHealthy = false;
      console.warn(`    ⚠️ Proxy marked unhealthy: ${proxy.url} (${proxy.failureCount} failures)`);
    }
  }

  /**
   * Health check proxy
   */
  async healthCheck(proxy: Proxy): Promise<boolean> {
    if (!this.healthCheckEnabled) {
      return true;
    }

    try {
      const axios = (await import('axios')).default;
      const response = await axios.get('https://httpbin.org/ip', {
        proxy: {
          host: new URL(proxy.url).hostname,
          port: parseInt(new URL(proxy.url).port),
          auth: proxy.auth,
        },
        timeout: 5000,
      });

      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get proxy count
   */
  getProxyCount(): number {
    return this.proxies.length;
  }

  /**
   * Get healthy proxy count
   */
  getHealthyProxyCount(): number {
    return this.proxies.filter(p => p.isHealthy).length;
  }
}


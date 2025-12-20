/**
 * OSINT Node Execution Services
 * Handles execution of OSINT intelligence nodes
 */

import axios from 'axios';
import * as intelligenceDB from '../../database/intelligence';

// Define IntelligenceOutput type locally since frontend types aren't available in backend
export interface IntelligenceOutput {
  data: any;
  entities?: Array<{ type: string; value: string; confidence: number }>;
  geolocation?: { lat: number; lon: number; accuracy?: number };
  confidence?: number;
  tags?: string[];
  metadata?: any;
}

// ============================================
// Domain Intelligence Node
// ============================================

export async function executeDomainIntelligence(
  input: any,
  config: {
    domain?: string;
    includeWHOIS?: boolean;
    includeDNS?: boolean;
    includeSubdomains?: boolean;
    includeSSL?: boolean;
    apiKey?: string;
  }
): Promise<IntelligenceOutput> {
  const domain = config.domain || input?.domain || input?.data?.domain || input;
  
  if (!domain || typeof domain !== 'string') {
    throw new Error('Domain is required');
  }

  const results: any = {
    domain,
    whois: null,
    dns: null,
    subdomains: [],
    ssl: null,
  };

  const entities: Array<{ type: string; value: string; confidence: number }> = [
    { type: 'domain', value: domain, confidence: 1.0 },
  ];

  try {
    // WHOIS lookup (using free API)
    if (config.includeWHOIS !== false) {
      try {
        const whoisResponse = await axios.get(`https://whoisjson.com/api/v1/whois?domain=${domain}`, {
          timeout: 10000,
        });
        if (whoisResponse.data) {
          results.whois = whoisResponse.data;
          if (whoisResponse.data.registrar) {
            entities.push({ type: 'organization', value: whoisResponse.data.registrar, confidence: 0.9 });
          }
          if (whoisResponse.data.registrantEmail) {
            entities.push({ type: 'email', value: whoisResponse.data.registrantEmail, confidence: 0.8 });
          }
        }
      } catch (err) {
        console.warn('WHOIS lookup failed:', err);
      }
    }

    // DNS records (using public DNS resolver)
    if (config.includeDNS !== false) {
      try {
        const dnsResponse = await axios.get(`https://dns.google/resolve?name=${domain}&type=A`, {
          timeout: 10000,
        });
        if (dnsResponse.data?.Answer) {
          results.dns = {
            A: dnsResponse.data.Answer.map((r: any) => r.data),
          };
          
          // Extract IP addresses
          dnsResponse.data.Answer.forEach((r: any) => {
            if (r.type === 1) { // A record
              entities.push({ type: 'ip', value: r.data, confidence: 0.9 });
            }
          });
        }
      } catch (err) {
        console.warn('DNS lookup failed:', err);
      }
    }

    // Subdomain enumeration (using crt.sh)
    if (config.includeSubdomains) {
      try {
        const subdomainResponse = await axios.get(
          `https://crt.sh/?q=${encodeURIComponent(domain)}&output=json`,
          { timeout: 15000 }
        );
        if (Array.isArray(subdomainResponse.data)) {
          const uniqueSubdomains = [...new Set(
            subdomainResponse.data
              .map((cert: any) => cert.name_value)
              .flat()
              .filter((name: string) => name.includes(domain))
          )];
          results.subdomains = uniqueSubdomains.slice(0, 50); // Limit to 50
        }
      } catch (err) {
        console.warn('Subdomain enumeration failed:', err);
      }
    }

    // SSL certificate info
    if (config.includeSSL) {
      try {
        const sslResponse = await axios.get(`https://crt.sh/?q=${encodeURIComponent(domain)}&output=json`, {
          timeout: 10000,
        });
        if (Array.isArray(sslResponse.data) && sslResponse.data.length > 0) {
          results.ssl = {
            issuer: sslResponse.data[0].issuer_name,
            validFrom: sslResponse.data[0].not_before,
            validTo: sslResponse.data[0].not_after,
          };
        }
      } catch (err) {
        console.warn('SSL lookup failed:', err);
      }
    }

    return {
      data: results,
      metadata: {
        source: 'domain-intelligence',
        timestamp: new Date().toISOString(),
        confidence: 0.85,
      },
      entities,
    };
  } catch (error: any) {
    throw new Error(`Domain intelligence failed: ${error.message}`);
  }
}

// ============================================
// IP Geolocation Node
// ============================================

export async function executeIPGeolocation(
  input: any,
  config: {
    ip?: string;
    apiKey?: string;
  }
): Promise<IntelligenceOutput> {
  const ip = config.ip || input?.ip || input?.data?.ip || input;
  
  if (!ip || typeof ip !== 'string') {
    throw new Error('IP address is required');
  }

  // Validate IP format
  const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (!ipRegex.test(ip)) {
    throw new Error('Invalid IP address format');
  }

  try {
    // Use free IP geolocation API
    const response = await axios.get(`http://ip-api.com/json/${ip}`, {
      timeout: 10000,
    });

    if (response.data.status === 'fail') {
      throw new Error(response.data.message || 'IP geolocation failed');
    }

    const data = response.data;
    const geolocation = {
      lat: data.lat,
      lon: data.lon,
      accuracy: 1000, // Approximate accuracy in meters
    };

    const entities: Array<{ type: string; value: string; confidence: number }> = [
      { type: 'ip', value: ip, confidence: 1.0 },
    ];

    if (data.org) {
      entities.push({ type: 'organization', value: data.org, confidence: 0.9 });
    }
    if (data.isp) {
      entities.push({ type: 'organization', value: data.isp, confidence: 0.8 });
    }
    if (data.city) {
      entities.push({ type: 'location', value: data.city, confidence: 0.9 });
    }
    if (data.country) {
      entities.push({ type: 'location', value: data.country, confidence: 1.0 });
    }

    return {
      data: {
        ip,
        country: data.country,
        countryCode: data.countryCode,
        region: data.region,
        regionName: data.regionName,
        city: data.city,
        zip: data.zip,
        lat: data.lat,
        lon: data.lon,
        timezone: data.timezone,
        isp: data.isp,
        org: data.org,
        as: data.as,
        query: data.query,
      },
      metadata: {
        source: 'ip-geolocation',
        timestamp: new Date().toISOString(),
        confidence: 0.9,
      },
      entities,
      geolocation,
    };
  } catch (error: any) {
    throw new Error(`IP geolocation failed: ${error.message}`);
  }
}

// ============================================
// Entity Extraction Node
// ============================================

export async function executeEntityExtraction(
  input: any,
  config: {
    text?: string;
    extractEmails?: boolean;
    extractPhones?: boolean;
    extractIPs?: boolean;
    extractURLs?: boolean;
    extractDomains?: boolean;
  }
): Promise<IntelligenceOutput> {
  const text = config.text || input?.text || input?.data?.text || JSON.stringify(input);
  
  if (!text || typeof text !== 'string') {
    throw new Error('Text input is required');
  }

  const entities: Array<{ type: string; value: string; confidence: number }> = [];

  // Email extraction
  if (config.extractEmails !== false) {
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const emails = text.match(emailRegex) || [];
    emails.forEach(email => {
      if (!entities.find(e => e.type === 'email' && e.value === email)) {
        entities.push({ type: 'email', value: email, confidence: 0.95 });
      }
    });
  }

  // Phone extraction
  if (config.extractPhones !== false) {
    const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
    const phones = text.match(phoneRegex) || [];
    phones.forEach(phone => {
      if (!entities.find(e => e.type === 'phone' && e.value === phone)) {
        entities.push({ type: 'phone', value: phone, confidence: 0.8 });
      }
    });
  }

  // IP address extraction
  if (config.extractIPs !== false) {
    const ipRegex = /\b(\d{1,3}\.){3}\d{1,3}\b/g;
    const ips = text.match(ipRegex) || [];
    ips.forEach(ip => {
      if (!entities.find(e => e.type === 'ip' && e.value === ip)) {
        entities.push({ type: 'ip', value: ip, confidence: 0.9 });
      }
    });
  }

  // URL extraction
  if (config.extractURLs !== false) {
    const urlRegex = /https?:\/\/[^\s]+/g;
    const urls = text.match(urlRegex) || [];
    urls.forEach(url => {
      if (!entities.find(e => e.type === 'url' && e.value === url)) {
        entities.push({ type: 'url', value: url, confidence: 0.95 });
      }
    });
  }

  // Domain extraction
  if (config.extractDomains !== false) {
    const domainRegex = /\b([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}\b/gi;
    const domains = text.match(domainRegex) || [];
    domains.forEach((domain: string) => {
      // Skip if it's part of a URL
      if (!domain.startsWith('http') && !entities.find(e => e.type === 'domain' && e.value === domain)) {
        entities.push({ type: 'domain', value: domain, confidence: 0.85 });
      }
    });
  }

  return {
    data: {
      text,
      extractedEntities: entities,
      entityCount: entities.length,
    },
    metadata: {
      source: 'entity-extraction',
      timestamp: new Date().toISOString(),
      confidence: 0.9,
    },
    entities,
  };
}


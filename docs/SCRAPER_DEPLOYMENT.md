# Scraper Deployment Guide

This document provides comprehensive guidance for implementing, deploying, and maintaining a production-ready web scraper for FoodDealSniper.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Implementation Guide](#implementation-guide)
- [Rate Limiting](#rate-limiting)
- [Proxy Configuration](#proxy-configuration)
- [Error Handling & Retries](#error-handling--retries)
- [Monitoring & Logging](#monitoring--logging)
- [Legal & Ethical Considerations](#legal--ethical-considerations)
- [Production Deployment](#production-deployment)
- [Troubleshooting](#troubleshooting)

## Overview

The FoodDealSniper scraper is designed to collect food deal information from various vendor websites while respecting rate limits, implementing proper retry logic, and rotating proxies to avoid detection and IP bans.

### Key Features

- **Respectful scraping** with configurable rate limits
- **Rotating proxy support** to distribute requests
- **Automatic retry** with exponential backoff
- **Comprehensive logging** for debugging and monitoring
- **Graceful error handling** to maintain service availability
- **Scheduling support** for automated execution

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Scraper Service                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐ │
│  │   Scheduler  │───▶│ Rate Limiter │───▶│ HTTP Client  │ │
│  └──────────────┘    └──────────────┘    └──────┬───────┘ │
│                                                   │          │
│  ┌──────────────┐    ┌──────────────┐           │          │
│  │Parser/Extract│◀───│ Retry Logic  │◀──────────┘          │
│  └──────┬───────┘    └──────────────┘                       │
│         │                                                     │
│         ▼                                                     │
│  ┌──────────────┐    ┌──────────────┐                       │
│  │ Validation   │───▶│  Data Store  │                       │
│  └──────────────┘    └──────────────┘                       │
│                                                              │
│         ┌──────────────────────┐                            │
│         │   Proxy Rotation     │                            │
│         └──────────────────────┘                            │
└─────────────────────────────────────────────────────────────┘
```

## Implementation Guide

### 1. Basic Scraper Structure

Create `packages/backend/src/scraper/scraper-service.ts`:

```typescript
import axios, { AxiosInstance } from 'axios';
import { RateLimiter } from './rate-limiter';
import { ProxyRotator } from './proxy-rotator';
import { Deal } from '../types';

interface ScraperConfig {
  rateLimitRequests: number;
  rateLimitPeriodMs: number;
  timeout: number;
  maxRetries: number;
  retryDelayMs: number;
  userAgent: string;
  proxyEnabled: boolean;
  proxyList?: string[];
}

export class ScraperService {
  private httpClient: AxiosInstance;
  private rateLimiter: RateLimiter;
  private proxyRotator?: ProxyRotator;
  private config: ScraperConfig;

  constructor(config: ScraperConfig) {
    this.config = config;
    this.rateLimiter = new RateLimiter(config.rateLimitRequests, config.rateLimitPeriodMs);

    if (config.proxyEnabled && config.proxyList?.length) {
      this.proxyRotator = new ProxyRotator(config.proxyList);
    }

    this.httpClient = this.createHttpClient();
  }

  private createHttpClient(): AxiosInstance {
    return axios.create({
      timeout: this.config.timeout,
      headers: {
        'User-Agent': this.config.userAgent,
      },
    });
  }

  async scrapeVendor(vendorUrl: string): Promise<Deal[]> {
    await this.rateLimiter.wait();

    try {
      const response = await this.fetchWithRetry(vendorUrl);
      const deals = this.parseDeals(response.data);
      return deals;
    } catch (error) {
      console.error(`Failed to scrape ${vendorUrl}:`, error);
      throw error;
    }
  }

  private async fetchWithRetry(url: string, attempt = 1): Promise<any> {
    try {
      const config: any = {};

      if (this.proxyRotator) {
        const proxy = this.proxyRotator.getNext();
        config.proxy = proxy;
      }

      return await this.httpClient.get(url, config);
    } catch (error) {
      if (attempt < this.config.maxRetries) {
        const delay = this.config.retryDelayMs * Math.pow(2, attempt - 1);
        await this.sleep(delay);
        return this.fetchWithRetry(url, attempt + 1);
      }
      throw error;
    }
  }

  private parseDeals(html: string): Deal[] {
    // Implement parsing logic based on vendor website structure
    // Use libraries like cheerio for HTML parsing
    return [];
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
```

### 2. Rate Limiter Implementation

Create `packages/backend/src/scraper/rate-limiter.ts`:

```typescript
export class RateLimiter {
  private requests: number[] = [];
  private maxRequests: number;
  private periodMs: number;

  constructor(maxRequests: number, periodMs: number) {
    this.maxRequests = maxRequests;
    this.periodMs = periodMs;
  }

  async wait(): Promise<void> {
    const now = Date.now();

    // Remove old requests outside the window
    this.requests = this.requests.filter((timestamp) => now - timestamp < this.periodMs);

    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = this.requests[0];
      const waitTime = this.periodMs - (now - oldestRequest);
      await this.sleep(waitTime);
      return this.wait();
    }

    this.requests.push(now);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
```

### 3. Proxy Rotator Implementation

Create `packages/backend/src/scraper/proxy-rotator.ts`:

```typescript
interface ProxyConfig {
  host: string;
  port: number;
  auth?: {
    username: string;
    password: string;
  };
}

export class ProxyRotator {
  private proxies: ProxyConfig[];
  private currentIndex = 0;
  private failedProxies = new Set<number>();

  constructor(proxyUrls: string[]) {
    this.proxies = proxyUrls.map(this.parseProxyUrl);
  }

  private parseProxyUrl(url: string): ProxyConfig {
    const parsed = new URL(url);
    return {
      host: parsed.hostname,
      port: parseInt(parsed.port, 10),
      auth:
        parsed.username && parsed.password
          ? {
              username: parsed.username,
              password: parsed.password,
            }
          : undefined,
    };
  }

  getNext(): ProxyConfig {
    // Skip failed proxies
    let attempts = 0;
    while (attempts < this.proxies.length) {
      if (!this.failedProxies.has(this.currentIndex)) {
        const proxy = this.proxies[this.currentIndex];
        this.currentIndex = (this.currentIndex + 1) % this.proxies.length;
        return proxy;
      }
      this.currentIndex = (this.currentIndex + 1) % this.proxies.length;
      attempts++;
    }

    // All proxies failed, reset and try again
    this.failedProxies.clear();
    return this.proxies[0];
  }

  markFailed(proxy: ProxyConfig): void {
    const index = this.proxies.findIndex((p) => p.host === proxy.host && p.port === proxy.port);
    if (index !== -1) {
      this.failedProxies.add(index);
    }
  }
}
```

## Rate Limiting

### Why Rate Limiting Matters

1. **Respects target servers** - Prevents overwhelming their infrastructure
2. **Avoids IP bans** - Stays under detection thresholds
3. **Legal compliance** - Shows good faith in terms of service
4. **Sustainable scraping** - Ensures long-term access

### Recommended Settings

```bash
# Conservative (for small sites or first-time scraping)
SCRAPER_RATE_LIMIT_REQUESTS=5
SCRAPER_RATE_LIMIT_PERIOD_MS=60000  # 5 requests per minute

# Moderate (for established scraping relationships)
SCRAPER_RATE_LIMIT_REQUESTS=10
SCRAPER_RATE_LIMIT_PERIOD_MS=60000  # 10 requests per minute

# Aggressive (only with explicit permission or public APIs)
SCRAPER_RATE_LIMIT_REQUESTS=30
SCRAPER_RATE_LIMIT_PERIOD_MS=60000  # 30 requests per minute
```

### Adaptive Rate Limiting

Implement adaptive rate limiting based on response codes:

```typescript
class AdaptiveRateLimiter extends RateLimiter {
  private errorCount = 0;
  private readonly errorThreshold = 3;

  async handleResponse(statusCode: number): Promise<void> {
    if (statusCode === 429 || statusCode === 503) {
      // Too Many Requests or Service Unavailable
      this.errorCount++;
      if (this.errorCount >= this.errorThreshold) {
        // Slow down by 50%
        this.maxRequests = Math.ceil(this.maxRequests * 0.5);
        this.errorCount = 0;
      }
    } else if (statusCode === 200) {
      // Successful response, gradually increase if we were throttled
      if (this.errorCount > 0) {
        this.errorCount = Math.max(0, this.errorCount - 1);
      }
    }
  }
}
```

## Proxy Configuration

### Why Use Proxies

1. **Distribute requests** across multiple IP addresses
2. **Avoid IP-based blocking**
3. **Geographic diversity** for location-specific content
4. **Increased reliability** with failover

### Proxy Types

#### Residential Proxies

- **Pros**: Harder to detect, less likely to be blocked
- **Cons**: More expensive, slower
- **Use case**: High-value targets with strong anti-scraping

#### Datacenter Proxies

- **Pros**: Fast, affordable
- **Cons**: Easier to detect and block
- **Use case**: Initial development, less restrictive sites

#### Rotating Proxies

- **Pros**: Automatic IP rotation, large pool
- **Cons**: Can be expensive
- **Use case**: Large-scale scraping operations

### Configuration Examples

```bash
# Single proxy
SCRAPER_PROXY_ENABLED=true
SCRAPER_PROXY_URL=http://user:pass@proxy.example.com:8080

# Multiple proxies (comma-separated)
SCRAPER_PROXY_ENABLED=true
SCRAPER_PROXY_LIST=http://proxy1:8080,http://proxy2:8080,http://proxy3:8080

# SOCKS5 proxy
SCRAPER_PROXY_URL=socks5://user:pass@proxy.example.com:1080
```

### Proxy Provider Setup

#### Bright Data (formerly Luminati)

```bash
SCRAPER_PROXY_URL=http://username:password@brd.superproxy.io:22225
```

#### Oxylabs

```bash
SCRAPER_PROXY_URL=http://username:password@pr.oxylabs.io:7777
```

#### ScraperAPI

```bash
# ScraperAPI handles proxies automatically
SCRAPER_API_KEY=your_api_key
SCRAPER_API_URL=http://api.scraperapi.com?api_key={key}&url={url}
```

## Error Handling & Retries

### Retry Strategy

Implement exponential backoff with jitter:

```typescript
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }

      // Exponential backoff with jitter
      const delay = baseDelay * Math.pow(2, attempt - 1);
      const jitter = Math.random() * 1000;
      await sleep(delay + jitter);

      console.log(`Retry attempt ${attempt} after ${delay + jitter}ms`);
    }
  }

  throw new Error('Max retries exceeded');
}
```

### Error Classification

```typescript
enum ErrorType {
  NETWORK = 'network',
  RATE_LIMIT = 'rate_limit',
  PARSE = 'parse',
  PROXY = 'proxy',
  UNKNOWN = 'unknown',
}

function classifyError(error: any): ErrorType {
  if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
    return ErrorType.NETWORK;
  }
  if (error.response?.status === 429 || error.response?.status === 503) {
    return ErrorType.RATE_LIMIT;
  }
  if (error.response?.status === 407) {
    return ErrorType.PROXY;
  }
  if (error.name === 'ParserError') {
    return ErrorType.PARSE;
  }
  return ErrorType.UNKNOWN;
}
```

## Monitoring & Logging

### Metrics to Track

1. **Request metrics**
   - Total requests
   - Successful requests
   - Failed requests
   - Average response time

2. **Error metrics**
   - Error rate by type
   - Rate limit hits
   - Proxy failures
   - Parse errors

3. **Performance metrics**
   - Scraping throughput (items/hour)
   - Time per vendor
   - Queue depth

### Logging Implementation

```typescript
interface ScraperMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  errorsByType: Record<string, number>;
  lastRunAt: Date;
}

class ScraperMonitor {
  private metrics: ScraperMetrics = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageResponseTime: 0,
    errorsByType: {},
    lastRunAt: new Date(),
  };

  recordRequest(success: boolean, responseTime: number, error?: ErrorType): void {
    this.metrics.totalRequests++;

    if (success) {
      this.metrics.successfulRequests++;
    } else {
      this.metrics.failedRequests++;
      if (error) {
        this.metrics.errorsByType[error] = (this.metrics.errorsByType[error] || 0) + 1;
      }
    }

    // Update average response time
    const total = this.metrics.successfulRequests + this.metrics.failedRequests;
    this.metrics.averageResponseTime =
      (this.metrics.averageResponseTime * (total - 1) + responseTime) / total;
  }

  getMetrics(): ScraperMetrics {
    return { ...this.metrics };
  }

  reset(): void {
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      errorsByType: {},
      lastRunAt: new Date(),
    };
  }
}
```

### Alerting

Set up alerts for critical issues:

```typescript
class ScraperAlerting {
  checkHealth(metrics: ScraperMetrics): void {
    const errorRate = metrics.failedRequests / metrics.totalRequests;

    if (errorRate > 0.5) {
      this.sendAlert('HIGH_ERROR_RATE', `Error rate: ${errorRate * 100}%`);
    }

    if (metrics.errorsByType[ErrorType.RATE_LIMIT] > 10) {
      this.sendAlert('RATE_LIMIT_EXCEEDED', 'Consider increasing delays');
    }

    if (metrics.errorsByType[ErrorType.PROXY] > 5) {
      this.sendAlert('PROXY_ISSUES', 'Multiple proxy failures detected');
    }
  }

  private sendAlert(type: string, message: string): void {
    console.error(`[ALERT] ${type}: ${message}`);
    // Integrate with alerting service (PagerDuty, Slack, email, etc.)
  }
}
```

## Legal & Ethical Considerations

### 1. Review Terms of Service

Before scraping any website:

- Read and understand their Terms of Service
- Look for explicit prohibitions on scraping
- Check for official APIs as alternatives

### 2. Respect robots.txt

```typescript
import { parse } from 'robots-txt-parser';

async function checkRobotsTxt(domain: string, path: string): Promise<boolean> {
  const robotsUrl = `${domain}/robots.txt`;
  const response = await fetch(robotsUrl);
  const robotsTxt = await response.text();
  const parser = parse(robotsTxt);

  return parser.isAllowed(path, 'FoodDealSniper-Bot/1.0');
}
```

### 3. Identify Your Bot

Use a descriptive User-Agent:

```bash
SCRAPER_USER_AGENT=FoodDealSniper-Bot/1.0 (+https://fooddealsniper.com/bot)
```

### 4. Rate Limiting (Again)

Always err on the side of caution with rate limits.

### 5. Handle Personal Data Responsibly

- Don't scrape personal information
- Comply with GDPR, CCPA, and other privacy laws
- Only collect publicly available data

### 6. Provide Contact Information

Create a page at `/bot` explaining your bot:

```markdown
# FoodDealSniper Bot

This is the web crawler for FoodDealSniper.

## Purpose

We collect publicly available food deal information to help consumers find the best deals.

## Contact

If you have concerns about our crawler:

- Email: bot@fooddealsniper.com
- We respect robots.txt
- We implement reasonable rate limits
```

## Production Deployment

### 1. Environment Setup

```bash
# Production environment variables
NODE_ENV=production
SCRAPER_RATE_LIMIT_REQUESTS=10
SCRAPER_RATE_LIMIT_PERIOD_MS=60000
SCRAPER_PROXY_ENABLED=true
SCRAPER_PROXY_LIST=http://proxy1:8080,http://proxy2:8080
SCRAPER_TIMEOUT_MS=30000
SCRAPER_MAX_RETRIES=3
SCRAPER_SCHEDULE="0 * * * *"
SCRAPER_AUTO_RUN=true
```

### 2. Docker Deployment

Add scraper configuration to docker-compose:

```yaml
services:
  scraper:
    build: .
    environment:
      - NODE_ENV=production
      - SCRAPER_RATE_LIMIT_REQUESTS=${SCRAPER_RATE_LIMIT_REQUESTS}
      - SCRAPER_PROXY_ENABLED=${SCRAPER_PROXY_ENABLED}
      - SCRAPER_PROXY_LIST=${SCRAPER_PROXY_LIST}
    restart: unless-stopped
    depends_on:
      - backend
```

### 3. Scheduling

Use cron or a job scheduler:

```typescript
import cron from 'node-cron';

// Run every hour
cron.schedule('0 * * * *', async () => {
  console.log('Starting scheduled scraping job');
  try {
    await scraperService.runAll();
  } catch (error) {
    console.error('Scraping job failed:', error);
  }
});
```

### 4. Graceful Shutdown

```typescript
let isShuttingDown = false;

process.on('SIGTERM', async () => {
  console.log('SIGTERM received, starting graceful shutdown');
  isShuttingDown = true;

  // Wait for current requests to complete
  await scraperService.waitForCompletion();

  process.exit(0);
});
```

### 5. Health Checks

Implement health check endpoint:

```typescript
app.get('/health/scraper', (req, res) => {
  const metrics = scraperMonitor.getMetrics();
  const isHealthy = metrics.failedRequests / metrics.totalRequests < 0.5;

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'healthy' : 'unhealthy',
    metrics,
  });
});
```

## Troubleshooting

### Common Issues

#### 1. Getting Blocked/Rate Limited

**Symptoms:**

- 429 Too Many Requests
- 403 Forbidden
- Slow response times

**Solutions:**

- Reduce request rate
- Enable proxies
- Add random delays between requests
- Rotate User-Agents

#### 2. Proxy Connection Failures

**Symptoms:**

- ECONNREFUSED errors
- 407 Proxy Authentication Required
- Timeouts

**Solutions:**

- Verify proxy credentials
- Check proxy server status
- Implement proxy health checks
- Use backup proxies

#### 3. Parse Errors

**Symptoms:**

- Incomplete data extraction
- Unexpected HTML structure

**Solutions:**

- Update selectors/parsers
- Add robust error handling
- Log HTML for debugging
- Implement schema validation

#### 4. Memory Leaks

**Symptoms:**

- Increasing memory usage
- Application crashes

**Solutions:**

- Clear request history regularly
- Limit concurrent requests
- Use streaming for large responses
- Monitor memory usage

### Debug Mode

Enable detailed logging:

```bash
LOG_LEVEL=debug
SCRAPER_DEBUG=true
```

```typescript
if (process.env.SCRAPER_DEBUG === 'true') {
  console.log('Request details:', {
    url,
    proxy,
    headers,
    timestamp: new Date(),
  });
}
```

## Performance Optimization

### 1. Concurrent Requests

```typescript
async function scrapeAllVendors(vendors: string[]): Promise<Deal[][]> {
  const concurrency = 5;
  const results: Deal[][] = [];

  for (let i = 0; i < vendors.length; i += concurrency) {
    const batch = vendors.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map((vendor) => scraperService.scrapeVendor(vendor)),
    );
    results.push(...batchResults);
  }

  return results;
}
```

### 2. Caching

```typescript
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 3600 }); // 1 hour TTL

async function scrapeWithCache(url: string): Promise<Deal[]> {
  const cached = cache.get<Deal[]>(url);
  if (cached) {
    return cached;
  }

  const deals = await scraperService.scrapeVendor(url);
  cache.set(url, deals);
  return deals;
}
```

### 3. Request Deduplication

```typescript
const inFlightRequests = new Map<string, Promise<Deal[]>>();

async function scrapeVendorDedup(url: string): Promise<Deal[]> {
  if (inFlightRequests.has(url)) {
    return inFlightRequests.get(url)!;
  }

  const promise = scraperService.scrapeVendor(url);
  inFlightRequests.set(url, promise);

  try {
    return await promise;
  } finally {
    inFlightRequests.delete(url);
  }
}
```

## Additional Resources

- [Scrapy Best Practices](https://docs.scrapy.org/en/latest/topics/practices.html)
- [Web Scraping Legal Guide](https://blog.apify.com/is-web-scraping-legal/)
- [robots.txt Specification](https://www.robotstxt.org/)
- [HTTP Status Codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)
- [Cheerio Documentation](https://cheerio.js.org/)
- [Puppeteer for Dynamic Sites](https://pptr.dev/)

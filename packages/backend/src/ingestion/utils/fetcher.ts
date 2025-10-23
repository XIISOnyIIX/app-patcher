import axios from 'axios';
import * as cheerio from 'cheerio';
import { chromium, Browser, Page } from 'playwright';

import { logger } from './logger';

export interface FetchOptions {
  usePlaywright?: boolean;
  timeout?: number;
  headers?: Record<string, string>;
  waitForSelector?: string;
}

export interface FetchResult {
  html: string;
  $?: cheerio.CheerioAPI;
  success: boolean;
  error?: string;
}

const DEFAULT_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5',
  'Accept-Encoding': 'gzip, deflate, br',
  DNT: '1',
  Connection: 'keep-alive',
  'Upgrade-Insecure-Requests': '1',
};

export class Fetcher {
  private browser?: Browser;

  async fetchWithCheerio(url: string, options: FetchOptions = {}): Promise<FetchResult> {
    try {
      logger.debug(`Fetching with Cheerio: ${url}`);

      const response = await axios.get(url, {
        headers: { ...DEFAULT_HEADERS, ...options.headers },
        timeout: options.timeout || 30000,
        validateStatus: (status) => status < 500,
      });

      if (response.status >= 400) {
        return {
          html: '',
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const $ = cheerio.load(response.data);

      return {
        html: response.data,
        $,
        success: true,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Cheerio fetch failed for ${url}:`, error);
      return {
        html: '',
        success: false,
        error: errorMessage,
      };
    }
  }

  async fetchWithPlaywright(url: string, options: FetchOptions = {}): Promise<FetchResult> {
    let page: Page | undefined;

    try {
      logger.debug(`Fetching with Playwright: ${url}`);

      if (!this.browser) {
        this.browser = await chromium.launch({ headless: true });
      }

      page = await this.browser.newPage();
      await page.setExtraHTTPHeaders(
        options.headers || {
          ...DEFAULT_HEADERS,
        },
      );

      await page.goto(url, {
        timeout: options.timeout || 30000,
        waitUntil: 'networkidle',
      });

      if (options.waitForSelector) {
        await page.waitForSelector(options.waitForSelector, {
          timeout: options.timeout || 30000,
        });
      }

      const html = await page.content();
      const $ = cheerio.load(html);

      await page.close();

      return {
        html,
        $,
        success: true,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Playwright fetch failed for ${url}:`, error);

      if (page) {
        await page.close().catch(() => {});
      }

      return {
        html: '',
        success: false,
        error: errorMessage,
      };
    }
  }

  async fetch(url: string, options: FetchOptions = {}): Promise<FetchResult> {
    const result = options.usePlaywright
      ? await this.fetchWithPlaywright(url, options)
      : await this.fetchWithCheerio(url, options);

    if (!result.success && !options.usePlaywright) {
      logger.info(`Falling back to Playwright for ${url}`);
      return this.fetchWithPlaywright(url, options);
    }

    return result;
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = undefined;
    }
  }
}

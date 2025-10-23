import { ProviderConfig, ScraperResult } from './types';
import { logger } from '../utils/logger';
import { RateLimiter } from '../utils/RateLimiter';

export abstract class BaseProvider {
  protected config: ProviderConfig;
  protected rateLimiter: RateLimiter;

  constructor(config: ProviderConfig) {
    this.config = config;
    this.rateLimiter = new RateLimiter(
      config.rateLimit.maxRequests,
      config.rateLimit.perMilliseconds,
    );
  }

  abstract scrape(): Promise<ScraperResult>;

  async execute(): Promise<ScraperResult> {
    if (!this.config.enabled) {
      logger.info(`Provider ${this.config.name} is disabled, skipping...`);
      return {
        success: false,
        coupons: [],
        error: 'Provider is disabled',
        timestamp: new Date(),
      };
    }

    try {
      logger.info(`Starting scrape for provider: ${this.config.name}`);
      await this.rateLimiter.checkLimit();

      const result = await this.scrape();

      if (result.success) {
        logger.info(
          `Successfully scraped ${result.coupons.length} coupons from ${this.config.name}`,
        );
      } else {
        logger.error(`Failed to scrape from ${this.config.name}: ${result.error}`);
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Error executing provider ${this.config.name}:`, error);
      return {
        success: false,
        coupons: [],
        error: errorMessage,
        timestamp: new Date(),
      };
    }
  }

  getName(): string {
    return this.config.name;
  }

  isEnabled(): boolean {
    return this.config.enabled;
  }

  getRefreshInterval(): string {
    return this.config.refreshInterval;
  }
}

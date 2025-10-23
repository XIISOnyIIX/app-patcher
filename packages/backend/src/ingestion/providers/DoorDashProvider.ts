import { BaseProvider } from '../core/BaseProvider';
import { ProviderConfig, ScraperResult } from '../core/types';
import { logger } from '../utils/logger';

export class DoorDashProvider extends BaseProvider {
  constructor(config?: Partial<ProviderConfig>) {
    super({
      name: 'DoorDash',
      enabled: config?.enabled ?? false,
      refreshInterval: config?.refreshInterval || '0 */6 * * *',
      rateLimit: {
        maxRequests: 10,
        perMilliseconds: 60000,
      },
      usePlaywright: true,
      timeout: 30000,
      ...config,
    });
  }

  async scrape(): Promise<ScraperResult> {
    logger.info('DoorDash provider is a stub implementation');

    return {
      success: true,
      coupons: [],
      timestamp: new Date(),
    };
  }
}

import { BaseProvider } from '../core/BaseProvider';
import { ProviderConfig, ScraperResult, NormalizedCoupon } from '../core/types';
import { Fetcher } from '../utils/fetcher';
import { logger } from '../utils/logger';

export class UberEatsProvider extends BaseProvider {
  private fetcher: Fetcher;

  constructor(config?: Partial<ProviderConfig>) {
    super({
      name: 'UberEats',
      enabled: config?.enabled ?? true,
      refreshInterval: config?.refreshInterval || '0 */4 * * *',
      rateLimit: {
        maxRequests: 15,
        perMilliseconds: 60000,
      },
      usePlaywright: false,
      timeout: 30000,
      ...config,
    });

    this.fetcher = new Fetcher();
  }

  async scrape(): Promise<ScraperResult> {
    try {
      const coupons: NormalizedCoupon[] = [];

      const promoUrls = [
        'https://www.ubereats.com/promotions',
        'https://www.retailmenot.com/view/ubereats.com',
      ];

      for (const url of promoUrls) {
        try {
          const result = await this.fetcher.fetch(url, {
            usePlaywright: this.config.usePlaywright,
            timeout: this.config.timeout,
          });

          if (!result.success || !result.$) {
            logger.warn(`Failed to fetch ${url}: ${result.error}`);
            continue;
          }

          const $ = result.$;

          if (url.includes('ubereats.com')) {
            $('[data-test="promo-card"], .promo-item, [class*="promo"]').each((_i, elem) => {
              try {
                const $elem = $(elem);
                const code = $elem
                  .find('[data-test="promo-code"], .promo-code, code')
                  .first()
                  .text()
                  .trim();

                const title =
                  $elem.find('h3, h4, [class*="title"]').first().text().trim() || 'UberEats Promo';

                const description =
                  $elem.find('p, [class*="description"]').first().text().trim() ||
                  'Discount on UberEats orders';

                if (code && code.length > 2) {
                  const coupon = this.parseUberEatsCoupon(code, title, description);
                  if (coupon) {
                    coupons.push(coupon);
                  }
                }
              } catch (error) {
                logger.debug('Error parsing promo element:', error);
              }
            });
          } else if (url.includes('retailmenot')) {
            $('.offer, [data-test="offer"]').each((_i, elem) => {
              try {
                const $elem = $(elem);
                const code = $elem.find('.offer-code, [data-test="code"]').first().text().trim();

                const title =
                  $elem.find('.offer-title, [data-test="title"]').first().text().trim() ||
                  'UberEats Discount';

                const description =
                  $elem
                    .find('.offer-description, [data-test="description"]')
                    .first()
                    .text()
                    .trim() || title;

                if (code && code.length > 2) {
                  const coupon = this.parseUberEatsCoupon(code, title, description);
                  if (coupon) {
                    coupons.push(coupon);
                  }
                }
              } catch (error) {
                logger.debug('Error parsing offer element:', error);
              }
            });
          }
        } catch (error) {
          logger.warn(`Error scraping ${url}:`, error);
        }
      }

      const uniqueCoupons = this.deduplicateByCode(coupons);

      logger.info(`UberEats scrape complete: found ${uniqueCoupons.length} unique coupons`);

      return {
        success: true,
        coupons: uniqueCoupons,
        timestamp: new Date(),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('UberEats scraping failed:', error);
      return {
        success: false,
        coupons: [],
        error: errorMessage,
        timestamp: new Date(),
      };
    }
  }

  private parseUberEatsCoupon(
    code: string,
    title: string,
    description: string,
  ): NormalizedCoupon | null {
    try {
      const lowerDesc = description.toLowerCase();
      const lowerTitle = title.toLowerCase();
      const combined = `${lowerTitle} ${lowerDesc}`;

      let discountType: NormalizedCoupon['discountType'] = 'other';
      let discountValue: number | undefined;
      let minOrderValue: number | undefined;

      if (combined.includes('free delivery') || combined.includes('$0 delivery')) {
        discountType = 'free_delivery';
      } else if (combined.includes('%') || combined.includes('percent')) {
        discountType = 'percentage';
        const percentMatch = combined.match(/(\d+)%/);
        if (percentMatch) {
          discountValue = parseInt(percentMatch[1]);
        }
      } else if (combined.includes('$') || combined.includes('off')) {
        discountType = 'fixed';
        const dollarMatch = combined.match(/\$(\d+)/);
        if (dollarMatch) {
          discountValue = parseInt(dollarMatch[1]);
        }
      }

      const minOrderMatch = combined.match(/\$(\d+)\s*(?:minimum|min|order)/);
      if (minOrderMatch) {
        minOrderValue = parseInt(minOrderMatch[1]);
      }

      let expiresAt: Date | undefined;
      const expiresMatch = description.match(/expires?\s*:?\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/i);
      if (expiresMatch) {
        try {
          expiresAt = new Date(expiresMatch[1]);
        } catch {
          expiresAt = undefined;
        }
      }

      return {
        code,
        title,
        description,
        vendor: 'UberEats',
        discountType,
        discountValue,
        minOrderValue,
        expiresAt,
      };
    } catch (error) {
      logger.debug('Error parsing coupon details:', error);
      return null;
    }
  }

  private deduplicateByCode(coupons: NormalizedCoupon[]): NormalizedCoupon[] {
    const seen = new Map<string, NormalizedCoupon>();

    for (const coupon of coupons) {
      const normalizedCode = coupon.code.toUpperCase().replace(/\s+/g, '');
      if (!seen.has(normalizedCode)) {
        seen.set(normalizedCode, coupon);
      }
    }

    return Array.from(seen.values());
  }

  async cleanup(): Promise<void> {
    await this.fetcher.close();
  }
}

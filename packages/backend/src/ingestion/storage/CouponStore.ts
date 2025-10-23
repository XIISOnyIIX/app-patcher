import { promises as fs } from 'fs';
import path from 'path';

import { Coupon } from '../core/types';
import { logger } from '../utils/logger';
import { deduplicateCoupons } from '../utils/normalizer';

export class CouponStore {
  private storePath: string;
  private coupons: Map<string, Coupon> = new Map();

  constructor(storagePath?: string) {
    this.storePath = storagePath || path.join(process.cwd(), 'data', 'coupons', 'coupons.json');
  }

  async initialize(): Promise<void> {
    try {
      const dir = path.dirname(this.storePath);
      await fs.mkdir(dir, { recursive: true });

      try {
        const data = await fs.readFile(this.storePath, 'utf-8');
        const coupons: Coupon[] = JSON.parse(data);

        for (const coupon of coupons) {
          coupon.scrapedAt = new Date(coupon.scrapedAt);
          coupon.lastVerified = new Date(coupon.lastVerified);
          if (coupon.expiresAt) {
            coupon.expiresAt = new Date(coupon.expiresAt);
          }
          this.coupons.set(coupon.id, coupon);
        }

        logger.info(`Loaded ${this.coupons.size} coupons from storage`);
      } catch (error) {
        logger.info('No existing coupon data found, starting fresh');
      }
    } catch (error) {
      logger.error('Failed to initialize coupon store:', error);
      throw error;
    }
  }

  async saveCoupons(newCoupons: Coupon[]): Promise<{
    added: number;
    updated: number;
  }> {
    let added = 0;
    let updated = 0;

    for (const coupon of newCoupons) {
      const existing = this.coupons.get(coupon.id);

      if (!existing) {
        this.coupons.set(coupon.id, coupon);
        added++;
      } else {
        existing.lastVerified = coupon.lastVerified;
        existing.description = coupon.description;
        existing.expiresAt = coupon.expiresAt;
        existing.termsUrl = coupon.termsUrl;
        existing.discountValue = coupon.discountValue;
        existing.minOrderValue = coupon.minOrderValue;
        updated++;
      }
    }

    await this.persist();

    logger.info(`Saved coupons: ${added} added, ${updated} updated, ${this.coupons.size} total`);

    return { added, updated };
  }

  async persist(): Promise<void> {
    try {
      const couponsArray = Array.from(this.coupons.values());
      const deduplicated = deduplicateCoupons(couponsArray);

      await fs.writeFile(this.storePath, JSON.stringify(deduplicated, null, 2), 'utf-8');

      logger.debug(`Persisted ${deduplicated.length} coupons to storage`);
    } catch (error) {
      logger.error('Failed to persist coupons:', error);
      throw error;
    }
  }

  getAllCoupons(): Coupon[] {
    return Array.from(this.coupons.values());
  }

  getCouponsByVendor(vendor: string): Coupon[] {
    return this.getAllCoupons().filter((c) => c.vendor === vendor);
  }

  getActiveCoupons(): Coupon[] {
    const now = new Date();
    return this.getAllCoupons().filter((c) => !c.expiresAt || c.expiresAt > now);
  }

  getCouponById(id: string): Coupon | undefined {
    return this.coupons.get(id);
  }

  getTotalCount(): number {
    return this.coupons.size;
  }

  getActiveCount(): number {
    return this.getActiveCoupons().length;
  }

  async deleteCoupon(id: string): Promise<boolean> {
    const deleted = this.coupons.delete(id);
    if (deleted) {
      await this.persist();
    }
    return deleted;
  }

  async clear(): Promise<void> {
    this.coupons.clear();
    await this.persist();
    logger.info('Cleared all coupons from storage');
  }
}

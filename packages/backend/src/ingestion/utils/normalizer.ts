import crypto from 'crypto';

import { NormalizedCoupon, Coupon } from '../core/types';

export function normalizeCode(code: string): string {
  return code.toUpperCase().replace(/\s+/g, '').trim();
}

export function generateCouponId(vendor: string, code: string, title: string): string {
  const normalized = `${vendor}-${normalizeCode(code)}-${title}`;
  return crypto.createHash('md5').update(normalized).digest('hex');
}

export function normalizeCoupon(rawCoupon: NormalizedCoupon, vendor: string): Coupon {
  const normalizedCode = normalizeCode(rawCoupon.code);
  const id = generateCouponId(vendor, normalizedCode, rawCoupon.title);

  return {
    id,
    code: normalizedCode,
    title: rawCoupon.title.trim(),
    description: rawCoupon.description.trim(),
    vendor,
    discountType: rawCoupon.discountType,
    discountValue: rawCoupon.discountValue,
    minOrderValue: rawCoupon.minOrderValue,
    expiresAt: rawCoupon.expiresAt,
    termsUrl: rawCoupon.termsUrl,
    scrapedAt: new Date(),
    lastVerified: new Date(),
  };
}

export function deduplicateCoupons(coupons: Coupon[]): Coupon[] {
  const seen = new Map<string, Coupon>();

  for (const coupon of coupons) {
    const existing = seen.get(coupon.id);

    if (!existing || existing.lastVerified < coupon.lastVerified) {
      seen.set(coupon.id, coupon);
    }
  }

  return Array.from(seen.values());
}

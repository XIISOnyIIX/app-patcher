export interface Coupon {
  id: string;
  code: string;
  title: string;
  description: string;
  vendor: string;
  discountType: 'percentage' | 'fixed' | 'free_delivery' | 'other';
  discountValue?: number;
  minOrderValue?: number;
  expiresAt?: Date;
  termsUrl?: string;
  scrapedAt: Date;
  lastVerified: Date;
}

export interface NormalizedCoupon {
  code: string;
  title: string;
  description: string;
  vendor: string;
  discountType: 'percentage' | 'fixed' | 'free_delivery' | 'other';
  discountValue?: number;
  minOrderValue?: number;
  expiresAt?: Date;
  termsUrl?: string;
}

export interface ScraperResult {
  success: boolean;
  coupons: NormalizedCoupon[];
  error?: string;
  timestamp: Date;
}

export interface ProviderConfig {
  name: string;
  enabled: boolean;
  refreshInterval: string;
  rateLimit: {
    maxRequests: number;
    perMilliseconds: number;
  };
  usePlaywright?: boolean;
  timeout?: number;
}

export interface IngestionMetrics {
  provider: string;
  lastRun: Date;
  status: 'success' | 'failure' | 'running';
  couponsFound: number;
  couponsAdded: number;
  couponsUpdated: number;
  duration: number;
  error?: string;
}

export interface HealthStatus {
  uptime: number;
  lastIngestionRun?: Date;
  providers: {
    [key: string]: {
      status: 'healthy' | 'degraded' | 'down';
      lastSuccess?: Date;
      lastFailure?: Date;
      consecutiveFailures: number;
    };
  };
  totalCoupons: number;
  activeCoupons: number;
}

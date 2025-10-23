import { Coupon, HealthStatus, IngestionMetrics } from './core/types';
import { MetricsTracker } from './metrics/MetricsTracker';
import { ProviderRegistry, createDefaultProviders } from './providers';
import { IngestionScheduler } from './scheduler/IngestionScheduler';
import { CouponStore } from './storage/CouponStore';
import { logger } from './utils/logger';

export class IngestionService {
  private store: CouponStore;
  private metrics: MetricsTracker;
  private scheduler: IngestionScheduler;
  private registry: ProviderRegistry;
  private initialized = false;

  constructor(storagePath?: string) {
    this.store = new CouponStore(storagePath);
    this.metrics = new MetricsTracker();
    this.registry = new ProviderRegistry();

    const defaultProviders = createDefaultProviders();
    defaultProviders.forEach((provider) => this.registry.registerProvider(provider));

    this.scheduler = new IngestionScheduler(
      this.registry.getAllProviders(),
      this.store,
      this.metrics,
    );
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      logger.warn('IngestionService already initialized');
      return;
    }

    logger.info('Initializing IngestionService...');

    await this.store.initialize();

    this.initialized = true;
    logger.info('IngestionService initialized successfully');
  }

  startScheduler(): void {
    if (!this.initialized) {
      throw new Error('IngestionService must be initialized before starting');
    }

    this.scheduler.start();
  }

  stopScheduler(): void {
    this.scheduler.stop();
  }

  async runIngestionNow(providerName?: string): Promise<void> {
    if (!this.initialized) {
      throw new Error('IngestionService must be initialized first');
    }

    if (providerName) {
      const provider = this.registry.getProvider(providerName);
      if (!provider) {
        throw new Error(`Provider not found: ${providerName}`);
      }
      await this.scheduler.runIngestion(provider);
    } else {
      await this.scheduler.runAllImmediately();
    }
  }

  getAllCoupons(): Coupon[] {
    return this.store.getAllCoupons();
  }

  getActiveCoupons(): Coupon[] {
    return this.store.getActiveCoupons();
  }

  getCouponsByVendor(vendor: string): Coupon[] {
    return this.store.getCouponsByVendor(vendor);
  }

  getCouponById(id: string): Coupon | undefined {
    return this.store.getCouponById(id);
  }

  getHealthStatus(): HealthStatus {
    return this.metrics.getHealthStatus(this.store.getTotalCount(), this.store.getActiveCount());
  }

  getMetrics(provider?: string, limit = 10): IngestionMetrics[] | Map<string, IngestionMetrics[]> {
    if (provider) {
      return this.metrics.getMetrics(provider, limit);
    }
    return this.metrics.getAllMetrics();
  }

  getSchedulerStatus(): {
    running: boolean;
    activeTasks: number;
    providers: string[];
  } {
    return this.scheduler.getStatus();
  }

  getProviders(): Array<{
    name: string;
    enabled: boolean;
  }> {
    return this.registry.getAllProviders().map((p) => ({
      name: p.getName(),
      enabled: p.isEnabled(),
    }));
  }

  async shutdown(): Promise<void> {
    logger.info('Shutting down IngestionService...');
    this.stopScheduler();
    await this.store.persist();
    logger.info('IngestionService shutdown complete');
  }
}

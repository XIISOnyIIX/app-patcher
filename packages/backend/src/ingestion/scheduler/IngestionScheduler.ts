import cron from 'node-cron';

import { BaseProvider } from '../core/BaseProvider';
import { IngestionMetrics } from '../core/types';
import { MetricsTracker } from '../metrics/MetricsTracker';
import { CouponStore } from '../storage/CouponStore';
import { logger } from '../utils/logger';
import { normalizeCoupon } from '../utils/normalizer';

export class IngestionScheduler {
  private store: CouponStore;
  private metrics: MetricsTracker;
  private providers: BaseProvider[];
  private tasks: Map<string, cron.ScheduledTask> = new Map();
  private isRunning = false;

  constructor(providers: BaseProvider[], store: CouponStore, metrics: MetricsTracker) {
    this.providers = providers;
    this.store = store;
    this.metrics = metrics;
  }

  start(): void {
    if (this.isRunning) {
      logger.warn('Scheduler is already running');
      return;
    }

    logger.info('Starting ingestion scheduler...');

    for (const provider of this.providers) {
      if (!provider.isEnabled()) {
        logger.info(`Skipping disabled provider: ${provider.getName()}`);
        continue;
      }

      const schedule = provider.getRefreshInterval() || '0 */6 * * *';

      const task = cron.schedule(
        schedule,
        async () => {
          await this.runIngestion(provider);
        },
        {
          scheduled: true,
        },
      );

      this.tasks.set(provider.getName(), task);
      logger.info(`Scheduled ${provider.getName()} with cron: ${schedule}`);
    }

    this.isRunning = true;
    logger.info(`Scheduler started with ${this.tasks.size} active provider(s)`);
  }

  async runIngestion(provider: BaseProvider): Promise<void> {
    const startTime = Date.now();
    const providerName = provider.getName();

    logger.info(`Running ingestion for provider: ${providerName}`);

    const metric: IngestionMetrics = {
      provider: providerName,
      lastRun: new Date(),
      status: 'running',
      couponsFound: 0,
      couponsAdded: 0,
      couponsUpdated: 0,
      duration: 0,
    };

    try {
      const result = await provider.execute();

      if (!result.success) {
        metric.status = 'failure';
        metric.error = result.error;
        metric.duration = Date.now() - startTime;
        this.metrics.recordMetric(metric);
        return;
      }

      metric.couponsFound = result.coupons.length;

      const normalizedCoupons = result.coupons.map((c) => normalizeCoupon(c, providerName));

      const { added, updated } = await this.store.saveCoupons(normalizedCoupons);

      metric.couponsAdded = added;
      metric.couponsUpdated = updated;
      metric.status = 'success';
      metric.duration = Date.now() - startTime;

      this.metrics.recordMetric(metric);

      logger.info(
        `Ingestion complete for ${providerName}: ${added} added, ${updated} updated, took ${metric.duration}ms`,
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      metric.status = 'failure';
      metric.error = errorMessage;
      metric.duration = Date.now() - startTime;

      this.metrics.recordMetric(metric);
      logger.error(`Ingestion failed for ${providerName}:`, error);
    }
  }

  async runAllImmediately(): Promise<void> {
    logger.info('Running all enabled providers immediately...');

    const enabledProviders = this.providers.filter((p) => p.isEnabled());

    for (const provider of enabledProviders) {
      await this.runIngestion(provider);
    }

    logger.info('Immediate ingestion run complete');
  }

  stop(): void {
    if (!this.isRunning) {
      logger.warn('Scheduler is not running');
      return;
    }

    logger.info('Stopping ingestion scheduler...');

    for (const [providerName, task] of this.tasks.entries()) {
      task.stop();
      logger.info(`Stopped scheduler for ${providerName}`);
    }

    this.tasks.clear();
    this.isRunning = false;

    logger.info('Scheduler stopped');
  }

  getStatus(): {
    running: boolean;
    activeTasks: number;
    providers: string[];
  } {
    return {
      running: this.isRunning,
      activeTasks: this.tasks.size,
      providers: Array.from(this.tasks.keys()),
    };
  }
}

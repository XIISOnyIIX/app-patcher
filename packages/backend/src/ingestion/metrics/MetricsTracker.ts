import { IngestionMetrics, HealthStatus } from '../core/types';
import { logger } from '../utils/logger';

export class MetricsTracker {
  private metrics: Map<string, IngestionMetrics[]> = new Map();
  private startTime: number = Date.now();
  private readonly maxMetricsPerProvider = 100;

  recordMetric(metric: IngestionMetrics): void {
    const providerMetrics = this.metrics.get(metric.provider) || [];
    providerMetrics.push(metric);

    if (providerMetrics.length > this.maxMetricsPerProvider) {
      providerMetrics.shift();
    }

    this.metrics.set(metric.provider, providerMetrics);

    logger.info(
      `Recorded metric for ${metric.provider}: ${metric.status}, ${metric.couponsFound} found, ${metric.couponsAdded} added`,
    );
  }

  getMetrics(provider: string, limit = 10): IngestionMetrics[] {
    const providerMetrics = this.metrics.get(provider) || [];
    return providerMetrics.slice(-limit);
  }

  getAllMetrics(): Map<string, IngestionMetrics[]> {
    return new Map(this.metrics);
  }

  getLastMetric(provider: string): IngestionMetrics | undefined {
    const providerMetrics = this.metrics.get(provider);
    return providerMetrics ? providerMetrics[providerMetrics.length - 1] : undefined;
  }

  getHealthStatus(totalCoupons: number, activeCoupons: number): HealthStatus {
    const uptime = Date.now() - this.startTime;
    const providers: HealthStatus['providers'] = {};
    let lastIngestionRun: Date | undefined;

    for (const [providerName, providerMetrics] of this.metrics.entries()) {
      if (providerMetrics.length === 0) {
        providers[providerName] = {
          status: 'down',
          consecutiveFailures: 0,
        };
        continue;
      }

      const sortedMetrics = [...providerMetrics].sort(
        (a, b) => b.lastRun.getTime() - a.lastRun.getTime(),
      );

      const lastMetric = sortedMetrics[0];
      const lastSuccess = sortedMetrics.find((m) => m.status === 'success');
      const lastFailure = sortedMetrics.find((m) => m.status === 'failure');

      if (!lastIngestionRun || lastMetric.lastRun > lastIngestionRun) {
        lastIngestionRun = lastMetric.lastRun;
      }

      let consecutiveFailures = 0;
      for (const metric of sortedMetrics) {
        if (metric.status === 'failure') {
          consecutiveFailures++;
        } else {
          break;
        }
      }

      let status: 'healthy' | 'degraded' | 'down' = 'healthy';
      if (consecutiveFailures >= 5) {
        status = 'down';
      } else if (consecutiveFailures >= 2) {
        status = 'degraded';
      } else if (lastMetric.status === 'failure') {
        status = 'degraded';
      }

      providers[providerName] = {
        status,
        lastSuccess: lastSuccess?.lastRun,
        lastFailure: lastFailure?.lastRun,
        consecutiveFailures,
      };
    }

    return {
      uptime,
      lastIngestionRun,
      providers,
      totalCoupons,
      activeCoupons,
    };
  }

  clear(provider?: string): void {
    if (provider) {
      this.metrics.delete(provider);
      logger.info(`Cleared metrics for provider: ${provider}`);
    } else {
      this.metrics.clear();
      logger.info('Cleared all metrics');
    }
  }
}

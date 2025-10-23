import { Router, Request, Response } from 'express';

import { IngestionMetrics } from '../ingestion/core/types';
import { IngestionService } from '../ingestion/IngestionService';

export function createIngestionRouter(ingestionService: IngestionService): Router {
  const router = Router();

  router.get('/health', (_req: Request, res: Response) => {
    try {
      const health = ingestionService.getHealthStatus();
      res.json(health);
    } catch (error) {
      res.status(500).json({
        error: 'Failed to get health status',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  router.get('/metrics', (req: Request, res: Response) => {
    try {
      const provider = req.query.provider as string | undefined;
      const limit = parseInt(req.query.limit as string) || 10;

      const metrics = ingestionService.getMetrics(provider, limit);

      if (provider) {
        res.json({ provider, metrics });
      } else {
        const metricsObj: { [key: string]: IngestionMetrics[] } = {};
        for (const [key, value] of metrics as Map<string, IngestionMetrics[]>) {
          metricsObj[key] = value;
        }
        res.json(metricsObj);
      }
    } catch (error) {
      res.status(500).json({
        error: 'Failed to get metrics',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  router.get('/scheduler/status', (_req: Request, res: Response) => {
    try {
      const status = ingestionService.getSchedulerStatus();
      res.json(status);
    } catch (error) {
      res.status(500).json({
        error: 'Failed to get scheduler status',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  router.post('/run', async (req: Request, res: Response) => {
    try {
      const provider = req.body.provider as string | undefined;

      res.json({
        message: provider
          ? `Starting ingestion for ${provider}...`
          : 'Starting ingestion for all providers...',
        status: 'started',
      });

      ingestionService.runIngestionNow(provider).catch((error) => {
        console.error('Ingestion run error:', error);
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to start ingestion',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  router.get('/providers', (_req: Request, res: Response) => {
    try {
      const providers = ingestionService.getProviders();
      res.json(providers);
    } catch (error) {
      res.status(500).json({
        error: 'Failed to get providers',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  return router;
}

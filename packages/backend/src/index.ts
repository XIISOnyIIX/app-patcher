import 'dotenv/config';

import cors from 'cors';
import express from 'express';

import { IngestionService } from './ingestion/IngestionService';
import { logger } from './ingestion/utils/logger';
import { createCouponsRouter } from './routes/coupons';
import { createIngestionRouter } from './routes/ingestion';

const app = express();
const port = Number(process.env.PORT ?? 4000);

app.use(cors());
app.use(express.json());

const ingestionService = new IngestionService();

async function bootstrap() {
  try {
    await ingestionService.initialize();
    logger.info('Ingestion service initialized');

    ingestionService.startScheduler();
    logger.info('Ingestion scheduler started');

    if (process.env.RUN_INGESTION_ON_STARTUP === 'true') {
      logger.info('Running initial ingestion...');
      await ingestionService.runIngestionNow();
    }
  } catch (error) {
    logger.error('Failed to bootstrap ingestion service:', error);
  }
}

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/', (_req, res) => {
  res.json({ message: 'FoodDealSniper API is online' });
});

app.use('/api/ingestion', createIngestionRouter(ingestionService));
app.use('/api/coupons', createCouponsRouter(ingestionService));

const server = app.listen(port, () => {
  logger.info(`✅ FoodDealSniper API listening on http://localhost:${port}`);
  bootstrap();
});

process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  await ingestionService.shutdown();
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully...');
  await ingestionService.shutdown();
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

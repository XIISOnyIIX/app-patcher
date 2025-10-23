import 'dotenv/config';
import cors from 'cors';
import express from 'express';

import { getPrismaClient, disconnectDatabase } from './config/database';
import { env } from './config/env';
import { DealController } from './controllers/dealController';
import { UserPreferenceController } from './controllers/userPreferenceController';
import { VendorController } from './controllers/vendorController';
import { errorHandler } from './middleware/errorHandler';
import { DealRepository } from './repositories/dealRepository';
import { UserPreferenceRepository } from './repositories/userPreferenceRepository';
import { VendorRepository } from './repositories/vendorRepository';
import { createDealRoutes } from './routes/dealRoutes';
import { createUserPreferenceRoutes } from './routes/userPreferenceRoutes';
import { createVendorRoutes } from './routes/vendorRoutes';
import { DealService } from './services/dealService';
import { UserPreferenceService } from './services/userPreferenceService';
import { VendorService } from './services/vendorService';
import { logger } from './utils/logger';

const prisma = getPrismaClient();

const vendorRepository = new VendorRepository(prisma);
const dealRepository = new DealRepository(prisma);
const userPreferenceRepository = new UserPreferenceRepository(prisma);

const vendorService = new VendorService(vendorRepository);
const dealService = new DealService(dealRepository);
const userPreferenceService = new UserPreferenceService(userPreferenceRepository);

const vendorController = new VendorController(vendorService);
const dealController = new DealController(dealService);
const userPreferenceController = new UserPreferenceController(userPreferenceService);

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  logger.info({ method: req.method, path: req.path }, 'Incoming request');
  next();
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/', (_req, res) => {
  res.json({ message: 'FoodDealSniper API is online' });
});

app.use('/api/vendors', createVendorRoutes(vendorController));
app.use('/api/deals', createDealRoutes(dealController));
app.use('/api/preferences', createUserPreferenceRoutes(userPreferenceController));

app.use(errorHandler);

if (require.main === module) {
  const server = app.listen(env.PORT, () => {
    logger.info(
      {
        port: env.PORT,
        nodeEnv: env.NODE_ENV,
      },
      'FoodDealSniper API is running'
    );
  });

  const gracefulShutdown = async () => {
    logger.info('Shutting down gracefully...');
    server.close(async () => {
      await disconnectDatabase();
      logger.info('Server closed');
      process.exit(0);
    });

    setTimeout(() => {
      logger.error('Forcing shutdown after timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);
}

export { app };

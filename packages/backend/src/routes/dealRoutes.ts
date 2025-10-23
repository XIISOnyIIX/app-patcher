import { Router } from 'express';

import { DealController } from '../controllers/dealController';
import { asyncHandler } from '../middleware/errorHandler';

export const createDealRoutes = (dealController: DealController): Router => {
  const router = Router();

  router.get('/', asyncHandler((req, res) => dealController.getAll(req, res)));
  router.get('/active', asyncHandler((req, res) => dealController.getActive(req, res)));
  router.get('/:id', asyncHandler((req, res) => dealController.getById(req, res)));
  router.post('/', asyncHandler((req, res) => dealController.create(req, res)));
  router.put('/:id', asyncHandler((req, res) => dealController.update(req, res)));
  router.delete('/:id', asyncHandler((req, res) => dealController.delete(req, res)));

  return router;
};

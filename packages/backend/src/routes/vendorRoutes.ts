import { Router } from 'express';

import { VendorController } from '../controllers/vendorController';
import { asyncHandler } from '../middleware/errorHandler';

export const createVendorRoutes = (vendorController: VendorController): Router => {
  const router = Router();

  router.get('/', asyncHandler((req, res) => vendorController.getAll(req, res)));
  router.get('/:id', asyncHandler((req, res) => vendorController.getById(req, res)));
  router.post('/', asyncHandler((req, res) => vendorController.create(req, res)));
  router.put('/:id', asyncHandler((req, res) => vendorController.update(req, res)));
  router.delete('/:id', asyncHandler((req, res) => vendorController.delete(req, res)));

  return router;
};

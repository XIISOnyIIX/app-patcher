import { Router } from 'express';

import { UserPreferenceController } from '../controllers/userPreferenceController';
import { asyncHandler } from '../middleware/errorHandler';

export const createUserPreferenceRoutes = (
  userPreferenceController: UserPreferenceController
): Router => {
  const router = Router();

  router.get(
    '/:userId',
    asyncHandler((req, res) => userPreferenceController.getByUserId(req, res))
  );
  router.post(
    '/:userId',
    asyncHandler((req, res) => userPreferenceController.create(req, res))
  );
  router.put(
    '/:userId',
    asyncHandler((req, res) => userPreferenceController.update(req, res))
  );
  router.delete(
    '/:userId',
    asyncHandler((req, res) => userPreferenceController.delete(req, res))
  );

  return router;
};

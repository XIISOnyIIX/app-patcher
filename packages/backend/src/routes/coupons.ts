import { Router, Request, Response } from 'express';

import { IngestionService } from '../ingestion/IngestionService';

export function createCouponsRouter(ingestionService: IngestionService): Router {
  const router = Router();

  router.get('/', (req: Request, res: Response) => {
    try {
      const vendor = req.query.vendor as string | undefined;
      const activeOnly = req.query.active === 'true';

      let coupons = vendor
        ? ingestionService.getCouponsByVendor(vendor)
        : ingestionService.getAllCoupons();

      if (activeOnly) {
        const now = new Date();
        coupons = coupons.filter((c) => !c.expiresAt || c.expiresAt > now);
      }

      res.json({
        count: coupons.length,
        coupons,
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to get coupons',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  router.get('/active', (_req: Request, res: Response) => {
    try {
      const coupons = ingestionService.getActiveCoupons();
      res.json({
        count: coupons.length,
        coupons,
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to get active coupons',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  router.get('/:id', (req: Request, res: Response) => {
    try {
      const coupon = ingestionService.getCouponById(req.params.id);

      if (!coupon) {
        res.status(404).json({ error: 'Coupon not found' });
        return;
      }

      res.json(coupon);
    } catch (error) {
      res.status(500).json({
        error: 'Failed to get coupon',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  return router;
}

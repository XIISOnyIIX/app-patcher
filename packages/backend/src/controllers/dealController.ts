import { Request, Response } from 'express';
import { z } from 'zod';

import { DealService } from '../services/dealService';

const createDealSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  originalPrice: z.number().positive().optional(),
  discountedPrice: z.number().positive(),
  discountPercentage: z.number().min(0).max(100).optional(),
  imageUrl: z.string().url().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  vendorId: z.string().uuid(),
});

const updateDealSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  originalPrice: z.number().positive().optional(),
  discountedPrice: z.number().positive().optional(),
  discountPercentage: z.number().min(0).max(100).optional(),
  imageUrl: z.string().url().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  isActive: z.boolean().optional(),
});

export class DealController {
  constructor(private dealService: DealService) {}

  async getAll(req: Request, res: Response): Promise<void> {
    const { vendorId, isActive, minDiscount, maxPrice } = req.query;

    const filters = {
      vendorId: vendorId as string | undefined,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      minDiscount: minDiscount ? Number(minDiscount) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
    };

    const deals = await this.dealService.getAllDeals(filters);
    res.json({ status: 'success', data: deals });
  }

  async getActive(req: Request, res: Response): Promise<void> {
    const deals = await this.dealService.getActiveDeals();
    res.json({ status: 'success', data: deals });
  }

  async getById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const deal = await this.dealService.getDealById(id);
    res.json({ status: 'success', data: deal });
  }

  async create(req: Request, res: Response): Promise<void> {
    const data = createDealSchema.parse(req.body);
    const dealData = {
      ...data,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
    };
    const deal = await this.dealService.createDeal(dealData);
    res.status(201).json({ status: 'success', data: deal });
  }

  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const data = updateDealSchema.parse(req.body);
    const dealData = {
      ...data,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
    };
    const deal = await this.dealService.updateDeal(id, dealData);
    res.json({ status: 'success', data: deal });
  }

  async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    await this.dealService.deleteDeal(id);
    res.status(204).send();
  }
}

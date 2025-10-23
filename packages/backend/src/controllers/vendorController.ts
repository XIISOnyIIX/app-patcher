import { Request, Response } from 'express';
import { z } from 'zod';

import { VendorService } from '../services/vendorService';

const createVendorSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  logoUrl: z.string().url().optional(),
  website: z.string().url().optional(),
  category: z.string().optional(),
});

const updateVendorSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  logoUrl: z.string().url().optional(),
  website: z.string().url().optional(),
  category: z.string().optional(),
  isActive: z.boolean().optional(),
});

export class VendorController {
  constructor(private vendorService: VendorService) {}

  async getAll(req: Request, res: Response): Promise<void> {
    const vendors = await this.vendorService.getAllVendors();
    res.json({ status: 'success', data: vendors });
  }

  async getById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const vendor = await this.vendorService.getVendorById(id);
    res.json({ status: 'success', data: vendor });
  }

  async create(req: Request, res: Response): Promise<void> {
    const data = createVendorSchema.parse(req.body);
    const vendor = await this.vendorService.createVendor(data);
    res.status(201).json({ status: 'success', data: vendor });
  }

  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const data = updateVendorSchema.parse(req.body);
    const vendor = await this.vendorService.updateVendor(id, data);
    res.json({ status: 'success', data: vendor });
  }

  async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    await this.vendorService.deleteVendor(id);
    res.status(204).send();
  }
}

import { Request, Response } from 'express';
import { z } from 'zod';

import { UserPreferenceService } from '../services/userPreferenceService';

const userPreferenceSchema = z.object({
  favoriteVendors: z.array(z.string().uuid()).optional(),
  preferredCategories: z.array(z.string()).optional(),
  maxPrice: z.number().positive().optional(),
  minDiscount: z.number().min(0).max(100).optional(),
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  notificationFrequency: z.enum(['instant', 'daily', 'weekly']).optional(),
});

export class UserPreferenceController {
  constructor(private userPreferenceService: UserPreferenceService) {}

  async getByUserId(req: Request, res: Response): Promise<void> {
    const { userId } = req.params;
    const preferences = await this.userPreferenceService.getUserPreferences(userId);
    res.json({ status: 'success', data: preferences });
  }

  async create(req: Request, res: Response): Promise<void> {
    const { userId } = req.params;
    const data = userPreferenceSchema.parse(req.body);
    const preferences = await this.userPreferenceService.createUserPreferences(
      userId,
      data
    );
    res.status(201).json({ status: 'success', data: preferences });
  }

  async update(req: Request, res: Response): Promise<void> {
    const { userId } = req.params;
    const data = userPreferenceSchema.parse(req.body);
    const preferences = await this.userPreferenceService.updateUserPreferences(
      userId,
      data
    );
    res.json({ status: 'success', data: preferences });
  }

  async delete(req: Request, res: Response): Promise<void> {
    const { userId } = req.params;
    await this.userPreferenceService.deleteUserPreferences(userId);
    res.status(204).send();
  }
}

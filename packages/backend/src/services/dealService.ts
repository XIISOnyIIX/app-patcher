import { Deal } from '../generated/prisma';
import { AppError } from '../middleware/errorHandler';
import { DealRepository, DealFilters } from '../repositories/dealRepository';

export class DealService {
  constructor(private dealRepository: DealRepository) {}

  async getAllDeals(filters?: DealFilters): Promise<Deal[]> {
    return this.dealRepository.findAll(filters);
  }

  async getActiveDeals(): Promise<Deal[]> {
    return this.dealRepository.findActiveDeals();
  }

  async getDealById(id: string): Promise<Deal> {
    const deal = await this.dealRepository.findById(id);
    if (!deal) {
      throw new AppError(404, `Deal with id ${id} not found`);
    }
    return deal;
  }

  async createDeal(data: {
    title: string;
    description: string;
    originalPrice?: number;
    discountedPrice: number;
    discountPercentage?: number;
    imageUrl?: string;
    startDate?: Date;
    endDate?: Date;
    isActive?: boolean;
    vendorId: string;
  }): Promise<Deal> {
    if (data.originalPrice && !data.discountPercentage) {
      data.discountPercentage =
        ((data.originalPrice - data.discountedPrice) / data.originalPrice) * 100;
    }
    return this.dealRepository.create(data);
  }

  async updateDeal(
    id: string,
    data: {
      title?: string;
      description?: string;
      originalPrice?: number;
      discountedPrice?: number;
      discountPercentage?: number;
      imageUrl?: string;
      startDate?: Date;
      endDate?: Date;
      isActive?: boolean;
    }
  ): Promise<Deal> {
    const deal = await this.dealRepository.findById(id);
    if (!deal) {
      throw new AppError(404, `Deal with id ${id} not found`);
    }

    const originalPrice = data.originalPrice ?? deal.originalPrice;
    const discountedPrice = data.discountedPrice ?? deal.discountedPrice;

    if (originalPrice && !data.discountPercentage) {
      data.discountPercentage =
        ((originalPrice - discountedPrice) / originalPrice) * 100;
    }

    return this.dealRepository.update(id, data);
  }

  async deleteDeal(id: string): Promise<void> {
    const deal = await this.dealRepository.findById(id);
    if (!deal) {
      throw new AppError(404, `Deal with id ${id} not found`);
    }
    await this.dealRepository.delete(id);
  }
}

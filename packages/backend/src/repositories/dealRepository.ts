import { PrismaClient, Deal } from '../generated/prisma';

export interface DealFilters {
  vendorId?: string;
  isActive?: boolean;
  minDiscount?: number;
  maxPrice?: number;
}

export class DealRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll(filters?: DealFilters): Promise<Deal[]> {
    const where: any = {};

    if (filters?.vendorId) {
      where.vendorId = filters.vendorId;
    }

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters?.minDiscount) {
      where.discountPercentage = { gte: filters.minDiscount };
    }

    if (filters?.maxPrice) {
      where.discountedPrice = { lte: filters.maxPrice };
    }

    return this.prisma.deal.findMany({
      where,
      include: {
        vendor: true,
      },
      orderBy: { discountPercentage: 'desc' },
    });
  }

  async findById(id: string): Promise<Deal | null> {
    return this.prisma.deal.findUnique({
      where: { id },
      include: {
        vendor: true,
      },
    });
  }

  async findActiveDeals(): Promise<Deal[]> {
    const now = new Date();
    return this.prisma.deal.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        OR: [{ endDate: null }, { endDate: { gte: now } }],
      },
      include: {
        vendor: true,
      },
      orderBy: { discountPercentage: 'desc' },
    });
  }

  async create(data: {
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
    return this.prisma.deal.create({
      data,
      include: {
        vendor: true,
      },
    });
  }

  async update(
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
    return this.prisma.deal.update({
      where: { id },
      data,
      include: {
        vendor: true,
      },
    });
  }

  async delete(id: string): Promise<Deal> {
    return this.prisma.deal.delete({
      where: { id },
    });
  }
}

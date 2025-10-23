import { PrismaClient, Coupon } from '../generated/prisma';

export class CouponRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll(vendorId?: string): Promise<Coupon[]> {
    return this.prisma.coupon.findMany({
      where: {
        ...(vendorId && { vendorId }),
        isActive: true,
      },
      include: {
        vendor: true,
      },
      orderBy: { discountValue: 'desc' },
    });
  }

  async findById(id: string): Promise<Coupon | null> {
    return this.prisma.coupon.findUnique({
      where: { id },
      include: {
        vendor: true,
      },
    });
  }

  async findByCode(code: string): Promise<Coupon | null> {
    return this.prisma.coupon.findUnique({
      where: { code },
      include: {
        vendor: true,
      },
    });
  }

  async findActiveByVendor(vendorId: string): Promise<Coupon[]> {
    const now = new Date();
    return this.prisma.coupon.findMany({
      where: {
        vendorId,
        isActive: true,
        startDate: { lte: now },
        OR: [{ endDate: null }, { endDate: { gte: now } }],
      },
      include: {
        vendor: true,
      },
      orderBy: { discountValue: 'desc' },
    });
  }

  async create(data: {
    code: string;
    title: string;
    description: string;
    discountType: string;
    discountValue: number;
    minPurchase?: number;
    maxDiscount?: number;
    startDate?: Date;
    endDate?: Date;
    usageLimit?: number;
    vendorId: string;
  }): Promise<Coupon> {
    return this.prisma.coupon.create({
      data,
      include: {
        vendor: true,
      },
    });
  }

  async incrementUsage(id: string): Promise<Coupon> {
    return this.prisma.coupon.update({
      where: { id },
      data: {
        usageCount: { increment: 1 },
      },
      include: {
        vendor: true,
      },
    });
  }

  async delete(id: string): Promise<Coupon> {
    return this.prisma.coupon.delete({
      where: { id },
    });
  }
}

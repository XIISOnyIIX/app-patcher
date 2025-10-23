import { PrismaClient, UserPreference } from '../generated/prisma';

export class UserPreferenceRepository {
  constructor(private prisma: PrismaClient) {}

  async findByUserId(userId: string): Promise<UserPreference | null> {
    return this.prisma.userPreference.findUnique({
      where: { userId },
    });
  }

  async create(data: {
    userId: string;
    favoriteVendors?: string;
    preferredCategories?: string;
    maxPrice?: number;
    minDiscount?: number;
    emailNotifications?: boolean;
    pushNotifications?: boolean;
    notificationFrequency?: string;
  }): Promise<UserPreference> {
    return this.prisma.userPreference.create({ data });
  }

  async update(
    userId: string,
    data: {
      favoriteVendors?: string;
      preferredCategories?: string;
      maxPrice?: number;
      minDiscount?: number;
      emailNotifications?: boolean;
      pushNotifications?: boolean;
      notificationFrequency?: string;
    }
  ): Promise<UserPreference> {
    return this.prisma.userPreference.update({
      where: { userId },
      data,
    });
  }

  async upsert(
    userId: string,
    data: {
      favoriteVendors?: string;
      preferredCategories?: string;
      maxPrice?: number;
      minDiscount?: number;
      emailNotifications?: boolean;
      pushNotifications?: boolean;
      notificationFrequency?: string;
    }
  ): Promise<UserPreference> {
    return this.prisma.userPreference.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
    });
  }

  async delete(userId: string): Promise<UserPreference> {
    return this.prisma.userPreference.delete({
      where: { userId },
    });
  }
}

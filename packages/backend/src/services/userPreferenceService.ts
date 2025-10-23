import { UserPreference } from '../generated/prisma';
import { AppError } from '../middleware/errorHandler';
import { UserPreferenceRepository } from '../repositories/userPreferenceRepository';

export interface UserPreferenceData {
  favoriteVendors?: string[];
  preferredCategories?: string[];
  maxPrice?: number;
  minDiscount?: number;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  notificationFrequency?: 'instant' | 'daily' | 'weekly';
}

export class UserPreferenceService {
  constructor(private userPreferenceRepository: UserPreferenceRepository) {}

  async getUserPreferences(userId: string): Promise<UserPreference> {
    const preferences = await this.userPreferenceRepository.findByUserId(userId);
    if (!preferences) {
      throw new AppError(404, `Preferences for user ${userId} not found`);
    }
    return preferences;
  }

  async createUserPreferences(
    userId: string,
    data: UserPreferenceData
  ): Promise<UserPreference> {
    const existing = await this.userPreferenceRepository.findByUserId(userId);
    if (existing) {
      throw new AppError(409, `Preferences for user ${userId} already exist`);
    }

    const dbData = {
      favoriteVendors: data.favoriteVendors
        ? JSON.stringify(data.favoriteVendors)
        : undefined,
      preferredCategories: data.preferredCategories
        ? JSON.stringify(data.preferredCategories)
        : undefined,
      maxPrice: data.maxPrice,
      minDiscount: data.minDiscount,
      emailNotifications: data.emailNotifications,
      pushNotifications: data.pushNotifications,
      notificationFrequency: data.notificationFrequency,
    };

    return this.userPreferenceRepository.create({ userId, ...dbData });
  }

  async updateUserPreferences(
    userId: string,
    data: UserPreferenceData
  ): Promise<UserPreference> {
    const dbData = {
      favoriteVendors: data.favoriteVendors
        ? JSON.stringify(data.favoriteVendors)
        : undefined,
      preferredCategories: data.preferredCategories
        ? JSON.stringify(data.preferredCategories)
        : undefined,
      maxPrice: data.maxPrice,
      minDiscount: data.minDiscount,
      emailNotifications: data.emailNotifications,
      pushNotifications: data.pushNotifications,
      notificationFrequency: data.notificationFrequency,
    };

    return this.userPreferenceRepository.upsert(userId, dbData);
  }

  async deleteUserPreferences(userId: string): Promise<void> {
    const preferences = await this.userPreferenceRepository.findByUserId(userId);
    if (!preferences) {
      throw new AppError(404, `Preferences for user ${userId} not found`);
    }
    await this.userPreferenceRepository.delete(userId);
  }
}

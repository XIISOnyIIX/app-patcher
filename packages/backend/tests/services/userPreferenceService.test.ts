import { PrismaClient } from '../../src/generated/prisma';
import { AppError } from '../../src/middleware/errorHandler';
import { UserPreferenceRepository } from '../../src/repositories/userPreferenceRepository';
import { UserPreferenceService } from '../../src/services/userPreferenceService';

describe('UserPreferenceService', () => {
  let prisma: PrismaClient;
  let userPreferenceRepository: UserPreferenceRepository;
  let userPreferenceService: UserPreferenceService;

  beforeAll(() => {
    prisma = new PrismaClient();
    userPreferenceRepository = new UserPreferenceRepository(prisma);
    userPreferenceService = new UserPreferenceService(userPreferenceRepository);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await prisma.userPreference.deleteMany({});
  });

  describe('createUserPreferences', () => {
    it('should create user preferences', async () => {
      const userId = 'test-user-1';
      const data = {
        favoriteVendors: ['vendor-1', 'vendor-2'],
        preferredCategories: ['Italian', 'Japanese'],
        maxPrice: 50,
        minDiscount: 20,
        emailNotifications: true,
        pushNotifications: false,
        notificationFrequency: 'daily' as const,
      };

      const preferences = await userPreferenceService.createUserPreferences(
        userId,
        data
      );

      expect(preferences).toBeDefined();
      expect(preferences.userId).toBe(userId);
      expect(preferences.maxPrice).toBe(50);
      expect(preferences.minDiscount).toBe(20);
    });

    it('should throw error if preferences already exist', async () => {
      const userId = 'test-user-1';
      const data = {
        favoriteVendors: ['vendor-1'],
      };

      await userPreferenceService.createUserPreferences(userId, data);

      await expect(
        userPreferenceService.createUserPreferences(userId, data)
      ).rejects.toThrow(AppError);
      await expect(
        userPreferenceService.createUserPreferences(userId, data)
      ).rejects.toThrow('already exist');
    });
  });

  describe('getUserPreferences', () => {
    it('should return user preferences', async () => {
      const userId = 'test-user-1';
      await userPreferenceService.createUserPreferences(userId, {
        maxPrice: 100,
      });

      const preferences = await userPreferenceService.getUserPreferences(userId);

      expect(preferences).toBeDefined();
      expect(preferences.userId).toBe(userId);
      expect(preferences.maxPrice).toBe(100);
    });

    it('should throw error if preferences not found', async () => {
      await expect(
        userPreferenceService.getUserPreferences('non-existent-user')
      ).rejects.toThrow(AppError);
      await expect(
        userPreferenceService.getUserPreferences('non-existent-user')
      ).rejects.toThrow('not found');
    });
  });

  describe('updateUserPreferences', () => {
    it('should update existing user preferences', async () => {
      const userId = 'test-user-1';
      await userPreferenceService.createUserPreferences(userId, {
        maxPrice: 50,
        minDiscount: 10,
      });

      const updated = await userPreferenceService.updateUserPreferences(userId, {
        maxPrice: 100,
        minDiscount: 20,
      });

      expect(updated.maxPrice).toBe(100);
      expect(updated.minDiscount).toBe(20);
    });

    it('should create preferences if they do not exist (upsert)', async () => {
      const userId = 'test-user-1';

      const preferences = await userPreferenceService.updateUserPreferences(userId, {
        maxPrice: 75,
      });

      expect(preferences).toBeDefined();
      expect(preferences.userId).toBe(userId);
      expect(preferences.maxPrice).toBe(75);
    });

    it('should update array fields', async () => {
      const userId = 'test-user-1';
      await userPreferenceService.createUserPreferences(userId, {
        favoriteVendors: ['vendor-1'],
      });

      const updated = await userPreferenceService.updateUserPreferences(userId, {
        favoriteVendors: ['vendor-1', 'vendor-2', 'vendor-3'],
        preferredCategories: ['Italian', 'Mexican'],
      });

      const favorites = JSON.parse(updated.favoriteVendors || '[]');
      const categories = JSON.parse(updated.preferredCategories || '[]');

      expect(favorites).toHaveLength(3);
      expect(categories).toHaveLength(2);
    });
  });

  describe('deleteUserPreferences', () => {
    it('should delete user preferences', async () => {
      const userId = 'test-user-1';
      await userPreferenceService.createUserPreferences(userId, {
        maxPrice: 50,
      });

      await userPreferenceService.deleteUserPreferences(userId);

      await expect(
        userPreferenceService.getUserPreferences(userId)
      ).rejects.toThrow(AppError);
    });

    it('should throw error if preferences not found', async () => {
      await expect(
        userPreferenceService.deleteUserPreferences('non-existent-user')
      ).rejects.toThrow(AppError);
    });
  });
});

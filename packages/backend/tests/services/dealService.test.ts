import { PrismaClient } from '../../src/generated/prisma';
import { AppError } from '../../src/middleware/errorHandler';
import { DealRepository } from '../../src/repositories/dealRepository';
import { VendorRepository } from '../../src/repositories/vendorRepository';
import { DealService } from '../../src/services/dealService';

describe('DealService', () => {
  let prisma: PrismaClient;
  let vendorRepository: VendorRepository;
  let dealRepository: DealRepository;
  let dealService: DealService;
  let vendorId: string;

  beforeAll(async () => {
    prisma = new PrismaClient();
    vendorRepository = new VendorRepository(prisma);
    dealRepository = new DealRepository(prisma);
    dealService = new DealService(dealRepository);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await prisma.coupon.deleteMany({});
    await prisma.deal.deleteMany({});
    await prisma.vendor.deleteMany({});

    const vendor = await vendorRepository.create({
      name: 'Test Vendor',
    });
    vendorId = vendor.id;
  });

  describe('createDeal', () => {
    it('should create a new deal', async () => {
      const dealData = {
        title: 'Great Deal',
        description: 'Amazing discount',
        originalPrice: 20,
        discountedPrice: 15,
        vendorId,
      };

      const deal = await dealService.createDeal(dealData);

      expect(deal).toBeDefined();
      expect(deal.title).toBe(dealData.title);
      expect(deal.discountPercentage).toBe(25);
    });

    it('should calculate discount percentage if not provided', async () => {
      const dealData = {
        title: 'Great Deal',
        description: 'Amazing discount',
        originalPrice: 100,
        discountedPrice: 80,
        vendorId,
      };

      const deal = await dealService.createDeal(dealData);

      expect(deal.discountPercentage).toBe(20);
    });
  });

  describe('getAllDeals', () => {
    it('should return all deals', async () => {
      await dealService.createDeal({
        title: 'Deal 1',
        description: 'Description 1',
        discountedPrice: 10,
        vendorId,
      });
      await dealService.createDeal({
        title: 'Deal 2',
        description: 'Description 2',
        discountedPrice: 15,
        vendorId,
      });

      const deals = await dealService.getAllDeals();

      expect(deals).toHaveLength(2);
    });

    it('should filter deals by vendor', async () => {
      const vendor2 = await vendorRepository.create({ name: 'Vendor 2' });

      await dealService.createDeal({
        title: 'Deal 1',
        description: 'Description 1',
        discountedPrice: 10,
        vendorId,
      });
      await dealService.createDeal({
        title: 'Deal 2',
        description: 'Description 2',
        discountedPrice: 15,
        vendorId: vendor2.id,
      });

      const deals = await dealService.getAllDeals({ vendorId });

      expect(deals).toHaveLength(1);
      expect(deals[0].vendorId).toBe(vendorId);
    });
  });

  describe('getActiveDeals', () => {
    it('should return only active deals', async () => {
      const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      await dealService.createDeal({
        title: 'Active Deal',
        description: 'Description',
        discountedPrice: 10,
        isActive: true,
        endDate: futureDate,
        vendorId,
      });

      await dealService.createDeal({
        title: 'Inactive Deal',
        description: 'Description',
        discountedPrice: 10,
        isActive: false,
        vendorId,
      });

      const deals = await dealService.getActiveDeals();

      expect(deals).toHaveLength(1);
      expect(deals[0].title).toBe('Active Deal');
    });
  });

  describe('getDealById', () => {
    it('should return a deal by id', async () => {
      const created = await dealService.createDeal({
        title: 'Test Deal',
        description: 'Test Description',
        discountedPrice: 10,
        vendorId,
      });

      const deal = await dealService.getDealById(created.id);

      expect(deal).toBeDefined();
      expect(deal.id).toBe(created.id);
    });

    it('should throw error if deal not found', async () => {
      await expect(dealService.getDealById('non-existent-id')).rejects.toThrow(
        AppError
      );
      await expect(dealService.getDealById('non-existent-id')).rejects.toThrow(
        'not found'
      );
    });
  });

  describe('updateDeal', () => {
    it('should update a deal', async () => {
      const deal = await dealService.createDeal({
        title: 'Original Deal',
        description: 'Original Description',
        discountedPrice: 10,
        vendorId,
      });

      const updated = await dealService.updateDeal(deal.id, {
        title: 'Updated Deal',
        discountedPrice: 12,
      });

      expect(updated.title).toBe('Updated Deal');
      expect(updated.discountedPrice).toBe(12);
    });

    it('should recalculate discount percentage on update', async () => {
      const deal = await dealService.createDeal({
        title: 'Test Deal',
        description: 'Description',
        originalPrice: 100,
        discountedPrice: 80,
        vendorId,
      });

      const updated = await dealService.updateDeal(deal.id, {
        originalPrice: 100,
        discountedPrice: 70,
      });

      expect(updated.discountPercentage).toBe(30);
    });

    it('should throw error if deal not found', async () => {
      await expect(
        dealService.updateDeal('non-existent-id', { title: 'New Title' })
      ).rejects.toThrow(AppError);
    });
  });

  describe('deleteDeal', () => {
    it('should delete a deal', async () => {
      const deal = await dealService.createDeal({
        title: 'To Delete',
        description: 'Description',
        discountedPrice: 10,
        vendorId,
      });

      await dealService.deleteDeal(deal.id);

      await expect(dealService.getDealById(deal.id)).rejects.toThrow(AppError);
    });

    it('should throw error if deal not found', async () => {
      await expect(dealService.deleteDeal('non-existent-id')).rejects.toThrow(
        AppError
      );
    });
  });
});

import { PrismaClient } from '../../src/generated/prisma';
import { DealRepository } from '../../src/repositories/dealRepository';
import { VendorRepository } from '../../src/repositories/vendorRepository';

describe('DealRepository', () => {
  let prisma: PrismaClient;
  let dealRepository: DealRepository;
  let vendorRepository: VendorRepository;
  let vendorId: string;

  beforeAll(() => {
    prisma = new PrismaClient();
    dealRepository = new DealRepository(prisma);
    vendorRepository = new VendorRepository(prisma);
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
      category: 'Fast Food',
    });
    vendorId = vendor.id;
  });

  describe('create', () => {
    it('should create a new deal', async () => {
      const dealData = {
        title: 'Test Deal',
        description: 'Test Description',
        originalPrice: 20,
        discountedPrice: 15,
        discountPercentage: 25,
        vendorId,
      };

      const deal = await dealRepository.create(dealData);

      expect(deal).toBeDefined();
      expect(deal.title).toBe(dealData.title);
      expect(deal.discountedPrice).toBe(dealData.discountedPrice);
      expect((deal as any).vendor).toBeDefined();
    });
  });

  describe('findAll', () => {
    it('should return all deals', async () => {
      await dealRepository.create({
        title: 'Deal 1',
        description: 'Description 1',
        discountedPrice: 10,
        vendorId,
      });
      await dealRepository.create({
        title: 'Deal 2',
        description: 'Description 2',
        discountedPrice: 15,
        vendorId,
      });

      const deals = await dealRepository.findAll();

      expect(deals).toHaveLength(2);
    });

    it('should filter deals by vendorId', async () => {
      const vendor2 = await vendorRepository.create({
        name: 'Second Vendor',
      });

      await dealRepository.create({
        title: 'Deal 1',
        description: 'Description 1',
        discountedPrice: 10,
        vendorId,
      });
      await dealRepository.create({
        title: 'Deal 2',
        description: 'Description 2',
        discountedPrice: 15,
        vendorId: vendor2.id,
      });

      const deals = await dealRepository.findAll({ vendorId });

      expect(deals).toHaveLength(1);
      expect(deals[0].vendorId).toBe(vendorId);
    });

    it('should filter deals by minDiscount', async () => {
      await dealRepository.create({
        title: 'Deal 1',
        description: 'Description 1',
        discountedPrice: 10,
        discountPercentage: 10,
        vendorId,
      });
      await dealRepository.create({
        title: 'Deal 2',
        description: 'Description 2',
        discountedPrice: 15,
        discountPercentage: 30,
        vendorId,
      });

      const deals = await dealRepository.findAll({ minDiscount: 20 });

      expect(deals).toHaveLength(1);
      expect(deals[0].title).toBe('Deal 2');
    });
  });

  describe('findActiveDeals', () => {
    it('should return only active deals within date range', async () => {
      const now = new Date();
      const futureDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const pastDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      await dealRepository.create({
        title: 'Active Deal',
        description: 'Description',
        discountedPrice: 10,
        isActive: true,
        endDate: futureDate,
        vendorId,
      });

      await dealRepository.create({
        title: 'Expired Deal',
        description: 'Description',
        discountedPrice: 10,
        isActive: true,
        endDate: pastDate,
        vendorId,
      });

      await dealRepository.create({
        title: 'Inactive Deal',
        description: 'Description',
        discountedPrice: 10,
        isActive: false,
        vendorId,
      });

      const deals = await dealRepository.findActiveDeals();

      expect(deals).toHaveLength(1);
      expect(deals[0].title).toBe('Active Deal');
    });
  });

  describe('update', () => {
    it('should update a deal', async () => {
      const deal = await dealRepository.create({
        title: 'Original Deal',
        description: 'Original Description',
        discountedPrice: 10,
        vendorId,
      });

      const updated = await dealRepository.update(deal.id, {
        title: 'Updated Deal',
        discountedPrice: 12,
      });

      expect(updated.title).toBe('Updated Deal');
      expect(updated.discountedPrice).toBe(12);
    });
  });

  describe('delete', () => {
    it('should delete a deal', async () => {
      const deal = await dealRepository.create({
        title: 'To Delete',
        description: 'Description',
        discountedPrice: 10,
        vendorId,
      });

      await dealRepository.delete(deal.id);

      const found = await dealRepository.findById(deal.id);
      expect(found).toBeNull();
    });
  });
});

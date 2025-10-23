import { PrismaClient } from '../../src/generated/prisma';
import { VendorRepository } from '../../src/repositories/vendorRepository';

describe('VendorRepository', () => {
  let prisma: PrismaClient;
  let vendorRepository: VendorRepository;

  beforeAll(() => {
    prisma = new PrismaClient();
    vendorRepository = new VendorRepository(prisma);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await prisma.coupon.deleteMany({});
    await prisma.deal.deleteMany({});
    await prisma.vendor.deleteMany({});
  });

  describe('create', () => {
    it('should create a new vendor', async () => {
      const vendorData = {
        name: 'Test Vendor',
        description: 'Test Description',
        category: 'Fast Food',
      };

      const vendor = await vendorRepository.create(vendorData);

      expect(vendor).toBeDefined();
      expect(vendor.name).toBe(vendorData.name);
      expect(vendor.description).toBe(vendorData.description);
      expect(vendor.category).toBe(vendorData.category);
      expect(vendor.isActive).toBe(true);
    });
  });

  describe('findAll', () => {
    it('should return all active vendors', async () => {
      await vendorRepository.create({
        name: 'Vendor 1',
        description: 'Description 1',
      });
      await vendorRepository.create({
        name: 'Vendor 2',
        description: 'Description 2',
      });

      const vendors = await vendorRepository.findAll();

      expect(vendors).toHaveLength(2);
      expect(vendors[0].name).toBe('Vendor 1');
      expect(vendors[1].name).toBe('Vendor 2');
    });

    it('should not return inactive vendors', async () => {
      const vendor = await vendorRepository.create({
        name: 'Test Vendor',
      });
      await vendorRepository.update(vendor.id, { isActive: false });

      const vendors = await vendorRepository.findAll();

      expect(vendors).toHaveLength(0);
    });
  });

  describe('findById', () => {
    it('should return a vendor by id', async () => {
      const created = await vendorRepository.create({
        name: 'Test Vendor',
      });

      const vendor = await vendorRepository.findById(created.id);

      expect(vendor).toBeDefined();
      expect(vendor?.id).toBe(created.id);
      expect(vendor?.name).toBe('Test Vendor');
    });

    it('should return null if vendor not found', async () => {
      const vendor = await vendorRepository.findById('non-existent-id');
      expect(vendor).toBeNull();
    });
  });

  describe('findByName', () => {
    it('should return a vendor by name', async () => {
      await vendorRepository.create({
        name: 'Unique Vendor',
      });

      const vendor = await vendorRepository.findByName('Unique Vendor');

      expect(vendor).toBeDefined();
      expect(vendor?.name).toBe('Unique Vendor');
    });

    it('should return null if vendor not found', async () => {
      const vendor = await vendorRepository.findByName('Non Existent');
      expect(vendor).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a vendor', async () => {
      const vendor = await vendorRepository.create({
        name: 'Original Name',
      });

      const updated = await vendorRepository.update(vendor.id, {
        name: 'Updated Name',
        description: 'New Description',
      });

      expect(updated.name).toBe('Updated Name');
      expect(updated.description).toBe('New Description');
    });
  });

  describe('delete', () => {
    it('should delete a vendor', async () => {
      const vendor = await vendorRepository.create({
        name: 'To Delete',
      });

      await vendorRepository.delete(vendor.id);

      const found = await vendorRepository.findById(vendor.id);
      expect(found).toBeNull();
    });
  });
});

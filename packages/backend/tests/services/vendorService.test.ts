import { PrismaClient } from '../../src/generated/prisma';
import { AppError } from '../../src/middleware/errorHandler';
import { VendorRepository } from '../../src/repositories/vendorRepository';
import { VendorService } from '../../src/services/vendorService';

describe('VendorService', () => {
  let prisma: PrismaClient;
  let vendorRepository: VendorRepository;
  let vendorService: VendorService;

  beforeAll(() => {
    prisma = new PrismaClient();
    vendorRepository = new VendorRepository(prisma);
    vendorService = new VendorService(vendorRepository);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await prisma.coupon.deleteMany({});
    await prisma.deal.deleteMany({});
    await prisma.vendor.deleteMany({});
  });

  describe('createVendor', () => {
    it('should create a new vendor', async () => {
      const vendorData = {
        name: 'New Vendor',
        description: 'A great vendor',
        category: 'Italian',
      };

      const vendor = await vendorService.createVendor(vendorData);

      expect(vendor).toBeDefined();
      expect(vendor.name).toBe(vendorData.name);
      expect(vendor.category).toBe(vendorData.category);
    });

    it('should throw error if vendor name already exists', async () => {
      const vendorData = {
        name: 'Duplicate Vendor',
      };

      await vendorService.createVendor(vendorData);

      await expect(vendorService.createVendor(vendorData)).rejects.toThrow(AppError);
      await expect(vendorService.createVendor(vendorData)).rejects.toThrow(
        'already exists'
      );
    });
  });

  describe('getAllVendors', () => {
    it('should return all active vendors', async () => {
      await vendorService.createVendor({ name: 'Vendor 1' });
      await vendorService.createVendor({ name: 'Vendor 2' });

      const vendors = await vendorService.getAllVendors();

      expect(vendors).toHaveLength(2);
    });
  });

  describe('getVendorById', () => {
    it('should return a vendor by id', async () => {
      const created = await vendorService.createVendor({ name: 'Test Vendor' });

      const vendor = await vendorService.getVendorById(created.id);

      expect(vendor).toBeDefined();
      expect(vendor.id).toBe(created.id);
    });

    it('should throw error if vendor not found', async () => {
      await expect(vendorService.getVendorById('non-existent-id')).rejects.toThrow(
        AppError
      );
      await expect(vendorService.getVendorById('non-existent-id')).rejects.toThrow(
        'not found'
      );
    });
  });

  describe('updateVendor', () => {
    it('should update a vendor', async () => {
      const vendor = await vendorService.createVendor({ name: 'Original Name' });

      const updated = await vendorService.updateVendor(vendor.id, {
        name: 'Updated Name',
        description: 'New Description',
      });

      expect(updated.name).toBe('Updated Name');
      expect(updated.description).toBe('New Description');
    });

    it('should throw error if vendor not found', async () => {
      await expect(
        vendorService.updateVendor('non-existent-id', { name: 'New Name' })
      ).rejects.toThrow(AppError);
    });

    it('should throw error if new name already exists', async () => {
      const vendor1 = await vendorService.createVendor({ name: 'Vendor 1' });
      await vendorService.createVendor({ name: 'Vendor 2' });

      await expect(
        vendorService.updateVendor(vendor1.id, { name: 'Vendor 2' })
      ).rejects.toThrow(AppError);
      await expect(
        vendorService.updateVendor(vendor1.id, { name: 'Vendor 2' })
      ).rejects.toThrow('already exists');
    });
  });

  describe('deleteVendor', () => {
    it('should delete a vendor', async () => {
      const vendor = await vendorService.createVendor({ name: 'To Delete' });

      await vendorService.deleteVendor(vendor.id);

      await expect(vendorService.getVendorById(vendor.id)).rejects.toThrow(AppError);
    });

    it('should throw error if vendor not found', async () => {
      await expect(vendorService.deleteVendor('non-existent-id')).rejects.toThrow(
        AppError
      );
    });
  });
});

import { Vendor } from '../generated/prisma';
import { AppError } from '../middleware/errorHandler';
import { VendorRepository } from '../repositories/vendorRepository';

export class VendorService {
  constructor(private vendorRepository: VendorRepository) {}

  async getAllVendors(): Promise<Vendor[]> {
    return this.vendorRepository.findAll();
  }

  async getVendorById(id: string): Promise<Vendor> {
    const vendor = await this.vendorRepository.findById(id);
    if (!vendor) {
      throw new AppError(404, `Vendor with id ${id} not found`);
    }
    return vendor;
  }

  async createVendor(data: {
    name: string;
    description?: string;
    logoUrl?: string;
    website?: string;
    category?: string;
  }): Promise<Vendor> {
    const existingVendor = await this.vendorRepository.findByName(data.name);
    if (existingVendor) {
      throw new AppError(409, `Vendor with name ${data.name} already exists`);
    }
    return this.vendorRepository.create(data);
  }

  async updateVendor(
    id: string,
    data: {
      name?: string;
      description?: string;
      logoUrl?: string;
      website?: string;
      category?: string;
      isActive?: boolean;
    }
  ): Promise<Vendor> {
    const vendor = await this.vendorRepository.findById(id);
    if (!vendor) {
      throw new AppError(404, `Vendor with id ${id} not found`);
    }

    if (data.name && data.name !== vendor.name) {
      const existingVendor = await this.vendorRepository.findByName(data.name);
      if (existingVendor) {
        throw new AppError(409, `Vendor with name ${data.name} already exists`);
      }
    }

    return this.vendorRepository.update(id, data);
  }

  async deleteVendor(id: string): Promise<void> {
    const vendor = await this.vendorRepository.findById(id);
    if (!vendor) {
      throw new AppError(404, `Vendor with id ${id} not found`);
    }
    await this.vendorRepository.delete(id);
  }
}

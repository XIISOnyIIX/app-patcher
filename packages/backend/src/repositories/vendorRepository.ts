import { PrismaClient, Vendor } from '../generated/prisma';

export class VendorRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll(): Promise<Vendor[]> {
    return this.prisma.vendor.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string): Promise<Vendor | null> {
    return this.prisma.vendor.findUnique({
      where: { id },
    });
  }

  async findByName(name: string): Promise<Vendor | null> {
    return this.prisma.vendor.findUnique({
      where: { name },
    });
  }

  async create(data: {
    name: string;
    description?: string;
    logoUrl?: string;
    website?: string;
    category?: string;
  }): Promise<Vendor> {
    return this.prisma.vendor.create({ data });
  }

  async update(
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
    return this.prisma.vendor.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Vendor> {
    return this.prisma.vendor.delete({
      where: { id },
    });
  }
}

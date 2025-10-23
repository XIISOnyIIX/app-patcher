import request from 'supertest';

import { PrismaClient } from '../../src/generated/prisma';
import { app } from '../../src/index';

const prisma = new PrismaClient();

describe('API Integration Tests', () => {
  beforeAll(async () => {
    await prisma.coupon.deleteMany({});
    await prisma.deal.deleteMany({});
    await prisma.vendor.deleteMany({});
    await prisma.userPreference.deleteMany({});
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Health Check', () => {
    it('should return ok status', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'ok' });
    });
  });

  describe('Vendor API', () => {
    let vendorId: string;

    it('should create a vendor', async () => {
      const response = await request(app).post('/api/vendors').send({
        name: 'Test Restaurant',
        description: 'A test restaurant',
        category: 'Italian',
      });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.name).toBe('Test Restaurant');
      vendorId = response.body.data.id;
    });

    it('should get all vendors', async () => {
      const response = await request(app).get('/api/vendors');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should get vendor by id', async () => {
      const response = await request(app).get(`/api/vendors/${vendorId}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.id).toBe(vendorId);
    });

    it('should return 404 for non-existent vendor', async () => {
      const response = await request(app).get('/api/vendors/non-existent-id');

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('error');
    });
  });

  describe('Deal API', () => {
    let vendorId: string;
    let dealId: string;

    beforeAll(async () => {
      const vendor = await prisma.vendor.create({
        data: {
          name: 'Deal Test Vendor',
          category: 'Fast Food',
        },
      });
      vendorId = vendor.id;
    });

    it('should create a deal', async () => {
      const response = await request(app)
        .post('/api/deals')
        .send({
          title: 'Test Deal',
          description: 'A great test deal',
          originalPrice: 20,
          discountedPrice: 15,
          vendorId,
        });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.title).toBe('Test Deal');
      expect(response.body.data.discountPercentage).toBe(25);
      dealId = response.body.data.id;
    });

    it('should get all deals', async () => {
      const response = await request(app).get('/api/deals');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should get active deals', async () => {
      const response = await request(app).get('/api/deals/active');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should filter deals by vendorId', async () => {
      const response = await request(app).get(`/api/deals?vendorId=${vendorId}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.every((deal: any) => deal.vendorId === vendorId)).toBe(
        true
      );
    });

    it('should update a deal', async () => {
      const response = await request(app).put(`/api/deals/${dealId}`).send({
        title: 'Updated Deal',
      });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.title).toBe('Updated Deal');
    });
  });

  describe('User Preference API', () => {
    const userId = 'test-user-123';

    it('should create user preferences', async () => {
      const response = await request(app)
        .post(`/api/preferences/${userId}`)
        .send({
          maxPrice: 50,
          minDiscount: 20,
          emailNotifications: true,
        });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.userId).toBe(userId);
      expect(response.body.data.maxPrice).toBe(50);
    });

    it('should get user preferences', async () => {
      const response = await request(app).get(`/api/preferences/${userId}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.userId).toBe(userId);
    });

    it('should update user preferences', async () => {
      const response = await request(app)
        .put(`/api/preferences/${userId}`)
        .send({
          maxPrice: 100,
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.maxPrice).toBe(100);
    });
  });

  describe('Validation', () => {
    it('should return 400 for invalid vendor data', async () => {
      const response = await request(app).post('/api/vendors').send({
        name: '',
      });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Validation error');
    });

    it('should return 400 for invalid deal data', async () => {
      const response = await request(app).post('/api/deals').send({
        title: 'Test',
      });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });
  });
});

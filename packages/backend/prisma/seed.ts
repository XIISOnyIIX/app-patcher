import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const vendor1 = await prisma.vendor.upsert({
    where: { name: 'Pizza Palace' },
    update: {},
    create: {
      name: 'Pizza Palace',
      description: 'The best pizza in town with fresh ingredients',
      logoUrl: 'https://example.com/pizza-palace-logo.png',
      website: 'https://pizzapalace.com',
      category: 'Italian',
      isActive: true,
    },
  });

  const vendor2 = await prisma.vendor.upsert({
    where: { name: 'Burger King' },
    update: {},
    create: {
      name: 'Burger King',
      description: 'Flame-grilled burgers and more',
      logoUrl: 'https://example.com/burger-king-logo.png',
      website: 'https://burgerking.com',
      category: 'Fast Food',
      isActive: true,
    },
  });

  const vendor3 = await prisma.vendor.upsert({
    where: { name: 'Sushi Express' },
    update: {},
    create: {
      name: 'Sushi Express',
      description: 'Fresh sushi and Japanese cuisine',
      logoUrl: 'https://example.com/sushi-express-logo.png',
      website: 'https://sushiexpress.com',
      category: 'Japanese',
      isActive: true,
    },
  });

  await prisma.deal.create({
    data: {
      title: '2 Large Pizzas for $25',
      description: 'Get two large pizzas with up to 3 toppings each for only $25',
      originalPrice: 40,
      discountedPrice: 25,
      discountPercentage: 37.5,
      imageUrl: 'https://example.com/pizza-deal.jpg',
      vendorId: vendor1.id,
      isActive: true,
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
  });

  await prisma.deal.create({
    data: {
      title: 'Family Meal Deal',
      description: '4 Burgers, 4 Fries, 4 Drinks for $29.99',
      originalPrice: 45,
      discountedPrice: 29.99,
      discountPercentage: 33.35,
      imageUrl: 'https://example.com/burger-deal.jpg',
      vendorId: vendor2.id,
      isActive: true,
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    },
  });

  await prisma.deal.create({
    data: {
      title: 'All-You-Can-Eat Sushi',
      description: 'Unlimited sushi for lunch at $19.99',
      originalPrice: 35,
      discountedPrice: 19.99,
      discountPercentage: 42.88,
      imageUrl: 'https://example.com/sushi-deal.jpg',
      vendorId: vendor3.id,
      isActive: true,
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    },
  });

  await prisma.coupon.create({
    data: {
      code: 'PIZZA20',
      title: '20% Off Any Order',
      description: 'Get 20% off your entire order',
      discountType: 'percentage',
      discountValue: 20,
      minPurchase: 15,
      maxDiscount: 10,
      vendorId: vendor1.id,
      isActive: true,
      usageLimit: 100,
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
    },
  });

  await prisma.coupon.create({
    data: {
      code: 'BURGER5OFF',
      title: '$5 Off $20',
      description: 'Get $5 off when you spend $20 or more',
      discountType: 'fixed',
      discountValue: 5,
      minPurchase: 20,
      vendorId: vendor2.id,
      isActive: true,
      usageLimit: 200,
      endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
    },
  });

  await prisma.coupon.create({
    data: {
      code: 'SUSHI15',
      title: '15% Off Takeout',
      description: 'Get 15% off all takeout orders',
      discountType: 'percentage',
      discountValue: 15,
      minPurchase: 25,
      maxDiscount: 15,
      vendorId: vendor3.id,
      isActive: true,
      usageLimit: 150,
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
  });

  await prisma.userPreference.create({
    data: {
      userId: 'demo-user-1',
      favoriteVendors: JSON.stringify([vendor1.id, vendor3.id]),
      preferredCategories: JSON.stringify(['Italian', 'Japanese']),
      maxPrice: 50,
      minDiscount: 15,
      emailNotifications: true,
      pushNotifications: true,
      notificationFrequency: 'daily',
    },
  });

  console.log('✅ Seed data created successfully!');
  console.log(`Created vendors: ${vendor1.name}, ${vendor2.name}, ${vendor3.name}`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

// backend/prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Bắt đầu seed data...');

  // 1. Tạo admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@vinhpart.com' },
    update: {},
    create: {
      email: 'admin@vinhpart.com',
      password: adminPassword,
      name: 'Admin VINHPART',
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin user created');

  // 2. Tạo categories
  const categories = [
    { name: 'Bumper', slug: 'bumper', description: 'Bumper body kits' },
    { name: 'Side Skirt', slug: 'side-skirt', description: 'Side skirt body kits' },
    { name: 'Spoiler', slug: 'spoiler', description: 'Spoiler body kits' },
    { name: 'Hood', slug: 'hood', description: 'Hood body kits' },
    { name: 'Fender', slug: 'fender', description: 'Fender body kits' },
    { name: 'Grille', slug: 'grille', description: 'Grille body kits' },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log('✅ Categories created');

  // 3. Tạo Vehicles với Body Kit Parts
  const vehicles = [
    {
      name: 'Honda Wave Alpha 2024',
      brand: 'Honda',
      model: 'Wave Alpha',
      year: 2024,
      description: 'Xe số phổ biến nhất Việt Nam, thiết kế thể thao, tiết kiệm nhiên liệu',
      parts: [
        { productName: 'Yên xe Wave Alpha', price: 450000, stock: 50, brand: 'Honda' },
        { productName: 'Cốp xe Wave Alpha', price: 350000, stock: 30, brand: 'Honda' },
        { productName: 'Body xe Wave Alpha', price: 1200000, stock: 20, brand: 'Honda' },
      ]
    },
    {
      name: 'Honda Future 2024',
      brand: 'Honda',
      model: 'Future',
      year: 2024,
      description: 'Xe số cao cấp với thiết kế sang trọng, động cơ mạnh mẽ',
      parts: [
        { productName: 'Yên xe Future', price: 550000, stock: 40, brand: 'Honda' },
        { productName: 'Cốp xe Future', price: 450000, stock: 25, brand: 'Honda' },
        { productName: 'Body xe Future', price: 1500000, stock: 15, brand: 'Honda' },
        { productName: 'Ốp nhựa Future', price: 250000, stock: 35, brand: 'Honda' },
      ]
    },
    {
      name: 'Yamaha Sirius 2024',
      brand: 'Yamaha',
      model: 'Sirius',
      year: 2024,
      description: 'Xe số bền bỉ, tiết kiệm xăng, phù hợp với mọi địa hình',
      parts: [
        { productName: 'Yên xe Sirius', price: 400000, stock: 45, brand: 'Yamaha' },
        { productName: 'Cốp xe Sirius', price: 300000, stock: 30, brand: 'Yamaha' },
        { productName: 'Body xe Sirius', price: 1000000, stock: 25, brand: 'Yamaha' },
      ]
    },
    {
      name: 'Honda SH 2024',
      brand: 'Honda',
      model: 'SH',
      year: 2024,
      description: 'Xe tay ga cao cấp với thiết kế đẳng cấp, công nghệ hiện đại',
      parts: [
        { productName: 'Yên xe SH', price: 1200000, stock: 20, brand: 'Honda' },
        { productName: 'Cốp xe SH', price: 800000, stock: 15, brand: 'Honda' },
        { productName: 'Body xe SH', price: 2500000, stock: 10, brand: 'Honda' },
        { productName: 'Ốp nhựa SH', price: 500000, stock: 20, brand: 'Honda' },
        { productName: 'Kính chắn gió SH', price: 350000, stock: 25, brand: 'Honda' },
      ]
    },
    {
      name: 'Yamaha Grande 2024',
      brand: 'Yamaha',
      model: 'Grande',
      year: 2024,
      description: 'Xe tay ga thời trang, thiết kế sang trọng, phù hợp với phái đẹp',
      parts: [
        { productName: 'Yên xe Grande', price: 650000, stock: 35, brand: 'Yamaha' },
        { productName: 'Cốp xe Grande', price: 500000, stock: 25, brand: 'Yamaha' },
        { productName: 'Body xe Grande', price: 1800000, stock: 15, brand: 'Yamaha' },
      ]
    },
    {
      name: 'Suzuki Vario 2024',
      brand: 'Suzuki',
      model: 'Vario',
      year: 2024,
      description: 'Xe tay ga thể thao, động cơ mạnh mẽ, tiết kiệm nhiên liệu',
      parts: [
        { productName: 'Yên xe Vario', price: 500000, stock: 30, brand: 'Suzuki' },
        { productName: 'Cốp xe Vario', price: 400000, stock: 20, brand: 'Suzuki' },
        { productName: 'Body xe Vario', price: 1400000, stock: 12, brand: 'Suzuki' },
        { productName: 'Ốp nhựa Vario', price: 300000, stock: 28, brand: 'Suzuki' },
      ]
    },
  ];

  for (const vehicleData of vehicles) {
    // Tạo vehicle
    const slug = `${vehicleData.brand}-${vehicleData.model}-${vehicleData.name}`
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      + '-' + Date.now();

    const vehicle = await prisma.vehicle.create({
      data: {
        name: vehicleData.name,
        slug: slug,
        brand: vehicleData.brand,
        model: vehicleData.model,
        year: vehicleData.year,
        description: vehicleData.description,
        isActive: true,
      },
    });
    console.log(`✅ Vehicle created: ${vehicleData.name}`);

    // Tạo products và body kit parts
    let sortOrder = 0;
    for (const partData of vehicleData.parts) {
      // Tạo product
      const productSlug = partData.productName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        + '-' + Date.now();

      // Tìm category
      let category = await prisma.category.findFirst({
        where: { name: partData.productName.includes('Yên') ? 'Body Kit' : 'Bumper' },
      });

      if (!category) {
        category = await prisma.category.create({
          data: {
            name: 'Body Kit',
            slug: 'body-kit',
            description: 'Body kit parts',
          },
        });
      }

      const product = await prisma.product.create({
        data: {
          name: partData.productName,
          slug: productSlug,
          description: `${partData.productName} for ${vehicleData.name}`,
          price: partData.price,
          stock: partData.stock,
          brand: partData.brand,
          categoryId: category.id,
          isActive: true,
          images: [],
        },
      });

      // Tạo body kit part
      await prisma.bodyKitPart.create({
        data: {
          vehicleId: vehicle.id,
          productId: product.id,
          position: partData.productName.includes('Yên') ? 'Seat' :
                   partData.productName.includes('Cốp') ? 'Trunk' :
                   partData.productName.includes('Body') ? 'Body' :
                   partData.productName.includes('Ốp') ? 'Cover' : 'Accessory',
          sortOrder: sortOrder++,
        },
      });
    }
    console.log(`✅ Body kit parts created for ${vehicleData.name}`);
  }

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
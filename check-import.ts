import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { pool } from './backend/src/shared/database.js';

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function check() {
  const categoryCount = await prisma.category.count();
  const productCount = await prisma.product.count();

  console.log(`\n📊 Import Status Check:`);
  console.log(`   Categories in DB: ${categoryCount} / 17`);
  console.log(`   Products in DB:   ${productCount} / 6725`);
  console.log(`   Remaining:        ${6725 - productCount} products\n`);

  // Show last 5 products by creation date
  const lastProducts = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: { sku: true, name: true, createdAt: true },
  });
  console.log('   Last 5 products added:');
  for (const p of lastProducts) {
    console.log(`     - ${p.sku}: ${p.name} (${p.createdAt.toISOString()})`);
  }

  // Show categories
  const categories = await prisma.category.findMany({
    select: { name: true, _count: { select: { products: true } } },
    orderBy: { name: 'asc' },
  });
  console.log('\n   Categories:');
  for (const c of categories) {
    console.log(`     - ${c.name}: ${c._count.products} products`);
  }
}

check()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

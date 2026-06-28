import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { pool } from './src/shared/database.js';
import fs from 'fs';
import path from 'path';

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// --- Helpers ---

/** Parse Vietnamese price "4.282.000 ₫" -> 4282000 */
function parsePrice(raw: string): number {
  const cleaned = raw.replace(/[₫\s]/g, '').replace(/\./g, '').replace(/,/g, '').trim();
  const num = parseInt(cleaned, 10);
  return isNaN(num) ? 0 : num;
}

/** Generate a URL-safe slug from Vietnamese text + SKU */
function slugify(text: string, sku: string): string {
  // Use the SKU as the slug since product names can repeat
  return sku.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

/** Parse a CSV line, handling quoted fields with commas */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

// --- Main ---

async function main() {
  const PROJECT_ROOT = path.resolve(import.meta.dirname, '..');

  // 1. Read and create categories
  console.log('📦 Reading categories...');
  const catPath = path.join(PROJECT_ROOT, 'DỮ LIỆU SẢN PHẨM - Danh mục.csv');
  const catRaw = fs.readFileSync(catPath, 'utf-8');
  const categoryNames = catRaw.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  console.log(`  Found ${categoryNames.length} categories`);

  const categoryMap: Record<string, string> = {}; // name -> id
  for (const name of categoryNames) {
    const slug = name.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd').replace(/Đ/g, 'D')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const cat = await prisma.category.upsert({
      where: { slug },
      update: { name },
      create: { name, slug },
    });
    categoryMap[name] = cat.id;
    console.log(`  ✅ Category: ${name} → ${slug} (${cat.id})`);
  }

  // 2. Read products CSV
  console.log('\n📦 Reading products...');
  const prodPath = path.join(PROJECT_ROOT, 'DỮ LIỆU SẢN PHẨM - Danh sách sản phẩm.csv');
  const prodRaw = fs.readFileSync(prodPath, 'utf-8');
  const lines = prodRaw.split(/\r?\n/).filter(l => l.trim());

  // Skip header + 0 already imported products
  const ALREADY_IMPORTED = 0;
  const dataLines = lines.slice(1 + ALREADY_IMPORTED);
  console.log(`  Found ${dataLines.length} products remaining to import (skipped ${ALREADY_IMPORTED})`);

  // 3. Import products in batches
  const BATCH_SIZE = 20;
  let imported = 0;
  let skipped = 0;
  let errors = 0;

  for (let i = 0; i < dataLines.length; i += BATCH_SIZE) {
    const batch = dataLines.slice(i, i + BATCH_SIZE);

    await Promise.all(batch.map(async (line, index) => {
      try {
        const fields = parseCSVLine(line);
        if (fields.length < 6) {
          skipped++;
          return;
        }

        const [sku, name, brand, category, priceRaw, stockRaw] = fields;

        if (!sku || !name) {
          skipped++;
          return;
        }

        const price = parsePrice(priceRaw);
        const stock = parseInt(stockRaw, 10) || 0;
        const slug = slugify(name, sku);
        const categoryId = categoryMap[category] || null;

        await prisma.product.upsert({
          where: { sku },
          update: {
            name,
            slug,
            brand: brand || null,
            price,
            stock,
            categoryId,
          },
          create: {
            sku,
            name,
            slug,
            brand: brand || null,
            price,
            stock,
            categoryId,
            isActive: true,
            isFeatured: false,
            images: [],
          },
        });

        imported++;
      } catch (err: any) {
        errors++;
        if (errors <= 5) {
          console.error(`  ❌ Error on line ${ALREADY_IMPORTED + i + index + 2}: ${err.message}`);
        }
      }
    }));

    // Progress log
    const pct = Math.round(((i + batch.length) / dataLines.length) * 100);
    console.log(`  📊 Progress: ${i + batch.length}/${dataLines.length} (${pct}%) | Imported: ${imported} | Skipped: ${skipped} | Errors: ${errors}`);
  }

  console.log(`\n✅ Import complete!`);
  console.log(`   Total imported: ${imported}`);
  console.log(`   Total skipped: ${skipped}`);
  console.log(`   Total errors: ${errors}`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

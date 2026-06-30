// backend/src/scripts/seed-bodykit.js
import { pool } from '../shared/database.js';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';

async function seed() {
  console.log('🌱 Bắt đầu seed data...');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Tạo admin user
    console.log('📝 Tạo admin user...');
    const adminPassword = await bcrypt.hash('admin123', 10);
    const adminId = uuidv4();
    
    await client.query(
      `INSERT INTO users (id, email, password, name, role, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       ON CONFLICT (email) DO NOTHING`,
      [adminId, 'admin@vinhpart.com', adminPassword, 'Admin VINHPART', 'ADMIN']
    );
    console.log('✅ Admin user created');

    // 2. Thêm vehicles mẫu
    console.log('📝 Tạo vehicles...');
    
    // Lấy danh sách vehicles hiện có
    const existingVehicles = await client.query('SELECT slug FROM vehicles');
    const existingSlugs = new Set(existingVehicles.rows.map(r => r.slug));

    const vehicleData = [
      {
        id: 'v1',
        name: 'Toyota Camry 2020',
        slug: 'toyota-camry-2020',
        brand: 'Toyota',
        model: 'Camry',
        year: 2020,
        description: 'Toyota Camry 2020 - Sedan hạng D sang trọng'
      },
      {
        id: 'v2',
        name: 'Toyota Camry 2021',
        slug: 'toyota-camry-2021',
        brand: 'Toyota',
        model: 'Camry',
        year: 2021,
        description: 'Toyota Camry 2021 - Sedan hạng D sang trọng'
      },
      {
        id: 'v3',
        name: 'Honda Civic 2019',
        slug: 'honda-civic-2019',
        brand: 'Honda',
        model: 'Civic',
        year: 2019,
        description: 'Honda Civic 2019 - Sedan hạng C thể thao'
      },
      {
        id: 'v4',
        name: 'Honda Civic 2020',
        slug: 'honda-civic-2020',
        brand: 'Honda',
        model: 'Civic',
        year: 2020,
        description: 'Honda Civic 2020 - Sedan hạng C thể thao'
      },
      {
        id: 'v5',
        name: 'Ford Mustang 2020',
        slug: 'ford-mustang-2020',
        brand: 'Ford',
        model: 'Mustang',
        year: 2020,
        description: 'Ford Mustang 2020 - Muscle car huyền thoại'
      },
      {
        id: 'v6',
        name: 'Ford Mustang 2021',
        slug: 'ford-mustang-2021',
        brand: 'Ford',
        model: 'Mustang',
        year: 2021,
        description: 'Ford Mustang 2021 - Muscle car huyền thoại'
      }
    ];

    for (const v of vehicleData) {
      if (!existingSlugs.has(v.slug)) {
        await client.query(
          `INSERT INTO vehicles (id, name, slug, brand, model, year, description, "isActive", "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, $5, $6, $7, true, NOW(), NOW())`,
          [v.id, v.name, v.slug, v.brand, v.model, v.year, v.description]
        );
        console.log(`✅ Added vehicle: ${v.name}`);
      }
    }

    // 3. Thêm products
    console.log('📝 Tạo products...');
    const productData = [
      { id: 'p1', name: 'Sport Front Bumper Camry 2020', slug: 'sport-front-bumper-camry-2020', price: 599.99, description: 'Front bumper thể thao cho Toyota Camry 2020' },
      { id: 'p2', name: 'Carbon Front Lip Civic 2019', slug: 'carbon-front-lip-civic-2019', price: 399.99, description: 'Cánh gió trước carbon cho Honda Civic 2019' },
      { id: 'p3', name: 'Rear Diffuser Mustang 2020', slug: 'rear-diffuser-mustang-2020', price: 449.99, description: 'Bộ khuếch tán gió sau cho Ford Mustang 2020' },
      { id: 'p4', name: 'Side Skirts Evolution', slug: 'side-skirts-evolution', price: 349.99, description: 'Side skirts với thiết kế thể thao' },
      { id: 'p5', name: 'GT Wing Spoiler', slug: 'gt-wing-spoiler', price: 299.99, description: 'Cánh gió GT có thể điều chỉnh' },
      { id: 'p6', name: 'Wide Body Kit', slug: 'wide-body-kit', price: 1299.99, description: 'Bộ body kit mở rộng' },
      { id: 'p7', name: 'Carbon Hood', slug: 'carbon-hood', price: 899.99, description: 'Nắp capo carbon siêu nhẹ' },
    ];

    for (const p of productData) {
      await client.query(
        `INSERT INTO products (id, name, slug, description, price, "isActive", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, true, NOW(), NOW())
         ON CONFLICT (slug) DO NOTHING`,
        [p.id, p.name, p.slug, p.description, p.price]
      );
    }
    console.log('✅ Products created');

    // 4. Thêm body_kit_parts
    console.log('📝 Tạo body kit parts...');
    const bodyKitParts = [
      { id: 'bkp1', vehicleId: 'v1', productId: 'p1', position: 'front', sortOrder: 1 },
      { id: 'bkp2', vehicleId: 'v2', productId: 'p1', position: 'front', sortOrder: 1 },
      { id: 'bkp3', vehicleId: 'v3', productId: 'p2', position: 'front', sortOrder: 1 },
      { id: 'bkp4', vehicleId: 'v5', productId: 'p3', position: 'rear', sortOrder: 1 },
    ];

    for (const bkp of bodyKitParts) {
      await client.query(
        `INSERT INTO body_kit_parts (id, "vehicleId", "productId", position, "sortOrder", "createdAt")
         VALUES ($1, $2, $3, $4, $5, NOW())
         ON CONFLICT ("vehicleId", "productId") DO NOTHING`,
        [bkp.id, bkp.vehicleId, bkp.productId, bkp.position, bkp.sortOrder]
      );
    }
    console.log('✅ Body kit parts created');

    await client.query('COMMIT');
    console.log(`🎉 Seed completed successfully!`);
    console.log(`📊 Admin: admin@vinhpart.com / admin123`);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Seed failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch(console.error);
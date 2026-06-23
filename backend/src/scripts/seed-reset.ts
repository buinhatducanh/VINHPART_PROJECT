// backend/src/scripts/seed-reset.ts
import { pool } from '../shared/database';

async function resetAndSeed() {
  const client = await pool.connect();
  try {
    console.log('🗑️ Xóa dữ liệu cũ...');
    await client.query('BEGIN');
    
    // Xóa theo thứ tự để tránh lỗi foreign key
    await client.query('TRUNCATE TABLE body_kit_parts CASCADE');
    await client.query('TRUNCATE TABLE products CASCADE');
    await client.query('TRUNCATE TABLE vehicles CASCADE');
    await client.query('TRUNCATE TABLE categories CASCADE');
    await client.query('TRUNCATE TABLE users CASCADE');
    await client.query('TRUNCATE TABLE admin_emails CASCADE');
    
    await client.query('COMMIT');
    console.log('✅ Dữ liệu cũ đã xóa');
    
    // Chạy seed
    console.log('🌱 Bắt đầu seed lại...');
    await import('./seed-bodykit');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Reset failed:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

resetAndSeed().catch(console.error);
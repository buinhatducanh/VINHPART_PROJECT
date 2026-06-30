import { pool } from '../shared/database.js';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

async function createAdmin() {
  console.log('🔐 Creating admin user...');
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminId = uuidv4();

    // Kiểm tra user đã tồn tại chưa
    const checkUser = await client.query(
      'SELECT id FROM users WHERE email = $1',
      ['admin@vinhpart.com']
    );

    if (checkUser.rows.length > 0) {
      console.log('✅ Admin user already exists, updating role...');
      await client.query(
        'UPDATE users SET role = $1 WHERE email = $2',
        ['ADMIN', 'admin@vinhpart.com']
      );
    } else {
      // Tạo user mới
      await client.query(
        `INSERT INTO users (id, email, password, name, role, "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
        [adminId, 'admin@vinhpart.com', hashedPassword, 'Admin VINHPART', 'ADMIN']
      );
      console.log('✅ Admin user created');
    }

    // Thêm vào admin_emails
    await client.query(
      `INSERT INTO admin_emails (email, "addedBy", "createdAt")
       VALUES ($1, $2, NOW())
       ON CONFLICT (email) DO NOTHING`,
      ['admin@vinhpart.com', 'system']
    );

    await client.query('COMMIT');
    
    console.log('🎉 Admin user ready!');
    console.log('📧 Email: admin@vinhpart.com');
    console.log('🔑 Password: admin123');
    console.log('👤 Role: ADMIN');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Failed to create admin:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

createAdmin();
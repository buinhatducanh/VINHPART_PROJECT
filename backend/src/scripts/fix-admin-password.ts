import { pool } from '../shared/database.js';
import { hashPassword } from '../shared/auth-helpers.js';

async function fixAdminPassword() {
    const client = await pool.connect();
    try {
        const email = 'admin@vinhpart.com';
        const password = 'admin123';
        const hashedPassword = hashPassword(password);

        console.log('🔑 New hash for password:', password);
        console.log('🔐 Hash:', hashedPassword);

        await client.query(
            'UPDATE users SET password = $1 WHERE email = $2',
            [hashedPassword, email]
        );

        console.log(`✅ Updated password for ${email}`);

        // Kiểm tra
        const result = await client.query(
            'SELECT email, role, "isVerified" FROM users WHERE email = $1',
            [email]
        );
        console.log('📊 User info:', result.rows[0]);

    } catch (error) {
        console.error('❌ Failed:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

fixAdminPassword();
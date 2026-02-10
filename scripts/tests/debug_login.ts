
import 'dotenv/config';
import { Pool } from 'pg';
import crypto from 'crypto';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const verifyPassword = (password: string, storedHash: string): boolean => {
    console.log(`Verifying password: "${password}" against hash: "${storedHash.substring(0, 20)}..."`);
    if (!storedHash.includes(':')) {
        console.log('Error: Stored hash missing separator');
        return false;
    }
    const [salt, hash] = storedHash.split(':');
    console.log(`Salt: ${salt}`);
    console.log(`Hash component: ${hash.substring(0, 10)}...`);

    const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    console.log(`Computed hash: ${verifyHash.substring(0, 10)}...`);

    return hash === verifyHash;
};

async function main() {
    const client = await pool.connect();
    try {
        console.log('🔌 Connected to database');

        const email = 'admin@vinhpart.vn';
        console.log(`🔍 Searching for user: ${email}`);

        const result = await client.query('SELECT * FROM users WHERE email = $1', [email]);

        if (result.rows.length === 0) {
            console.log('❌ User not found!');
            return;
        }

        const user = result.rows[0];
        console.log(`✅ User found. Role: ${user.role}`);
        console.log(`Stored Password: ${user.password}`);

        console.log('🔐 Attempting verification with password "admin123"...');
        const isValid = verifyPassword('admin123', user.password);

        if (isValid) {
            console.log('✅ PASS: Password matches!');
        } else {
            console.log('❌ FAIL: Password does not match.');

            // Check if it's the old bcrypt hash
            if (user.password.startsWith('$2a$')) {
                console.log('⚠️  WARNING: Stored password looks like a BCAYPT hash. The fix was not applied or was overwritten.');
            }
        }

    } catch (error) {
        console.error('❌ Error during debug:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

main();

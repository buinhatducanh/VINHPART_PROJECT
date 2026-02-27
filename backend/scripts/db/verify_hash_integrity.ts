
import 'dotenv/config';
import { Pool } from 'pg';
import crypto from 'crypto';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const verifyPassword = (password: string, storedHash: string): boolean => {
    const [salt, hash] = storedHash.split(':');
    const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return hash === verifyHash;
};

const hashPassword = (password: string): string => {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
};

async function main() {
    const client = await pool.connect();
    try {
        const password = 'admin123';
        const generatedHash = hashPassword(password);
        console.log(`Generated Hash (${generatedHash.length} chars): ${generatedHash}`);

        console.log('Writing to DB...');
        await client.query(
            'UPDATE users SET password = $1 WHERE email = $2',
            [generatedHash, 'admin@vinhpart.vn']
        );

        console.log('Reading from DB...');
        const result = await client.query('SELECT password FROM users WHERE email = $1', ['admin@vinhpart.vn']);
        const readHash = result.rows[0].password;
        console.log(`Read Hash      (${readHash.length} chars): ${readHash}`);

        if (generatedHash === readHash) {
            console.log('✅ Strings are identical.');
        } else {
            console.log('❌ Strings differ!');
            // Find difference
            for (let i = 0; i < generatedHash.length; i++) {
                if (generatedHash[i] !== readHash[i]) {
                    console.log(`Mismatch at index ${i}: Generated '${generatedHash[i]}' vs Read '${readHash[i]}'`);
                    break;
                }
            }
        }

        const isValid = verifyPassword(password, readHash);
        if (isValid) {
            console.log('✅ Verification PASSED');
        } else {
            console.log('❌ Verification FAILED');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

main();

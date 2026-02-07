import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } // Neon usually requires SSL
});

async function test() {
    try {
        const client = await pool.connect();
        console.log('PG connected successfully');
        const res = await client.query('SELECT NOW()');
        console.log('Query time:', res.rows[0]);
        client.release();
    } catch (err) {
        console.error('PG error:', err);
    } finally {
        await pool.end();
    }
}

test();

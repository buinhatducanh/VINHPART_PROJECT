
import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();
const { Pool } = pg;
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function checkStats() {
    const client = await pool.connect();
    try {
        const res = await client.query('SELECT COUNT(*) FROM products');
        console.log(`Total products: ${res.rows[0].count}`);

        const res2 = await client.query('SELECT COUNT(*) FROM categories');
        console.log(`Total categories: ${res2.rows[0].count}`);

    } catch (e) {
        console.error(e);
    } finally {
        client.release();
        await pool.end();
    }
}
checkStats();

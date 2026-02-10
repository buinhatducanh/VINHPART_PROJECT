
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function updateStock() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Update all products with stock 0 (or all products) to random 10-100
        const res = await client.query(`
            UPDATE products 
            SET stock = floor(random() * 90 + 10)::int
            WHERE stock = 0 OR stock IS NULL
            RETURNING id, name, stock
        `);

        console.log(`Updated ${res.rowCount} products with random stock.`);
        await client.query('COMMIT');
    } catch (e) {
        await client.query('ROLLBACK');
        console.error(e);
    } finally {
        client.release();
        await pool.end();
    }
}

updateStock();

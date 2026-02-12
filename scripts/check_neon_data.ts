import 'dotenv/config';
import { Pool } from 'pg';

async function checkNeonData() {
    console.log('🔍 Checking Neon Database content...');
    console.log('Database URL:', process.env.DATABASE_URL?.replace(/:[^:@]*@/, ':****@')); // Hide password

    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false } // Required for Neon sometimes
    });

    try {
        const client = await pool.connect();
        try {
            const res = await client.query('SELECT name, images FROM products LIMIT 3');
            console.log('\n📦 Database Rows (Direct SQL):');
            console.log(JSON.stringify(res.rows, null, 2));
        } finally {
            client.release();
        }
    } catch (err) {
        console.error('❌ Database connection failed:', err);
    } finally {
        await pool.end();
    }

    console.log('\n🌐 Checking API Response...');
    try {
        const apiRes = await fetch('http://localhost:3001/api/products?limit=3');
        const data = await apiRes.json();
        console.log('API Response Sample:');
        if (data.data && data.data.length > 0) {
            console.log(JSON.stringify(data.data.slice(0, 3).map((p: any) => ({ name: p.product_name, images: p.images || p.product_image })), null, 2));
        } else {
            console.log('No data or unexpected format:', data);
        }
    } catch (err) {
        console.error('❌ API request failed:', err);
    }
}

checkNeonData();

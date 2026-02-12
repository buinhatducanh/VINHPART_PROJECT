import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function check() {
    try {
        console.log('=== HIERARCHY CHECK ===');

        // Check Parent Categories
        const parents = await pool.query(`
        SELECT id, name, slug FROM categories WHERE "parentId" IS NULL ORDER BY name
    `);
        console.log(`\nFound ${parents.rows.length} Parent Categories:`);
        console.table(parents.rows);

        // Check Child Categories with Parent Name
        const children = await pool.query(`
        SELECT c.id, c.name, c.slug, p.name as parent_name 
        FROM categories c 
        LEFT JOIN categories p ON c."parentId" = p.id 
        WHERE c."parentId" IS NOT NULL 
        ORDER BY p.name, c.name
    `);
        console.log(`\nFound ${children.rows.length} Child Categories:`);
        console.table(children.rows);

        // Check Products with Full Category Path
        const products = await pool.query(`
        SELECT 
            p.name as product_name, 
            c.name as category, 
            parent.name as parent_category
        FROM products p
        LEFT JOIN categories c ON p."categoryId" = c.id
        LEFT JOIN categories parent ON c."parentId" = parent.id
        ORDER BY parent.name, c.name, p.name
        LIMIT 20
    `);

        console.log(`\nSample Products with Hierarchy (First 20):`);
        console.table(products.rows);

    } catch (e: any) {
        console.error('Error:', e.message);
    } finally {
        await pool.end();
    }
}

check();

const pg = require('pg');
require('dotenv').config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function check() {
  try {
    // Check columns in categories table
    const cols = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'categories'
    `);
    console.log('=== COLUMNS IN categories TABLE ===');
    console.table(cols.rows);

    // Check categories data
    const cats = await pool.query('SELECT * FROM categories LIMIT 10');
    console.log('\n=== CATEGORIES DATA ===');
    console.table(cats.rows);

    // Check products categoryId
    const prods = await pool.query('SELECT id, name, "categoryId" FROM products LIMIT 5');
    console.log('\n=== PRODUCTS DATA ===');
    console.table(prods.rows);

  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await pool.end();
  }
}

check();

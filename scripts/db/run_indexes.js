require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function runIndexScript() {
  try {
    const path = require('path');
    const sqlPath = path.join(__dirname, 'add_indexes.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    const result = await pool.query(sql);
    console.log('✅ Database optimization complete!');
    console.log(result.rows || result);
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

runIndexScript();

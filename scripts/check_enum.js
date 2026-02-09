import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function checkEnum() {
  try {
    // Check if PostStatus enum exists
    const enumCheck = await pool.query(`
      SELECT n.nspname as schema, t.typname as type 
      FROM pg_type t 
      JOIN pg_namespace n ON t.typnamespace = n.oid 
      WHERE t.typname = 'PostStatus'
    `);
    
    console.log('PostStatus enum found in schemas:', JSON.stringify(enumCheck.rows, null, 2));
    
    // Check posts table
    const tableCheck = await pool.query(`
      SELECT table_schema, table_name 
      FROM information_schema.tables 
      WHERE table_name = 'posts'
    `);
    
    console.log('Posts table found:', JSON.stringify(tableCheck.rows, null, 2));
    
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    pool.end();
  }
}

checkEnum();

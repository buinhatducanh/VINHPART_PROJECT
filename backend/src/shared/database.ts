import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Strip channel_binding from connection string (not supported by pg driver)
const connectionString = (process.env.DATABASE_URL || '').replace(/[&?]channel_binding=[^&]*/g, '');

export const pool = new Pool({
    connectionString,
    ssl: process.env.DB_SSL === 'false' ? undefined : { rejectUnauthorized: false }
});

// Prevent unhandled rejection crashes on idle client errors
pool.on('error', (err) => {
    console.error('Unexpected pool error:', err);
});

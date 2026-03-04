import pg from 'pg';


const { Pool } = pg;

const rawUrl = process.env.DATABASE_URL;
if (!rawUrl) {
    console.warn('⚠️ DATABASE_URL is not set. Database connections will fail.');
}

// Strip channel_binding from connection string (not supported by pg driver)
const connectionString = (rawUrl || '').replace(/[&?]channel_binding=[^&]*/g, '');

export const pool = new Pool({
    connectionString,
    ssl: process.env.DB_SSL === 'false' ? undefined : { rejectUnauthorized: false }
});

// Prevent unhandled rejection crashes on idle client errors
pool.on('error', (err) => {
    console.error('Unexpected pool error:', err);
});

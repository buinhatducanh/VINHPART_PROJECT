import pg from 'pg';

const connectionString = process.env.DATABASE_URL || '';

if (!connectionString) {
    console.error('❌ DATABASE_URL is not set.');
}

// Use standard pg Pool — works on both local and Vercel serverless (TCP)
export const pool = new pg.Pool({
    connectionString,
    ssl: connectionString.includes('sslmode=require')
        ? { rejectUnauthorized: false }
        : false,
    max: 10,
});

pool.on('error', (err) => {
    console.error('Unexpected pool error:', err);
});

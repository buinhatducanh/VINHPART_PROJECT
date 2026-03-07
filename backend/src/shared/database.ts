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

pool.on('error', (err: Error) => {
    // Neon DB pooler actively terminates idle connections.
    // This is expected and harmless, the pool will automatically reconnect.
    if (err && err.message && err.message.includes('Connection terminated unexpectedly')) {
        console.warn('Neon DB: Idle connection terminated by server (Expected behavior, pool will seamlessly reconnect).');
        return;
    }
    console.error('Unexpected pool error:', err);
});

import { Pool, neon, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

// Use native WebSocket (available on Vercel Node 20+) with ws as fallback
neonConfig.webSocketConstructor = globalThis.WebSocket ?? ws;

const rawUrl = process.env.DATABASE_URL;
if (!rawUrl) {
    console.error('❌ DATABASE_URL is not set. ALL database connections will fail.');
}

// Strip channel_binding from connection string (not supported by driver in some environments)
const connectionString = (rawUrl || '').replace(/[&?]channel_binding=[^&]*/g, '');

// HTTP-based SQL function — best for serverless (no WebSocket, no connection pool needed)
// Use for simple queries: await sql`SELECT * FROM users WHERE id = ${id}`
// Or parameterized: await sql.query('SELECT * FROM users WHERE id = $1', [id])
export const sql = neon(connectionString);

// Pool for transactions (uses WebSocket)
// Only use pool.connect() when you actually need BEGIN/COMMIT transactions
export const pool = new Pool({
    connectionString,
    max: 5, // Limit max connections for serverless
});

// Prevent unhandled rejection crashes on idle client errors
pool.on('error', (err: any) => {
    console.error('Unexpected pool error:', err);
});

import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

// Use native WebSocket (available on Vercel Node 20+) with ws as fallback
neonConfig.webSocketConstructor = globalThis.WebSocket ?? ws;

const rawUrl = process.env.DATABASE_URL;
if (!rawUrl) {
    console.error('❌ DATABASE_URL is not set. ALL database connections will fail.');
}

// Strip channel_binding from connection string (not supported by driver in some environments)
const connectionString = (rawUrl || '').replace(/[&?]channel_binding=[^&]*/g, '');

// Pool for all queries (uses WebSocket via @neondatabase/serverless)
export const pool = new Pool({
    connectionString,
    max: 5,
});

pool.on('error', (err: any) => {
    console.error('Unexpected pool error:', err);
});

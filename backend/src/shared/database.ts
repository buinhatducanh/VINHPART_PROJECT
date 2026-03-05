import 'dotenv/config';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

// Required for Neon serverless pool in Node.js environments
neonConfig.webSocketConstructor = ws;

const rawUrl = process.env.DATABASE_URL;
if (!rawUrl) {
    console.warn('⚠️ DATABASE_URL is not set. Database connections will fail.');
}

// Strip channel_binding from connection string (not supported by driver in some environments)
const connectionString = (rawUrl || '').replace(/[&?]channel_binding=[^&]*/g, '');

export const pool = new Pool({
    connectionString,
    // @neondatabase/serverless handles SSL appropriately over WebSocket or HTTPS.
});

// Prevent unhandled rejection crashes on idle client errors
pool.on('error', (err: any) => {
    console.error('Unexpected pool error:', err);
});

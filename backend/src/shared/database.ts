// backend/src/shared/database.ts
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env từ thư mục root
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Try to load .env from multiple locations
const envPaths = [
  path.resolve(__dirname, '../../../.env'), // root directory
  path.resolve(__dirname, '../../.env'),    // backend directory
  path.resolve(process.cwd(), '.env'),      // current working directory
];

let envLoaded = false;
for (const envPath of envPaths) {
  const result = dotenv.config({ path: envPath });
  if (!result.error) {
    console.log(`✅ Loaded .env from: ${envPath}`);
    envLoaded = true;
    break;
  }
}

if (!envLoaded) {
  console.warn('⚠️ No .env file found, using system environment variables');
}

const connectionString = process.env.DATABASE_URL || '';

if (!connectionString) {
    console.error('❌ DATABASE_URL is not set.');
    console.error('📝 Please create a .env file with DATABASE_URL');
} else {
    console.log('✅ DATABASE_URL loaded successfully');
}

// Use standard pg Pool — works on both local and Vercel serverless (TCP)
export const pool = new pg.Pool({
    connectionString,
    ssl: connectionString.includes('sslmode=require') || connectionString.includes('neon.tech')
        ? { rejectUnauthorized: false }
        : false,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
});

pool.on('connect', () => {
    console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err: Error) => {
    // Neon DB pooler actively terminates idle connections.
    // This is expected and harmless, the pool will automatically reconnect.
    const message = err.message || '';
    if (message.includes('Connection terminated unexpectedly') || message.includes('ECONNRESET')) {
        console.warn('Neon DB: Idle connection terminated by server (Expected behavior, pool will seamlessly reconnect).');
        return;
    }
    console.error('Unexpected pool error:', err);
});

// Test connection on startup
pool.query('SELECT NOW()')
    .then(() => {
        console.log('✅ Database connection test successful');
    })
    .catch((err) => {
        console.error('❌ Database connection test failed:', err.message);
    });
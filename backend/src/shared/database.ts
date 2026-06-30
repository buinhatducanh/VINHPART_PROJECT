// backend/src/shared/database.ts
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPaths = [
    path.resolve(__dirname, '../../../.env'),
    path.resolve(__dirname, '../../.env'),
    path.resolve(process.cwd(), '.env'),
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
} else {
    console.log('✅ DATABASE_URL loaded successfully');
}

export const pool = new pg.Pool({
    connectionString,
    ssl: connectionString.includes('sslmode=require') || connectionString.includes('neon.tech')
        ? { rejectUnauthorized: false }
        : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
});

pool.on('connect', () => {
    console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err: Error) => {
    const message = err.message || '';
    if (message.includes('Connection terminated unexpectedly') || message.includes('ECONNRESET')) {
        console.warn('Neon DB: Idle connection terminated by server (Expected behavior).');
        return;
    }
    console.error('Unexpected pool error:', err);
});

pool.query('SELECT NOW()')
    .then(() => console.log('✅ Database connection test successful'))
    .catch((err) => console.error('❌ Database connection test failed:', err.message));
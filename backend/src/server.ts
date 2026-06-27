// backend/src/server.ts
import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { pool } from './shared/database';
import { securityHeaders, corsOptions } from './shared/middleware/security';
import { apiLimiter } from './shared/middleware/rate-limiter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env
const envPaths = [
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

// Feature routes
import authRoutes from './features/auth/auth.routes';
import productRoutes from './features/product/product.routes';
import categoryRoutes from './features/category/category.routes';
import orderRoutes from './features/order/order.routes';
import postRoutes from './features/post/post.routes';
import reviewRoutes from './features/review/review.routes';
import dashboardRoutes from './features/dashboard/dashboard.routes';
import uploadRoutes from './features/upload/upload.routes';
import notificationRoutes from './features/notification/notification.routes';
import bodykitRoutes from './features/bodykit/bodykit.routes';
import adminEmailsRoutes from './features/admin/admin-emails.routes';
import homepageSectionRoutes from './features/homepage-section/homepage-section.routes';
import { notificationQueue } from './features/notification/notification-queue';

const rootDir = process.cwd();
const app = express();
const port = process.env.PORT || 3001;

// ============ SECURITY MIDDLEWARE ============
app.use(securityHeaders);
app.use(cors(corsOptions));

// ============ RATE LIMITING ============
app.use('/api', apiLimiter);

// ============ BODY PARSING ============
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(rootDir, 'uploads')));

// ============ HEALTH CHECK ============
app.get('/api/health', async (_req, res) => {
    try {
        const result = await pool.query('SELECT now() as server_time');
        res.json({ 
            status: 'ok', 
            server_time: result.rows[0]?.server_time,
            database: 'connected',
            env: process.env.NODE_ENV || 'development'
        });
    } catch (err: any) {
        res.status(503).json({ 
            status: 'error', 
            message: err.message,
            database: 'disconnected'
        });
    }
});

// ============ REGISTER ROUTES ============
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/bodykit', bodykitRoutes);
app.use('/api/admin/emails', adminEmailsRoutes);
app.use('/api/homepage-sections', homepageSectionRoutes);

// ============ MIGRATIONS ============
async function migrate() {
    const client = await pool.connect();
    try {
        // Users table columns
        await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS "googleId" TEXT UNIQUE`);
        await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar TEXT`);
        await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS "isVerified" BOOLEAN DEFAULT false`);
        await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS "verificationToken" TEXT`);
        await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS "resetToken" TEXT`);
        await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS "resetTokenExpires" TIMESTAMP`);
        await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS "lastLogin" TIMESTAMP`);
        await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS "isLocked" BOOLEAN DEFAULT false`);
        await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS "lockUntil" TIMESTAMP`);
        await client.query(`ALTER TABLE users ALTER COLUMN password DROP NOT NULL`);

        // Refresh tokens table
        await client.query(`
            CREATE TABLE IF NOT EXISTS refresh_tokens (
                id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
                user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                token TEXT NOT NULL UNIQUE,
                expires_at TIMESTAMP NOT NULL,
                created_at TIMESTAMP DEFAULT NOW(),
                revoked BOOLEAN DEFAULT false
            )
        `);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token)`);

        // Login attempts table
        await client.query(`
            CREATE TABLE IF NOT EXISTS login_attempts (
                id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
                email TEXT NOT NULL,
                ip_address TEXT,
                user_agent TEXT,
                success BOOLEAN DEFAULT false,
                attempted_at TIMESTAMP DEFAULT NOW()
            )
        `);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON login_attempts(email)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_login_attempts_ip ON login_attempts(ip_address)`);

        // Audit logs table
        await client.query(`
            CREATE TABLE IF NOT EXISTS audit_logs (
                id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
                user_id TEXT REFERENCES users(id),
                action TEXT NOT NULL,
                ip_address TEXT,
                user_agent TEXT,
                details JSONB,
                created_at TIMESTAMP DEFAULT NOW()
            )
        `);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at)`);

        // Vehicles table
        await client.query(`
            CREATE TABLE IF NOT EXISTS vehicles (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                slug TEXT UNIQUE NOT NULL,
                brand TEXT NOT NULL,
                model TEXT NOT NULL,
                year INTEGER,
                image TEXT,
                description TEXT,
                "isActive" BOOLEAN DEFAULT true,
                "createdAt" TIMESTAMP DEFAULT NOW(),
                "updatedAt" TIMESTAMP DEFAULT NOW()
            )
        `);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_vehicles_slug ON vehicles(slug)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_vehicles_brand ON vehicles(brand)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_vehicles_active ON vehicles("isActive")`);

        // Body kit parts table
        await client.query(`
            CREATE TABLE IF NOT EXISTS body_kit_parts (
                id TEXT PRIMARY KEY,
                "vehicleId" TEXT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
                "productId" TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
                position TEXT,
                "sortOrder" INTEGER DEFAULT 0,
                "createdAt" TIMESTAMP DEFAULT NOW(),
                UNIQUE("vehicleId", "productId")
            )
        `);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_bkp_vehicle ON body_kit_parts("vehicleId")`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_bkp_product ON body_kit_parts("productId")`);

        // Notifications table
        await client.query(`
            CREATE TABLE IF NOT EXISTS notifications (
                id TEXT PRIMARY KEY,
                type TEXT NOT NULL,
                title TEXT NOT NULL,
                message TEXT NOT NULL,
                "targetEmail" TEXT,
                "orderId" TEXT,
                amount DECIMAL(10,2),
                status TEXT DEFAULT 'QUEUED',
                priority INTEGER DEFAULT 0,
                data JSONB,
                "retryCount" INTEGER DEFAULT 0,
                "maxRetries" INTEGER DEFAULT 3,
                "createdAt" TIMESTAMP DEFAULT NOW(),
                "deliveredAt" TIMESTAMP,
                "readAt" TIMESTAMP
            )
        `);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_notif_email ON notifications("targetEmail")`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_notif_status ON notifications(status)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_notif_created ON notifications("createdAt")`);

        // Admin emails table
        await client.query(`
            CREATE TABLE IF NOT EXISTS admin_emails (
                id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
                email TEXT NOT NULL UNIQUE,
                "addedBy" TEXT,
                "createdAt" TIMESTAMP DEFAULT NOW()
            )
        `);
        await client.query(`
            INSERT INTO admin_emails (email, "addedBy")
            VALUES ('admin@vinhpart.com', 'system')
            ON CONFLICT (email) DO NOTHING
        `);

        // Posts columns
        await client.query(`ALTER TABLE posts ADD COLUMN IF NOT EXISTS "isPinned" BOOLEAN DEFAULT false`);
        await client.query(`ALTER TABLE posts ADD COLUMN IF NOT EXISTS "pinnedOrder" INTEGER DEFAULT 0`);

        // Homepage sections table
        await client.query(`
            CREATE TABLE IF NOT EXISTS homepage_sections (
                id TEXT PRIMARY KEY,
                key TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                "isEnabled" BOOLEAN DEFAULT true,
                "sortOrder" INTEGER DEFAULT 0,
                config JSONB,
                "createdAt" TIMESTAMP DEFAULT NOW(),
                "updatedAt" TIMESTAMP DEFAULT NOW()
            )
        `);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_hs_sort ON homepage_sections("sortOrder")`);

        // Seed homepage sections
        await client.query(`
            INSERT INTO homepage_sections (id, key, name, "sortOrder", "isEnabled")
            SELECT gen_random_uuid()::text, key, name, sort_order, true
            FROM (VALUES
                ('hero', 'Banner chính', 0),
                ('benefits', 'Lợi ích', 1),
                ('body_kit', 'Dàn áo xe', 2),
                ('featured_products', 'Sản phẩm nổi bật', 3),
                ('latest_posts', 'Bài viết mới nhất', 4),
                ('reviews', 'Đánh giá khách hàng', 5),
                ('cta', 'Call to Action', 6),
                ('footer', 'Footer', 7)
            ) AS t(key, name, sort_order)
            ON CONFLICT (key) DO NOTHING
        `);
    } catch (e) {
        console.error('Startup migration error:', e);
    } finally {
        client.release();
    }
}

migrate()
    .then(() => {
        console.log('Migrations completed');
        notificationQueue.start();
    })
    .catch((err) => console.error('Migration failed (non-fatal):', err));

app.listen(port, () => {
    console.log(`🚀 API Server running at http://localhost:${port}`);
    console.log(`🔍 Health check: http://localhost:${port}/api/health`);
    console.log(`📡 API Base: http://localhost:${port}/api`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📁 Working directory: ${process.cwd()}`);
});

export default app;
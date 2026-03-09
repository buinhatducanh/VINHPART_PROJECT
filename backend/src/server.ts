
import express from 'express';
import cors from 'cors';
import path from 'path';
import { pool } from './shared/database';

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
import { notificationQueue } from './features/notification/notification-queue';

// Use process.cwd() instead of import.meta.url for better Vercel compatibility
const rootDir = process.cwd();

const app = express();
const port = 3001;

app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:3000',
        /^http:\/\/localhost:\d+$/,
        /\.vercel\.app$/,
    ],
    credentials: true,
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(rootDir, 'uploads')));

// Health check
app.get('/api/health', async (_req, res) => {
    try {
        const result = await pool.query('SELECT now() as server_time');
        res.json({ status: 'ok', server_time: result.rows[0]?.server_time });
    } catch (err: any) {
        res.status(503).json({ status: 'error', message: err.message });
    }
});

// Register feature routes
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

// Startup migration (non-fatal)
async function migrate() {
    const client = await pool.connect();
    try {
        await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS "googleId" TEXT UNIQUE`);
        await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar TEXT`);
        await client.query(`ALTER TABLE users ALTER COLUMN password DROP NOT NULL`);

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

        // Notifications queue table (persistent message queue)
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
        await client.query(`CREATE INDEX IF NOT EXISTS idx_notif_email_status ON notifications("targetEmail", status)`);

        // Admin emails table for dynamic admin role management
        await client.query(`
            CREATE TABLE IF NOT EXISTS admin_emails (
                id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
                email TEXT NOT NULL UNIQUE,
                "addedBy" TEXT,
                "createdAt" TIMESTAMP DEFAULT NOW()
            )
        `);
        // Seed default admin email if not exists
        await client.query(`
            INSERT INTO admin_emails (email, "addedBy")
            VALUES ('admin@vinpart.vn', 'system')
            ON CONFLICT (email) DO NOTHING
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
        // Start notification queue processor after migrations
        notificationQueue.start();
    })
    .catch((err) => console.error('Migration failed (non-fatal):', err));

app.listen(port, () => {
    console.log(`API Server running at http://localhost:${port}`);
});

export default app;

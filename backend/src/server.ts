
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

// Use process.cwd() instead of import.meta.url for better Vercel compatibility
const rootDir = process.cwd();

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(rootDir, 'uploads')));

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

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(rootDir, 'dist')));

    app.get(/.*/, (_req, res) => {
        res.sendFile(path.join(rootDir, 'dist', 'index.html'));
    });
}

async function migrate() {
    const client = await pool.connect();
    try {
        await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS "googleId" TEXT UNIQUE`);
        await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar TEXT`);
        await client.query(`ALTER TABLE users ALTER COLUMN password DROP NOT NULL`);
    } catch (e) {
        console.error('Startup migration error:', e);
    } finally {
        client.release();
    }
}

// Run migrations on startup (needed for googleId/avatar columns)
// Non-blocking: don't let migration failure crash the serverless function
migrate()
    .then(() => {
        console.log('Migrations completed successfully');
    })
    .catch((err) => {
        console.error('Migration failed (non-fatal):', err);
    });

// Only bind port locally — on Vercel, the app is imported as a serverless function
if (!process.env.VERCEL) {
    app.listen(port, () => {
        console.log(`API Server running at http://localhost:${port}`);
    });
}

export default app;

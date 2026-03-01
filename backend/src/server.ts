import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
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

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

// Register feature routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/upload', uploadRoutes);

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../../dist')));

    app.get(/.*/, (req, res) => {
        res.sendFile(path.join(__dirname, '../../dist', 'index.html'));
    });
}

async function migrate() {
    const client = await pool.connect();
    try {
        await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS "googleId" TEXT UNIQUE`);
        await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar TEXT`);
    } catch (e) {
        console.error('Startup migration error:', e);
    } finally {
        client.release();
    }
}

migrate().then(() => {
    app.listen(port, () => {
        console.log(`API Server running at http://localhost:${port}`);
    });
});

export default app;

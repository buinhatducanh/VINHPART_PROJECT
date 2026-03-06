import { Router } from 'express';
import { sql } from '../../shared/database';

const router = Router();

// GET /api/dashboard/stats
router.get('/stats', async (_req, res) => {
    try {
        const productCountResult = await sql`SELECT COUNT(*) FROM products`;
        const categoryCountResult = await sql`SELECT COUNT(*) FROM categories`;
        const orderCountResult = await sql`SELECT COUNT(*) FROM orders WHERE status = 'PENDING'`;

        const bannerCount = 3;

        res.json({
            products: parseInt(productCountResult[0].count),
            categories: parseInt(categoryCountResult[0].count),
            orders: parseInt(orderCountResult[0].count),
            banners: bannerCount
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;

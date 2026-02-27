import { Router } from 'express';
import { pool } from '../../shared/database';

const router = Router();

// GET /api/dashboard/stats
router.get('/stats', async (req, res) => {
    try {
        const productCountResult = await pool.query('SELECT COUNT(*) FROM products');
        const categoryCountResult = await pool.query('SELECT COUNT(*) FROM categories');
        const orderCountResult = await pool.query("SELECT COUNT(*) FROM orders WHERE status = 'PENDING'");

        const bannerCount = 3;

        res.json({
            products: parseInt(productCountResult.rows[0].count),
            categories: parseInt(categoryCountResult.rows[0].count),
            orders: parseInt(orderCountResult.rows[0].count),
            banners: bannerCount
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;

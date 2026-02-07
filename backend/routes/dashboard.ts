import express from 'express';
import { pool } from '../db';

const router = express.Router();

router.get('/stats', async (_req, res) => {
    try {
        const productCountResult = await pool.query('SELECT COUNT(*) FROM products');
        const categoryCountResult = await pool.query('SELECT COUNT(*) FROM categories');
        // Only count PENDING orders as requested by user
        const orderCountResult = await pool.query("SELECT COUNT(*) FROM orders WHERE status = 'PENDING'");

        // Mock banner count for now since we don't have a banners table
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

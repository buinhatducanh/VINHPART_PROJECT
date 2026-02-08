import express from 'express';
import prisma from '../prisma';

const router = express.Router();

router.get('/stats', async (_req, res) => {
    try {
        const [productCount, categoryCount, orderCount] = await Promise.all([
            prisma.product.count(),
            prisma.category.count(),
            prisma.order.count({
                where: { status: 'PENDING' }
            })
        ]);

        // Mock banner count for now since we don't have a banners table
        const bannerCount = 3;

        res.json({
            products: productCount,
            categories: categoryCount,
            orders: orderCount,
            banners: bannerCount
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;

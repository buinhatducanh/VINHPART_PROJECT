import express from 'express';
import prisma from '../prisma';

const router = express.Router();

router.get('/', async (_req, res) => {
    try {
        const orders = await prisma.order.findMany({
            include: {
                items: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Map to match frontend interface
        const mappedOrders = orders.map(order => ({
            id: order.id,
            orderNumber: order.orderNumber,
            customerName: order.customerName,
            date: order.createdAt,
            total: Number(order.totalAmount),
            status: order.status.toLowerCase(), // Frontend expects lowercase
            items: order.items.length
        }));

        res.json(mappedOrders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;

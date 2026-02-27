import { Router } from 'express';
import { pool } from '../../shared/database';

const router = Router();

// GET /api/orders
router.get('/', async (req, res) => {
    try {
        const query = `
            SELECT o.id, o."orderNumber", o."customerName", o."createdAt", o."totalAmount", o.status,
                   (SELECT COUNT(*) FROM order_items oi WHERE oi."orderId" = o.id) as items_count
            FROM orders o
            ORDER BY o."createdAt" DESC
        `;
        const { rows } = await pool.query(query);

        const mappedOrders = rows.map(order => ({
            id: order.id,
            orderNumber: order.orderNumber,
            customerName: order.customerName,
            date: order.createdAt,
            total: Number(order.totalAmount),
            status: order.status.toLowerCase(),
            items: parseInt(order.items_count)
        }));

        res.json(mappedOrders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;

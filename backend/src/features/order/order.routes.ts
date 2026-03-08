import { Router } from 'express';
import { pool } from '../../shared/database';
import { broadcast } from '../notification/sse';

const router = Router();

// GET /api/orders
router.get('/', async (_req, res) => {
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

// POST /api/orders
router.post('/', async (req, res) => {
    const client = await pool.connect();
    try {
        const {
            customerName,
            customerEmail,
            customerPhone,
            address,
            city,
            notes,
            totalAmount,
            items
        } = req.body;

        await client.query('BEGIN');

        // Generate a simple order number
        const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const orderQuery = `
            INSERT INTO orders (id, "orderNumber", "customerName", "customerEmail", "customerPhone", address, city, notes, "totalAmount", status, "createdAt", "updatedAt")
            VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $7, $8, 'PENDING', NOW(), NOW())
            RETURNING id
        `;

        const orderResult = await client.query(orderQuery, [
            orderNumber,
            customerName,
            customerEmail,
            customerPhone,
            address,
            city,
            notes,
            totalAmount
        ]);

        const orderId = orderResult.rows[0].id;

        for (const item of items) {
            const itemQuery = `
                INSERT INTO order_items (id, "orderId", "productId", name, price, quantity)
                VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5)
            `;
            await client.query(itemQuery, [
                orderId,
                item.productId,
                item.name,
                item.price,
                item.quantity
            ]);
        }

        await client.query('COMMIT');

        // Push real-time notification via SSE
        broadcast('new_order', {
            id: orderId,
            type: 'order',
            title: 'Đơn hàng mới',
            message: `${customerName} đã đặt đơn hàng ${orderNumber}`,
            orderId,
            orderNumber,
            createdAt: new Date().toISOString(),
            amount: totalAmount
        }, customerEmail);

        res.status(201).json({
            id: orderId,
            orderNumber,
            message: 'Order placed successfully'
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error placing order:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        client.release();
    }
});

// GET /api/orders/:id
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const orderQuery = `
            SELECT * FROM orders WHERE id = $1
        `;
        const itemsQuery = `
            SELECT * FROM order_items WHERE "orderId" = $1
        `;

        const orderResult = await pool.query(orderQuery, [id]);
        if (orderResult.rows.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const itemsResult = await pool.query(itemsQuery, [id]);

        const order = orderResult.rows[0];
        res.json({
            ...order,
            items: itemsResult.rows
        });
    } catch (error) {
        console.error('Error fetching order details:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// PATCH /api/orders/:id/status
router.patch('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const updateQuery = `
            UPDATE orders 
            SET status = $1, "updatedAt" = NOW()
            WHERE id = $2
            RETURNING id, "orderNumber", status
        `;

        const { rows } = await pool.query(updateQuery, [status, id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Get customer email to push notification to the right user
        const orderDetail = await pool.query(
            'SELECT "customerEmail", "customerName", "orderNumber", "totalAmount" FROM orders WHERE id = $1',
            [id]
        );
        if (orderDetail.rows.length > 0) {
            const order = orderDetail.rows[0];
            broadcast('order_status', {
                id: id + '_' + status,
                type: 'order_status',
                title: `Cập nhật đơn hàng`,
                message: `Đơn hàng ${order.orderNumber} đã chuyển sang ${status}`,
                status,
                orderId: id,
                createdAt: new Date().toISOString(),
                amount: order.totalAmount
            }, order.customerEmail);
        }

        res.json({ message: 'Order status updated successfully', order: rows[0] });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;

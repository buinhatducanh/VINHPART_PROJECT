import { Router } from 'express';
import { pool } from '../../shared/database';
import { addClient } from './sse';

const router = Router();

// SSE stream endpoint - real-time push notifications
// GET /api/notifications/stream (admin) or /api/notifications/stream?email=xxx (user)
router.get('/stream', (req, res) => {
    const email = req.query.email as string | undefined;

    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
    });

    // Initial heartbeat
    res.write('event: connected\ndata: {"status":"ok"}\n\n');

    addClient(res, email);

    // Keep-alive every 30s to prevent proxy timeouts
    const heartbeat = setInterval(() => {
        res.write(': heartbeat\n\n');
    }, 30000);

    req.on('close', () => {
        clearInterval(heartbeat);
    });
});

// GET /api/notifications
// Returns admin notifications from the persistent queue + pending orders
router.get('/', async (_req, res) => {
    try {
        // Fetch from notifications table (admin = targetEmail IS NULL)
        const query = `
            SELECT id, type, title, message, "orderId", amount, status, "createdAt"
            FROM notifications
            WHERE "targetEmail" IS NULL
            ORDER BY "createdAt" DESC
            LIMIT 20
        `;
        const { rows: queuedNotifs } = await pool.query(query);

        // Fallback: also include PENDING orders not yet in notifications table
        const orderQuery = `
            SELECT o.id, o."orderNumber", o."customerName", o."totalAmount", o."createdAt"
            FROM orders o
            WHERE o.status = 'PENDING'
              AND NOT EXISTS (
                SELECT 1 FROM notifications n WHERE n."orderId" = o.id AND n.type = 'order'
              )
            ORDER BY o."createdAt" DESC
            LIMIT 10
        `;
        const { rows: pendingOrders } = await pool.query(orderQuery);

        const orderNotifs = pendingOrders.map((order: any) => ({
            id: `order_fallback_${order.id}`,
            type: 'order',
            title: 'Đơn hàng mới',
            message: `${order.customerName} đã đặt đơn hàng ${order.orderNumber}`,
            orderId: order.id,
            createdAt: order.createdAt,
            amount: order.totalAmount,
        }));

        const notifications = [
            ...queuedNotifs.map((n: any) => ({
                id: n.id,
                type: n.type,
                title: n.title,
                message: n.message,
                orderId: n.orderId,
                createdAt: n.createdAt,
                amount: n.amount,
            })),
            ...orderNotifs,
        ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        res.json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// GET /api/notifications/user?email=xxx
// Returns user-specific notifications from queue + order status
router.get('/user', async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        // Fetch from notifications table for this user
        const queueQuery = `
            SELECT id, type, title, message, "orderId", amount, status as "notifStatus", data, "createdAt"
            FROM notifications
            WHERE "targetEmail" = $1
            ORDER BY "createdAt" DESC
            LIMIT 30
        `;
        const { rows: queuedNotifs } = await pool.query(queueQuery, [email]);

        // Fallback: also include orders not yet in notifications table
        const orderQuery = `
            SELECT id, "orderNumber", "totalAmount", status, "updatedAt"
            FROM orders
            WHERE "customerEmail" = $1
              AND NOT EXISTS (
                SELECT 1 FROM notifications n WHERE n."orderId" = orders.id AND n."targetEmail" = $1
              )
            ORDER BY "updatedAt" DESC
            LIMIT 20
        `;
        const { rows: orders } = await pool.query(orderQuery, [email]);

        const statusLabels: Record<string, { title: string; message: (orderNum: string) => string }> = {
            PENDING: { title: 'Đặt hàng thành công', message: (n) => `Đơn hàng ${n} đang chờ xử lý.` },
            CONFIRMED: { title: 'Đã nhận đơn', message: (n) => `Đơn hàng ${n} đã được tiếp nhận.` },
            PROCESSING: { title: 'Đang đóng gói', message: (n) => `Đơn hàng ${n} đang được chuẩn bị.` },
            SHIPPED: { title: 'Đang vận chuyển', message: (n) => `Đơn hàng ${n} đang trên đường giao đến bạn.` },
            DELIVERED: { title: 'Giao hàng thành công', message: (n) => `Đơn hàng ${n} đã hoàn tất. Hãy để lại đánh giá nhé!` },
            CANCELLED: { title: 'Đơn hàng đã hủy', message: (n) => `Đơn hàng ${n} đã bị hủy.` },
        };

        const orderNotifs = orders.map((order: any) => {
            const label = statusLabels[order.status] || { title: 'Cập nhật đơn hàng', message: (n: string) => `Đơn hàng ${n} có cập nhật mới.` };
            return {
                id: order.id + '_' + order.status,
                type: 'order_status',
                title: label.title,
                message: label.message(order.orderNumber),
                status: order.status,
                orderId: order.id,
                createdAt: order.updatedAt,
                amount: order.totalAmount,
            };
        });

        const notifications = [
            ...queuedNotifs.map((n: any) => ({
                id: n.id,
                type: n.type,
                title: n.title,
                message: n.message,
                orderId: n.orderId,
                createdAt: n.createdAt,
                amount: n.amount,
                status: n.data?.orderStatus,
            })),
            ...orderNotifs,
        ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        res.json(notifications);
    } catch (error) {
        console.error('Error fetching user notifications:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query(
            `UPDATE notifications SET status = 'READ', "readAt" = NOW() WHERE id = $1`,
            [id]
        );
        res.json({ message: 'Notification marked as read' });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// GET /api/notifications/queue-status
router.get('/queue-status', async (_req, res) => {
    try {
        const { rows } = await pool.query(`
            SELECT status, COUNT(*) as count
            FROM notifications
            GROUP BY status
        `);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching queue status:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;

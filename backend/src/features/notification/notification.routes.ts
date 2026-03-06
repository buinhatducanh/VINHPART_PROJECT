import { Router } from 'express';
import { sql } from '../../shared/database';

const router = Router();

// GET /api/notifications
// In this implementation, we treat PENDING orders as unread notifications
router.get('/', async (_req, res) => {
    try {
        const query = `
            SELECT id, "orderNumber", "customerName", "totalAmount", "createdAt"
            FROM orders
            WHERE status = 'PENDING'
            ORDER BY "createdAt" DESC
            LIMIT 10
        `;
        const { rows } = await sql.query(query);

        const notifications = rows.map(order => ({
            id: order.id,
            type: 'order',
            title: 'Đơn hàng mới',
            message: `${order.customerName} đã đặt đơn hàng ${order.orderNumber}`,
            orderId: order.id,
            createdAt: order.createdAt,
            amount: order.totalAmount
        }));

        res.json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// GET /api/notifications/user
router.get('/user', async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const query = `
            SELECT id, "orderNumber", "totalAmount", status, "updatedAt"
            FROM orders
            WHERE "customerEmail" = $1
            AND status != 'PENDING'
            ORDER BY "updatedAt" DESC
            LIMIT 20
        `;
        const { rows } = await sql.query(query, [email]);

        const notifications = rows.map(order => {
            let title = '';
            let message = '';

            switch (order.status) {
                case 'CONFIRMED':
                    title = 'Đã nhận đơn';
                    message = `Đơn hàng ${order.orderNumber} đã được hệ thống tiếp nhận.`;
                    break;
                case 'PROCESSING':
                    title = 'Đang đóng gói';
                    message = `Đơn hàng ${order.orderNumber} đang được chuẩn bị.`;
                    break;
                case 'SHIPPED':
                    title = 'Đang vận chuyển';
                    message = `Đơn hàng ${order.orderNumber} đang trên đường giao đến bạn.`;
                    break;
                case 'DELIVERED':
                    title = 'Giao hàng thành công';
                    message = `Đơn hàng ${order.orderNumber} đã hoàn tất. Hãy để lại đánh giá nhé!`;
                    break;
                case 'CANCELLED':
                    title = 'Đơn hàng đã hủy';
                    message = `Đơn hàng ${order.orderNumber} đã bị hủy.`;
                    break;
                default:
                    title = 'Cập nhật đơn hàng';
                    message = `Đơn hàng ${order.orderNumber} có cập nhật mới.`;
            }

            return {
                id: order.id + '_' + order.status, // Unique ID for notification instance
                type: 'order_status',
                title,
                message,
                status: order.status,
                orderId: order.id,
                createdAt: order.updatedAt,
                amount: order.totalAmount
            };
        });

        res.json(notifications);
    } catch (error) {
        console.error('Error fetching user notifications:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;

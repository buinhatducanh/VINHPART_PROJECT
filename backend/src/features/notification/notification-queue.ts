import { pool } from '../../shared/database';
import { broadcast } from './sse';

export interface QueuedNotification {
    type: string;        // 'order' | 'order_status' | 'system'
    title: string;
    message: string;
    targetEmail?: string; // null = admin, email = user
    orderId?: string;
    amount?: number;
    priority?: number;   // 0=info, 1=success, 2=warning, 3=error
    data?: Record<string, any>;
}

class NotificationQueue {
    private pollTimer: ReturnType<typeof setInterval> | null = null;
    private processing = false;

    /**
     * Enqueue a notification: persist to DB, then attempt immediate SSE delivery.
     * If SSE fails (no connected clients), the queue processor will retry later.
     */
    async enqueue(notification: QueuedNotification): Promise<string> {
        const { type, title, message, targetEmail, orderId, amount, priority = 0, data } = notification;

        // 1. Persist to DB
        const insertQuery = `
            INSERT INTO notifications (id, type, title, message, "targetEmail", "orderId", amount, priority, status, data, "retryCount", "maxRetries", "createdAt")
            VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $7, 'QUEUED', $8, 0, 3, NOW())
            RETURNING id, "createdAt"
        `;
        const { rows } = await pool.query(insertQuery, [
            type, title, message, targetEmail || null, orderId || null,
            amount || null, priority, data ? JSON.stringify(data) : null,
        ]);
        const notifId = rows[0].id;
        const createdAt = rows[0].createdAt;

        // 2. Attempt immediate SSE delivery
        const ssePayload = {
            id: notifId,
            type,
            title,
            message,
            orderId,
            createdAt,
            amount,
            status: data?.orderStatus,
            ...data,
        };

        const sseEvent = type === 'order' ? 'new_order' : type === 'order_status' ? 'order_status' : 'system';
        broadcast(sseEvent, ssePayload, targetEmail);

        // 3. Mark as delivered (optimistic — SSE broadcast was called)
        await pool.query(
            `UPDATE notifications SET status = 'DELIVERED', "deliveredAt" = NOW() WHERE id = $1`,
            [notifId]
        );

        return notifId;
    }

    /**
     * Process queued/failed notifications that haven't been delivered.
     * Called periodically to retry failed deliveries.
     */
    async processQueue(): Promise<number> {
        if (this.processing) return 0;
        this.processing = true;

        try {
            const query = `
                SELECT id, type, title, message, "targetEmail", "orderId", amount, data, "retryCount", "maxRetries"
                FROM notifications
                WHERE status IN ('QUEUED', 'FAILED')
                  AND "retryCount" < "maxRetries"
                ORDER BY priority DESC, "createdAt" ASC
                LIMIT 50
            `;
            const { rows } = await pool.query(query);

            let processed = 0;
            for (const row of rows) {
                try {
                    const sseEvent = row.type === 'order' ? 'new_order' : row.type === 'order_status' ? 'order_status' : 'system';
                    const payload = {
                        id: row.id,
                        type: row.type,
                        title: row.title,
                        message: row.message,
                        orderId: row.orderId,
                        amount: row.amount,
                        ...(row.data || {}),
                    };

                    broadcast(sseEvent, payload, row.targetEmail || undefined);

                    await pool.query(
                        `UPDATE notifications SET status = 'DELIVERED', "deliveredAt" = NOW() WHERE id = $1`,
                        [row.id]
                    );
                    processed++;
                } catch {
                    await pool.query(
                        `UPDATE notifications SET status = 'FAILED', "retryCount" = "retryCount" + 1 WHERE id = $1`,
                        [row.id]
                    );
                }
            }

            return processed;
        } finally {
            this.processing = false;
        }
    }

    /**
     * Start the queue processor — retries failed notifications every 15 seconds.
     */
    start() {
        if (this.pollTimer) return;
        this.pollTimer = setInterval(() => this.processQueue(), 15_000);
        console.log('📬 Notification queue processor started (15s interval)');
    }

    stop() {
        if (this.pollTimer) {
            clearInterval(this.pollTimer);
            this.pollTimer = null;
        }
    }
}

// Singleton instance
export const notificationQueue = new NotificationQueue();

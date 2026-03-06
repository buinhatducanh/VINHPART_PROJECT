import { Router } from 'express';
import { pool, sql } from '../../shared/database';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// GET /api/reviews
router.get('/', async (req, res) => {
    try {
        const { status, productId, rating, limit = 50 } = req.query;

        let query = `
            SELECT r.*, p.name as "productName"
            FROM reviews r
            LEFT JOIN products p ON r."productId" = p.id
            WHERE 1=1
        `;
        const params: any[] = [];
        let paramIndex = 1;

        if (status && status !== 'all') {
            query += ` AND r.status = $${paramIndex++}`;
            params.push(status);
        }

        if (productId) {
            query += ` AND r."productId" = $${paramIndex++}`;
            params.push(productId);
        }

        if (rating && rating !== 'all') {
            query += ` AND r.rating = $${paramIndex++}`;
            params.push(Number(rating));
        }

        query += ` ORDER BY r.priority DESC, r."createdAt" DESC`;
        query += ` LIMIT $${paramIndex++}`;
        params.push(Number(limit));

        const rows = await sql.query(query, params);

        const reviews = rows.map((r: any) => ({
            id: r.id,
            product_id: r.productId,
            product_name: r.productName,
            customer_name: r.customerName,
            customer_email: r.customerEmail,
            rating: r.rating,
            title: r.title,
            content: r.content,
            images: r.images || [],
            status: r.status,
            is_verified_purchase: r.isVerifiedPurchase,
            priority: r.priority,
            helpful_count: r.helpfulCount,
            created_at: r.createdAt,
            updated_at: r.updatedAt
        }));

        res.json(reviews);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
});

// POST /api/reviews
router.post('/', async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const {
            product_id, customer_name, customer_email,
            rating, title, content, images
        } = req.body;

        if (!product_id || !customer_name || !rating || !content) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const id = uuidv4();
        const now = new Date();

        const insertQuery = `
            INSERT INTO reviews (
                id, "productId", "customerName", "customerEmail", rating, title, content, images, "createdAt", "updatedAt"
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *
        `;

        const { rows } = await client.query(insertQuery, [
            id, product_id, customer_name, customer_email || '', rating, title || '', content, images || [], now, now
        ]);

        await client.query('COMMIT');

        const r = rows[0];
        res.status(201).json({
            id: r.id,
            product_id: r.productId,
            customer_name: r.customerName,
            rating: r.rating,
            status: r.status
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating review:', error);
        res.status(500).json({ error: 'Failed to create review' });
    } finally {
        client.release();
    }
});

// PUT /api/reviews/:id
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const { status, priority } = req.body;

        const now = new Date();
        let query = `UPDATE reviews SET "updatedAt" = $1`;
        const params: any[] = [now];
        let idx = 2;

        if (status) {
            query += `, status = $${idx++}`;
            params.push(status);
        }

        if (priority !== undefined) {
            query += `, priority = $${idx++}`;
            params.push(parseInt(priority));
        }

        query += ` WHERE id = $${idx} RETURNING *`;
        params.push(id);

        const { rows } = await client.query(query, params);

        if (rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Review not found' });
        }

        await client.query('COMMIT');

        const r = rows[0];
        res.json({
            id: r.id,
            status: r.status,
            priority: r.priority,
            updated_at: r.updatedAt
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error updating review:', error);
        res.status(500).json({ error: 'Failed to update review' });
    } finally {
        client.release();
    }
});

// DELETE /api/reviews/:id
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await sql.query('DELETE FROM reviews WHERE id = $1 RETURNING id', [id]);
        if (result.length === 0) {
            return res.status(404).json({ error: 'Review not found' });
        }
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({ error: 'Failed to delete review' });
    }
});

export default router;

import { Router } from 'express';
import { pool, sql } from '../../shared/database';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// GET /api/posts
router.get('/', async (req, res) => {
    try {
        const { status, limit = 50 } = req.query;

        let query = `
            SELECT id, title, slug, excerpt, content, "featuredImage",
                   "metaTitle", "metaDescription", "ogImage", status,
                   "publishedAt", "viewCount", "authorId", "createdAt", "updatedAt"
            FROM posts
        `;
        const params: any[] = [];

        if (status) {
            query += ' WHERE status = $1';
            params.push(status);
        }

        query += ' ORDER BY "publishedAt" DESC NULLS LAST, "createdAt" DESC';

        if (limit) {
            query += ` LIMIT $${params.length + 1}`;
            params.push(parseInt(limit as string));
        }

        const { rows } = await sql.query(query, params);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
});

// GET /api/posts/:slug
router.get('/:slug', async (req, res) => {
    const client = await pool.connect();
    try {
        const { slug } = req.params;

        const { rows } = await client.query('SELECT * FROM posts WHERE slug = $1', [slug]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Post not found' });
        }

        await client.query(
            'UPDATE posts SET "viewCount" = "viewCount" + 1 WHERE slug = $1',
            [slug]
        );

        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching post:', error);
        res.status(500).json({ error: 'Failed to fetch post' });
    } finally {
        client.release();
    }
});

// POST /api/posts
router.post('/', async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const {
            title, slug, excerpt, content, featuredImage,
            metaTitle, metaDescription, ogImage, status = 'DRAFT'
        } = req.body;

        if (!title || !slug || !content) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'Title, slug, and content required' });
        }

        const check = await client.query('SELECT id FROM posts WHERE slug = $1', [slug]);
        if (check.rows.length > 0) {
            await client.query('ROLLBACK');
            return res.status(409).json({ error: 'Slug already exists' });
        }

        const id = uuidv4();
        const now = new Date();
        const publishedAt = status === 'PUBLISHED' ? now : null;

        const insertQuery = `
            INSERT INTO posts (
                id, title, slug, excerpt, content, "featuredImage",
                "metaTitle", "metaDescription", "ogImage", status,
                "publishedAt", "viewCount", "createdAt", "updatedAt"
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            RETURNING *
        `;

        const { rows } = await client.query(insertQuery, [
            id, title, slug, excerpt || null, content, featuredImage || null,
            metaTitle || null, metaDescription || null, ogImage || null, status,
            publishedAt, 0, now, now
        ]);

        await client.query('COMMIT');
        res.status(201).json(rows[0]);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating post:', error);
        res.status(500).json({ error: 'Failed to create post' });
    } finally {
        client.release();
    }
});

// PUT /api/posts/:id
router.put('/:id', async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const { id } = req.params;
        const {
            title, slug, excerpt, content, featuredImage,
            metaTitle, metaDescription, ogImage, status
        } = req.body;

        const existing = await client.query('SELECT * FROM posts WHERE id = $1', [id]);
        if (existing.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Post not found' });
        }

        const now = new Date();
        const oldStatus = existing.rows[0].status;
        let publishedAt = existing.rows[0].publishedAt;

        if (status === 'PUBLISHED' && oldStatus !== 'PUBLISHED') {
            publishedAt = now;
        }

        let query = `UPDATE posts SET "updatedAt" = $1`;
        const params: any[] = [now];
        let idx = 2;

        if (title) { query += `, title = $${idx++}`; params.push(title); }
        if (slug) { query += `, slug = $${idx++}`; params.push(slug); }
        if (excerpt !== undefined) { query += `, excerpt = $${idx++}`; params.push(excerpt || null); }
        if (content) { query += `, content = $${idx++}`; params.push(content); }
        if (featuredImage !== undefined) { query += `, "featuredImage" = $${idx++}`; params.push(featuredImage || null); }
        if (metaTitle !== undefined) { query += `, "metaTitle" = $${idx++}`; params.push(metaTitle || null); }
        if (metaDescription !== undefined) { query += `, "metaDescription" = $${idx++}`; params.push(metaDescription || null); }
        if (ogImage !== undefined) { query += `, "ogImage" = $${idx++}`; params.push(ogImage || null); }
        if (status) {
            query += `, status = $${idx++}`;
            params.push(status);
            if (publishedAt && status === 'PUBLISHED') {
                query += `, "publishedAt" = $${idx++}`;
                params.push(publishedAt);
            }
        }

        query += ` WHERE id = $${idx} RETURNING *`;
        params.push(id);

        const { rows } = await client.query(query, params);

        await client.query('COMMIT');
        res.json(rows[0]);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error updating post:', error);
        res.status(500).json({ error: 'Failed to update post' });
    } finally {
        client.release();
    }
});

// DELETE /api/posts/:id
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await sql.query('DELETE FROM posts WHERE id = $1 RETURNING id', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Post not found' });
        }

        res.status(204).send();
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ error: 'Failed to delete post' });
    }
});

export default router;

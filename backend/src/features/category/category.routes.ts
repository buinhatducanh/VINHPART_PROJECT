import { Router } from 'express';
import { pool, sql } from '../../shared/database';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// GET /api/categories
router.get('/', async (_req, res) => {
    try {
        const query = `
            SELECT id, name, slug, description, image, "parentId", "createdAt", "updatedAt"
            FROM categories
            ORDER BY "parentId" ASC NULLS FIRST, "createdAt" ASC
        `;
        const rows = await sql.query(query);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

// POST /api/categories
router.post('/', async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const { name, slug, description, image, parentId } = req.body;

        if (!name || !slug) {
            return res.status(400).json({ error: 'Name and slug are required' });
        }

        const checkSlug = await client.query('SELECT id FROM categories WHERE slug = $1', [slug]);
        if (checkSlug.rows.length > 0) {
            await client.query('ROLLBACK');
            return res.status(409).json({ error: 'Slug already exists' });
        }

        const id = uuidv4();
        const now = new Date();

        const insertQuery = `
            INSERT INTO categories (id, name, slug, description, image, "parentId", "createdAt", "updatedAt")
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `;

        const { rows } = await client.query(insertQuery, [
            id, name, slug, description || null, image || null, parentId || null, now, now
        ]);

        await client.query('COMMIT');
        res.status(201).json(rows[0]);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating category:', error);
        res.status(500).json({ error: 'Failed to create category' });
    } finally {
        client.release();
    }
});

// PUT /api/categories/:id
router.put('/:id', async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const { id } = req.params;
        const { name, slug, description, image, parentId } = req.body;

        const existing = await client.query('SELECT id FROM categories WHERE id = $1', [id]);
        if (existing.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Category not found' });
        }

        if (parentId === id) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'Cannot set self as parent' });
        }

        if (slug) {
            const checkSlug = await client.query('SELECT id FROM categories WHERE slug = $1 AND id != $2', [slug, id]);
            if (checkSlug.rows.length > 0) {
                await client.query('ROLLBACK');
                return res.status(409).json({ error: 'Slug already exists' });
            }
        }

        const now = new Date();
        let query = `UPDATE categories SET "updatedAt" = $1`;
        const params: any[] = [now];
        let idx = 2;

        if (name) { query += `, name = $${idx++}`; params.push(name); }
        if (slug) { query += `, slug = $${idx++}`; params.push(slug); }
        if (description !== undefined) { query += `, description = $${idx++}`; params.push(description || null); }
        if (image !== undefined) { query += `, image = $${idx++}`; params.push(image || null); }
        if (parentId !== undefined) { query += `, "parentId" = $${idx++}`; params.push(parentId || null); }

        query += ` WHERE id = $${idx} RETURNING *`;
        params.push(id);

        const { rows } = await client.query(query, params);

        await client.query('COMMIT');
        res.json(rows[0]);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error updating category:', error);
        res.status(500).json({ error: 'Failed to update category' });
    } finally {
        client.release();
    }
});

// DELETE /api/categories/:id
router.delete('/:id', async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const { id } = req.params;

        const category = await client.query('SELECT id FROM categories WHERE id = $1', [id]);
        if (category.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Category not found' });
        }

        const products = await client.query('SELECT COUNT(*) FROM products WHERE "categoryId" = $1', [id]);
        const productCount = parseInt(products.rows[0].count);
        if (productCount > 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: `Cannot delete category with ${productCount} products` });
        }

        const findAndDeleteDescendants = async (parentId: string) => {
            const children = await client.query('SELECT id FROM categories WHERE "parentId" = $1', [parentId]);
            for (const child of children.rows) {
                await findAndDeleteDescendants(child.id);
                await client.query('DELETE FROM categories WHERE id = $1', [child.id]);
            }
        };

        await findAndDeleteDescendants(id);
        await client.query('DELETE FROM categories WHERE id = $1', [id]);

        await client.query('COMMIT');
        res.status(204).send();
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error deleting category:', error);
        res.status(500).json({ error: 'Failed to delete category' });
    } finally {
        client.release();
    }
});

export default router;

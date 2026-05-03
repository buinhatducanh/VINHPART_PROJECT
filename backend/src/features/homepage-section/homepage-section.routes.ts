import { Router } from 'express';
import { pool } from '../../shared/database';

const router = Router();

router.get('/', async (_req, res) => {
    try {
        const { rows } = await pool.query(
            'SELECT * FROM homepage_sections ORDER BY "sortOrder" ASC'
        );
        res.json(rows);
    } catch (error) {
        console.error('Error fetching homepage sections:', error);
        res.status(500).json({ error: 'Failed to fetch homepage sections' });
    }
});

router.put('/reorder', async (req, res) => {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds)) {
        return res.status(400).json({ error: 'orderedIds array required' });
    }
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        for (let i = 0; i < orderedIds.length; i++) {
            await client.query(
                'UPDATE homepage_sections SET "sortOrder" = $1, "updatedAt" = NOW() WHERE id = $2',
                [i, orderedIds[i]]
            );
        }
        await client.query('COMMIT');
        res.json({ success: true });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error reordering sections:', error);
        res.status(500).json({ error: 'Failed to reorder sections' });
    } finally {
        client.release();
    }
});

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, isEnabled, config } = req.body;
    try {
        const result = await pool.query(
            `UPDATE homepage_sections
             SET name = COALESCE($1, name),
                 "isEnabled" = COALESCE($2, "isEnabled"),
                 config = COALESCE($3, config),
                 "updatedAt" = NOW()
             WHERE id = $4 RETURNING *`,
            [name, isEnabled, config ? JSON.stringify(config) : null, id]
        );
        if (!result.rows[0]) {
            return res.status(404).json({ error: 'Section not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating section:', error);
        res.status(500).json({ error: 'Failed to update section' });
    }
});

export default router;

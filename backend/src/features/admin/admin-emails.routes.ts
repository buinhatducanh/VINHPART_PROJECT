import { Router } from 'express';
import { pool } from '../../shared/database';

const router = Router();

/**
 * Middleware: Check if the requesting user is an admin.
 * Expects header x-user-email with the logged-in user's email.
 */
async function requireAdmin(req: any, res: any, next: any) {
    const userEmail = req.headers['x-user-email'] as string;
    if (!userEmail) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    // Check admin_emails table first
    const adminEmailCheck = await pool.query(
        'SELECT 1 FROM admin_emails WHERE LOWER(email) = LOWER($1)',
        [userEmail]
    );
    if (adminEmailCheck.rows.length > 0) {
        return next();
    }

    // Fallback: check if user has ADMIN role in users table
    const userRoleCheck = await pool.query(
        "SELECT 1 FROM users WHERE LOWER(email) = LOWER($1) AND role = 'ADMIN'",
        [userEmail]
    );
    if (userRoleCheck.rows.length === 0) {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
}

// GET /api/admin/emails — List all admin emails
router.get('/', requireAdmin, async (_req, res) => {
    try {
        const { rows } = await pool.query(
            'SELECT id, email, "addedBy", "createdAt" FROM admin_emails ORDER BY "createdAt" ASC'
        );
        res.json(rows);
    } catch (error) {
        console.error('Error fetching admin emails:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// POST /api/admin/emails — Add a new admin email
router.post('/', requireAdmin, async (req, res) => {
    const client = await pool.connect();
    try {
        const { email } = req.body;
        const addedBy = req.headers['x-user-email'] as string;

        if (!email || !email.includes('@')) {
            return res.status(400).json({ error: 'Valid email is required' });
        }

        const cleanEmail = email.trim().toLowerCase();

        await client.query('BEGIN');

        // Insert into admin_emails
        const { rows } = await client.query(
            `INSERT INTO admin_emails (email, "addedBy")
             VALUES ($1, $2)
             ON CONFLICT (email) DO NOTHING
             RETURNING id, email, "addedBy", "createdAt"`,
            [cleanEmail, addedBy]
        );

        if (rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(409).json({ error: 'Email already exists as admin' });
        }

        // If this email already has a user account, promote them to ADMIN
        await client.query(
            `UPDATE users SET role = 'ADMIN', "updatedAt" = NOW() WHERE LOWER(email) = LOWER($1) AND role != 'ADMIN'`,
            [cleanEmail]
        );

        await client.query('COMMIT');
        res.status(201).json(rows[0]);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error adding admin email:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        client.release();
    }
});

// DELETE /api/admin/emails/:id — Remove an admin email
router.delete('/:id', requireAdmin, async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;
        const requestingEmail = req.headers['x-user-email'] as string;

        await client.query('BEGIN');

        // Get the email before deleting
        const emailResult = await client.query(
            'SELECT email FROM admin_emails WHERE id = $1',
            [id]
        );

        if (emailResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Admin email not found' });
        }

        const email = emailResult.rows[0].email;

        // Prevent self-deletion
        if (email.toLowerCase() === requestingEmail.toLowerCase()) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'Cannot remove your own admin email' });
        }

        // Prevent deleting the last admin
        const countResult = await client.query('SELECT COUNT(*) as count FROM admin_emails');
        if (parseInt(countResult.rows[0].count) <= 1) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'Cannot remove the last admin email' });
        }

        // Delete from admin_emails
        await client.query('DELETE FROM admin_emails WHERE id = $1', [id]);

        // Downgrade the user to USER role
        await client.query(
            `UPDATE users SET role = 'USER', "updatedAt" = NOW() WHERE LOWER(email) = LOWER($1) AND role = 'ADMIN'`,
            [email]
        );

        await client.query('COMMIT');
        res.json({ message: 'Admin email removed', email });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error removing admin email:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        client.release();
    }
});

export default router;

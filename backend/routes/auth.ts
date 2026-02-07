import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { pool } from '../db';

const router = express.Router();

// Auth Helpers
const hashPassword = (password: string): string => {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
};

const verifyPassword = (password: string, storedHash: string): boolean => {
    if (!storedHash.includes(':')) return false;
    const [salt, hash] = storedHash.split(':');
    const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return hash === verifyHash;
};

// Auth Routes
router.post('/register', async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const { email, password, name } = req.body;

        // Check existing
        const check = await client.query('SELECT id FROM users WHERE email = $1', [email]);
        if (check.rows.length > 0) {
            await client.query('ROLLBACK');
            res.status(400).json({ error: 'Email already exists' });
            return;
        }

        const hashedPassword = hashPassword(password);
        const role = email === 'admin@vinpart.vn' ? 'ADMIN' : 'USER';
        const id = uuidv4();
        const now = new Date();

        const insertQuery = `
            INSERT INTO users (id, email, password, name, role, "createdAt", "updatedAt")
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id, email, name, role
        `;

        const { rows } = await client.query(insertQuery, [id, email, hashedPassword, name, role, now, now]);

        await client.query('COMMIT');

        const user = rows[0];
        res.json({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role.toLowerCase()
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Register error:', error);
        res.status(500).json({ error: 'Registration failed' });
    } finally {
        client.release();
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const cleanEmail = email ? email.trim().toLowerCase() : '';
        console.log(`Login attempt for: '${cleanEmail}'`);

        const result = await pool.query('SELECT * FROM users WHERE email = $1', [cleanEmail]);

        if (result.rows.length === 0) {
            console.log(`User not found: '${cleanEmail}'`);
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        const user = result.rows[0];
        console.log(`User found: ${user.email}, Role: ${user.role}`);
        console.log(`Stored hash: ${user.password}`);

        const isValid = verifyPassword(password, user.password);
        console.log(`Password valid: ${isValid}`);

        if (!isValid) {
            console.log('Password verification failed');
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        res.json({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role.toLowerCase()
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

export default router;

import { Router } from 'express';
import { pool } from '../../shared/database';
import { hashPassword, verifyPassword } from '../../shared/auth-helpers';
import { v4 as uuidv4 } from 'uuid';
import { OAuth2Client } from 'google-auth-library';

const router = Router();
const googleClient = new OAuth2Client();

// POST /api/auth/register
router.post('/register', async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const { email, password, name } = req.body;

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

// POST /api/auth/login
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

        const isValid = verifyPassword(password, user.password);

        if (!isValid) {
            console.log('Password verification failed');
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        res.json({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role.toLowerCase(),
            avatar: user.avatar || null
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// POST /api/auth/google
router.post('/google', async (req, res) => {
    const client = await pool.connect();
    try {
        const { credential, clientId, googleId: directGoogleId, email: directEmail, name: directName, picture: directPicture } = req.body;

        let googleId: string | undefined;
        let email: string | undefined;
        let name: string | undefined;
        let picture: string | undefined;

        if (directGoogleId && directEmail) {
            // Implicit flow: frontend already fetched user info from Google
            googleId = directGoogleId;
            email = directEmail;
            name = directName;
            picture = directPicture;
        } else if (credential) {
            // ID token flow: verify the token
            const ticket = await googleClient.verifyIdToken({
                idToken: credential,
                audience: clientId,
            });

            const payload = ticket.getPayload();
            if (!payload || !payload.email) {
                res.status(400).json({ error: 'Invalid Google token' });
                return;
            }

            googleId = payload.sub;
            email = payload.email;
            name = payload.name;
            picture = payload.picture;
        } else {
            res.status(400).json({ error: 'Google credential or user info is required' });
            return;
        }

        await client.query('BEGIN');

        // Check if user exists by googleId or email
        const existingUser = await client.query(
            'SELECT * FROM users WHERE "googleId" = $1 OR email = $2',
            [googleId, email]
        );

        let user;

        if (existingUser.rows.length > 0) {
            // User exists - update googleId and avatar if needed
            user = existingUser.rows[0];
            const now = new Date();
            await client.query(
                `UPDATE users SET "googleId" = $1, avatar = $2, "updatedAt" = $3, name = COALESCE(name, $4) WHERE id = $5`,
                [googleId, picture || user.avatar, now, name, user.id]
            );
            user.avatar = picture || user.avatar;
            user.name = user.name || name;
        } else {
            // Create new user with Google info (no password needed)
            const id = uuidv4();
            const now = new Date();
            const role = email === 'admin@vinpart.vn' ? 'ADMIN' : 'USER';

            const insertQuery = `
                INSERT INTO users (id, email, name, "googleId", avatar, role, "createdAt", "updatedAt")
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING id, email, name, role, avatar
            `;

            const { rows } = await client.query(insertQuery, [
                id, email, name, googleId, picture, role, now, now
            ]);
            user = rows[0];
        }

        await client.query('COMMIT');

        res.json({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role.toLowerCase(),
            avatar: user.avatar || null
        });
    } catch (error) {
        await client.query('ROLLBACK');
        const msg = error instanceof Error ? error.message : String(error);
        console.error('Google auth error:', msg);
        res.status(500).json({ error: `Google authentication failed: ${msg}` });
    } finally {
        client.release();
    }
});

export default router;

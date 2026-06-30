// backend/src/features/auth/auth.routes.ts
import { Router } from 'express';
import { pool } from '../../shared/database';
import { 
    hashPassword, 
    verifyPassword, 
    generateTokens, 
    verifyRefreshToken,
    generateVerificationToken,
    generateResetToken
} from '../../shared/auth-helpers';
import { v4 as uuidv4 } from 'uuid';
import { OAuth2Client } from 'google-auth-library';
import { 
    registerLimiter, 
    loginLimiter, 
    forgotPasswordLimiter,
    refreshLimiter
} from '../../shared/middleware/rate-limiter';
import { authenticate } from '../../shared/middleware/auth';

const router = Router();
const googleClient = new OAuth2Client();

// ============================================
// REGISTER
// ============================================
router.post('/register', registerLimiter, async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const { email, password, name } = req.body;

        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        // Validate password strength
        if (password.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters' });
        }
        if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
            return res.status(400).json({ 
                error: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' 
            });
        }

        // Check existing user
        const check = await client.query('SELECT id, "isVerified" FROM users WHERE email = $1', [email]);
        if (check.rows.length > 0) {
            if (!check.rows[0].isVerified) {
                return res.status(400).json({ 
                    error: 'Email already registered but not verified. Please check your email.' 
                });
            }
            return res.status(400).json({ error: 'Email already exists' });
        }

        const hashedPassword = hashPassword(password);
        const adminCheck = await client.query('SELECT 1 FROM admin_emails WHERE LOWER(email) = LOWER($1)', [email]);
        const role = adminCheck.rows.length > 0 ? 'ADMIN' : 'USER';

        const id = uuidv4();
        const now = new Date();
        const verificationToken = generateVerificationToken(email);

        const insertQuery = `
            INSERT INTO users (id, email, password, name, role, "verificationToken", "isVerified", "createdAt", "updatedAt")
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING id, email, name, role
        `;

        const { rows } = await client.query(insertQuery, [id, email, hashedPassword, name, role, verificationToken, false, now, now]);
        await client.query('COMMIT');

        // TODO: Send verification email
        console.log(`📧 Verification token for ${email}: ${verificationToken}`);
        console.log(`🔗 Verify link: http://localhost:5173/verify?token=${verificationToken}`);

        const user = rows[0];
        res.status(201).json({
            success: true,
            message: 'Registration successful. Please verify your email.',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role.toLowerCase(),
                isVerified: false
            }
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Register error:', error);
        res.status(500).json({ error: 'Registration failed' });
    } finally {
        client.release();
    }
});

// ============================================
// VERIFY EMAIL
// ============================================
router.get('/verify/:token', async (req, res) => {
    const { token } = req.params;
    try {
        const result = await pool.query(
            'SELECT id FROM users WHERE "verificationToken" = $1 AND "isVerified" = false',
            [token]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid or expired verification token' });
        }

        await pool.query(
            'UPDATE users SET "isVerified" = true, "verificationToken" = NULL WHERE id = $1',
            [result.rows[0].id]
        );

        res.json({ success: true, message: 'Email verified successfully. You can now login.' });
    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({ error: 'Verification failed' });
    }
});

// ============================================
// LOGIN
// ============================================
router.post('/login', loginLimiter, async (req, res) => {
    const client = await pool.connect();
    try {
        const { email, password } = req.body;
        const cleanEmail = email ? email.trim().toLowerCase() : '';
        const ipAddress = req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown';
        const userAgent = req.headers['user-agent'] || 'unknown';

        console.log(`Login attempt for: '${cleanEmail}' from IP: ${ipAddress}`);

        // Check too many failed attempts - GIẢM XUỐNG 3 PHÚT
        const recentAttempts = await client.query(
            `SELECT COUNT(*) FROM login_attempts 
             WHERE email = $1 AND success = false AND attempted_at > NOW() - INTERVAL '3 minutes'`,
            [cleanEmail]
        );
        
        if (parseInt(recentAttempts.rows[0].count) >= 5) {
            return res.status(429).json({ 
                error: 'Too many failed attempts. Please try again after 3 minutes.' 
            });
        }

        // Find user
        const result = await client.query('SELECT * FROM users WHERE email = $1', [cleanEmail]);

        if (result.rows.length === 0) {
            await client.query(
                'INSERT INTO login_attempts (email, ip_address, user_agent, success) VALUES ($1, $2, $3, false)',
                [cleanEmail, ipAddress, userAgent]
            );
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = result.rows[0];

        // Check if locked - GIẢM XUỐNG 3 PHÚT
        if (user.isLocked && user.lockUntil > new Date()) {
            const remainingMinutes = Math.ceil((new Date(user.lockUntil).getTime() - Date.now()) / 60000);
            return res.status(423).json({ 
                error: `Account is temporarily locked. Please try again after ${remainingMinutes} minutes.` 
            });
        }

        // Check if verified
        if (!user.isVerified) {
            return res.status(403).json({ 
                error: 'Please verify your email before logging in.' 
            });
        }

        // Verify password
        const isValid = verifyPassword(password, user.password);

        if (!isValid) {
            await client.query(
                'INSERT INTO login_attempts (email, ip_address, user_agent, success) VALUES ($1, $2, $3, false)',
                [cleanEmail, ipAddress, userAgent]
            );
            
            // Lock account after 5 failed attempts - KHÓA 3 PHÚT
            const failedCount = await client.query(
                `SELECT COUNT(*) FROM login_attempts 
                 WHERE email = $1 AND success = false AND attempted_at > NOW() - INTERVAL '3 minutes'`,
                [cleanEmail]
            );
            
            if (parseInt(failedCount.rows[0].count) >= 5) {
                const lockUntil = new Date();
                lockUntil.setMinutes(lockUntil.getMinutes() + 3);
                await client.query(
                    'UPDATE users SET "isLocked" = true, "lockUntil" = $1 WHERE id = $2',
                    [lockUntil, user.id]
                );
                return res.status(423).json({ 
                    error: 'Account locked due to multiple failed attempts. Please try again after 3 minutes.' 
                });
            }
            
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Log successful attempt
        await client.query(
            'INSERT INTO login_attempts (email, ip_address, user_agent, success) VALUES ($1, $2, $3, true)',
            [cleanEmail, ipAddress, userAgent]
        );

        // Generate tokens
        const { accessToken, refreshToken } = generateTokens(user.id, user.email, user.role);

        // Save refresh token
        const tokenId = uuidv4();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        await client.query(
            `INSERT INTO refresh_tokens (id, user_id, token, expires_at)
             VALUES ($1, $2, $3, $4)`,
            [tokenId, user.id, refreshToken, expiresAt]
        );

        // Update last login và mở khóa tài khoản
        await client.query(
            'UPDATE users SET "lastLogin" = NOW(), "isLocked" = false, "lockUntil" = NULL WHERE id = $1',
            [user.id]
        );

        res.json({
            success: true,
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role.toLowerCase(),
                avatar: user.avatar || null,
                isVerified: user.isVerified
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    } finally {
        client.release();
    }
});

// ============================================
// REFRESH TOKEN
// ============================================
router.post('/refresh', refreshLimiter, async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(400).json({ error: 'Refresh token required' });
    }

    try {
        const decoded = verifyRefreshToken(refreshToken);
        if (!decoded) {
            return res.status(401).json({ error: 'Invalid refresh token' });
        }

        const tokenResult = await pool.query(
            'SELECT * FROM refresh_tokens WHERE token = $1 AND revoked = false AND expires_at > NOW()',
            [refreshToken]
        );

        if (tokenResult.rows.length === 0) {
            return res.status(401).json({ error: 'Refresh token expired or revoked' });
        }

        const userResult = await pool.query(
            'SELECT * FROM users WHERE id = $1',
            [decoded.id]
        );

        if (userResult.rows.length === 0) {
            return res.status(401).json({ error: 'User not found' });
        }

        const user = userResult.rows[0];
        const { accessToken, refreshToken: newRefreshToken } = generateTokens(
            user.id,
            user.email,
            user.role
        );

        const tokenId = uuidv4();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        await pool.query(
            `INSERT INTO refresh_tokens (id, user_id, token, expires_at)
             VALUES ($1, $2, $3, $4)`,
            [tokenId, user.id, newRefreshToken, expiresAt]
        );

        await pool.query(
            'UPDATE refresh_tokens SET revoked = true WHERE token = $1',
            [refreshToken]
        );

        res.json({
            success: true,
            accessToken,
            refreshToken: newRefreshToken
        });
    } catch (error) {
        console.error('Refresh error:', error);
        res.status(500).json({ error: 'Refresh failed' });
    }
});

// ============================================
// LOGOUT
// ============================================
router.post('/logout', async (req, res) => {
    const { refreshToken } = req.body;

    if (refreshToken) {
        await pool.query(
            'UPDATE refresh_tokens SET revoked = true WHERE token = $1',
            [refreshToken]
        );
    }

    res.json({ success: true, message: 'Logged out successfully' });
});

// ============================================
// FORGOT PASSWORD
// ============================================
router.post('/forgot-password', forgotPasswordLimiter, async (req, res) => {
    const { email } = req.body;

    try {
        const result = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.json({ 
                success: true, 
                message: 'If the email exists, a reset link will be sent.' 
            });
        }

        const resetToken = generateResetToken(email);
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 1);

        await pool.query(
            'UPDATE users SET "resetToken" = $1, "resetTokenExpires" = $2 WHERE id = $3',
            [resetToken, expiresAt, result.rows[0].id]
        );

        console.log(`🔑 Reset token for ${email}: ${resetToken}`);
        console.log(`🔗 Reset link: http://localhost:5173/reset-password?token=${resetToken}`);

        res.json({ 
            success: true, 
            message: 'If the email exists, a reset link will be sent.' 
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ error: 'Failed to process request' });
    }
});

// ============================================
// RESET PASSWORD
// ============================================
router.post('/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    if (newPassword.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    try {
        const result = await pool.query(
            `SELECT id FROM users 
             WHERE "resetToken" = $1 AND "resetTokenExpires" > NOW()`,
            [token]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid or expired reset token' });
        }

        const hashedPassword = hashPassword(newPassword);
        await pool.query(
            'UPDATE users SET password = $1, "resetToken" = NULL, "resetTokenExpires" = NULL WHERE id = $2',
            [hashedPassword, result.rows[0].id]
        );

        // Revoke all refresh tokens
        await pool.query(
            'UPDATE refresh_tokens SET revoked = true WHERE user_id = $1',
            [result.rows[0].id]
        );

        res.json({ success: true, message: 'Password reset successfully' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ error: 'Failed to reset password' });
    }
});

// ============================================
// CHANGE PASSWORD (Authenticated)
// ============================================
router.post('/change-password', authenticate, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user?.id;

    if (!userId || !currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    if (newPassword.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    try {
        const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = result.rows[0];
        const isValid = verifyPassword(currentPassword, user.password);

        if (!isValid) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }

        const hashedPassword = hashPassword(newPassword);
        await pool.query(
            'UPDATE users SET password = $1, "updatedAt" = NOW() WHERE id = $2',
            [hashedPassword, userId]
        );

        res.json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Failed to change password' });
    }
});

// ============================================
// GET CURRENT USER (Authenticated)
// ============================================
router.get('/me', authenticate, async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const result = await pool.query('SELECT id, email, name, role, avatar, "isVerified", "lastLogin" FROM users WHERE id = $1', [userId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = result.rows[0];
        res.json({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role.toLowerCase(),
            avatar: user.avatar || null,
            isVerified: user.isVerified,
            lastLogin: user.lastLogin
        });
    } catch (error) {
        console.error('Auth me error:', error);
        res.status(500).json({ error: 'Failed to get user info' });
    }
});

// ============================================
// GOOGLE OAUTH
// ============================================
router.post('/google', async (req, res) => {
    const client = await pool.connect();
    try {
        const { credential, clientId, googleId: directGoogleId, email: directEmail, name: directName, picture: directPicture } = req.body;

        let googleId: string | undefined;
        let email: string | undefined;
        let name: string | undefined;
        let picture: string | undefined;

        if (directGoogleId && directEmail) {
            googleId = directGoogleId;
            email = directEmail;
            name = directName;
            picture = directPicture;
        } else if (credential) {
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

        const existingUser = await client.query(
            'SELECT * FROM users WHERE "googleId" = $1 OR email = $2',
            [googleId, email]
        );

        let user;

        if (existingUser.rows.length > 0) {
            user = existingUser.rows[0];
            const now = new Date();
            await client.query(
                `UPDATE users SET "googleId" = $1, avatar = $2, "updatedAt" = $3, name = COALESCE(name, $4), "isVerified" = true WHERE id = $5`,
                [googleId, picture || user.avatar, now, name, user.id]
            );
            user.avatar = picture || user.avatar;
            user.name = user.name || name;
            user.isVerified = true;
        } else {
            const id = uuidv4();
            const now = new Date();

            const adminCheck = await client.query('SELECT 1 FROM admin_emails WHERE LOWER(email) = LOWER($1)', [email]);
            const role = adminCheck.rows.length > 0 ? 'ADMIN' : 'USER';

            const insertQuery = `
                INSERT INTO users (id, email, name, "googleId", avatar, role, "isVerified", "createdAt", "updatedAt")
                VALUES ($1, $2, $3, $4, $5, $6, true, $7, $8)
                RETURNING id, email, name, role, avatar, "isVerified"
            `;

            const { rows } = await client.query(insertQuery, [
                id, email, name, googleId, picture, role, now, now
            ]);
            user = rows[0];
        }

        const adminRecheck = await client.query('SELECT 1 FROM admin_emails WHERE LOWER(email) = LOWER($1)', [user.email]);
        const expectedRole = adminRecheck.rows.length > 0 ? 'ADMIN' : 'USER';
        if (user.role !== expectedRole) {
            await client.query('UPDATE users SET role = $1, "updatedAt" = NOW() WHERE id = $2', [expectedRole, user.id]);
            user.role = expectedRole;
        }

        await client.query('COMMIT');

        const { accessToken, refreshToken } = generateTokens(user.id, user.email, user.role);

        const tokenId = uuidv4();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        await client.query(
            `INSERT INTO refresh_tokens (id, user_id, token, expires_at)
             VALUES ($1, $2, $3, $4)`,
            [tokenId, user.id, refreshToken, expiresAt]
        );

        res.json({
            success: true,
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role.toLowerCase(),
                avatar: user.avatar || null,
                isVerified: user.isVerified
            }
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
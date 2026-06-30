// backend/src/shared/auth-helpers.ts
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const JWT_SECRET = process.env.JWT_SECRET || 'vinhpart_dev_jwt_secret_key_2026';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'vinhpart_refresh_secret_key_2026';

// ============ PASSWORD HASHING ============
export const hashPassword = (password: string): string => {
    return bcrypt.hashSync(password, 10);
};

export const verifyPassword = (password: string, storedHash: string): boolean => {
    if (!storedHash) return false;

    // Support bcrypt hashes for seeded/admin users and existing bcrypt-based scripts.
    if (storedHash.startsWith('$2a$') || storedHash.startsWith('$2b$') || storedHash.startsWith('$2y$')) {
        return bcrypt.compareSync(password, storedHash);
    }

    // Support legacy PBKDF2 hashes stored as salt:hash
    if (storedHash.includes(':')) {
        const [salt, hash] = storedHash.split(':');
        const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
        return hash === verifyHash;
    }

    return false;
};

// ============ JWT TOKENS ============
export const generateTokens = (userId: string, email: string, role: string) => {
    const accessToken = jwt.sign(
        { id: userId, email, role },
        JWT_SECRET,
        { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
        { id: userId, email },
        REFRESH_SECRET,
        { expiresIn: '7d' }
    );

    return { accessToken, refreshToken };
};

export const verifyAccessToken = (token: string) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
};

export const verifyRefreshToken = (token: string) => {
    try {
        return jwt.verify(token, REFRESH_SECRET);
    } catch (error) {
        return null;
    }
};

// ============ VERIFICATION TOKENS ============
export const generateVerificationToken = (email: string): string => {
    return crypto
        .createHash('sha256')
        .update(email + process.env.JWT_SECRET + Date.now())
        .digest('hex')
        .substring(0, 32);
};

export const generateResetToken = (email: string): string => {
    return crypto
        .createHash('sha256')
        .update(email + process.env.JWT_SECRET + Date.now() + Math.random().toString())
        .digest('hex')
        .substring(0, 32);
};

export const generateOTP = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};
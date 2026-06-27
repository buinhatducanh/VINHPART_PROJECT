// backend/src/shared/auth-helpers.ts
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'vinhpart_dev_jwt_secret_key_2026';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'vinhpart_refresh_secret_key_2026';

// ============ PASSWORD HASHING ============
export const hashPassword = (password: string): string => {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
};

export const verifyPassword = (password: string, storedHash: string): boolean => {
    if (!storedHash || !storedHash.includes(':')) return false;
    const [salt, hash] = storedHash.split(':');
    const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return hash === verifyHash;
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
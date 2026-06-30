// backend/src/shared/middleware/rate-limiter.ts
import rateLimit from 'express-rate-limit';

// Rate limit cho đăng ký - 5 requests/3 phút
export const registerLimiter = rateLimit({
    windowMs: 3 * 60 * 1000, // 3 minutes
    max: 5,
    message: { error: 'Too many registration attempts. Please try again after 3 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        return req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown';
    }
});

// Rate limit cho login - 5 requests/3 phút
export const loginLimiter = rateLimit({
    windowMs: 3 * 60 * 1000, // 3 minutes
    max: 5,
    message: { error: 'Too many login attempts. Please try again after 3 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
});

// Rate limit cho forgot password - 3 requests/3 phút
export const forgotPasswordLimiter = rateLimit({
    windowMs: 3 * 60 * 1000, // 3 minutes
    max: 3,
    message: { error: 'Too many password reset requests. Please try again after 3 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limit cho API chung - 100 requests/1 phút
export const apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100,
    message: { error: 'Too many requests. Please slow down.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limit cho tạo nội dung - 20 requests/3 phút
export const createLimiter = rateLimit({
    windowMs: 3 * 60 * 1000, // 3 minutes
    max: 20,
    message: { error: 'Too many creations. Please try again after 3 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limit cho refresh token - 10 requests/3 phút
export const refreshLimiter = rateLimit({
    windowMs: 3 * 60 * 1000, // 3 minutes
    max: 10,
    message: { error: 'Too many refresh attempts. Please try again after 3 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
});
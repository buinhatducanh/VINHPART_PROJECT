// backend/src/shared/middleware/security.ts
import helmet from 'helmet';
import cors from 'cors';

// Security headers with Helmet
export const securityHeaders = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https://res.cloudinary.com", "https://*.cloudinary.com"],
            connectSrc: ["'self'", "https://api.vinhpart.com", "http://localhost:3001"],
            fontSrc: ["'self'", "data:"],
        },
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
    },
    xssFilter: true,
    noSniff: true,
    hidePoweredBy: true,
});

// CORS options
export const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-user-email'],
    maxAge: 86400, // 24 hours
};
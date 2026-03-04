import type { VercelRequest, VercelResponse } from '@vercel/node';

// DIAGNOSTIC: Temporarily remove all backend imports to isolate the crash
// Step 1: Check if the function itself works and env vars are present

export default function handler(req: VercelRequest, res: VercelResponse) {
    res.status(200).json({
        status: 'Function works!',
        node_version: process.version,
        env_check: {
            DATABASE_URL: process.env.DATABASE_URL ? `set (${process.env.DATABASE_URL.substring(0, 30)}...)` : 'NOT SET',
            CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME ? 'set' : 'NOT SET',
            VERCEL: process.env.VERCEL || 'NOT SET',
            NODE_ENV: process.env.NODE_ENV || 'NOT SET',
        },
    });
}

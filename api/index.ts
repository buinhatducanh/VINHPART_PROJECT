import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(_req: VercelRequest, res: VercelResponse) {
    res.status(200).json({
        status: 'ok',
        node: process.version,
        env: {
            DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT_SET',
            CLOUDINARY: process.env.CLOUDINARY_CLOUD_NAME ? 'SET' : 'NOT_SET',
            VERCEL: process.env.VERCEL || 'not set',
        },
    });
}

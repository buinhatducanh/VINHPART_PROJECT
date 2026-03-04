import type { VercelRequest, VercelResponse } from '@vercel/node';
import app from '../backend/src/server';

export default function handler(req: VercelRequest, res: VercelResponse) {
    try {
        return app(req, res);
    } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        console.error('❌ API handler error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message,
        });
    }
}

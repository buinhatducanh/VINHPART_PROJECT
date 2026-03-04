import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getErrors } from './_setup';
import app from '../backend/src/server';

export default function handler(req: VercelRequest, res: VercelResponse) {
    const errors = getErrors();
    if (errors.length > 0) {
        return res.status(503).json({
            error: 'Server had initialization errors',
            details: errors,
        });
    }
    return app(req, res);
}

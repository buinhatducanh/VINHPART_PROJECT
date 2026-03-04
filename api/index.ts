import type { VercelRequest, VercelResponse } from '@vercel/node';

let app: any;
let loadError: string | null = null;

try {
    // Static import that Vercel can bundle
    const serverModule = require('../backend/src/server');
    app = serverModule.default || serverModule;
} catch (err: any) {
    loadError = err?.message || String(err);
    console.error('❌ Server module load failed:', loadError);
}

export default function handler(req: VercelRequest, res: VercelResponse) {
    if (loadError || !app) {
        res.status(503).json({
            error: 'Server initialization failed',
            message: loadError || 'Unknown error',
        });
        return;
    }
    try {
        return app(req, res);
    } catch (err: any) {
        console.error('❌ API handler error:', err);
        res.status(500).json({
            error: 'Internal server error',
            message: err?.message || String(err),
        });
    }
}

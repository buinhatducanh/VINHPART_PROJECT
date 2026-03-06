import type { VercelRequest, VercelResponse } from '@vercel/node';

let app: any = null;
let initError: string | null = null;

// Dynamic import to catch initialization errors instead of crashing the function
const appReady = import('../backend/src/server')
    .then((mod) => {
        app = mod.default;
    })
    .catch((err) => {
        initError = err?.stack || err?.message || String(err);
        console.error('❌ Failed to initialize server:', initError);
    });

export default async function handler(req: VercelRequest, res: VercelResponse) {
    await appReady;

    if (initError) {
        return res.status(503).json({
            error: 'Server initialization failed',
            details: initError,
        });
    }

    if (!app) {
        return res.status(503).json({ error: 'App not loaded' });
    }

    return app(req, res);
}

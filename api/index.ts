import type { VercelRequest, VercelResponse } from '@vercel/node';

let app: any;
let initError: Error | null = null;

try {
    const serverModule = await import('../backend/src/server');
    app = serverModule.default;
} catch (err) {
    initError = err instanceof Error ? err : new Error(String(err));
    console.error('❌ Failed to initialize server module:', initError);
}

export default function handler(req: VercelRequest, res: VercelResponse) {
    if (initError || !app) {
        res.status(503).json({
            error: 'Server initialization failed',
            message: initError?.message || 'Unknown error',
            stack: process.env.NODE_ENV !== 'production' ? initError?.stack : undefined,
        });
        return;
    }
    return app(req, res);
}

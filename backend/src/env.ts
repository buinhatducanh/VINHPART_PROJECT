// Load .env file for local development
// On Vercel, this silently fails (dotenv is a devDependency) — env vars are set via dashboard
// Top-level await ensures dotenv loads BEFORE any other module reads process.env
try {
    const { config } = await import('dotenv');
    config();
} catch {
    // dotenv not available (production) — that's fine
}

export { };

// This module is imported FIRST by api/index.ts to set up error handlers
// before any other module evaluation happens

const errors: string[] = [];

process.on('uncaughtException', (err) => {
    errors.push(`uncaughtException: ${err?.message || String(err)}`);
    console.error('❌ Uncaught exception:', err);
});

process.on('unhandledRejection', (reason) => {
    const msg = reason instanceof Error ? reason.message : String(reason);
    errors.push(`unhandledRejection: ${msg}`);
    console.error('❌ Unhandled rejection:', reason);
});

export function getErrors(): string[] {
    return errors;
}

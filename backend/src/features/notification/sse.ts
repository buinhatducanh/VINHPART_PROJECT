import { Response } from 'express';

interface SSEClient {
    id: string;
    res: Response;
    email?: string; // undefined = admin, string = user
}

const clients: SSEClient[] = [];
let clientIdCounter = 0;

export function addClient(res: Response, email?: string): string {
    const id = `client_${++clientIdCounter}`;
    clients.push({ id, res, email });

    res.on('close', () => {
        removeClient(id);
    });

    return id;
}

function removeClient(id: string) {
    const idx = clients.findIndex(c => c.id === id);
    if (idx !== -1) clients.splice(idx, 1);
}

/**
 * Broadcast a notification event to connected SSE clients.
 * - If targetEmail is provided, sends to that user's clients
 * - Always sends to admin clients (email === undefined)
 */
export function broadcast(event: string, data: any, targetEmail?: string) {
    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;

    for (const client of clients) {
        // Send to admin clients (no email filter)
        if (!client.email) {
            client.res.write(payload);
        }
        // Send to matching user clients
        if (targetEmail && client.email === targetEmail) {
            client.res.write(payload);
        }
    }
}

export function getClientCount() {
    return clients.length;
}

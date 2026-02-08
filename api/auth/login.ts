import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL!;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter }).$extends(withAccelerate());

const verifyPassword = (password: string, storedHash: string): boolean => {
    if (!storedHash.includes(':')) return false;
    const [salt, hash] = storedHash.split(':');
    const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return hash === verifyHash;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { email, password } = req.body;
        const cleanEmail = email ? email.trim().toLowerCase() : '';
        console.log(`Login attempt for: '${cleanEmail}'`);

        const user = await prisma.user.findUnique({
            where: { email: cleanEmail }
        });

        if (!user) {
            console.log(`User not found: '${cleanEmail}'`);
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        console.log(`User found: ${user.email}, Role: ${user.role}`);

        const isValid = verifyPassword(password, user.password);
        console.log(`Password valid: ${isValid}`);

        if (!isValid) {
            console.log('Password verification failed');
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        res.json({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role.toLowerCase()
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
}

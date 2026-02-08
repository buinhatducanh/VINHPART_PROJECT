import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL!;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter }).$extends(withAccelerate());

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        const result = await prisma.product.aggregate({
            _max: {
                price: true
            },
            where: {
                isActive: true
            }
        });
        const maxPrice = result._max.price ? Number(result._max.price) : 5000000;
        res.json({ maxPrice });
    } catch (error) {
        console.error('Error fetching max price:', error);
        res.status(500).json({ error: 'Internal Server Error', maxPrice: 5000000 });
    }
}

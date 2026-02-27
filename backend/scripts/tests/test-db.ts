console.log('Starting test...');
import { PrismaClient } from '@prisma/client';
try {
    const prisma = new PrismaClient({ log: ['query', 'info', 'warn', 'error'] });
    console.log('Prisma initialized');
    await prisma.$connect();
    console.log('Prisma connected');
    await prisma.$disconnect();
    console.log('Prisma disconnected');
} catch (e) {
    console.error('Error:', e);
}

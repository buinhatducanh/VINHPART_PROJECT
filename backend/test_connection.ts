import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

console.log('Testing Prisma Instantiation...');
try {
    const prisma = new PrismaClient();
    console.log('✅ Prisma Initialized');
    // await prisma.$connect(); // Optional, usually lazy
    await prisma.$disconnect();
} catch (error) {
    console.error('❌ Init Error:', error);
}

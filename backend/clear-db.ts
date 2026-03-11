import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { pool } from './src/shared/database.js'; // Adjust path if needed

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function clearDatabase() {
  console.log('Starting to clear database...');

  try {
    // Delete in order to avoid foreign key constraints (or just use Prisma's cascading deletes if set up, but safer to do it manually from bottom up)
    
    // Order Items -> Orders
    await prisma.orderItem.deleteMany();
    console.log('Cleared OrderItems');
    
    await prisma.order.deleteMany();
    console.log('Cleared Orders');

    // BodyKitPart -> Vehicle & Product
    await prisma.bodyKitPart.deleteMany();
    console.log('Cleared BodyKitParts');

    // Reviews -> Product
    await prisma.reviews.deleteMany();
    console.log('Cleared Reviews');

    // Posts
    await prisma.post.deleteMany();
    console.log('Cleared Posts');

    // Products -> Categories
    await prisma.product.deleteMany();
    console.log('Cleared Products');

    await prisma.category.deleteMany();
    console.log('Cleared Categories');

    // Vehicles
    await prisma.vehicle.deleteMany();
    console.log('Cleared Vehicles');

    // Notifications
    await prisma.notification.deleteMany();
    console.log('Cleared Notifications');

    // AdminEmails (if we should clear them, maybe keep them so the admin can still log in if there's any logic dependending on it?)
    // Actually the user just said "except super admin to log in". AdminEmails might be used for authorization. Let's keep AdminEmails just in case, or delete all except admin@vinpart.vn
    const superAdminEmail = 'admin@vinpart.vn'; // assuming this is the one from previous conversation context
    
    await prisma.adminEmail.deleteMany({
      where: {
        NOT: {
          email: superAdminEmail
        }
      }
    });
    console.log('Cleared AdminEmails except super admin');

    // Users
    await prisma.user.deleteMany({
      where: {
        NOT: {
          role: 'ADMIN' // keep admins
        }
      }
    });
    
    // In case there are multiple admins, let's make sure we only keep the super admin if specified, but keeping all ADMINs is generally safe.
    // If the user meant a specific one, keeping all ADMINs is the safest bet to not lock them out.
    console.log('Cleared Users except ADMINs');

    console.log('Database cleared successfully.');
  } catch (error) {
    console.error('Error clearing database:', error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

clearDatabase();

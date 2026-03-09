import { Client } from 'pg';

async function main() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    await client.connect();

    try {
        console.log('Finding admins...');
        const result = await client.query(`SELECT id, email, name FROM users WHERE role = 'ADMIN'`);
        const admins = result.rows;

        if (admins.length === 0) {
            console.error('No admin found!');
            return;
        }

        // Keep the first admin found
        const adminToKeep = admins[0];
        console.log('Admin to keep:', adminToKeep);

        console.log('Starting clear data process...');

        // Delete everything else
        await client.query('DELETE FROM order_items');
        await client.query('DELETE FROM orders');
        await client.query('DELETE FROM posts');
        await client.query('DELETE FROM reviews');
        await client.query('DELETE FROM body_kit_parts');
        await client.query('DELETE FROM vehicles');
        await client.query('DELETE FROM products');
        await client.query('DELETE FROM categories');
        await client.query('DELETE FROM notifications');

        // Delete all admin emails except the one associated with the admin we keep
        await client.query('DELETE FROM admin_emails WHERE email != $1', [adminToKeep.email]);

        // Delete all users except the admin we keep
        const deleteUsersResult = await client.query('DELETE FROM users WHERE id != $1', [adminToKeep.id]);

        console.log(`Deleted ${deleteUsersResult.rowCount} non-admin users.`);
        console.log('Database cleared perfectly for handover!');
    } catch (err) {
        console.error('Error during clearing:', err);
        process.exit(1);
    } finally {
        await client.end();
    }
}

main();

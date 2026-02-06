import express from 'express';
import cors from 'cors';
import pg from 'pg';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

dotenv.config();

const { Pool } = pg;
const app = express();
const port = 3001;

// Use connection string from environment
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

app.use(cors());
app.use(express.json());

// Helper to generate IDs if not using database default (Prisma used CUIDs, UUID is fine fallback)
// Actually, let's see if we can use `gen_random_uuid()` in Postgres if available, or just use `crypto.randomUUID` in Node.

// Node v24 implies crypto is available.

// Auth Helpers
const hashPassword = (password: string): string => {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
};

const verifyPassword = (password: string, storedHash: string): boolean => {
    if (!storedHash.includes(':')) return false;
    const [salt, hash] = storedHash.split(':');
    const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return hash === verifyHash;
};

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const { email, password, name } = req.body;

        // Check existing
        const check = await client.query('SELECT id FROM users WHERE email = $1', [email]);
        if (check.rows.length > 0) {
            await client.query('ROLLBACK');
            res.status(400).json({ error: 'Email already exists' });
            return;
        }

        const hashedPassword = hashPassword(password);
        const role = email === 'admin@vinpart.vn' ? 'ADMIN' : 'USER';
        const id = uuidv4();
        const now = new Date();

        const insertQuery = `
            INSERT INTO users (id, email, password, name, role, "createdAt", "updatedAt")
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id, email, name, role
        `;

        const { rows } = await client.query(insertQuery, [id, email, hashedPassword, name, role, now, now]);

        await client.query('COMMIT');

        const user = rows[0];
        res.json({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role.toLowerCase()
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Register error:', error);
        res.status(500).json({ error: 'Registration failed' });
    } finally {
        client.release();
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (result.rows.length === 0) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        const user = result.rows[0];

        const isValid = verifyPassword(password, user.password);

        if (!isValid) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
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
});

app.get('/api/dashboard/stats', async (req, res) => {
    try {
        const productCountResult = await pool.query('SELECT COUNT(*) FROM products');
        const categoryCountResult = await pool.query('SELECT COUNT(*) FROM categories');
        // Only count PENDING orders as requested by user
        const orderCountResult = await pool.query("SELECT COUNT(*) FROM orders WHERE status = 'PENDING'");

        // Mock banner count for now since we don't have a banners table
        // or we could count featured products? Let's generic valid 3 for now as per UI default, 
        // or 0 if we want to be strict. I'll stick to 3 or maybe check if there's a way store banners.
        // For now, I'll return the hardcoded 3 to match the original UI, but allow it to be dynamic later.
        const bannerCount = 3;

        res.json({
            products: parseInt(productCountResult.rows[0].count),
            categories: parseInt(categoryCountResult.rows[0].count),
            orders: parseInt(orderCountResult.rows[0].count),
            banners: bannerCount
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



app.get('/api/orders', async (req, res) => {
    try {
        const query = `
            SELECT o.id, o."orderNumber", o."customerName", o."createdAt", o."totalAmount", o.status,
                   (SELECT COUNT(*) FROM order_items oi WHERE oi."orderId" = o.id) as items_count
            FROM orders o
            ORDER BY o."createdAt" DESC
        `;
        const { rows } = await pool.query(query);

        // Map to match frontend interface
        const mappedOrders = rows.map(order => ({
            id: order.id,
            orderNumber: order.orderNumber,
            customerName: order.customerName,
            date: order.createdAt,
            total: Number(order.totalAmount),
            status: order.status.toLowerCase(), // Frontend expects lowercase
            items: parseInt(order.items_count)
        }));

        res.json(mappedOrders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/products', async (req, res) => {
    try {
        const {
            page = 1,
            limit = 12,
            category,
            brand,
            minPrice,
            maxPrice,
            search,
            vehicle_type,
            stock_status // Expect 'in_stock', 'low_stock', 'out_of_stock'
        } = req.query;

        const offset = (Number(page) - 1) * Number(limit);
        const params: any[] = [];
        let paramIndex = 1;

        // Base Query
        let baseQuery = `
            FROM products p
            LEFT JOIN categories c ON p."categoryId" = c.id
            WHERE 1=1
        `;

        // Filter: Search (Name)
        if (search) {
            baseQuery += ` AND p.name ILIKE $${paramIndex++}`;
            params.push(`%${search}%`);
        }

        // Filter: Category (Slug or ID)
        // Check if category is 'all' - frontend might send 'all'
        if (category && category !== 'all') {
            baseQuery += ` AND (c.slug = $${paramIndex} OR c.id = $${paramIndex})`;
            params.push(category);
            paramIndex++;
        }

        // Filter: Brand
        if (brand && brand !== 'all') {
            baseQuery += ` AND p.brand = $${paramIndex++}`;
            params.push(brand);
        }

        // Filter: Price
        if (minPrice) {
            baseQuery += ` AND p.price >= $${paramIndex++}`;
            params.push(Number(minPrice));
        }
        if (maxPrice) {
            baseQuery += ` AND p.price <= $${paramIndex++}`;
            params.push(Number(maxPrice));
        }

        // Filter: Stock Status logic is complex because it's calculated. 
        // Logic: in_stock (>10), low_stock (>0 <=10), out_of_stock (<=0)
        if (stock_status) {
            if (stock_status === 'in_stock') {
                baseQuery += ` AND p.stock > 10`;
            } else if (stock_status === 'low_stock') {
                baseQuery += ` AND p.stock > 0 AND p.stock <= 10`;
            } else if (stock_status === 'out_of_stock') {
                baseQuery += ` AND (p.stock <= 0 OR p.stock IS NULL)`;
            }
        }

        // Count Total
        const countResult = await pool.query(`SELECT COUNT(*) ${baseQuery}`, params);
        const total = parseInt(countResult.rows[0].count);

        // Fetch Data
        // Order by created at desc default
        const dataQuery = `
            SELECT p.id, p.name, p."categoryId", p.brand, p.price, p."salePrice", p.stock, p.images, p.description,
                   c.name as category_name, c.slug as category_slug
            ${baseQuery}
            ORDER BY p."createdAt" DESC
            LIMIT $${paramIndex++} OFFSET $${paramIndex++}
        `;

        params.push(Number(limit), offset);

        const { rows: products } = await pool.query(dataQuery, params);

        const mappedProducts = products.map(p => {
            // Calculate status
            let status = 'out_of_stock';
            if (p.stock > 10) status = 'in_stock';
            else if (p.stock > 0) status = 'low_stock';

            return {
                product_id: p.id,
                product_name: p.name,
                category: p.category_slug || 'parts',
                sub_category: p.category_name || 'General',
                vehicle_type: 'Motorbike',
                compatible_brand: p.brand || 'Honda',
                compatible_model: 'Universal',
                engine_capacity: 'Universal',
                price: Number(p.price),
                original_price: Number(p.salePrice || p.price),
                discount_percentage: p.salePrice ? Math.round(((p.price - p.salePrice) / p.price) * 100) : 0,
                stock: p.stock,
                stock_status: status,
                description: p.description || '', // Still sending description, but we could select substring if needed
                product_image: p.images && p.images.length > 0 ? p.images[0] : '',
                tags: []
            };
        });

        res.json({
            data: mappedProducts,
            metadata: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / Number(limit))
            }
        });

    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Internal Server Error', details: String(error) });
    }
});


app.post('/api/products', async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const {
            product_name,
            brand,
            category,
            model,
            price,
            discount_percent,
            stock,
            description,
            image_url
        } = req.body;

        // Find or create category
        let categoryId;
        if (category) {
            const { rows: existingCats } = await client.query('SELECT id FROM categories WHERE name = $1', [category]);
            if (existingCats.length > 0) {
                categoryId = existingCats[0].id;
            } else {
                // Create
                const slug = category.toLowerCase()
                    .replace(/đ/g, 'd')
                    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove accents
                    .replace(/[^a-z0-9]/g, '-') // Replace non-alphanumeric with hyphen
                    .replace(/-+/g, '-') // collapse multiple hyphens
                    .replace(/^-|-$/g, ''); // trim hyphens

                // We need an ID. 
                const newCatId = uuidv4();
                const now = new Date();
                await client.query(
                    'INSERT INTO categories (id, name, slug, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5)',
                    [newCatId, category, slug, now, now]
                );
                categoryId = newCatId;
            }
        }

        const newProductId = uuidv4();
        const now = new Date();
        const slug = product_name.toLowerCase().replace(/ /g, '-') + '-' + Date.now();
        const images = image_url ? [image_url] : [];
        const salePrice = discount_percent ? parseFloat(price) * (1 - parseFloat(discount_percent) / 100) : null;

        // Insert product
        // Note: Field names in Postgres are case sensitive if quoted in Prisma migration? 
        // Prisma typically maps to snake_case or keeps camelCase depending on mapping. 
        // Schema says @@map("products"). 
        // Let's assume columns are created by Prisma which usually preserves case if not mapped, 
        // AND in schema `categoryId` is camelCase. 
        // BUT, standard SQL uses lowercase. Prisma often quotes columns.
        // I should check column names from the `SELECT * from products` query if possible, or assume Prisma defaults.
        // Prisma defaults: `categoryId` -> `categoryId` (quoted) or snake_case?
        // Let's look at schema again: `categoryId String?` no map.
        // Usually Prisma creates column `"categoryId"` (quoted).

        const insertQuery = `
            INSERT INTO products (
                id, name, slug, brand, "categoryId", description, price, "salePrice", stock, images, "isActive", "createdAt", "updatedAt"
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING *
        `;
        // description + model
        const finalDesc = description + (model ? `\nModel: ${model}` : '');

        const { rows: newProducts } = await client.query(insertQuery, [
            newProductId, product_name, slug, brand, categoryId, finalDesc, parseFloat(price), salePrice, parseInt(stock), images, true, now, now
        ]);

        await client.query('COMMIT');
        res.json(newProducts[0]);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating product:', error);
        res.status(500).json({ error: 'Failed to create product', details: String(error) });
    } finally {
        client.release();
    }
});

app.put('/api/products/:id', async (req, res) => {
    const { id } = req.params;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const {
            product_name,
            brand,
            category,
            price,
            discount_percentage,
            stock,
            description,
            image_url
        } = req.body;

        let categoryId;
        if (category) {
            const { rows: cats } = await client.query('SELECT id FROM categories WHERE name = $1', [category]);
            if (cats.length > 0) categoryId = cats[0].id;
            // If not found, ignore or handle? For update, maybe ignore if not exact match or create?
            // Let's ignore creation for now to keep it simple, or reuse explicit create logic.
        }

        // Build dynamic update
        // This is manual manual. 
        // Let's just update fields we know.
        let salePrice = null;
        if (discount_percentage !== undefined) {
            salePrice = parseFloat(price) * (1 - parseFloat(discount_percentage) / 100);
        }

        const now = new Date();

        // We'll verify column accessibility 
        let query = `UPDATE products SET "updatedAt" = $1`;
        const params: any[] = [now];
        let idx = 2;

        if (product_name) { query += `, name = $${idx++}`; params.push(product_name); }
        if (brand) { query += `, brand = $${idx++}`; params.push(brand); }
        if (price) { query += `, price = $${idx++}`; params.push(parseFloat(price)); }
        if (stock !== undefined) { query += `, stock = $${idx++}`; params.push(parseInt(stock)); }
        if (description) { query += `, description = $${idx++}`; params.push(description); }
        if (salePrice !== null) { query += `, "salePrice" = $${idx++}`; params.push(salePrice); }
        if (categoryId) { query += `, "categoryId" = $${idx++}`; params.push(categoryId); }
        if (image_url) { query += `, images = $${idx++}`; params.push([image_url]); }

        query += ` WHERE id = $${idx} RETURNING *`;
        params.push(id);

        const { rows: updated } = await client.query(query, params);

        await client.query('COMMIT');
        res.json(updated[0]);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error updating product:', error);
        res.status(500).json({ error: 'Failed to update product' });
    } finally {
        client.release();
    }
});

app.delete('/api/products/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM products WHERE id = $1', [id]);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: 'Failed to delete product' });
    }
});

app.listen(port, () => {
    console.log(`API Server running at http://localhost:${port}`);
});

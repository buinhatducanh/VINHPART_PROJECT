import express from 'express';
import cors from 'cors';
import pg from 'pg';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;
const app = express();
const port = 3001;

// Use connection string from environment
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DB_SSL === 'false' ? undefined : { rejectUnauthorized: false }
});

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
        const cleanEmail = email ? email.trim().toLowerCase() : '';
        console.log(`Login attempt for: '${cleanEmail}'`);

        const result = await pool.query('SELECT * FROM users WHERE email = $1', [cleanEmail]);

        if (result.rows.length === 0) {
            console.log(`User not found: '${cleanEmail}'`);
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        const user = result.rows[0];
        console.log(`User found: ${user.email}, Role: ${user.role}`);
        console.log(`Stored hash: ${user.password}`);

        const isValid = verifyPassword(password, user.password);
        console.log(`Password valid: ${isValid}`);

        if (!isValid) {
            console.log('Password verification failed');
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

// Get max price from all products - MUST BE BEFORE /api/products
app.get('/api/products/max-price', async (req, res) => {
    try {
        const result = await pool.query('SELECT MAX(price) as max_price FROM products WHERE "isActive" = true');
        const maxPrice = result.rows[0]?.max_price || 5000000;
        res.json({ maxPrice: Number(maxPrice) });
    } catch (error) {
        console.error('Error fetching max price:', error);
        res.status(500).json({ error: 'Internal Server Error', maxPrice: 5000000 });
    }
});

app.get('/api/products', async (req, res) => {
    try {
        // DEBUG LOGGING
        const dbUrl = process.env.DATABASE_URL || 'undefined';
        const maskedUrl = dbUrl.replace(/:[^:@]*@/, ':****@');
        console.log(`[DEBUG] /api/products hit. DB URL: ${maskedUrl}`);

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
        // Also include products from subcategories when parent category is selected
        if (category && category !== 'all') {
            baseQuery += ` AND (
                c.slug = $${paramIndex} OR c.id = $${paramIndex} 
                OR c."parentId" = $${paramIndex}
                OR c."parentId" IN (SELECT id FROM categories WHERE slug = $${paramIndex})
            )`;
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

        console.log(`[DEBUG] Fetched ${products.length} products`);
        if (products.length > 0) {
            console.log(`[DEBUG] First product image: ${JSON.stringify(products[0].images)}`);
        }


        const mappedProducts = products.map(p => {
            // Calculate status
            let status = 'out_of_stock';
            if (p.stock > 10) status = 'in_stock';
            else if (p.stock > 0) status = 'low_stock';

            // Calculate actual sale price and discount
            const actualPrice = p.salePrice ? Number(p.salePrice) : Number(p.price);
            const originalPrice = Number(p.price);
            const discountPercent = p.salePrice ? Math.round(((originalPrice - Number(p.salePrice)) / originalPrice) * 100) : 0;

            return {
                product_id: p.id,
                product_name: p.name,
                category: p.category_slug || 'parts',
                sub_category: p.category_name || 'General',
                vehicle_type: 'Motorbike',
                compatible_brand: p.brand || 'Honda',
                compatible_model: 'Universal',
                engine_capacity: 'Universal',
                price: actualPrice,  // Giá hiển thị (sau giảm giá)
                original_price: originalPrice,  // Giá gốc
                discount_percentage: discountPercent,
                stock: p.stock,  // ✅ FIX: Thêm stock number
                stock_status: status,
                description: p.description || '',
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
        // ✅ FIX: Tính salePrice đúng - salePrice là giá sau giảm
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

        // ✅ FIX: Fetch existing product first for validation and default values
        const existingResult = await client.query('SELECT * FROM products WHERE id = $1', [id]);
        if (existingResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Product not found' });
        }
        const existing = existingResult.rows[0];

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
        }

        // ✅ FIX: Calculate salePrice using existing price if not provided
        let salePrice = null;
        if (discount_percentage !== undefined) {
            const basePrice = price ? parseFloat(price) : parseFloat(existing.price);
            salePrice = basePrice * (1 - parseFloat(discount_percentage) / 100);
        }

        const now = new Date();

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
        // ✅ FIX: Use RETURNING to verify deletion
        const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING id', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: 'Failed to delete product' });
    }
});

// ============================================
// CATEGORIES CRUD API
// ============================================

// GET all categories
app.get('/api/categories', async (req, res) => {
    try {
        const query = `
            SELECT id, name, slug, description, image, "parentId", "createdAt", "updatedAt"
            FROM categories
            ORDER BY "parentId" ASC NULLS FIRST, "createdAt" ASC
        `;
        const { rows } = await pool.query(query);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

// POST create category
app.post('/api/categories', async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const { name, slug, description, image, parentId } = req.body;

        // Validation
        if (!name || !slug) {
            return res.status(400).json({ error: 'Name and slug are required' });
        }

        // Check for duplicate slug
        const checkSlug = await client.query('SELECT id FROM categories WHERE slug = $1', [slug]);
        if (checkSlug.rows.length > 0) {
            await client.query('ROLLBACK');
            return res.status(409).json({ error: 'Slug already exists' });
        }

        const id = uuidv4();
        const now = new Date();

        const insertQuery = `
            INSERT INTO categories (id, name, slug, description, image, "parentId", "createdAt", "updatedAt")
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `;

        const { rows } = await client.query(insertQuery, [
            id,
            name,
            slug,
            description || null,
            image || null,
            parentId || null,
            now,
            now
        ]);

        await client.query('COMMIT');
        res.status(201).json(rows[0]);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating category:', error);
        res.status(500).json({ error: 'Failed to create category' });
    } finally {
        client.release();
    }
});

// PUT update category
app.put('/api/categories/:id', async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const { id } = req.params;
        const { name, slug, description, image, parentId } = req.body;

        // Check if category exists
        const existing = await client.query('SELECT id FROM categories WHERE id = $1', [id]);
        if (existing.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Category not found' });
        }

        // Prevent circular reference
        if (parentId === id) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'Cannot set self as parent' });
        }

        // Check slug uniqueness (if changed)
        if (slug) {
            const checkSlug = await client.query('SELECT id FROM categories WHERE slug = $1 AND id != $2', [slug, id]);
            if (checkSlug.rows.length > 0) {
                await client.query('ROLLBACK');
                return res.status(409).json({ error: 'Slug already exists' });
            }
        }

        const now = new Date();

        let query = `UPDATE categories SET "updatedAt" = $1`;
        const params: any[] = [now];
        let idx = 2;

        if (name) { query += `, name = $${idx++}`; params.push(name); }
        if (slug) { query += `, slug = $${idx++}`; params.push(slug); }
        if (description !== undefined) { query += `, description = $${idx++}`; params.push(description || null); }
        if (image !== undefined) { query += `, image = $${idx++}`; params.push(image || null); }
        if (parentId !== undefined) { query += `, "parentId" = $${idx++}`; params.push(parentId || null); }

        query += ` WHERE id = $${idx} RETURNING *`;
        params.push(id);

        const { rows } = await client.query(query, params);

        await client.query('COMMIT');
        res.json(rows[0]);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error updating category:', error);
        res.status(500).json({ error: 'Failed to update category' });
    } finally {
        client.release();
    }
});

// DELETE category (cascade children)
app.delete('/api/categories/:id', async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const { id } = req.params;

        // Check if category exists
        const category = await client.query('SELECT id FROM categories WHERE id = $1', [id]);
        if (category.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Category not found' });
        }

        // Check if has products
        const products = await client.query('SELECT COUNT(*) FROM products WHERE "categoryId" = $1', [id]);
        const productCount = parseInt(products.rows[0].count);
        if (productCount > 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: `Cannot delete category with ${productCount} products` });
        }

        // Recursive delete: Find and delete all descendants
        const findAndDeleteDescendants = async (parentId: string) => {
            const children = await client.query('SELECT id FROM categories WHERE "parentId" = $1', [parentId]);
            for (const child of children.rows) {
                await findAndDeleteDescendants(child.id);
                await client.query('DELETE FROM categories WHERE id = $1', [child.id]);
            }
        };

        await findAndDeleteDescendants(id);

        // Finally delete the category itself
        await client.query('DELETE FROM categories WHERE id = $1', [id]);

        await client.query('COMMIT');
        res.status(204).send();
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error deleting category:', error);
        res.status(500).json({ error: 'Failed to delete category' });
    } finally {
        client.release();
    }
});

// ============================================
// BLOG POSTS CRUD API
// ============================================

// GET all posts
app.get('/api/posts', async (req, res) => {
    try {
        const { status, limit = 50 } = req.query;

        let query = `
            SELECT id, title, slug, excerpt, content, "featuredImage", 
                   "metaTitle", "metaDescription", "ogImage", status,
                   "publishedAt", "viewCount", "authorId", "createdAt", "updatedAt"
            FROM posts
        `;
        const params: any[] = [];

        if (status) {
            query += ' WHERE status = $1';
            params.push(status);
        }

        query += ' ORDER BY "publishedAt" DESC NULLS LAST, "createdAt" DESC';

        if (limit) {
            query += ` LIMIT $${params.length + 1}`;
            params.push(parseInt(limit as string));
        }

        const { rows } = await pool.query(query, params);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
});

// GET single post by slug
app.get('/api/posts/:slug', async (req, res) => {
    const client = await pool.connect();
    try {
        const { slug } = req.params;

        const { rows } = await client.query(
            'SELECT * FROM posts WHERE slug = $1',
            [slug]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Increment view count
        await client.query(
            'UPDATE posts SET "viewCount" = "viewCount" + 1 WHERE slug = $1',
            [slug]
        );

        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching post:', error);
        res.status(500).json({ error: 'Failed to fetch post' });
    } finally {
        client.release();
    }
});

// POST create post
app.post('/api/posts', async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const {
            title,
            slug,
            excerpt,
            content,
            featuredImage,
            metaTitle,
            metaDescription,
            ogImage,
            status = 'DRAFT'
        } = req.body;

        // Validation
        if (!title || !slug || !content) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'Title, slug, and content required' });
        }

        // Check duplicate slug
        const check = await client.query('SELECT id FROM posts WHERE slug = $1', [slug]);
        if (check.rows.length > 0) {
            await client.query('ROLLBACK');
            return res.status(409).json({ error: 'Slug already exists' });
        }

        const id = uuidv4();
        const now = new Date();
        const publishedAt = status === 'PUBLISHED' ? now : null;

        const insertQuery = `
            INSERT INTO posts (
                id, title, slug, excerpt, content, "featuredImage",
                "metaTitle", "metaDescription", "ogImage", status,
                "publishedAt", "viewCount", "createdAt", "updatedAt"
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            RETURNING *
        `;

        const { rows } = await client.query(insertQuery, [
            id, title, slug, excerpt || null, content, featuredImage || null,
            metaTitle || null, metaDescription || null, ogImage || null, status,
            publishedAt, 0, now, now
        ]);

        await client.query('COMMIT');
        res.status(201).json(rows[0]);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating post:', error);
        res.status(500).json({ error: 'Failed to create post' });
    } finally {
        client.release();
    }
});

// ============================================
// REVIEWS CRUD API
// ============================================

// GET reviews
app.get('/api/reviews', async (req, res) => {
    try {
        const { status, productId, rating, limit = 50 } = req.query;

        let query = `
            SELECT r.*, p.name as "productName"
            FROM reviews r
            LEFT JOIN products p ON r."productId" = p.id
            WHERE 1=1
        `;
        const params: any[] = [];
        let paramIndex = 1;

        if (status && status !== 'all') {
            query += ` AND r.status = $${paramIndex++}`;
            params.push(status);
        }

        if (productId) {
            query += ` AND r."productId" = $${paramIndex++}`;
            params.push(productId);
        }

        if (rating && rating !== 'all') {
            query += ` AND r.rating = $${paramIndex++}`;
            params.push(Number(rating));
        }

        query += ` ORDER BY r.priority DESC, r."createdAt" DESC`;
        query += ` LIMIT $${paramIndex++}`;
        params.push(Number(limit));

        const { rows } = await pool.query(query, params);

        // Map to match frontend interface
        const reviews = rows.map(r => ({
            id: r.id,
            product_id: r.productId,
            product_name: r.productName,
            customer_name: r.customerName,
            customer_email: r.customerEmail,
            rating: r.rating,
            title: r.title,
            content: r.content,
            images: r.images || [],
            status: r.status,
            is_verified_purchase: r.isVerifiedPurchase,
            priority: r.priority,
            helpful_count: r.helpfulCount,
            created_at: r.createdAt,
            updated_at: r.updatedAt
        }));

        res.json(reviews);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
});

// POST create review
app.post('/api/reviews', async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const {
            product_id,
            customer_name,
            customer_email,
            rating,
            title,
            content,
            images
        } = req.body;

        // Validation
        if (!product_id || !customer_name || !rating || !content) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const id = uuidv4();
        const now = new Date();

        const insertQuery = `
            INSERT INTO reviews (
                id, "productId", "customerName", "customerEmail", rating, title, content, images, "createdAt", "updatedAt"
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *
        `;

        const { rows } = await client.query(insertQuery, [
            id, product_id, customer_name, customer_email || '', rating, title || '', content, images || [], now, now
        ]);

        await client.query('COMMIT');

        // Return mapped object
        const r = rows[0];
        res.status(201).json({
            id: r.id,
            product_id: r.productId,
            customer_name: r.customerName,
            rating: r.rating,
            status: r.status
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating review:', error);
        res.status(500).json({ error: 'Failed to create review' });
    } finally {
        client.release();
    }
});

// PUT update review (approve/reject/priority)
app.put('/api/reviews/:id', async (req, res) => {
    const { id } = req.params;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const { status, priority } = req.body;

        const now = new Date();
        let query = `UPDATE reviews SET "updatedAt" = $1`;
        const params: any[] = [now];
        let idx = 2;

        if (status) {
            query += `, status = $${idx++}`;
            params.push(status);
        }

        if (priority !== undefined) {
            query += `, priority = $${idx++}`;
            params.push(parseInt(priority));
        }

        query += ` WHERE id = $${idx} RETURNING *`;
        params.push(id);

        const { rows } = await client.query(query, params);

        if (rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Review not found' });
        }

        await client.query('COMMIT');

        const r = rows[0];
        res.json({
            id: r.id,
            status: r.status,
            priority: r.priority,
            updated_at: r.updatedAt
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error updating review:', error);
        res.status(500).json({ error: 'Failed to update review' });
    } finally {
        client.release();
    }
});

// DELETE review
app.delete('/api/reviews/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM reviews WHERE id = $1', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Review not found' });
        }
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({ error: 'Failed to delete review' });
    }
});



// PUT update post
app.put('/api/posts/:id', async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const { id } = req.params;
        const {
            title, slug, excerpt, content, featuredImage,
            metaTitle, metaDescription, ogImage, status
        } = req.body;

        // Check exists
        const existing = await client.query('SELECT * FROM posts WHERE id = $1', [id]);
        if (existing.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Post not found' });
        }

        const now = new Date();
        const oldStatus = existing.rows[0].status;
        let publishedAt = existing.rows[0].publishedAt;

        // Set publishedAt if transitioning to PUBLISHED
        if (status === 'PUBLISHED' && oldStatus !== 'PUBLISHED') {
            publishedAt = now;
        }

        let query = `UPDATE posts SET "updatedAt" = $1`;
        const params: any[] = [now];
        let idx = 2;

        if (title) { query += `, title = $${idx++}`; params.push(title); }
        if (slug) { query += `, slug = $${idx++}`; params.push(slug); }
        if (excerpt !== undefined) { query += `, excerpt = $${idx++}`; params.push(excerpt || null); }
        if (content) { query += `, content = $${idx++}`; params.push(content); }
        if (featuredImage !== undefined) { query += `, "featuredImage" = $${idx++}`; params.push(featuredImage || null); }
        if (metaTitle !== undefined) { query += `, "metaTitle" = $${idx++}`; params.push(metaTitle || null); }
        if (metaDescription !== undefined) { query += `, "metaDescription" = $${idx++}`; params.push(metaDescription || null); }
        if (ogImage !== undefined) { query += `, "ogImage" = $${idx++}`; params.push(ogImage || null); }
        if (status) {
            query += `, status = $${idx++}`;
            params.push(status);
            if (publishedAt && status === 'PUBLISHED') {
                query += `, "publishedAt" = $${idx++}`;
                params.push(publishedAt);
            }
        }

        query += ` WHERE id = $${idx} RETURNING *`;
        params.push(id);

        const { rows } = await client.query(query, params);

        await client.query('COMMIT');
        res.json(rows[0]);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error updating post:', error);
        res.status(500).json({ error: 'Failed to update post' });
    } finally {
        client.release();
    }
});

// DELETE post
app.delete('/api/posts/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query('DELETE FROM posts WHERE id = $1 RETURNING id', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Post not found' });
        }

        res.status(204).send();
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ error: 'Failed to delete post' });
    }
});


// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));

    // Handle React routing, return all requests to React app
    app.get(/.*/, (req, res) => {
        res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
}


app.listen(port, () => {
    console.log(`API Server running at http://localhost:${port}`);
});

export default app;

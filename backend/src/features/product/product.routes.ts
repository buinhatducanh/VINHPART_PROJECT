import { Router } from 'express';
import { pool, sql } from '../../shared/database';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// GET /api/products/max-price - MUST BE BEFORE /:id
router.get('/max-price', async (_req, res) => {
    try {
        const result = await sql`SELECT MAX(price) as max_price FROM products WHERE "isActive" = true`;
        const maxPrice = result[0]?.max_price || 5000000;
        res.json({ maxPrice: Number(maxPrice) });
    } catch (error) {
        console.error('Error fetching max price:', error);
        res.status(500).json({ error: 'Internal Server Error', maxPrice: 5000000 });
    }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const rows = await sql`
            SELECT p.*, c.name as category_name, c.slug as category_slug
            FROM products p
            LEFT JOIN categories c ON p."categoryId" = c.id
            WHERE p.id = ${id} AND p."isActive" = true
        `;

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const p = rows[0];

        let status = 'out_of_stock';
        if (p.stock > 10) status = 'in_stock';
        else if (p.stock > 0) status = 'low_stock';

        const actualPrice = p.salePrice ? Number(p.salePrice) : Number(p.price);
        const originalPrice = Number(p.price);
        const discountPercent = p.salePrice ? Math.round(((originalPrice - Number(p.salePrice)) / originalPrice) * 100) : 0;

        const product = {
            product_id: p.id,
            product_name: p.name,
            category: p.category_slug || 'parts',
            sub_category: p.category_name || 'General',
            vehicle_type: 'Motorbike',
            compatible_brand: p.brand || 'Honda',
            compatible_model: 'Universal',
            engine_capacity: 'Universal',
            price: actualPrice,
            original_price: originalPrice,
            discount_percentage: discountPercent,
            stock: p.stock,
            stock_status: status,
            description: p.description || '',
            product_image: p.images && p.images.length > 0 ? p.images[0] : '',
            images: p.images || [],
            tags: [],
            sku: p.sku
        };

        res.json(product);
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ error: 'Failed to fetch product' });
    }
});

// GET /api/products
router.get('/', async (req, res) => {
    try {
        const {
            page = 1,
            limit = 12,
            category,
            brand,
            minPrice,
            maxPrice,
            search,
            stock_status
        } = req.query;

        const offset = (Number(page) - 1) * Number(limit);
        const params: any[] = [];
        let paramIndex = 1;

        let baseQuery = `
            FROM products p
            LEFT JOIN categories c ON p."categoryId" = c.id
            WHERE 1=1
        `;

        if (search) {
            baseQuery += ` AND p.name ILIKE $${paramIndex++}`;
            params.push(`%${search}%`);
        }

        if (category && category !== 'all') {
            baseQuery += ` AND (
                c.slug = $${paramIndex} OR c.id = $${paramIndex}
                OR c."parentId" = $${paramIndex}
                OR c."parentId" IN (SELECT id FROM categories WHERE slug = $${paramIndex})
            )`;
            params.push(category);
            paramIndex++;
        }

        if (brand && brand !== 'all') {
            baseQuery += ` AND p.brand = $${paramIndex++}`;
            params.push(brand);
        }

        if (minPrice) {
            baseQuery += ` AND p.price >= $${paramIndex++}`;
            params.push(Number(minPrice));
        }
        if (maxPrice) {
            baseQuery += ` AND p.price <= $${paramIndex++}`;
            params.push(Number(maxPrice));
        }

        if (stock_status) {
            if (stock_status === 'in_stock') {
                baseQuery += ` AND p.stock > 10`;
            } else if (stock_status === 'low_stock') {
                baseQuery += ` AND p.stock > 0 AND p.stock <= 10`;
            } else if (stock_status === 'out_of_stock') {
                baseQuery += ` AND (p.stock <= 0 OR p.stock IS NULL)`;
            }
        }

        const countResult = await sql.query(`SELECT COUNT(*) ${baseQuery}`, params);
        const total = parseInt(countResult.rows[0].count);

        const dataQuery = `
            SELECT p.id, p.name, p."categoryId", p.brand, p.price, p."salePrice", p.stock, p.images, p.description,
                   c.name as category_name, c.slug as category_slug
            ${baseQuery}
            ORDER BY p."createdAt" DESC
            LIMIT $${paramIndex++} OFFSET $${paramIndex++}
        `;

        params.push(Number(limit), offset);

        const { rows: products } = await sql.query(dataQuery, params);

        const mappedProducts = products.map(p => {
            let status = 'out_of_stock';
            if (p.stock > 10) status = 'in_stock';
            else if (p.stock > 0) status = 'low_stock';

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
                price: actualPrice,
                original_price: originalPrice,
                discount_percentage: discountPercent,
                stock: p.stock,
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

// POST /api/products
router.post('/', async (req, res) => {
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

        let categoryId;
        if (category) {
            const { rows: existingCats } = await client.query('SELECT id FROM categories WHERE name = $1', [category]);
            if (existingCats.length > 0) {
                categoryId = existingCats[0].id;
            } else {
                const slug = category.toLowerCase()
                    .replace(/đ/g, 'd')
                    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                    .replace(/[^a-z0-9]/g, '-')
                    .replace(/-+/g, '-')
                    .replace(/^-|-$/g, '');

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

        const insertQuery = `
            INSERT INTO products (
                id, name, slug, brand, "categoryId", description, price, "salePrice", stock, images, "isActive", "createdAt", "updatedAt"
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING *
        `;
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

// PUT /api/products/:id
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

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

// DELETE /api/products/:id
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await sql.query('DELETE FROM products WHERE id = $1 RETURNING id', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: 'Failed to delete product' });
    }
});

export default router;

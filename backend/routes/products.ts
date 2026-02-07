import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../db';

const router = express.Router();

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

        // Filter: Stock Status
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

router.put('/:id', async (req, res) => {
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
        }

        let salePrice = null;
        if (discount_percentage !== undefined) {
            salePrice = parseFloat(price) * (1 - parseFloat(discount_percentage) / 100);
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

router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM products WHERE id = $1', [id]);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: 'Failed to delete product' });
    }
});

export default router;

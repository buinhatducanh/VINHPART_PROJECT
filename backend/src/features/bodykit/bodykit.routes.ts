import { Router } from 'express';
import { pool } from '../../shared/database';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.get('/vehicles', async (req, res) => {
    try {
        const { page = 1, limit = 12, brand, search } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        const params: any[] = [];
        let paramIndex = 1;

        let whereClause = `WHERE v."isActive" = true AND EXISTS (
            SELECT 1 FROM body_kit_parts bkp WHERE bkp."vehicleId" = v.id
        )`;

        if (brand && brand !== 'all') {
            whereClause += ` AND v.brand = $${paramIndex++}`;
            params.push(brand);
        }

        if (search) {
            whereClause += ` AND (v.name ILIKE $${paramIndex} OR v.brand ILIKE $${paramIndex} OR v.model ILIKE $${paramIndex})`;
            params.push(`%${search}%`);
            paramIndex++;
        }

        const countResult = await pool.query(
            `SELECT COUNT(*) FROM vehicles v ${whereClause}`,
            params
        );
        const total = parseInt(countResult.rows[0].count);

        const dataQuery = `
            SELECT v.*,
                   COUNT(bkp.id)::int AS parts_count,
                   COALESCE(SUM(p.price), 0) AS total_price
            FROM vehicles v
            LEFT JOIN body_kit_parts bkp ON bkp."vehicleId" = v.id
            LEFT JOIN products p ON p.id = bkp."productId"
            ${whereClause}
            GROUP BY v.id
            ORDER BY v."createdAt" DESC
            LIMIT $${paramIndex++} OFFSET $${paramIndex++}
        `;
        params.push(Number(limit), offset);

        const { rows } = await pool.query(dataQuery, params);

        const vehicles = rows.map(v => ({
            id: v.id,
            name: v.name,
            slug: v.slug,
            brand: v.brand,
            model: v.model,
            year: v.year,
            image: v.image,
            description: v.description,
            partsCount: v.parts_count,
            totalPrice: Number(v.total_price),
            createdAt: v.createdAt,
        }));

        res.json({
            data: vehicles,
            metadata: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / Number(limit)),
            },
        });
    } catch (error) {
        console.error('Error fetching bodykit vehicles:', error);
        res.status(500).json({ error: 'Failed to fetch vehicles' });
    }
});

router.get('/vehicles/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const vehicleResult = await pool.query(
            `SELECT * FROM vehicles WHERE id = $1 AND "isActive" = true`,
            [id]
        );

        if (vehicleResult.rows.length === 0) {
            return res.status(404).json({ error: 'Vehicle not found' });
        }

        const vehicle = vehicleResult.rows[0];

        const partsResult = await pool.query(
            `SELECT bkp.id AS body_kit_part_id,
                    bkp.position,
                    bkp."sortOrder",
                    p.id AS product_id,
                    p.name,
                    p.price,
                    p."salePrice",
                    p.stock,
                    p.images,
                    p.description,
                    p.brand,
                    p.sku
             FROM body_kit_parts bkp
             JOIN products p ON p.id = bkp."productId"
             WHERE bkp."vehicleId" = $1
             ORDER BY bkp."sortOrder" ASC, p.name ASC`,
            [id]
        );

        const parts = partsResult.rows.map(p => {
            const actualPrice = p.salePrice ? Number(p.salePrice) : Number(p.price);
            const originalPrice = Number(p.price);
            const discountPercent = p.salePrice
                ? Math.round(((originalPrice - Number(p.salePrice)) / originalPrice) * 100)
                : 0;

            let stockStatus = 'out_of_stock';
            if (p.stock > 10) stockStatus = 'in_stock';
            else if (p.stock > 0) stockStatus = 'low_stock';

            return {
                bodyKitPartId: p.body_kit_part_id,
                position: p.position,
                sortOrder: p.sortOrder,
                product: {
                    product_id: p.product_id,
                    product_name: p.name,
                    price: actualPrice,
                    original_price: originalPrice,
                    discount_percentage: discountPercent,
                    stock: p.stock,
                    stock_status: stockStatus,
                    product_image: p.images && p.images.length > 0 ? p.images[0] : '',
                    images: p.images || [],
                    description: p.description || '',
                    brand: p.brand || '',
                    sku: p.sku,
                },
            };
        });

        const totalPrice = parts.reduce((sum: number, p: any) => sum + p.product.price, 0);

        res.json({
            vehicle: {
                id: vehicle.id,
                name: vehicle.name,
                slug: vehicle.slug,
                brand: vehicle.brand,
                model: vehicle.model,
                year: vehicle.year,
                image: vehicle.image,
                description: vehicle.description,
            },
            parts,
            totalPrice,
        });
    } catch (error) {
        console.error('Error fetching bodykit detail:', error);
        res.status(500).json({ error: 'Failed to fetch bodykit detail' });
    }
});

router.post('/vehicles', async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const { name, brand, model, year, image, description } = req.body;

        if (!name || !brand || !model) {
            return res.status(400).json({ error: 'name, brand, and model are required' });
        }

        const id = uuidv4();
        const now = new Date();
        const slug = `${brand}-${model}-${name}`
            .toLowerCase()
            .replace(/đ/g, 'd')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '')
            + '-' + Date.now();

        const { rows } = await client.query(
            `INSERT INTO vehicles (id, name, slug, brand, model, year, image, description, "isActive", "createdAt", "updatedAt")
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, $9, $9)
             RETURNING *`,
            [id, name, slug, brand, model, year || null, image || null, description || null, now]
        );

        await client.query('COMMIT');
        res.status(201).json(rows[0]);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating vehicle:', error);
        res.status(500).json({ error: 'Failed to create vehicle' });
    } finally {
        client.release();
    }
});

router.put('/vehicles/:id', async (req, res) => {
    const { id } = req.params;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const { name, brand, model, year, image, description, isActive } = req.body;

        const existing = await client.query('SELECT * FROM vehicles WHERE id = $1', [id]);
        if (existing.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Vehicle not found' });
        }

        const now = new Date();
        const fields: string[] = ['"updatedAt" = $1'];
        const params: any[] = [now];
        let idx = 2;

        if (name !== undefined) { fields.push(`name = $${idx++}`); params.push(name); }
        if (brand !== undefined) { fields.push(`brand = $${idx++}`); params.push(brand); }
        if (model !== undefined) { fields.push(`model = $${idx++}`); params.push(model); }
        if (year !== undefined) { fields.push(`year = $${idx++}`); params.push(year); }
        if (image !== undefined) { fields.push(`image = $${idx++}`); params.push(image); }
        if (description !== undefined) { fields.push(`description = $${idx++}`); params.push(description); }
        if (isActive !== undefined) { fields.push(`"isActive" = $${idx++}`); params.push(isActive); }

        params.push(id);
        const { rows } = await client.query(
            `UPDATE vehicles SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
            params
        );

        await client.query('COMMIT');
        res.json(rows[0]);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error updating vehicle:', error);
        res.status(500).json({ error: 'Failed to update vehicle' });
    } finally {
        client.release();
    }
});

router.delete('/vehicles/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM vehicles WHERE id = $1 RETURNING id', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Vehicle not found' });
        }
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting vehicle:', error);
        res.status(500).json({ error: 'Failed to delete vehicle' });
    }
});

router.post('/vehicles/:vehicleId/parts', async (req, res) => {
    const { vehicleId } = req.params;
    const { productIds, position } = req.body;

    if (!Array.isArray(productIds) || productIds.length === 0) {
        return res.status(400).json({ error: 'productIds array is required' });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const vehicleCheck = await client.query('SELECT id FROM vehicles WHERE id = $1', [vehicleId]);
        if (vehicleCheck.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Vehicle not found' });
        }

        const maxOrderResult = await client.query(
            `SELECT COALESCE(MAX("sortOrder"), -1) AS max_order FROM body_kit_parts WHERE "vehicleId" = $1`,
            [vehicleId]
        );
        let currentOrder = maxOrderResult.rows[0].max_order + 1;

        const inserted: any[] = [];
        for (const productId of productIds) {
            const productCheck = await client.query('SELECT id FROM products WHERE id = $1', [productId]);
            if (productCheck.rows.length === 0) continue;

            const existsCheck = await client.query(
                `SELECT id FROM body_kit_parts WHERE "vehicleId" = $1 AND "productId" = $2`,
                [vehicleId, productId]
            );
            if (existsCheck.rows.length > 0) continue;

            const id = uuidv4();
            const now = new Date();
            const { rows } = await client.query(
                `INSERT INTO body_kit_parts (id, "vehicleId", "productId", position, "sortOrder", "createdAt")
                 VALUES ($1, $2, $3, $4, $5, $6)
                 RETURNING *`,
                [id, vehicleId, productId, position || null, currentOrder++, now]
            );
            inserted.push(rows[0]);
        }

        await client.query('COMMIT');
        res.status(201).json({ added: inserted.length, parts: inserted });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error adding parts to bodykit:', error);
        res.status(500).json({ error: 'Failed to add parts' });
    } finally {
        client.release();
    }
});

router.delete('/vehicles/:vehicleId/parts/:productId', async (req, res) => {
    const { vehicleId, productId } = req.params;
    try {
        const result = await pool.query(
            `DELETE FROM body_kit_parts WHERE "vehicleId" = $1 AND "productId" = $2 RETURNING id`,
            [vehicleId, productId]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Part not found in this bodykit' });
        }
        res.json({ success: true });
    } catch (error) {
        console.error('Error removing part from bodykit:', error);
        res.status(500).json({ error: 'Failed to remove part' });
    }
});

router.get('/vehicles-admin', async (_req, res) => {
    try {
        const { rows } = await pool.query(
            `SELECT v.*,
                    COUNT(bkp.id)::int AS parts_count
             FROM vehicles v
             LEFT JOIN body_kit_parts bkp ON bkp."vehicleId" = v.id
             GROUP BY v.id
             ORDER BY v."createdAt" DESC`
        );

        const vehicles = rows.map(v => ({
            id: v.id,
            name: v.name,
            slug: v.slug,
            brand: v.brand,
            model: v.model,
            year: v.year,
            image: v.image,
            description: v.description,
            isActive: v.isActive,
            partsCount: v.parts_count,
            createdAt: v.createdAt,
        }));

        res.json(vehicles);
    } catch (error) {
        console.error('Error fetching admin vehicles:', error);
        res.status(500).json({ error: 'Failed to fetch vehicles' });
    }
});

export default router;

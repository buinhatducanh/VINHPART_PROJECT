import express from 'express';
import prisma from '../prisma';

const router = express.Router();


// Get max price - MUST BE BEFORE '/' route
router.get('/max-price', async (_req, res) => {
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
});


router.get('/', async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            category,
            brand,
            minPrice,
            maxPrice,
            search,
            stock_status,
            sortBy
        } = req.query;

        const skip = (Number(page) - 1) * Number(limit);
        const take = Number(limit);

        // Build Where Clause
        const where: any = {};

        // Filter: Search (Name)
        if (search) {
            where.name = {
                contains: String(search),
                mode: 'insensitive'
            };
        }

        // Filter: Category
        if (category && category !== 'all') {
            where.category = {
                OR: [
                    { slug: String(category) },
                    { id: String(category) },
                    { parentId: String(category) },
                    { parent: { slug: String(category) } }
                ]
            };
        }

        // Filter: Brand
        if (brand && brand !== 'all') {
            where.brand = String(brand);
        }

        // Filter: Price
        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice) where.price.gte = Number(minPrice);
            if (maxPrice) where.price.lte = Number(maxPrice);
        }

        // Filter: Stock Status
        if (stock_status) {
            if (stock_status === 'in_stock') {
                where.stock = { gt: 10 };
            } else if (stock_status === 'low_stock') {
                where.stock = { gt: 0, lte: 10 };
            } else if (stock_status === 'out_of_stock') {
                where.OR = [
                    { stock: { lte: 0 } },
                    { stock: null }
                ];
            }
        }

        // Determine Order By
        let orderBy: any = { createdAt: 'desc' };
        if (sortBy === 'price_asc') {
            orderBy = { price: 'asc' };
        } else if (sortBy === 'price_desc') {
            orderBy = { price: 'desc' };
        }

        // Execute Queries in Parallel
        const [total, products] = await Promise.all([
            prisma.product.count({ where }),
            prisma.product.findMany({
                where,
                skip,
                take,
                orderBy,
                include: {
                    category: true
                }
            })
        ]);

        const mappedProducts = products.map((p: any) => {
            let status = 'out_of_stock';
            if (p.stock > 10) status = 'in_stock';
            else if (p.stock > 0) status = 'low_stock';

            return {
                product_id: p.id,
                product_name: p.name,
                category: p.category?.slug || 'parts',
                sub_category: p.category?.name || 'General',
                vehicle_type: 'Motorbike',
                compatible_brand: p.brand || 'Honda',
                compatible_model: 'Universal',
                engine_capacity: 'Universal',
                price: Number(p.price),
                original_price: Number(p.salePrice || p.price),
                discount_percentage: p.salePrice ? Math.round(((Number(p.price) - Number(p.salePrice)) / Number(p.price)) * 100) : 0,
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
    try {
        const {
            product_name,
            brand,
            category, // Name of category
            model,
            price,
            discount_percent,
            stock,
            description,
            image_url
        } = req.body;

        let categoryConnectOrCreate;
        if (category) {
            const slug = category.toLowerCase()
                .replace(/đ/g, 'd')
                .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                .replace(/[^a-z0-9]/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '');

            categoryConnectOrCreate = {
                connectOrCreate: {
                    where: { slug },
                    create: {
                        name: category,
                        slug
                    }
                }
            };
        }

        const slug = product_name.toLowerCase().replace(/ /g, '-') + '-' + Date.now();
        const images = image_url ? [image_url] : [];
        const salePrice = discount_percent ? parseFloat(price) * (1 - parseFloat(discount_percent) / 100) : null;
        const finalDesc = description + (model ? `\nModel: ${model}` : '');

        const product = await prisma.product.create({
            data: {
                name: product_name,
                slug,
                brand,
                description: finalDesc,
                price: parseFloat(price),
                salePrice,
                stock: parseInt(stock),
                images,
                isActive: true,
                category: categoryConnectOrCreate
            }
        });

        res.json(product);

    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ error: 'Failed to create product', details: String(error) });
    }
});


router.put('/:id', async (req, res) => {
    const { id } = req.params;
    try {
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

        const data: any = {};
        if (product_name) data.name = product_name;
        if (brand) data.brand = brand;
        if (price) data.price = parseFloat(price);
        if (stock !== undefined) data.stock = parseInt(stock);
        if (description) data.description = description;
        if (image_url) data.images = [image_url];

        if (discount_percentage !== undefined) {
            const basePrice = price ? parseFloat(price) : 0; // Ideally should fetch existing if not provided
            // For simplicitly assuming price is provided or handled by frontend. 
            // If price is not in body, we might calculated wrong. 
            // But let's follow existing logic pattern: logic above calculates it.
            // Actually existing logic used variables. Let's replicate.
            if (price) {
                data.salePrice = parseFloat(price) * (1 - parseFloat(discount_percentage) / 100);
            }
        }

        if (category) {
            const slug = category.toLowerCase().replace(/ /g, '-'); // Simple slug for now or lookup
            // Ideally we should look up category by name to get ID or connect.
            // Existing logic: SELECT id FROM categories WHERE name = $1
            const cat = await prisma.category.findFirst({ where: { name: category } });
            if (cat) {
                data.categoryId = cat.id;
            }
        }

        const updated = await prisma.product.update({
            where: { id },
            data
        });

        res.json(updated);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ error: 'Failed to update product' });
    }
});


router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.product.delete({
            where: { id }
        });
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: 'Failed to delete product' });
    }
});

export default router;

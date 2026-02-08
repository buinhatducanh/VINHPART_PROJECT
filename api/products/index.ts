import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL!;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter }).$extends(withAccelerate());

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method === 'GET') {
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

            const where: any = {};

            if (search) {
                where.name = {
                    contains: String(search),
                    mode: 'insensitive'
                };
            }

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

            if (brand && brand !== 'all') {
                where.brand = String(brand);
            }

            if (minPrice || maxPrice) {
                where.price = {};
                if (minPrice) where.price.gte = Number(minPrice);
                if (maxPrice) where.price.lte = Number(maxPrice);
            }

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

            let orderBy: any = { createdAt: 'desc' };
            if (sortBy === 'price_asc') {
                orderBy = { price: 'asc' };
            } else if (sortBy === 'price_desc') {
                orderBy = { price: 'desc' };
            }

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
    } else if (req.method === 'POST') {
        try {
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
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}

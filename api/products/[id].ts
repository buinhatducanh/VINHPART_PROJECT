import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL!;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter }).$extends(withAccelerate());

// Helper to delete cloudinary images
async function deleteCloudinaryImage(imageUrl: string) {
    if (!imageUrl.includes('cloudinary')) return;

    const parts = imageUrl.split('/');
    const filename = parts.pop();
    const folder = parts.pop();
    if (filename && folder) {
        const publicId = `${folder}/${filename.split('.')[0]}`;
        // Note: deleteImage from cloudinary lib needs to be imported or called via API
        // For now, we'll skip actual deletion in serverless
        console.log('Would delete:', publicId);
    }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const { id } = req.query;

    if (req.method === 'PUT') {
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

            if (image_url) {
                const existingProduct = await prisma.product.findUnique({
                    where: { id: String(id) },
                    select: { images: true }
                });

                if (existingProduct && existingProduct.images && existingProduct.images.length > 0) {
                    const oldUrl = existingProduct.images[0];
                    if (oldUrl && oldUrl !== image_url) {
                        await deleteCloudinaryImage(oldUrl);
                    }
                }
                data.images = [image_url];
            }

            if (discount_percentage !== undefined && price) {
                data.salePrice = parseFloat(price) * (1 - parseFloat(discount_percentage) / 100);
            }

            if (category) {
                const cat = await prisma.category.findFirst({ where: { name: category } });
                if (cat) {
                    data.categoryId = cat.id;
                }
            }

            const updated = await prisma.product.update({
                where: { id: String(id) },
                data
            });

            res.json(updated);
        } catch (error) {
            console.error('Error updating product:', error);
            res.status(500).json({ error: 'Failed to update product' });
        }
    } else if (req.method === 'DELETE') {
        try {
            const product = await prisma.product.findUnique({
                where: { id: String(id) },
                select: { images: true }
            });

            if (product && product.images && product.images.length > 0) {
                for (const imageUrl of product.images) {
                    await deleteCloudinaryImage(imageUrl);
                }
            }

            await prisma.product.delete({
                where: { id: String(id) }
            });
            res.json({ success: true });
        } catch (error) {
            console.error('Error deleting product:', error);
            res.status(500).json({ error: 'Failed to delete product' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}

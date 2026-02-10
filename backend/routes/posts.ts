import express from 'express';
import prisma from '../prisma';

const router = express.Router();

// GET all posts
router.get('/', async (req, res) => {
    try {
        const { status, limit = 50 } = req.query;

        const where: any = {};
        if (status) {
            where.status = status;
        }

        const posts = await prisma.post.findMany({
            where,
            take: Number(limit),
            orderBy: [
                { publishedAt: 'desc' },
                { createdAt: 'desc' }
            ],
            select: {
                id: true,
                title: true,
                slug: true,
                excerpt: true,
                content: true,
                featuredImage: true,
                metaTitle: true,
                metaDescription: true,
                ogImage: true,
                status: true,
                publishedAt: true,
                viewCount: true,
                createdAt: true,
                updatedAt: true
            }
        });

        res.json(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
});

// GET single post by slug
router.get('/:slug', async (req, res) => {
    try {
        const { slug } = req.params;

        const post = await prisma.post.findUnique({
            where: { slug }
        });

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Increment view count
        await prisma.post.update({
            where: { slug },
            data: {
                viewCount: {
                    increment: 1
                }
            }
        });

        res.json(post);
    } catch (error) {
        console.error('Error fetching post:', error);
        res.status(500).json({ error: 'Failed to fetch post' });
    }
});

// POST create post
router.post('/', async (req, res) => {
    try {
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
            return res.status(400).json({ error: 'Title, slug, and content required' });
        }

        const post = await prisma.post.create({
            data: {
                title,
                slug,
                excerpt,
                content,
                featuredImage,
                metaTitle,
                metaDescription,
                ogImage,
                status,
                publishedAt: status === 'PUBLISHED' ? new Date() : null,
                viewCount: 0
            }
        });

        res.status(201).json(post);
    } catch (error: any) {
        if (error.code === 'P2002') {
            return res.status(409).json({ error: 'Slug already exists' });
        }
        console.error('Error creating post:', error);
        res.status(500).json({ error: 'Failed to create post' });
    }
});

// PUT update post
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            title,
            slug,
            excerpt,
            content,
            featuredImage,
            metaTitle,
            metaDescription,
            ogImage,
            status
        } = req.body;

        // Check if exists
        const existing = await prisma.post.findUnique({ where: { id } });
        if (!existing) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Build update data
        const data: any = {};
        if (title !== undefined) data.title = title;
        if (slug !== undefined) data.slug = slug;
        if (excerpt !== undefined) data.excerpt = excerpt;
        if (content !== undefined) data.content = content;
        if (featuredImage !== undefined) data.featuredImage = featuredImage;
        if (metaTitle !== undefined) data.metaTitle = metaTitle;
        if (metaDescription !== undefined) data.metaDescription = metaDescription;
        if (ogImage !== undefined) data.ogImage = ogImage;

        if (status) {
            data.status = status;
            // Set publishedAt if transitioning to PUBLISHED
            if (status === 'PUBLISHED' && existing.status !== 'PUBLISHED') {
                data.publishedAt = new Date();
            }
        }

        const post = await prisma.post.update({
            where: { id },
            data
        });

        res.json(post);
    } catch (error: any) {
        if (error.code === 'P2002') {
            return res.status(409).json({ error: 'Slug already exists' });
        }
        console.error('Error updating post:', error);
        res.status(500).json({ error: 'Failed to update post' });
    }
});

// DELETE post
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.post.delete({
            where: { id }
        });

        res.status(204).send();
    } catch (error: any) {
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Post not found' });
        }
        console.error('Error deleting post:', error);
        res.status(500).json({ error: 'Failed to delete post' });
    }
});

export default router;

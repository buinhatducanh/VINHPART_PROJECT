import { Router } from 'express';
import cloudinary from '../../shared/cloudinary';

const router = Router();

// GET /api/upload/signature
router.get('/signature', (req, res) => {
    try {
        const params = req.query;
        const signature = cloudinary.utils.api_sign_request(
            params as Record<string, any>,
            process.env.CLOUDINARY_API_SECRET!
        );
        res.json({ signature });
    } catch (error) {
        console.error('Error generating signature:', error);
        res.status(500).json({ error: 'Failed to generate signature' });
    }
});

export default router;

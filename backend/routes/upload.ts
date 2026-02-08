
import express from 'express';
import { generateSignature } from '../lib/cloudinary';

const router = express.Router();

router.get('/signature', (req, res) => {
    try {
        const params = req.query;
        // Filter out irrelevant params if needed, but Cloudinary usually sends exact params to sign.
        // The widget sends timestamp, source, etc.
        // We need to pass them to api_sign_request.

        // Remove 'callback' or other non-cloudinary params if any. 
        // req.query is mainly string. Cloudinary expects object.

        const signature = generateSignature(params);
        res.json({ signature });
    } catch (error) {
        console.error('Error generating signature:', error);
        res.status(500).json({ error: 'Failed to generate signature' });
    }
});

export default router;

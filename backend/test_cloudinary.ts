
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

async function testConnection() {
    console.log('Testing Cloudinary Connection...');
    console.log(`Cloud Name: ${process.env.CLOUDINARY_CLOUD_NAME}`);

    try {
        // 1. Get Account Details (Ping)
        const ping = await cloudinary.api.ping();
        console.log('✅ Connection Successful:', ping);

        // 2. Upload a test image from URL
        console.log('Attemping upload...');
        const uploadResult = await cloudinary.uploader.upload('https://placehold.co/100x100.png', {
            folder: 'vinhpart_test',
            public_id: 'test_connection_image'
        });
        console.log('✅ Upload Successful:', uploadResult.secure_url);

        // 3. Delete the test image
        console.log('Cleaning up...');
        const deleteResult = await cloudinary.uploader.destroy(uploadResult.public_id);
        console.log('✅ Delete Successful:', deleteResult);

        console.log('🎉 Cloudinary is fully functional!');

    } catch (error) {
        console.error('❌ Cloudinary Error:', error);
    }
}

testConnection();


import pg from 'pg';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

dotenv.config();

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const reviewsData = [
    {
        customer_name: 'Nguyễn Văn A',
        customer_email: 'nguyenvana@email.com',
        rating: 5,
        title: 'Sản phẩm rất tốt, sáng đẹp',
        content: 'Đèn sáng hơn nhiều so với đèn zin, lắp vào vừa khít, chất lượng tốt. Rất đáng tiền. Sẽ ủng hộ shop lần sau.',
        status: 'approved',
        is_verified_purchase: true,
        priority: 10,
        helpful_count: 24
    },
    {
        customer_name: 'Trần Thị B',
        customer_email: 'tranthib@email.com',
        rating: 4,
        title: 'Chất lượng ổn, giá hợp lý',
        content: 'Sản phẩm dùng ổn, không có gì phàn nàn. Giao hàng hơi chậm một chút nhưng đóng gói kỹ.',
        status: 'approved',
        is_verified_purchase: true,
        priority: 5,
        helpful_count: 12
    },
    {
        customer_name: 'Lê Văn C',
        customer_email: 'levanc@email.com',
        rating: 3,
        title: 'Bình thường',
        content: 'Sản phẩm ok nhưng không thần thánh như quảng cáo. Dùng tạm được.',
        status: 'pending',
        is_verified_purchase: false,
        priority: 0,
        helpful_count: 3
    },
    {
        customer_name: 'Phạm Thị D',
        customer_email: 'phamthid@email.com',
        rating: 5,
        title: 'Tuyệt vời',
        content: 'Chính hãng 100%, check mã vạch ra ngay. Shop tư vấn rất nhiệt tình, sẽ giới thiệu cho bạn bè.',
        status: 'approved',
        is_verified_purchase: true,
        priority: 8,
        helpful_count: 18
    },
    {
        customer_name: 'Hoàng Văn E',
        customer_email: 'hoangvane@email.com',
        rating: 2,
        title: 'Không như mong đợi',
        content: 'Hàng nhìn hơi dại, không sắc nét như ảnh. Chưa dùng thử nhưng cảm quan ban đầu không ưng lắm.',
        status: 'rejected',
        is_verified_purchase: false,
        priority: 0,
        helpful_count: 1
    },
    {
        customer_name: 'Ngô Kiến H',
        customer_email: 'ngokienh@email.com',
        rating: 5,
        title: 'Đáng đồng tiền bát gạo',
        content: 'Mua lần 2 rồi, vẫn rất hài lòng. Đồ bền, đẹp, giá cả cạnh tranh.',
        status: 'approved',
        is_verified_purchase: true,
        priority: 2,
        helpful_count: 5
    },
    {
        customer_name: 'Đặng Thu T',
        customer_email: 'dangthut@email.com',
        rating: 4,
        title: 'Tốt',
        content: 'Giao hàng nhanh, sản phẩm đúng mô tả.',
        status: 'pending',
        is_verified_purchase: true,
        priority: 0,
        helpful_count: 0
    }
];

async function seed() {
    try {
        console.log('Fetching products...');
        const productRes = await pool.query('SELECT id, name FROM products LIMIT 20');
        const products = productRes.rows;

        if (products.length === 0) {
            console.log('No products found. Cannot seed reviews.');
            process.exit(1);
        }

        console.log(`Found ${products.length} products. Seeding reviews...`);

        for (const review of reviewsData) {
            // Pick a random product
            const randomProduct = products[Math.floor(Math.random() * products.length)];
            
            const id = uuidv4();
            const now = new Date();
            // Random date within last 30 days
            const randomDate = new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000));

            await pool.query(`
                INSERT INTO reviews (
                    id, "productId", "customerName", "customerEmail", rating, title, content, status, "isVerifiedPurchase", priority, "helpfulCount", "createdAt", "updatedAt"
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            `, [
                id,
                randomProduct.id,
                review.customer_name,
                review.customer_email,
                review.rating,
                review.title,
                review.content,
                review.status,
                review.is_verified_purchase,
                review.priority,
                review.helpful_count,
                randomDate,
                randomDate
            ]);

            console.log(`Created review for product "${randomProduct.name}" by ${review.customer_name}`);
        }

        console.log('✅ Seeding complete!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error seeding reviews:', err);
        process.exit(1);
    }
}

seed();

import { Router } from 'express';
import { pool } from '../../shared/database';

const router = Router();

router.get('/stats', async (_req, res) => {
    try {
        const [productCount, categoryCount, pendingOrderCount, totalOrderCount, totalRevenue, vehicleCount] = await Promise.all([
            pool.query('SELECT COUNT(*)::int AS count FROM products'),
            pool.query('SELECT COUNT(*)::int AS count FROM categories'),
            pool.query("SELECT COUNT(*)::int AS count FROM orders WHERE status = 'PENDING'"),
            pool.query('SELECT COUNT(*)::int AS count FROM orders'),
            pool.query("SELECT COALESCE(SUM(\"totalAmount\"), 0)::numeric AS total FROM orders WHERE status != 'CANCELLED'"),
            pool.query('SELECT COUNT(*)::int AS count FROM vehicles WHERE "isActive" = true'),
        ]);

        res.json({
            products: productCount.rows[0].count,
            categories: categoryCount.rows[0].count,
            orders: pendingOrderCount.rows[0].count,
            totalOrders: totalOrderCount.rows[0].count,
            totalRevenue: Number(totalRevenue.rows[0].total),
            vehicles: vehicleCount.rows[0].count,
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/statistics', async (req, res) => {
    try {
        const { range = 'month' } = req.query;

        let dateInterval: string;
        let prevDateStart: string;
        let prevDateEnd: string;
        let groupFormat: string;
        let labelFormat: string;

        if (range === 'week') {
            dateInterval = '7 days';
            prevDateStart = '14 days';
            prevDateEnd = '7 days';
            groupFormat = "TO_CHAR(o.\"createdAt\", 'YYYY-MM-DD')";
            labelFormat = "TO_CHAR(o.\"createdAt\", 'DD/MM')";
        } else if (range === 'year') {
            dateInterval = '12 months';
            prevDateStart = '24 months';
            prevDateEnd = '12 months';
            groupFormat = "TO_CHAR(o.\"createdAt\", 'YYYY-MM')";
            labelFormat = "TO_CHAR(o.\"createdAt\", 'MM/YYYY')";
        } else {
            dateInterval = '30 days';
            prevDateStart = '60 days';
            prevDateEnd = '30 days';
            groupFormat = "TO_CHAR(o.\"createdAt\", 'YYYY-MM-DD')";
            labelFormat = "TO_CHAR(o.\"createdAt\", 'DD/MM')";
        }

        const revenueQuery = `
            SELECT
                ${groupFormat} AS period,
                ${labelFormat} AS label,
                COALESCE(SUM(o."totalAmount"), 0)::numeric AS revenue,
                COUNT(o.id)::int AS orders
            FROM orders o
            WHERE o."createdAt" >= NOW() - INTERVAL '${dateInterval}' AND o.status != 'CANCELLED'
            GROUP BY period, label
            ORDER BY period ASC
        `;

        const topProductsQuery = `
            SELECT
                p.name,
                SUM(oi.quantity)::int AS sales,
                SUM(oi.price * oi.quantity)::numeric AS revenue
            FROM order_items oi
            JOIN products p ON p.id = oi."productId"
            JOIN orders o ON o.id = oi."orderId"
            WHERE o.status != 'CANCELLED'
            GROUP BY p.id, p.name
            ORDER BY sales DESC
            LIMIT 5
        `;

        const categoryDistributionQuery = `
            SELECT
                COALESCE(c.name, 'Khác') AS name,
                SUM(oi.quantity)::int AS value
            FROM order_items oi
            JOIN products p ON p.id = oi."productId"
            LEFT JOIN categories c ON c.id = p."categoryId"
            JOIN orders o ON o.id = oi."orderId"
            WHERE o.status != 'CANCELLED'
            GROUP BY c.id, c.name
            ORDER BY value DESC
            LIMIT 6
        `;

        const ordersByStatusQuery = `
            SELECT status, COUNT(*)::int AS count
            FROM orders
            GROUP BY status
        `;

        const summaryQuery = `
            SELECT
                COALESCE(SUM(o."totalAmount"), 0)::numeric AS total_revenue,
                COUNT(o.id)::int AS total_orders,
                CASE WHEN COUNT(o.id) > 0
                    THEN (SUM(o."totalAmount") / COUNT(o.id))::numeric
                    ELSE 0
                END AS avg_order_value,
                COUNT(DISTINCT o."customerEmail")::int AS unique_customers
            FROM orders o
            WHERE o.status != 'CANCELLED'
        `;

        const prevPeriodQuery = `
            SELECT
                COALESCE(SUM(o."totalAmount"), 0)::numeric AS prev_revenue,
                COUNT(o.id)::int AS prev_orders
            FROM orders o
            WHERE o.status != 'CANCELLED'
            AND o."createdAt" >= NOW() - INTERVAL '${prevDateStart}'
            AND o."createdAt" < NOW() - INTERVAL '${prevDateEnd}'
        `;

        const reviewStatsQuery = `
            SELECT
                COUNT(*)::int AS total_reviews,
                COUNT(CASE WHEN rating >= 4 THEN 1 END)::int AS positive_reviews
            FROM reviews
            WHERE status = 'approved'
        `;

        const [revenueData, topProducts, categoryDist, ordersByStatus, summary, prevPeriod, reviewStats] = await Promise.all([
            pool.query(revenueQuery),
            pool.query(topProductsQuery),
            pool.query(categoryDistributionQuery),
            pool.query(ordersByStatusQuery),
            pool.query(summaryQuery),
            pool.query(prevPeriodQuery),
            pool.query(reviewStatsQuery),
        ]);

        const currentRevenue = Number(summary.rows[0].total_revenue);
        const previousRevenue = Number(prevPeriod.rows[0].prev_revenue);
        const revenueGrowth = previousRevenue > 0
            ? ((currentRevenue - previousRevenue) / previousRevenue * 100)
            : 0;

        const currentOrders = summary.rows[0].total_orders;
        const previousOrders = prevPeriod.rows[0].prev_orders;
        const ordersGrowth = previousOrders > 0
            ? ((currentOrders - previousOrders) / previousOrders * 100)
            : 0;

        const totalReviews = reviewStats.rows[0].total_reviews;
        const positiveReviews = reviewStats.rows[0].positive_reviews;
        const positiveRate = totalReviews > 0
            ? Math.round(positiveReviews / totalReviews * 100)
            : 0;

        const categoryColors = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#ec4899'];

        res.json({
            summary: {
                totalRevenue: currentRevenue,
                totalOrders: currentOrders,
                avgOrderValue: Number(summary.rows[0].avg_order_value),
                uniqueCustomers: summary.rows[0].unique_customers,
                revenueGrowth: Math.round(revenueGrowth * 10) / 10,
                ordersGrowth: Math.round(ordersGrowth * 10) / 10,
                positiveReviewRate: positiveRate,
            },
            revenueChart: revenueData.rows.map(r => ({
                name: r.label,
                revenue: Number(r.revenue),
                orders: r.orders,
            })),
            topProducts: topProducts.rows.map(p => ({
                name: p.name.length > 20 ? p.name.substring(0, 20) + '...' : p.name,
                fullName: p.name,
                sales: p.sales,
                revenue: Number(p.revenue),
            })),
            categoryDistribution: categoryDist.rows.map((c, i) => ({
                name: c.name,
                value: c.value,
                color: categoryColors[i % categoryColors.length],
            })),
            ordersByStatus: ordersByStatus.rows.reduce((acc: Record<string, number>, r) => {
                acc[r.status.toLowerCase()] = r.count;
                return acc;
            }, {}),
        });
    } catch (error) {
        console.error('Error fetching statistics:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;

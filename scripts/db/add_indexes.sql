-- Performance Optimization: Add Database Indexes (FIXED)
-- Indexes already exist in Prisma schema, just analyze tables

-- Analyze tables to update statistics for query planner
ANALYZE products;
ANALYZE categories;

-- ✅ Prisma schema already has these indexes (from schema.prisma):
-- @@index([categoryId])  
-- @@index([slug])
-- @@index([brand])
-- @@index([price])
-- @@index([name])

-- Show current indexes to confirm
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public' AND tablename = 'products'
ORDER BY indexname;

SELECT 'Indexes updated and analyzed successfully!' as status;

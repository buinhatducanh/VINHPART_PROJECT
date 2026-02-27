CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY,
    "productId" TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    content TEXT,
    images TEXT[], -- Array of image URLs
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    "isVerifiedPurchase" BOOLEAN DEFAULT false,
    priority INTEGER DEFAULT 0,
    "helpfulCount" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster filtering
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews("productId");
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
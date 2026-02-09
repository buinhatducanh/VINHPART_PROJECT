-- Create PostStatus enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE "PostStatus" AS ENUM ('DRAFT', 'PUBLISHED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    "featuredImage" TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "ogImage" TEXT,
    status "PostStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "authorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT posts_author_fkey FOREIGN KEY ("authorId") REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_publishedAt ON posts("publishedAt");

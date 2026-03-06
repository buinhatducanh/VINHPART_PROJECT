import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Calendar, Eye, Search } from 'lucide-react';
import { Input } from '@/shared/components/ui/input';
import { SEO } from '@/shared/components/SEO';
import { BlogPostSkeleton } from '@/shared/components/skeletons/BlogPostSkeleton';

interface BlogListPageProps {
  onBack: () => void;
  onPostClick: (postId: string) => void;
}

export function BlogListPage({ onBack, onPostClick }: BlogListPageProps) {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'latest' | 'popular'>('latest');

  // Fetch published posts from API
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch('/api/posts?status=PUBLISHED');
        if (res.ok) {
          const data = await res.json();
          setPosts(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  // Filter and sort posts
  const filteredPosts = posts
    .filter(post =>
      searchQuery === '' ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (post.excerpt && post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === 'latest') {
        return new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime();
      } else {
        return b.viewCount - a.viewCount;
      }
    });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Generate skeleton items
  const skeletonItems = Array(6).fill(0);

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <SEO
        title="Tin Tức & Kiến Thức"
        description="Cập nhật những tin tức mới nhất về xe máy, phụ tùng và hướng dẫn bảo dưỡng từ VINHPART."
      />
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-muted-foreground hover:text-red-500 transition-colors mb-6 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Quay lại trang chủ
          </button>

          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-red-500 via-red-400 to-orange-500 bg-clip-text text-transparent">
            Tin Tức & Kiến Thức
          </h1>
          <p className="text-muted-foreground text-lg">
            Khám phá các bài viết hữu ích về phụ tùng và bảo dưỡng xe máy
          </p>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 flex flex-col sm:flex-row gap-4"
        >
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Tìm kiếm bài viết..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card/50 border-border focus:border-red-500 text-foreground"
            />
          </div>

          {/* Sort */}
          <div className="flex gap-2">
            <button
              onClick={() => setSortBy('latest')}
              className={`px-4 py-2 rounded-lg transition-all ${sortBy === 'latest'
                ? 'bg-red-500 text-foreground'
                : 'bg-card/50 text-muted-foreground hover:text-foreground border border-border'
                }`}
            >
              Mới nhất
            </button>
            <button
              onClick={() => setSortBy('popular')}
              className={`px-4 py-2 rounded-lg transition-all ${sortBy === 'popular'
                ? 'bg-red-500 text-foreground'
                : 'bg-card/50 text-muted-foreground hover:text-foreground border border-border'
                }`}
            >
              Phổ biến
            </button>
          </div>
        </motion.div>

        {/* Posts Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {skeletonItems.map((_, index) => (
              <BlogPostSkeleton key={`skeleton-${index}`} />
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-muted-foreground text-lg">Không tìm thấy bài viết nào</p>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => onPostClick(post.slug)}
                className="bg-card/30 border border-border rounded-lg overflow-hidden cursor-pointer hover:border-red-500/50 transition-all group hover:shadow-lg hover:shadow-red-500/10"
              >
                {/* Featured Image */}
                {post.featuredImage && (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={post.featuredImage}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/placeholder-blog.svg';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  </div>
                )}

                {/* Content */}
                <div className="p-5">
                  <h2 className="text-xl font-bold mb-2 line-clamp-2 group-hover:text-red-500 transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>

                  {/* Meta */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3" />
                      <span>{post.publishedAt ? formatDate(post.publishedAt) : 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="w-3 h-3" />
                      <span>{post.viewCount.toLocaleString('vi-VN')}</span>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 text-center text-muted-foreground text-sm"
        >
          Hiển thị {filteredPosts.length} / {posts.length} bài viết
        </motion.div>
      </div>
    </div>
  );
}

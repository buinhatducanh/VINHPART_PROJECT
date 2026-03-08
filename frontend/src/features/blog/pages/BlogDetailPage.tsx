import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Calendar, Eye, User } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { SEO } from '@/shared/components/SEO';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { API_BASE_URL } from '@/lib/api';

interface BlogDetailPageProps {
  postId: string;
  onBack: () => void;
  onPostClick: (postId: string) => void;
}

export function BlogDetailPage({ postId, onBack, onPostClick }: BlogDetailPageProps) {
  const [post, setPost] = useState<any | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true); // Ensure loading is true on id change
        // Fetch post by slug (postId is actually slug in this case)
        const res = await fetch(`${API_BASE_URL}/posts/${postId}`);
        if (res.ok) {
          const data = await res.json();
          setPost(data);

          // Fetch related posts
          const relatedRes = await fetch(`${API_BASE_URL}/posts?status=PUBLISHED&limit=4`);
          if (relatedRes.ok) {
            const relatedData = await relatedRes.json();
            // Filter out current post and limit to 3
            const safeData = Array.isArray(relatedData) ? relatedData : [];
            const filtered = safeData.filter((p: any) => p.slug !== postId).slice(0, 3);
            setRelatedPosts(filtered);
          }
        } else {
          setPost(null);
        }
      } catch (error) {
        console.error('Failed to fetch post:', error);
        setPost(null);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [postId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Back button skeleton */}
          <Skeleton className="w-24 h-8 bg-muted mb-6" />

          {/* Image skeleton */}
          <Skeleton className="w-full h-[400px] bg-muted rounded-lg mb-8" />

          {/* Title skeleton */}
          <Skeleton className="w-3/4 h-12 bg-muted mb-4" />

          {/* Meta skeleton */}
          <div className="flex gap-4 mb-8">
            <Skeleton className="w-20 h-4 bg-muted" />
            <Skeleton className="w-32 h-4 bg-muted" />
            <Skeleton className="w-24 h-4 bg-muted" />
          </div>

          {/* Content skeleton */}
          <div className="space-y-4">
            <Skeleton className="w-full h-4 bg-muted" />
            <Skeleton className="w-full h-4 bg-muted" />
            <Skeleton className="w-5/6 h-4 bg-muted" />
            <Skeleton className="w-full h-4 bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-muted-foreground">Không tìm thấy bài viết</p>
          <Button onClick={onBack} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <SEO
        title={post.title}
        description={post.metaDescription || post.excerpt}
        image={post.featuredImage || '/favicon.svg'}
        url={window.location.href}
        type="article"
      />

      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-red-500 transition-colors mb-6 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Quay lại
        </motion.button>

        {/* Featured image */}
        {post.featuredImage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative h-[400px] rounded-lg overflow-hidden mb-8"
          >
            <img
              src={post.featuredImage}
              alt={post.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/placeholder-blog.svg';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
          </motion.div>
        )}

        {/* Article header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            {post.title}
          </h1>

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>Admin</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{post.publishedAt ? formatDate(post.publishedAt) : 'Chưa xuất bản'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              <span>{post.viewCount.toLocaleString('vi-VN')} lượt xem</span>
            </div>
          </div>
        </motion.div>

        {/* Article content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="prose prose-invert prose-lg max-w-none mb-12"
          style={{
            color: '#e5e7eb',
          }}
        >
          <div
            className="article-content"
            dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br/>') }}
            style={{
              lineHeight: '1.8',
              fontSize: '1.125rem'
            }}
          />
        </motion.div>

        {/* Related posts */}
        {relatedPosts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="border-t border-border pt-12"
          >
            <h2 className="text-2xl font-bold text-foreground mb-6">Bài viết liên quan</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <div
                  key={relatedPost.id}
                  onClick={() => onPostClick(relatedPost.slug)}
                  className="bg-card/50 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-red-500/50 transition-all group"
                >
                  <div className="h-40 overflow-hidden">
                    <img
                      src={relatedPost.featuredImage || '/placeholder-image.jpg'}
                      alt={relatedPost.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => { e.currentTarget.src = '/placeholder-blog.jpg'; }}
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-foreground font-semibold mb-2 line-clamp-2 group-hover:text-red-400 transition-colors">
                      {relatedPost.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(relatedPost.publishedAt || '')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Calendar, Eye, User } from 'lucide-react';
import { SEOPost } from '@/types';
import { mockSEOPosts } from '@/data/mockSEOPosts';
import { Button } from '@/components/ui/button';
import { SEO } from '@/components/SEO';

interface BlogDetailPageProps {
  postId: string;
  onBack: () => void;
  onPostClick: (postId: string) => void;
}

export function BlogDetailPage({ postId, onBack, onPostClick }: BlogDetailPageProps) {
  const [post, setPost] = useState<SEOPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<SEOPost[]>([]);

  useEffect(() => {
    // Tìm bài viết theo ID
    const foundPost = mockSEOPosts.find(p => p.id === postId);
    if (foundPost) {
      setPost(foundPost);

      // Tăng view count (trong thực tế sẽ gọi API)
      foundPost.view_count += 1;

      // Lấy 3 bài viết liên quan (khác bài hiện tại)
      const related = mockSEOPosts
        .filter(p => p.id !== postId && p.status === 'published')
        .slice(0, 3);
      setRelatedPosts(related);
    }
  }, [postId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!post) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-400">Không tìm thấy bài viết</p>
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
        description={post.meta_description || post.excerpt}
        image={post.featured_image || '/favicon.svg'}
        url={window.location.href}
        type="article"
      />

      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-red-500 transition-colors mb-6 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Quay lại
        </motion.button>

        {/* Featured image */}
        {post.featured_image && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative h-[400px] rounded-lg overflow-hidden mb-8"
          >
            <img
              src={post.featured_image}
              alt={post.title}
              className="w-full h-full object-cover"
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
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{post.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{post.published_at ? formatDate(post.published_at) : 'Chưa xuất bản'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              <span>{post.view_count.toLocaleString('vi-VN')} lượt xem</span>
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
            className="border-t border-gray-800 pt-12"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Bài viết liên quan</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <div
                  key={relatedPost.id}
                  onClick={() => onPostClick(relatedPost.id)}
                  className="bg-gray-900/50 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-red-500/50 transition-all group"
                >
                  <div className="h-40 overflow-hidden">
                    <img
                      src={relatedPost.featured_image || '/placeholder-image.jpg'}
                      alt={relatedPost.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-white font-semibold mb-2 line-clamp-2 group-hover:text-red-400 transition-colors">
                      {relatedPost.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(relatedPost.published_at || '')}</span>
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

import { motion } from 'motion/react';
import { FileText, ArrowLeft, Search, Edit, Trash2, Plus, Eye, Calendar } from 'lucide-react';
import { useState } from 'react';
import { SEOPost } from '@/types';

interface ManageSEOPageProps {
  onBack: () => void;
}

// Mock data
const mockSEOPosts: SEOPost[] = [
  {
    id: 'post-1',
    title: 'Top 10 phụ tùng xe máy bán chạy nhất 2025',
    slug: 'top-10-phu-tung-xe-may-ban-chay-nhat-2025',
    content: 'Nội dung chi tiết về các phụ tùng xe máy...',
    excerpt: 'Khám phá 10 phụ tùng xe máy được yêu thích nhất trong năm 2025',
    featured_image: 'https://images.unsplash.com/photo-1558980664-769d59546b3d?w=800',
    meta_title: 'Top 10 phụ tùng xe máy bán chạy | VINPART',
    meta_description: 'Danh sách 10 phụ tùng xe máy chất lượng cao được ưa chuộng nhất',
    meta_keywords: ['phụ tùng xe máy', 'phụ kiện xe máy', 'mua phụ tùng'],
    status: 'published',
    author: 'Admin VINPART',
    published_at: '2025-01-15T10:00:00Z',
    created_at: '2025-01-10T08:00:00Z',
    updated_at: '2025-01-15T10:00:00Z',
    view_count: 1234
  },
  {
    id: 'post-2',
    title: 'Hướng dẫn chọn mua đèn LED cho ô tô',
    slug: 'huong-dan-chon-mua-den-led-cho-o-to',
    content: 'Hướng dẫn chi tiết về cách chọn đèn LED phù hợp...',
    excerpt: 'Những điều cần biết khi chọn mua đèn LED cho xe ô tô',
    featured_image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800',
    meta_title: 'Hướng dẫn chọn đèn LED ô tô | VINPART',
    meta_description: 'Tất cả thông tin về đèn LED ô tô và cách chọn lựa phù hợp',
    meta_keywords: ['đèn led ô tô', 'phụ tùng ô tô', 'đèn xe hơi'],
    status: 'published',
    author: 'Admin VINPART',
    published_at: '2025-01-20T14:30:00Z',
    created_at: '2025-01-18T09:00:00Z',
    updated_at: '2025-01-20T14:30:00Z',
    view_count: 856
  },
  {
    id: 'post-3',
    title: 'Bảo dưỡng phanh xe máy định kỳ',
    slug: 'bao-duong-phanh-xe-may-dinh-ky',
    content: 'Cách bảo dưỡng hệ thống phanh xe máy...',
    excerpt: 'Hướng dẫn bảo dưỡng phanh xe máy đúng cách',
    meta_title: 'Bảo dưỡng phanh xe máy | VINPART',
    meta_description: 'Kinh nghiệm bảo dưỡng phanh xe máy an toàn và hiệu quả',
    meta_keywords: ['phanh xe máy', 'bảo dưỡng xe máy', 'sửa chữa xe'],
    status: 'draft',
    author: 'Admin VINPART',
    created_at: '2025-02-01T11:00:00Z',
    updated_at: '2025-02-03T15:00:00Z',
    view_count: 0
  },
];

export function ManageSEOPage({ onBack }: ManageSEOPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft' | 'archived'>('all');
  const [posts, setPosts] = useState<SEOPost[]>(mockSEOPosts);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [editingPost, setEditingPost] = useState<SEOPost | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || post.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = (id: string) => {
    setPosts(posts.filter(post => post.id !== id));
    setShowDeleteConfirm(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      published: 'bg-green-500/10 text-green-400 border-green-500/50',
      draft: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/50',
      archived: 'bg-gray-500/10 text-gray-400 border-gray-500/50',
    };
    const labels = {
      published: 'Đã xuất bản',
      draft: 'Nháp',
      archived: 'Lưu trữ',
    };
    return { style: styles[status as keyof typeof styles], label: labels[status as keyof typeof labels] };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black pb-20">
      {/* Animated background particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-red-600/30 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              y: [null, Math.random() * window.innerHeight],
              opacity: [0.3, 0.8, 0.3]
            }}
            transition={{
              duration: Math.random() * 5 + 3,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          />
        ))}
      </div>

      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative border-b border-gray-800 bg-black/40 backdrop-blur-xl sticky top-0 z-10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <motion.button
                onClick={onBack}
                whileHover={{ scale: 1.05, x: -5 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 bg-gray-900 border border-gray-700 rounded-lg hover:border-red-600/50 transition-all group"
              >
                <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-red-600 transition-colors" />
              </motion.button>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-transparent bg-gradient-to-r from-white via-gray-200 to-purple-600 bg-clip-text">
                    QUẢN LÝ BÀI VIẾT SEO
                  </h1>
                  <p className="text-sm text-gray-500">{posts.length} bài viết</p>
                </div>
              </div>
            </div>

            {/* Add Post Button */}
            <motion.button
              onClick={() => setShowAddModal(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg shadow-purple-600/25 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Thêm bài viết mới
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl p-4 mb-6"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm bài viết..."
                className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-600/50 focus:ring-2 focus:ring-purple-600/20 transition-all"
              />
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
              {(['all', 'published', 'draft', 'archived'] as const).map((status) => (
                <motion.button
                  key={status}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-3 rounded-lg font-semibold text-sm transition-all ${filterStatus === status
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800'
                    }`}
                >
                  {status === 'all' ? 'Tất cả' :
                    status === 'published' ? 'Đã xuất bản' :
                      status === 'draft' ? 'Nháp' : 'Lưu trữ'}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredPosts.map((post, index) => {
            const badge = getStatusBadge(post.status);
            return (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group relative bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl overflow-hidden hover:border-purple-600/50 transition-all"
              >
                {/* Featured Image */}
                {post.featured_image && (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={post.featured_image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>

                    {/* Status Badge */}
                    <div className="absolute top-4 right-4">
                      <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${badge.style}`}>
                        {badge.label}
                      </span>
                    </div>
                  </div>
                )}

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-purple-400 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {post.excerpt}
                  </p>

                  {/* Meta Info */}
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(post.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      <span>{post.view_count} lượt xem</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-4 border-t border-gray-800">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setEditingPost(post)}
                      className="flex-1 px-4 py-2 bg-purple-600/10 border border-purple-600/50 text-purple-400 rounded-lg hover:bg-purple-600/20 transition-all flex items-center justify-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Sửa
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowDeleteConfirm(post.id)}
                      className="flex-1 px-4 py-2 bg-red-600/10 border border-red-600/50 text-red-400 rounded-lg hover:bg-red-600/20 transition-all flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Xóa
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredPosts.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl p-12 text-center"
          >
            <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Không tìm thấy bài viết</h3>
            <p className="text-gray-500 mb-4">Không có bài viết nào phù hợp với bộ lọc của bạn.</p>
            <motion.button
              onClick={() => {
                setSearchQuery('');
                setFilterStatus('all');
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-gray-800 border border-gray-700 text-white rounded-lg hover:bg-gray-700 transition-all"
            >
              Xóa bộ lọc
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowDeleteConfirm(null)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-gray-900 border border-gray-700 rounded-2xl p-8 max-w-md w-full"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 to-transparent rounded-2xl"></div>

            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-white" />
              </div>

              <h3 className="text-2xl font-bold text-white text-center mb-2">Xóa bài viết</h3>
              <p className="text-gray-400 text-center mb-6">
                Bạn có chắc chắn muốn xóa bài viết này? Hành động này không thể hoàn tác.
              </p>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 px-6 py-3 bg-gray-800 border border-gray-700 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Hủy
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDelete(showDeleteConfirm)}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all shadow-lg shadow-red-600/25"
                >
                  Xóa
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

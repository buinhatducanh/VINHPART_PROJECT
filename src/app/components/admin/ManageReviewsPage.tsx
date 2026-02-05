import { motion } from 'motion/react';
import { MessageSquare, ArrowLeft, Search, Edit, Trash2, Star, Check, X, ArrowUp, ArrowDown, User, Calendar } from 'lucide-react';
import { useState } from 'react';
import { Review } from '@/app/types';

interface ManageReviewsPageProps {
  onBack: () => void;
}

// Mock data
const mockReviews: Review[] = [
  {
    id: 'review-1',
    product_id: 'prod-1',
    product_name: 'Đèn LED trước Honda SH 2020',
    customer_name: 'Nguyễn Văn A',
    customer_email: 'nguyenvana@email.com',
    rating: 5,
    title: 'Sản phẩm rất tốt, sáng đẹp',
    content: 'Đèn sáng hơn nhiều so với đèn zin, lắp vào vừa khít, chất lượng tốt. Rất đáng tiền. Sẽ ủng hộ shop lần sau.',
    images: ['https://images.unsplash.com/photo-1558980664-769d59546b3d?w=400'],
    status: 'approved',
    is_verified_purchase: true,
    priority: 10,
    helpful_count: 24,
    created_at: '2025-01-15T10:30:00Z',
    updated_at: '2025-01-15T11:00:00Z',
  },
  {
    id: 'review-2',
    product_id: 'prod-2',
    product_name: 'Má phanh Yamaha Exciter 150',
    customer_name: 'Trần Thị B',
    customer_email: 'tranthib@email.com',
    rating: 4,
    title: 'Chất lượng ổn, giá hợp lý',
    content: 'Má phanh êm, không kêu. Độ bền chưa test được nhưng nhìn chất lượng ok. Giá cả phải chăng.',
    status: 'approved',
    is_verified_purchase: true,
    priority: 5,
    helpful_count: 12,
    created_at: '2025-01-20T14:20:00Z',
    updated_at: '2025-01-20T15:00:00Z',
  },
  {
    id: 'review-3',
    product_id: 'prod-1',
    product_name: 'Đèn LED trước Honda SH 2020',
    customer_name: 'Lê Văn C',
    customer_email: 'levanc@email.com',
    rating: 3,
    title: 'Bình thường',
    content: 'Sản phẩm ok nhưng giao hàng hơi lâu. Đèn sáng được nhưng không đặc biệt lắm.',
    status: 'pending',
    is_verified_purchase: false,
    priority: 0,
    helpful_count: 3,
    created_at: '2025-02-01T09:15:00Z',
    updated_at: '2025-02-01T09:15:00Z',
  },
  {
    id: 'review-4',
    product_id: 'prod-3',
    product_name: 'Nhớt Motul 5000 10W40',
    customer_name: 'Phạm Thị D',
    customer_email: 'phamthid@email.com',
    rating: 5,
    title: 'Nhớt chính hãng, xe chạy êm hơn',
    content: 'Xe chạy êm hơn hẳn, chính hãng 100%. Giá có hơi cao nhưng chất lượng xứng đáng. Sẽ mua lại.',
    images: ['https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400', 'https://images.unsplash.com/photo-1558980664-769d59546b3d?w=400'],
    status: 'approved',
    is_verified_purchase: true,
    priority: 8,
    helpful_count: 18,
    created_at: '2025-01-25T16:45:00Z',
    updated_at: '2025-01-25T17:00:00Z',
  },
  {
    id: 'review-5',
    product_id: 'prod-4',
    product_name: 'Lốp Michelin City Grip',
    customer_name: 'Hoàng Văn E',
    customer_email: 'hoangvane@email.com',
    rating: 2,
    title: 'Không như mong đợi',
    content: 'Lốp hơi cứng, bám đường không tốt lắm. Có thể do xe tôi không phù hợp.',
    status: 'rejected',
    is_verified_purchase: false,
    priority: 0,
    helpful_count: 1,
    created_at: '2025-01-28T11:20:00Z',
    updated_at: '2025-01-28T12:00:00Z',
  },
];

export function ManageReviewsPage({ onBack }: ManageReviewsPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');
  const [reviews, setReviews] = useState<Review[]>(mockReviews);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [editingReview, setEditingReview] = useState<Review | null>(null);

  const filteredReviews = reviews
    .filter(review => {
      const matchesSearch = review.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           review.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           review.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'all' || review.status === filterStatus;
      const matchesRating = filterRating === 'all' || review.rating === filterRating;
      return matchesSearch && matchesStatus && matchesRating;
    })
    .sort((a, b) => b.priority - a.priority || new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const handleDelete = (id: string) => {
    setReviews(reviews.filter(review => review.id !== id));
    setShowDeleteConfirm(null);
  };

  const handleApprove = (id: string) => {
    setReviews(reviews.map(review =>
      review.id === id ? { ...review, status: 'approved' as const, updated_at: new Date().toISOString() } : review
    ));
  };

  const handleReject = (id: string) => {
    setReviews(reviews.map(review =>
      review.id === id ? { ...review, status: 'rejected' as const, updated_at: new Date().toISOString() } : review
    ));
  };

  const handleChangePriority = (id: string, delta: number) => {
    setReviews(reviews.map(review =>
      review.id === id ? { ...review, priority: Math.max(0, review.priority + delta) } : review
    ));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      approved: 'bg-green-500/10 text-green-400 border-green-500/50',
      pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/50',
      rejected: 'bg-red-500/10 text-red-400 border-red-500/50',
    };
    const labels = {
      approved: 'Đã duyệt',
      pending: 'Chờ duyệt',
      rejected: 'Từ chối',
    };
    return { style: styles[status as keyof typeof styles], label: labels[status as keyof typeof labels] };
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'
            }`}
          />
        ))}
      </div>
    );
  };

  const stats = {
    total: reviews.length,
    pending: reviews.filter(r => r.status === 'pending').length,
    approved: reviews.filter(r => r.status === 'approved').length,
    rejected: reviews.filter(r => r.status === 'rejected').length,
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
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-600 to-cyan-800 rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-transparent bg-gradient-to-r from-white via-gray-200 to-cyan-600 bg-clip-text">
                    QUẢN LÝ ĐÁNH GIÁ
                  </h1>
                  <p className="text-sm text-gray-500">{reviews.length} đánh giá</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl p-4"
          >
            <p className="text-gray-400 text-sm mb-1">Tổng số</p>
            <p className="text-3xl font-bold text-white">{stats.total}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-900/50 backdrop-blur-xl border border-yellow-600/30 rounded-xl p-4"
          >
            <p className="text-gray-400 text-sm mb-1">Chờ duyệt</p>
            <p className="text-3xl font-bold text-yellow-400">{stats.pending}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-900/50 backdrop-blur-xl border border-green-600/30 rounded-xl p-4"
          >
            <p className="text-gray-400 text-sm mb-1">Đã duyệt</p>
            <p className="text-3xl font-bold text-green-400">{stats.approved}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-900/50 backdrop-blur-xl border border-red-600/30 rounded-xl p-4"
          >
            <p className="text-gray-400 text-sm mb-1">Từ chối</p>
            <p className="text-3xl font-bold text-red-400">{stats.rejected}</p>
          </motion.div>
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
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
                placeholder="Tìm kiếm theo sản phẩm, khách hàng, nội dung..."
                className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-600/50 focus:ring-2 focus:ring-cyan-600/20 transition-all"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-600/50 focus:ring-2 focus:ring-cyan-600/20 transition-all"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ duyệt</option>
              <option value="approved">Đã duyệt</option>
              <option value="rejected">Từ chối</option>
            </select>

            {/* Rating Filter */}
            <select
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
              className="px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-600/50 focus:ring-2 focus:ring-cyan-600/20 transition-all"
            >
              <option value="all">Tất cả đánh giá</option>
              <option value="5">5 sao</option>
              <option value="4">4 sao</option>
              <option value="3">3 sao</option>
              <option value="2">2 sao</option>
              <option value="1">1 sao</option>
            </select>
          </div>
        </motion.div>

        {/* Reviews List */}
        <div className="space-y-4">
          {filteredReviews.map((review, index) => {
            const badge = getStatusBadge(review.status);
            return (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group relative bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl p-6 hover:border-cyan-600/50 transition-all"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-white">{review.title}</h3>
                      {review.is_verified_purchase && (
                        <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/50 rounded text-blue-400 text-xs font-semibold">
                          Đã mua hàng
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{review.customer_name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(review.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    {renderStars(review.rating)}
                    <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${badge.style}`}>
                      {badge.label}
                    </span>
                  </div>
                </div>

                {/* Product */}
                <div className="mb-3">
                  <p className="text-sm text-gray-500">Sản phẩm: <span className="text-cyan-400">{review.product_name}</span></p>
                </div>

                {/* Content */}
                <p className="text-gray-300 mb-4">{review.content}</p>

                {/* Images */}
                {review.images && review.images.length > 0 && (
                  <div className="flex gap-2 mb-4">
                    {review.images.map((img, idx) => (
                      <div key={idx} className="w-20 h-20 rounded-lg overflow-hidden border border-gray-700">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                  <span>👍 {review.helpful_count} người thấy hữu ích</span>
                  <span>🏆 Độ ưu tiên: {review.priority}</span>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  {review.status === 'pending' && (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleApprove(review.id)}
                        className="px-4 py-2 bg-green-600/10 border border-green-600/50 text-green-400 rounded-lg hover:bg-green-600/20 transition-all flex items-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        Duyệt
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleReject(review.id)}
                        className="px-4 py-2 bg-red-600/10 border border-red-600/50 text-red-400 rounded-lg hover:bg-red-600/20 transition-all flex items-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        Từ chối
                      </motion.button>
                    </>
                  )}
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleChangePriority(review.id, 1)}
                    className="px-4 py-2 bg-blue-600/10 border border-blue-600/50 text-blue-400 rounded-lg hover:bg-blue-600/20 transition-all flex items-center gap-2"
                  >
                    <ArrowUp className="w-4 h-4" />
                    Tăng ưu tiên
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleChangePriority(review.id, -1)}
                    className="px-4 py-2 bg-orange-600/10 border border-orange-600/50 text-orange-400 rounded-lg hover:bg-orange-600/20 transition-all flex items-center gap-2"
                  >
                    <ArrowDown className="w-4 h-4" />
                    Giảm ưu tiên
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setEditingReview(review)}
                    className="px-4 py-2 bg-purple-600/10 border border-purple-600/50 text-purple-400 rounded-lg hover:bg-purple-600/20 transition-all flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Sửa
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowDeleteConfirm(review.id)}
                    className="px-4 py-2 bg-red-600/10 border border-red-600/50 text-red-400 rounded-lg hover:bg-red-600/20 transition-all flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Xóa
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredReviews.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl p-12 text-center"
          >
            <MessageSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Không tìm thấy đánh giá</h3>
            <p className="text-gray-500 mb-4">Không có đánh giá nào phù hợp với bộ lọc của bạn.</p>
            <motion.button
              onClick={() => {
                setSearchQuery('');
                setFilterStatus('all');
                setFilterRating('all');
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
              
              <h3 className="text-2xl font-bold text-white text-center mb-2">Xóa đánh giá</h3>
              <p className="text-gray-400 text-center mb-6">
                Bạn có chắc chắn muốn xóa đánh giá này? Hành động này không thể hoàn tác.
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

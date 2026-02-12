
import { motion } from 'motion/react';
import { FileText, ArrowLeft, Search, Edit, Trash2, Plus, Eye, Calendar, Save, X, Upload } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { SEOPost } from '@/shared/types';
import { postApi } from '@/lib/api';
import { toast } from 'sonner';

interface ManageSEOPageProps {
  onBack: () => void;
}

export function ManageSEOPage({ onBack }: ManageSEOPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'PUBLISHED' | 'DRAFT'>('all');
  const [posts, setPosts] = useState<SEOPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [editingPost, setEditingPost] = useState<Partial<SEOPost> | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Cloudinary Widget Ref
  const widgetRef = useRef<any>(null);
  const editingPostRef = useRef<Partial<SEOPost> | null>(null);

  useEffect(() => {
    editingPostRef.current = editingPost;
  }, [editingPost]);

  // Initialize Cloudinary widget
  useEffect(() => {
    if ((window as any).cloudinary) {
      widgetRef.current = (window as any).cloudinary.createUploadWidget(
        {
          cloudName: (import.meta as any).env.VITE_CLOUDINARY_CLOUD_NAME || 'dmz66rbbk',
          uploadPreset: 'vinhpart_products_preset', // Reusing preset
          sources: ['local', 'url'],
          multiple: false,
          folder: 'vinhpart_posts',
          resourceType: 'image',
          clientAllowedFormats: ['png', 'jpg', 'jpeg', 'webp'],
          maxFileSize: 10000000,
        },
        (error: any, result: any) => {
          if (!error && result && result.event === "success") {
            const url = result.info.secure_url;
            const current = editingPostRef.current;
            if (current) {
              setEditingPost({ ...current, featuredImage: url });
              toast.success('Ảnh đã được tải lên thành công!');
            }
          }
        }
      );
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [filterStatus]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const data = await postApi.getPosts(filterStatus);
      setPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Không thể tải danh sách bài viết');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await postApi.deletePost(id);
      setPosts(posts.filter(post => post.id !== id));
      setShowDeleteConfirm(null);
      toast.success('Đã xóa bài viết thành công');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Lỗi khi xóa bài viết');
    }
  };

  const handleSave = async () => {
    if (!editingPost) return;

    if (!editingPost.title || !editingPost.slug || !editingPost.content) {
      toast.error('Vui lòng điền đầy đủ các trường bắt buộc');
      return;
    }

    try {
      if (isCreating) {
        await postApi.createPost(editingPost);
        toast.success('Đã tạo bài viết mới thành công');
      } else if (editingPost.id) {
        await postApi.updatePost(editingPost.id, editingPost);
        toast.success('Đã cập nhật bài viết thành công');
      }
      setEditingPost(null);
      fetchPosts();
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Lỗi khi lưu bài viết');
    }
  };

  const openCreateModal = () => {
    setIsCreating(true);
    setEditingPost({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      status: 'DRAFT',
      viewCount: 0
    });
  };

  const openEditModal = (post: SEOPost) => {
    setIsCreating(false);
    setEditingPost(post);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (post.excerpt && post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getStatusBadge = (status: string) => {
    const styles = {
      PUBLISHED: 'bg-green-500/10 text-green-400 border-green-500/50',
      DRAFT: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/50',
    };
    const labels = {
      PUBLISHED: 'Đã xuất bản',
      DRAFT: 'Nháp',
    };
    // safe fallback
    const key = status as keyof typeof styles;
    return { 
        style: styles[key] || 'bg-gray-500/10 text-gray-400 border-gray-500/50', 
        label: labels[key] || status 
    };
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
              onClick={openCreateModal}
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
              {(['all', 'PUBLISHED', 'DRAFT'] as const).map((status) => (
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
                    status === 'PUBLISHED' ? 'Đã xuất bản' : 'Nháp'}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {loading ? (
             <div className="text-center text-white py-12">Đang tải bài viết...</div>
        ) : (
            <>
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
                        {post.featuredImage && (
                        <div className="relative h-48 overflow-hidden">
                            <img
                            src={post.featuredImage}
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
                            <span>{formatDate(post.createdAt)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            <span>{post.viewCount} lượt xem</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 pt-4 border-t border-gray-800">
                            <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => openEditModal(post)}
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
            </>
        )}
      </div>

       {/* Edit/Create Modal */}
       {editingPost && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setEditingPost(null)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-gray-900 border border-gray-700 rounded-2xl p-8 max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-transparent rounded-2xl pointer-events-none"></div>

            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-transparent bg-gradient-to-r from-white to-purple-500 bg-clip-text">
                  {isCreating ? 'Thêm bài viết mới' : 'Chỉnh sửa bài viết'}
                </h3>
                <button
                  onClick={() => setEditingPost(null)}
                  className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Col: Image */}
                <div className="lg:col-span-1 space-y-4">
                  <div className="aspect-video bg-gray-800/50 rounded-xl overflow-hidden border-2 border-dashed border-gray-700 flex items-center justify-center relative group">
                    {editingPost.featuredImage ? (
                      <img
                        key={editingPost.featuredImage}
                        src={editingPost.featuredImage}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center text-gray-500">
                        <Upload className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <span className="text-sm">Chưa có ảnh</span>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (widgetRef.current) widgetRef.current.open();
                      else toast.error('Widget chưa tải xong');
                    }}
                    className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20"
                  >
                    <Upload className="w-4 h-4" />
                    Tải ảnh lên
                  </button>
                </div>

                {/* Right Col: Details */}
                <div className="lg:col-span-2 space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Tiêu đề</label>
                    <input
                      type="text"
                      value={editingPost.title || ''}
                      onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-600/50 focus:ring-2 focus:ring-purple-600/20"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Slug</label>
                    <input
                      type="text"
                      value={editingPost.slug || ''}
                      onChange={(e) => setEditingPost({ ...editingPost, slug: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-600/50 focus:ring-2 focus:ring-purple-600/20"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Mô tả ngắn</label>
                    <textarea
                      value={editingPost.excerpt || ''}
                      onChange={(e) => setEditingPost({ ...editingPost, excerpt: e.target.value })}
                      rows={2}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-600/50 focus:ring-2 focus:ring-purple-600/20 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Nội dung</label>
                    <textarea
                      value={editingPost.content || ''}
                      onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                      rows={6}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-600/50 focus:ring-2 focus:ring-purple-600/20 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Trạng thái</label>
                    <select
                      value={editingPost.status || 'DRAFT'}
                      onChange={(e) => setEditingPost({ ...editingPost, status: e.target.value as any })}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-600/50 focus:ring-2 focus:ring-purple-600/20"
                    >
                      <option value="DRAFT">Nháp</option>
                      <option value="PUBLISHED">Đã xuất bản</option>
                    </select>
                  </div>

                </div>
              </div>

              <div className="flex gap-3 mt-8 pt-6 border-t border-gray-800">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setEditingPost(null)}
                  className="flex-1 px-6 py-3 bg-gray-800 border border-gray-700 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                >
                  Hủy bỏ
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSave}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg shadow-purple-600/25 font-bold flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Lưu thay đổi
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

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

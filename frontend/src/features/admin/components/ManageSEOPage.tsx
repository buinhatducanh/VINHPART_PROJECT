import { motion } from 'motion/react';
import { FileText, ArrowLeft, Search, Edit, Trash2, Plus, Eye, Calendar, Save, X, Upload } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { SEOPost } from '@/shared/types';
import { postsApi } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface ManageSEOPageProps {
  onBack: () => void;
}
//FIXED zz
export function ManageSEOPage({ onBack }: ManageSEOPageProps) {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'PUBLISHED' | 'DRAFT'>('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [editingPost, setEditingPost] = useState<SEOPost | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Cloudinary Widget Refs
  const widgetRef = useRef<any>(null);
  const editingPostRef = useRef<SEOPost | null>(null);
  const imageFieldToUpdateRef = useRef<'featuredImage' | 'ogImage' | 'featured_image' | null>(null);

  useEffect(() => {
    editingPostRef.current = editingPost;
  }, [editingPost]);

  // Fetch Posts
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['posts', filterStatus],
    queryFn: () => postsApi.getPosts(filterStatus === 'all' ? undefined : filterStatus),
  });

  // Create Post Mutation
  const createMutation = useMutation({
    mutationFn: postsApi.createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success('Đã tạo bài viết mới thành công');
      setIsAddModalOpen(false);
      setEditingPost(null);
    },
    onError: (error: Error) => {
      toast.error('Lỗi khi tạo bài viết: ' + error.message);
    }
  });

  // Update Post Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, post }: { id: string, post: Partial<SEOPost> }) => postsApi.updatePost(id, post),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success('Đã cập nhật bài viết thành công');
      setEditingPost(null);
    },
    onError: (error: Error) => {
      toast.error('Lỗi khi cập nhật bài viết: ' + error.message);
    }
  });

  // Delete Post Mutation
  const deleteMutation = useMutation({
    mutationFn: postsApi.deletePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success('Đã xóa bài viết thành công');
      setShowDeleteConfirm(null);
    },
    onError: (error: Error) => {
      toast.error('Lỗi khi xóa bài viết: ' + error.message);
    }
  });

  // Initialize Cloudinary widget for editing
  useEffect(() => {
    if ((window as any).cloudinary) {
      widgetRef.current = (window as any).cloudinary.createUploadWidget(
        {
          cloudName: (import.meta as any).env.VITE_CLOUDINARY_CLOUD_NAME || 'dmz66rbbk',
          uploadPreset: 'vinhpart_products_preset',
          sources: ['local', 'url'],
          multiple: false,
          folder: 'vinhpart_seo',
          resourceType: 'image',
          clientAllowedFormats: ['png', 'jpg', 'jpeg', 'webp'],
        },
        (error: any, result: any) => {
          if (!error && result && result.event === "success") {
            const url = result.info.secure_url;
            const current = editingPostRef.current;
            const field = imageFieldToUpdateRef.current || 'featuredImage';
            
            if (current) {
              setEditingPost({ ...current, [field]: url });
              toast.success(`Đã cập nhật ${field === 'featuredImage' ? 'ảnh chính' : 'ảnh chia sẻ social'}`);
            }
          }
        }
      );
    }
  }, []);

  const openWidget = (field: 'featuredImage' | 'ogImage') => {
    imageFieldToUpdateRef.current = field;
    widgetRef.current?.open();
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (post.excerpt && post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Vừa xong';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .trim()
      .normalize('NFD') // chuẩn hóa unicode để tách dấu
      .replace(/[\u0300-\u036f]/g, '') // xóa dấu
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '') // xóa ký tự đặc biệt
      .replace(/[\s-]+/g, '-') // thay khoảng trắng/nhiều gạch bằng 1 gạch
      .replace(/^-+|-+$/g, '') // xóa gạch ở đầu/cuối
      + '-' + Math.random().toString(36).substring(2, 6); // Add small random suffix to avoid duplicates
  };

  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-foreground">Đang tải bài viết...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black pb-20">
      {/* Animated background particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-purple-600/30 rounded-full"
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
        className="relative border-b border-border bg-background/40 backdrop-blur-xl sticky top-0 z-10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <motion.button
                onClick={onBack}
                whileHover={{ scale: 1.05, x: -5 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 bg-card border border-border rounded-lg hover:border-purple-600/50 transition-all group"
              >
                <ArrowLeft className="w-5 h-5 text-muted-foreground group-hover:text-purple-600 transition-colors" />
              </motion.button>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-foreground" />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-transparent bg-gradient-to-r from-white via-gray-200 to-purple-600 bg-clip-text">
                    QUẢN LÝ BÀI VIẾT SEO
                  </h1>
                  <p className="text-sm text-muted-foreground">{posts.length} bài viết</p>
                </div>
              </div>
            </div>

            <motion.button
              onClick={() => {
                setEditingPost({
                  id: '',
                  title: '',
                  slug: '',
                  content: '',
                  excerpt: '',
                  status: 'DRAFT',
                  viewCount: 0,
                  createdAt: '',
                  updatedAt: ''
                });
                setIsAddModalOpen(true);
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-foreground rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg shadow-purple-600/25 flex items-center gap-2"
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
           className="bg-card/50 backdrop-blur-xl border border-border rounded-xl p-4 mb-6"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm bài viết..."
                className="w-full pl-12 pr-4 py-3 bg-muted border border-border rounded-lg text-foreground placeholder-gray-500 focus:outline-none focus:border-purple-600/50 focus:ring-2 focus:ring-purple-600/20 transition-all"
              />
            </div>

            <div className="flex gap-2">
              {(['all', 'PUBLISHED', 'DRAFT'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${filterStatus === status
                    ? 'bg-purple-600 text-foreground shadow-lg shadow-purple-600/25'
                    : 'bg-muted text-muted-foreground hover:bg-muted'
                    }`}
                >
                  {status === 'all' ? 'Tất cả' : status === 'PUBLISHED' ? 'Đã xuất bản' : 'Bản nháp'}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group relative bg-card/50 backdrop-blur-xl border border-border rounded-xl overflow-hidden hover:border-purple-600/50 transition-all"
            >
              <div className="relative h-48 overflow-hidden bg-muted flex items-center justify-center">
                {post.featuredImage ? (
                  <img
                    src={post.featuredImage}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <FileText className="w-12 h-12 text-gray-600 opacity-20" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
                
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${
                    post.status === 'PUBLISHED' 
                      ? 'bg-green-500/10 text-green-400 border-green-500/50' 
                      : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/50'
                  }`}>
                    {post.status === 'PUBLISHED' ? 'Đã xuất bản' : 'Bản nháp'}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-foreground mb-2 line-clamp-2 group-hover:text-purple-400 transition-colors">
                  {post.title}
                </h3>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                  {post.excerpt}
                </p>

                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(post.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    <span>{post.viewCount} lượt xem</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-border">
                  <button
                    onClick={() => {
                        setEditingPost(post);
                        setIsAddModalOpen(false);
                    }}
                    className="flex-1 px-4 py-2 bg-purple-600/10 border border-purple-600/50 text-purple-400 rounded-lg hover:bg-purple-600/20 transition-all flex items-center justify-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Sửa
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(post.id)}
                    className="flex-1 px-4 py-2 bg-red-600/10 border border-red-600/50 text-red-400 rounded-lg hover:bg-red-600/20 transition-all flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Xóa
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-20 bg-card/50 border border-border rounded-xl">
             <FileText className="w-16 h-16 text-gray-700 mx-auto mb-4 opacity-50" />
             <h3 className="text-xl font-bold text-muted-foreground">Không tìm thấy bài viết nào</h3>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {editingPost && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="bg-card border border-border rounded-2xl w-full max-w-4xl p-8 relative my-auto shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-transparent rounded-2xl pointer-events-none"></div>

            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-foreground">
                {isAddModalOpen ? 'THÊM BÀI VIẾT MỚI' : 'CHỈNH SỬA BÀI VIẾT'}
              </h2>
              <button onClick={() => { setEditingPost(null); setIsAddModalOpen(false); }} className="p-2 hover:bg-muted rounded-lg transition-colors">
                <X className="w-6 h-6 text-muted-foreground" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Image Col */}
              <div className="lg:col-span-4 space-y-4">
                <div className="aspect-video lg:aspect-square bg-muted rounded-xl border-2 border-dashed border-border flex items-center justify-center overflow-hidden relative group">
                  {editingPost.featuredImage ? (
                    <img src={editingPost.featuredImage} className="w-full h-full object-cover" alt="Preview" />
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <Upload className="w-10 h-10 mx-auto mb-2 opacity-20" />
                      <p className="text-xs uppercase font-bold tracking-tighter">Click để tải ảnh</p>
                    </div>
                  )}
                  <button 
                    onClick={() => openWidget('featuredImage')}
                    className="absolute inset-0 bg-background/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-foreground text-xs font-bold"
                  >
                    THAY ĐỔI ẢNH CHÍNH
                  </button>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-black text-muted-foreground uppercase">Featured Image URL</label>
                  <input
                    type="text"
                    value={editingPost.featuredImage || ''}
                    onChange={(e) => setEditingPost({ ...editingPost, featuredImage: e.target.value })}
                    className="w-full bg-muted border border-border rounded-lg px-4 py-2 text-sm text-muted-foreground focus:border-purple-600 outline-none transition-all"
                  />
                </div>

                {/* Social Image */}
                <div className="space-y-2 pt-4 border-t border-border">
                  <label className="text-xs font-black text-muted-foreground uppercase">Ảnh chia sẻ Social (OG Image)</label>
                  <div className="aspect-video bg-muted rounded-lg border border-border flex items-center justify-center overflow-hidden relative group">
                    {editingPost.ogImage ? (
                      <img src={editingPost.ogImage} className="w-full h-full object-cover" alt="OG Preview" />
                    ) : (
                      <div className="text-center text-muted-foreground">
                        <Upload className="w-6 h-6 mx-auto mb-1 opacity-20" />
                        <p className="text-[10px] uppercase font-bold tracking-tighter">Click để tải ảnh social</p>
                      </div>
                    )}
                    <button 
                      onClick={() => openWidget('ogImage')}
                      className="absolute inset-0 bg-background/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-foreground text-xs font-bold"
                    >
                      THAY ĐỔI ẢNH SOCIAL
                    </button>
                  </div>
                  <input
                    type="text"
                    value={editingPost.ogImage || ''}
                    onChange={(e) => setEditingPost({ ...editingPost, ogImage: e.target.value })}
                    className="w-full bg-muted border border-border rounded-lg px-4 py-2 text-sm text-muted-foreground focus:border-purple-600 outline-none transition-all"
                    placeholder="OG Image URL..."
                  />
                </div>
              </div>

              {/* Form Col */}
              <div className="lg:col-span-8 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-muted-foreground uppercase">Tiêu đề bài viết</label>
                    <input
                      type="text"
                      value={editingPost.title}
                      onChange={(e) => {
                        const title = e.target.value;
                        setEditingPost({ ...editingPost, title, slug: isAddModalOpen ? generateSlug(title) : editingPost.slug });
                      }}
                      className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-foreground focus:border-purple-600 outline-none transition-all"
                      placeholder="Nhập tiêu đề..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-muted-foreground uppercase">Slug (URL)</label>
                    <input
                      type="text"
                      value={editingPost.slug}
                      onChange={(e) => setEditingPost({ ...editingPost, slug: e.target.value })}
                      className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-foreground focus:border-purple-600 outline-none transition-all font-mono text-sm"
                      placeholder="tieu-de-bai-viet"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-muted-foreground uppercase">Trạng thái</label>
                      <select
                        value={editingPost.status}
                        onChange={(e) => setEditingPost({ ...editingPost, status: e.target.value as any })}
                        className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-foreground focus:border-purple-600 outline-none transition-all"
                      >
                        <option value="DRAFT">Bản nháp</option>
                        <option value="PUBLISHED">Công khai</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-black text-muted-foreground uppercase">Tiêu đề Meta (SEO Title)</label>
                       <input
                        type="text"
                        value={editingPost.metaTitle || ''}
                        onChange={(e) => setEditingPost({ ...editingPost, metaTitle: e.target.value })}
                        className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-foreground focus:border-purple-600 outline-none transition-all"
                        placeholder="Thẻ Title SEO..."
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-muted-foreground uppercase">Mô tả Meta (Meta Description)</label>
                    <textarea
                      value={editingPost.metaDescription || ''}
                      onChange={(e) => setEditingPost({ ...editingPost, metaDescription: e.target.value })}
                      className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-foreground focus:border-purple-600 outline-none transition-all h-20 resize-none text-sm"
                      placeholder="Thẻ Meta Description SEO..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-muted-foreground uppercase">Mô tả ngắn (Excerpt)</label>
                    <textarea
                      value={editingPost.excerpt || ''}
                      onChange={(e) => setEditingPost({ ...editingPost, excerpt: e.target.value })}
                      className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-foreground focus:border-purple-600 outline-none transition-all h-20 resize-none"
                      placeholder="Bài viết này nói về..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-muted-foreground uppercase">Nội dung bài viết (Markdown/HTML)</label>
                    <textarea
                      value={editingPost.content}
                      onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                      className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-foreground focus:border-purple-600 outline-none transition-all h-40 font-mono text-sm"
                      placeholder="Nội dung chi tiết..."
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                   <button 
                    onClick={() => { setEditingPost(null); setIsAddModalOpen(false); }}
                    className="flex-1 py-4 bg-muted text-muted-foreground font-bold rounded-xl hover:bg-muted/80 transition-all border border-border"
                   >
                     HỦY BỔ
                   </button>
                   <button 
                    disabled={createMutation.isPending || updateMutation.isPending}
                    onClick={() => {
                      if (isAddModalOpen) {
                        createMutation.mutate(editingPost);
                      } else {
                        updateMutation.mutate({ id: editingPost.id, post: editingPost });
                      }
                    }}
                    className="flex-1 py-4 bg-gradient-to-r from-purple-600 to-purple-800 text-foreground font-black rounded-xl hover:from-purple-500 hover:to-purple-700 transition-all shadow-xl shadow-purple-900/40 flex items-center justify-center gap-2"
                   >
                     <Save className="w-5 h-5" />
                     {isAddModalOpen ? 'TẠO BÀI VIẾT' : 'CẬP NHẬT'}
                   </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-card border border-red-900/50 rounded-2xl p-8 max-w-md w-full shadow-2xl"
          >
            <div className="w-16 h-16 bg-red-600/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trash2 className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-foreground text-center mb-2">Xác nhận xóa?</h3>
            <p className="text-muted-foreground text-center mb-8">
              Bạn có chắc chắn muốn xóa bài viết này? Hành động này không thể hoàn tác.
            </p>
            <div className="flex gap-4">
               <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 py-3 bg-muted text-muted-foreground font-bold rounded-xl border border-border transition-colors">QUAY LẠI</button>
               <button onClick={() => deleteMutation.mutate(showDeleteConfirm)} className="flex-1 py-3 bg-red-600 text-foreground font-bold rounded-xl hover:bg-red-700 transition-all">XÓA NGAY</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

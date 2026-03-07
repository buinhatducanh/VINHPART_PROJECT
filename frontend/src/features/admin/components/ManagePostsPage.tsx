import { motion } from 'motion/react';
import { FileText, ArrowLeft, Search, Edit, Trash2, Plus, Upload, Save, X, Eye, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { useState, useEffect, useRef } from 'react';
import { useFirstVisit } from '@/shared/hooks/useFirstVisit';

interface Post {
    id: string;
    title: string;
    slug: string;
    excerpt?: string;
    content: string;
    featuredImage?: string;
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: string;
    status: 'DRAFT' | 'PUBLISHED';
    publishedAt?: string;
    viewCount: number;
    createdAt: string;
    updatedAt: string;
}

interface ManagePostsPageProps {
    onBack: () => void;
}

export function ManagePostsPage({ onBack }: ManagePostsPageProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [posts, setPosts] = useState<Post[]>([]);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
    const [editingPost, setEditingPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);
    const a = useFirstVisit('manage-posts');
    const [draftPost, setDraftPost] = useState<Post | null>(null);

    // Cloudinary Widget Refs
    const featuredImageWidgetRef = useRef<any>(null);
    const ogImageWidgetRef = useRef<any>(null);
    const editingPostRef = useRef<Post | null>(null);

    // Sync ref with state
    useEffect(() => {
        editingPostRef.current = editingPost;
    }, [editingPost]);

    // Initialize Cloudinary widgets
    useEffect(() => {
        if ((window as any).cloudinary) {
            // Featured Image Widget
            featuredImageWidgetRef.current = (window as any).cloudinary.createUploadWidget(
                {
                    cloudName: (import.meta as any).env.VITE_CLOUDINARY_CLOUD_NAME || 'dmz66rbbk',
                    uploadPreset: 'vinhpart_products_preset',
                    sources: ['local', 'url', 'camera'],
                    multiple: false,
                    folder: 'vinhpart_posts/featured',
                    resourceType: 'image',
                    clientAllowedFormats: ['png', 'jpg', 'jpeg', 'webp'],
                    maxFileSize: 10000000,
                    maxImageWidth: 2000,
                    maxImageHeight: 2000,
                    cropping: true,
                    croppingAspectRatio: 16 / 9,
                    showSkipCropButton: true,
                },
                (error: any, result: any) => {
                    if (!error && result && result.event === "success") {
                        const url = result.info.secure_url;
                        const current = editingPostRef.current;
                        if (current) {
                            setEditingPost({ ...current, featuredImage: url });
                            toast.success('Ảnh đại diện đã được tải lên!');
                        }
                    } else if (error) {
                        toast.error('Lỗi khi tải ảnh: ' + error.message);
                    }
                }
            );

            // OG Image Widget
            ogImageWidgetRef.current = (window as any).cloudinary.createUploadWidget(
                {
                    cloudName: (import.meta as any).env.VITE_CLOUDINARY_CLOUD_NAME || 'dmz66rbbk',
                    uploadPreset: 'vinhpart_products_preset',
                    sources: ['local', 'url', 'camera'],
                    multiple: false,
                    folder: 'vinhpart_posts/og',
                    resourceType: 'image',
                    clientAllowedFormats: ['png', 'jpg', 'jpeg', 'webp'],
                    maxFileSize: 10000000,
                    maxImageWidth: 1200,
                    maxImageHeight: 630,
                    cropping: true,
                    croppingAspectRatio: 1.91,
                    showSkipCropButton: true,
                },
                (error: any, result: any) => {
                    if (!error && result && result.event === "success") {
                        const url = result.info.secure_url;
                        const current = editingPostRef.current;
                        if (current) {
                            setEditingPost({ ...current, ogImage: url });
                            toast.success('Ảnh OG đã được tải lên!');
                        }
                    } else if (error) {
                        toast.error('Lỗi khi tải ảnh OG: ' + error.message);
                    }
                }
            );
        }
    }, []);

    // Fetch posts on mount
    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = () => {
        setLoading(true);
        fetch('/api/posts?limit=1000')
            .then(res => res.json())
            .then(data => {
                setPosts(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching posts:", err);
                setLoading(false);
            });
    };

    const filteredPosts = posts.filter(post =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`/api/posts/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                setPosts(posts.filter(p => p.id !== id));
                setShowDeleteConfirm(null);
                toast.success("Đã xóa bài viết thành công");
            } else {
                const errorData = await res.json().catch(() => null);
                toast.error(errorData?.error || "Lỗi khi xóa bài viết");
            }
        } catch (error) {
            console.error("Delete error:", error);
            toast.error("Lỗi kết nối");
        }
    };

    const handleSaveEdit = async () => {
        if (editingPost) {
            try {
                const url = editingPost.id ? `/api/posts/${editingPost.id}` : '/api/posts';
                const method = editingPost.id ? 'PUT' : 'POST';

                const res = await fetch(url, {
                    method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title: editingPost.title,
                        slug: editingPost.slug,
                        excerpt: editingPost.excerpt,
                        content: editingPost.content,
                        featuredImage: editingPost.featuredImage,
                        metaTitle: editingPost.metaTitle,
                        metaDescription: editingPost.metaDescription,
                        ogImage: editingPost.ogImage,
                        status: editingPost.status
                    })
                });

                if (res.ok) {
                    setDraftPost(null);
                    fetchPosts();
                    setEditingPost(null);
                    toast.success(editingPost.id ? "Cập nhật thành công" : "Thêm bài viết thành công");
                } else {
                    const errorData = await res.json();
                    toast.error(errorData.error || "Lỗi khi lưu");
                }
            } catch (error) {
                console.error("Save error:", error);
                toast.error("Lỗi kết nối");
            }
        }
    };

    const closeAndSaveDraft = () => {
        if (editingPost && !editingPost.id) {
            setDraftPost(editingPost);
            toast.info('Đã lưu bản nháp tạm thời');
        }
        setEditingPost(null);
    };

    const createNewPost = () => {
        if (draftPost) {
            setEditingPost(draftPost);
            setDraftPost(null);
            return;
        }
        setEditingPost({
            id: '',
            title: '',
            slug: '',
            excerpt: '',
            content: '',
            featuredImage: '',
            metaTitle: '',
            metaDescription: '',
            ogImage: '',
            status: 'DRAFT',
            viewCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
    };

    if (loading) {
        return <div className="min-h-screen bg-background flex items-center justify-center text-foreground">Loading posts...</div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black pb-20">
            {/* Header */}
            <motion.div
                initial={a && { y: -20, opacity: 0 }}
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
                                className="p-3 bg-card border border-border rounded-lg hover:border-red-600/50 transition-all group"
                            >
                                <ArrowLeft className="w-5 h-5 text-muted-foreground group-hover:text-red-600 transition-colors" />
                            </motion.button>

                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-800 rounded-xl flex items-center justify-center">
                                    <FileText className="w-6 h-6 text-foreground" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-black text-transparent bg-gradient-to-r from-white via-gray-200 to-green-600 bg-clip-text">
                                        QUẢN LÝ BÀI VIẾT
                                    </h1>
                                    <p className="text-sm text-muted-foreground">{posts.length} bài viết</p>
                                </div>
                            </div>
                        </div>

                        <motion.button
                            onClick={createNewPost}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-foreground rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-lg shadow-green-600/25 flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            {draftPost ? 'Tiếp tục bản nháp' : 'Thêm bài viết mới'}
                        </motion.button>
                    </div>
                </div>
            </motion.div>

            {/* Main Content */}
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Search Bar */}
                <motion.div
                    initial={a && { opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card/50 backdrop-blur-xl border border-border rounded-xl p-4 mb-6"
                >
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Tìm kiếm bài viết theo tiêu đề, slug..."
                            className="w-full pl-12 pr-4 py-3 bg-muted border border-border rounded-lg text-foreground placeholder-gray-500 focus:outline-none focus:border-green-600/50 focus:ring-2 focus:ring-green-600/20 transition-all"
                        />
                    </div>
                </motion.div>

                {/* Posts Table */}
                <motion.div
                    initial={a && { opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-card/50 backdrop-blur-xl border border-border rounded-xl overflow-hidden"
                >
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Bài viết
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Trạng thái
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Lượt xem
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Ngày xuất bản
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Thao tác
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {filteredPosts.map((post, index) => (
                                    <motion.tr
                                        key={post.id}
                                        initial={a && { opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="hover:bg-muted/30 transition-colors group"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {post.featuredImage && (
                                                    <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                                                        <img
                                                            src={post.featuredImage}
                                                            alt={post.title}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="text-foreground font-semibold line-clamp-2">
                                                        {post.title}
                                                    </p>
                                                    <p className="text-muted-foreground text-sm">/{post.slug}</p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-lg text-sm font-medium ${post.status === 'PUBLISHED'
                                                ? 'bg-green-500/10 border border-green-500/50 text-green-400'
                                                : 'bg-yellow-500/10 border border-yellow-500/50 text-yellow-400'
                                                }`}>
                                                {post.status === 'PUBLISHED' ? 'Published' : 'Draft'}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-foreground">
                                                <Eye className="w-4 h-4 text-muted-foreground" />
                                                {post.viewCount}
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                                <Calendar className="w-4 h-4" />
                                                {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('vi-VN') : '-'}
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <motion.button
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => setEditingPost(post)}
                                                    className="p-2 bg-muted border border-border rounded-lg hover:border-green-600/50 transition-all group/edit"
                                                >
                                                    <Edit className="w-4 h-4 text-muted-foreground group-hover/edit:text-green-600 transition-colors" />
                                                </motion.button>

                                                <motion.button
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => setShowDeleteConfirm(post.id)}
                                                    className="p-2 bg-muted border border-border rounded-lg hover:border-red-600/50 transition-all group/delete"
                                                >
                                                    <Trash2 className="w-4 h-4 text-muted-foreground group-hover/delete:text-red-600 transition-colors" />
                                                </motion.button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>

                {/* Empty State */}
                {filteredPosts.length === 0 && (
                    <motion.div
                        initial={a && { opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-card/50 backdrop-blur-xl border border-border rounded-xl p-12 text-center mt-6"
                    >
                        <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-foreground mb-2">Không tìm thấy bài viết</h3>
                        <p className="text-muted-foreground mb-4">Không có bài viết nào phù hợp với tìm kiếm của bạn.</p>
                        <motion.button
                            onClick={() => setSearchQuery('')}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-6 py-3 bg-muted border border-border text-foreground rounded-lg hover:bg-muted/80 transition-all"
                        >
                            Xóa bộ lọc
                        </motion.button>
                    </motion.div>
                )}
            </div>

            {/* Edit/Create Modal */}
            {editingPost && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={closeAndSaveDraft}
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative bg-card border border-border rounded-2xl p-8 max-w-6xl w-full my-8 max-h-[90vh] overflow-y-auto"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold text-transparent bg-gradient-to-r from-white to-green-500 bg-clip-text">
                                {editingPost.id ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}
                            </h3>
                            <button
                                onClick={closeAndSaveDraft}
                                className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Left Col: Images */}
                            <div className="lg:col-span-1 space-y-4">
                                {/* Featured Image */}
                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground mb-2">Ảnh đại diện</label>
                                    <div className="aspect-video bg-muted rounded-xl overflow-hidden border-2 border-dashed border-border flex items-center justify-center">
                                        {editingPost.featuredImage ? (
                                            <img
                                                key={editingPost.featuredImage}
                                                src={editingPost.featuredImage}
                                                alt="Featured"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="text-center text-muted-foreground">
                                                <Upload className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                                <span className="text-sm">Chưa có ảnh</span>
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => featuredImageWidgetRef.current?.open()}
                                        className="w-full mt-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-foreground font-medium rounded-lg transition-all flex items-center justify-center gap-2"
                                    >
                                        <Upload className="w-4 h-4" />
                                        Tải ảnh đại diện
                                    </button>
                                </div>

                                {/* OG Image */}
                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground mb-2">Ảnh OG (Social)</label>
                                    <div className="aspect-[1.91/1] bg-muted rounded-xl overflow-hidden border-2 border-dashed border-border flex items-center justify-center">
                                        {editingPost.ogImage ? (
                                            <img
                                                key={editingPost.ogImage}
                                                src={editingPost.ogImage}
                                                alt="OG"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="text-center text-muted-foreground">
                                                <Upload className="w-6 h-6 mx-auto mb-1 opacity-50" />
                                                <span className="text-xs">1200x630px</span>
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => ogImageWidgetRef.current?.open()}
                                        className="w-full mt-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-foreground font-medium rounded-lg transition-all flex items-center justify-center gap-2"
                                    >
                                        <Upload className="w-4 h-4" />
                                        Tải ảnh OG
                                    </button>
                                </div>
                            </div>

                            {/* Right Col: Content */}
                            <div className="lg:col-span-2 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-muted-foreground mb-2">Tiêu đề</label>
                                        <input
                                            type="text"
                                            value={editingPost.title}
                                            onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                                            className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:border-green-600/50 focus:ring-2 focus:ring-green-600/20 transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-muted-foreground mb-2">Slug</label>
                                        <input
                                            type="text"
                                            value={editingPost.slug}
                                            onChange={(e) => setEditingPost({ ...editingPost, slug: e.target.value })}
                                            className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:border-green-600/50 focus:ring-2 focus:ring-green-600/20 transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-muted-foreground mb-2">Trạng thái</label>
                                    <select
                                        value={editingPost.status}
                                        onChange={(e) => setEditingPost({ ...editingPost, status: e.target.value as 'DRAFT' | 'PUBLISHED' })}
                                        className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:border-green-600/50 focus:ring-2 focus:ring-green-600/20"
                                    >
                                        <option value="DRAFT">Draft</option>
                                        <option value="PUBLISHED">Published</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-muted-foreground mb-2">Excerpt (Tóm tắt)</label>
                                    <textarea
                                        value={editingPost.excerpt || ''}
                                        onChange={(e) => setEditingPost({ ...editingPost, excerpt: e.target.value })}
                                        rows={2}
                                        className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:border-green-600/50 focus:ring-2 focus:ring-green-600/20 resize-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-muted-foreground mb-2">Nội dung</label>
                                    <textarea
                                        value={editingPost.content}
                                        onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                                        rows={8}
                                        className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:border-green-600/50 focus:ring-2 focus:ring-green-600/20 resize-none"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-muted-foreground mb-2">Meta Title</label>
                                        <input
                                            type="text"
                                            value={editingPost.metaTitle || ''}
                                            onChange={(e) => setEditingPost({ ...editingPost, metaTitle: e.target.value })}
                                            className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:border-green-600/50 focus:ring-2 focus:ring-green-600/20"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-muted-foreground mb-2">Meta Description</label>
                                        <input
                                            type="text"
                                            value={editingPost.metaDescription || ''}
                                            onChange={(e) => setEditingPost({ ...editingPost, metaDescription: e.target.value })}
                                            className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:border-green-600/50 focus:ring-2 focus:ring-green-600/20"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-8 pt-6 border-t border-border">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={closeAndSaveDraft}
                                className="flex-1 px-6 py-3 bg-muted border border-border text-foreground rounded-lg hover:bg-muted/80 transition-colors font-medium"
                            >
                                Hủy bỏ
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleSaveEdit}
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-foreground rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-lg shadow-green-600/25 font-bold flex items-center justify-center gap-2"
                            >
                                <Save className="w-5 h-5" />
                                Lưu bài viết
                            </motion.button>
                        </div>
                    </motion.div>
                </motion.div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={() => setShowDeleteConfirm(null)}
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative bg-card border border-border rounded-2xl p-8 max-w-md w-full"
                    >
                        <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Trash2 className="w-8 h-8 text-foreground" />
                        </div>

                        <h3 className="text-2xl font-bold text-foreground text-center mb-2">Xóa bài viết</h3>
                        <p className="text-muted-foreground text-center mb-6">
                            Bạn có chắc chắn muốn xóa bài viết này? Hành động này không thể hoàn tác.
                        </p>

                        <div className="flex gap-3">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowDeleteConfirm(null)}
                                className="flex-1 px-6 py-3 bg-muted border border-border text-foreground rounded-lg hover:bg-muted/80 transition-colors"
                            >
                                Hủy
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleDelete(showDeleteConfirm)}
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-foreground rounded-lg hover:from-red-700 hover:to-red-800 transition-all shadow-lg shadow-red-600/25"
                            >
                                Xóa
                            </motion.button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
}

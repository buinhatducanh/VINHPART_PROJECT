import { motion } from 'motion/react';
import { FileText, ArrowLeft, Search, Edit, Trash2, Plus, Upload, Save, X, Eye, Calendar, Info, AlertCircle, Check, RefreshCw, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useFirstVisit } from '@/shared/hooks/useFirstVisit';
import { NotificationBell } from '@/features/notification/components/NotificationBell';
import { API_BASE_URL } from '@/lib/api';
import { Switch } from '@/shared/components/ui/switch';

const DRAFT_STORAGE_KEY = 'vinhpart_post_draft';
const AUTO_SAVE_INTERVAL = 30000; // 30s

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
    isPinned?: boolean;
    pinnedOrder?: number;
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
    const [showPreview, setShowPreview] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [showDraftRecovery, setShowDraftRecovery] = useState(false);
    const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const formChangedRef = useRef(false);

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
        fetch(`${API_BASE_URL}/posts?limit=1000`)
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

    // Check for saved draft on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved) as Post;
                if (parsed.title || parsed.content) {
                    setShowDraftRecovery(true);
                }
            }
        } catch {}
    }, []);

    const saveDraftToStorage = useCallback(() => {
        if (editingPost && !editingPost.id && (editingPost.title || editingPost.content)) {
            try {
                localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(editingPost));
                setLastSaved(new Date());
            } catch {}
        }
    }, [editingPost]);

    const clearDraftFromStorage = () => {
        try {
            localStorage.removeItem(DRAFT_STORAGE_KEY);
        } catch {}
    };

    // Auto-save every 30s
    useEffect(() => {
        if (!editingPost) return;
        if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
        autoSaveTimerRef.current = setTimeout(() => {
            if (formChangedRef.current) {
                saveDraftToStorage();
                formChangedRef.current = false;
            }
        }, AUTO_SAVE_INTERVAL);
        return () => {
            if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
        };
    }, [editingPost, saveDraftToStorage]);

    // Mark form as changed for auto-save trigger
    const markFormChanged = () => {
        formChangedRef.current = true;
    };

    // Auto-generate slug from title
    const generateSlug = (text: string) => {
        return text
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim()
            .replace(/^-+|-+$/g, '');
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        if (!editingPost) return false;
        if (!editingPost.title.trim()) newErrors.title = 'Vui lòng nhập tiêu đề bài viết';
        if (!editingPost.slug.trim()) newErrors.slug = 'Vui lòng nhập đường dẫn (slug)';
        else if (!/^[a-z0-9-]+$/.test(editingPost.slug)) newErrors.slug = 'Slug chỉ được chứa chữ thường, số và dấu gạch ngang';
        if (!editingPost.content.trim()) newErrors.content = 'Vui lòng nhập nội dung bài viết';
        if (editingPost.metaDescription && editingPost.metaDescription.length > 160)
            newErrors.metaDescription = 'Meta description không nên quá 160 ký tự';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleTitleChange = (value: string) => {
        setEditingPost({ ...editingPost!, title: value });
        markFormChanged();
        if (!slugManuallyEdited && value) {
            setEditingPost({ ...editingPost!, title: value, slug: generateSlug(value) });
        }
    };

    const handleSlugChange = (value: string) => {
        setSlugManuallyEdited(true);
        setEditingPost({ ...editingPost!, slug: value.toLowerCase().replace(/[^a-z0-9-]/g, '') });
        markFormChanged();
    };

    const handleInputChange = (field: keyof Post, value: string) => {
        setEditingPost({ ...editingPost!, [field]: value });
        markFormChanged();
        // Clear error when user types
        if (errors[field]) {
            setErrors(prev => { const next = { ...prev }; delete next[field]; return next; });
        }
    };

    const recoverSavedDraft = () => {
        try {
            const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved) as Post;
                setDraftPost(parsed);
                setEditingPost(parsed);
                setDraftPost(null);
                toast.success('Đã khôi phục bản nháp');
            }
        } catch {
            toast.error('Không thể khôi phục bản nháp');
        }
        setShowDraftRecovery(false);
    };

    const dismissSavedDraft = () => {
        clearDraftFromStorage();
        setShowDraftRecovery(false);
    };

    const filteredPosts = posts.filter(post =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`${API_BASE_URL}/posts/${id}`, {
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

    const handleTogglePin = async (id: string, isPinned: boolean) => {
        try {
            const res = await fetch(`${API_BASE_URL}/posts/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isPinned, pinnedOrder: isPinned ? 999 : 0 }),
            });
            if (res.ok) {
                setPosts(posts.map(p => p.id === id ? { ...p, isPinned } : p));
                toast.success(isPinned ? 'Đã ghim bài viết' : 'Đã bỏ ghim bài viết');
            } else {
                toast.error('Không thể cập nhật');
            }
        } catch {
            toast.error('Lỗi kết nối');
        }
    };

    const handleSaveEdit = async () => {
        if (!editingPost) return;
        if (!validateForm()) {
            toast.error('Vui lòng kiểm tra lại các trường bắt buộc');
            return;
        }
        try {
            const url = editingPost.id ? `${API_BASE_URL}/posts/${editingPost.id}` : `${API_BASE_URL}/posts`;
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
                    status: editingPost.status,
                    isPinned: editingPost.isPinned ?? false,
                    pinnedOrder: editingPost.pinnedOrder ?? 0,
                })
            });

            if (res.ok) {
                setDraftPost(null);
                clearDraftFromStorage();
                fetchPosts();
                setEditingPost(null);
                setLastSaved(null);
                toast.success(editingPost.id ? "Cập nhật thành công" : "Thêm bài viết thành công");
            } else {
                const errorData = await res.json();
                toast.error(errorData.error || "Lỗi khi lưu");
            }
        } catch (error) {
            console.error("Save error:", error);
            toast.error("Lỗi kết nối");
        }
    };

    const closeAndSaveDraft = () => {
        if (editingPost && !editingPost.id && (editingPost.title || editingPost.content)) {
            saveDraftToStorage();
            toast.info('Đã lưu bản nháp');
        }
        setEditingPost(null);
    };

    const createNewPost = () => {
        if (draftPost) {
            setEditingPost(draftPost);
            setDraftPost(null);
            return;
        }
        setSlugManuallyEdited(false);
        setErrors({});
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
            updatedAt: new Date().toISOString(),
            isPinned: false,
            pinnedOrder: 0
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
                className="relative border-b border-border bg-background/40 backdrop-blur-xl sticky top-0 z-50"
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

                        <div className="flex items-center gap-4">
                            <NotificationBell />
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
                </div>
            </motion.div>

            {/* Draft Recovery Banner */}
            {showDraftRecovery && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-blue-900/50 border border-blue-500/50 rounded-xl p-4 mb-6 flex items-center justify-between"
                >
                    <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-blue-400" />
                        <div>
                            <p className="text-foreground font-medium">Bạn có bản nháp chưa lưu</p>
                            <p className="text-muted-foreground text-sm">Một bài viết đã được lưu tự động trước đó. Bạn có muốn khôi phục không?</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={dismissSavedDraft}
                            className="px-4 py-2 bg-muted border border-border text-foreground rounded-lg hover:bg-muted/80 transition-colors text-sm"
                        >
                            Bỏ qua
                        </button>
                        <button
                            onClick={recoverSavedDraft}
                            className="px-4 py-2 bg-blue-600 text-foreground rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                            Khôi phục bản nháp
                        </button>
                    </div>
                </motion.div>
            )}

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
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Ghim
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
                                                    <p className="text-foreground font-semibold line-clamp-2 flex items-center gap-2">
                                                        {post.title}
                                                        {post.isPinned && (
                                                            <span className="px-1.5 py-0.5 bg-red-500/20 border border-red-500/50 text-red-400 text-xs rounded">
                                                                GHIM
                                                            </span>
                                                        )}
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
                                            <div className="flex items-center justify-center">
                                                <Switch
                                                    checked={post.isPinned || false}
                                                    onCheckedChange={(checked) => handleTogglePin(post.id, checked)}
                                                />
                                            </div>
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
                            <div className="flex items-center gap-3">
                                {lastSaved && (
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Check className="w-3 h-3 text-green-500" />
                                        Đã lưu lúc {lastSaved.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                )}
                                <button
                                    type="button"
                                    onClick={() => setShowPreview(true)}
                                    className="px-4 py-2 bg-muted border border-border text-foreground rounded-lg hover:bg-muted/80 transition-colors text-sm font-medium flex items-center gap-2"
                                >
                                    <Eye className="w-4 h-4" />
                                    Xem trước
                                </button>
                                <button
                                    onClick={closeAndSaveDraft}
                                    className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Left Col: Images */}
                            <div className="lg:col-span-1 space-y-4">
                                {/* Featured Image */}
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <label className="block text-sm font-medium text-muted-foreground">Ảnh đại diện</label>
                                        <span className="group relative">
                                            <Info className="w-3.5 h-3.5 text-blue-400 cursor-help" />
                                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block w-64 bg-gray-900 text-white text-xs rounded-lg p-2 z-10 leading-relaxed">
                                                Ảnh hiển thị khi chia sẻ bài viết lên mạng xã hội (Facebook, Zalo). Kích thước khuyến nghị: <b>1200x630px</b>.
                                            </span>
                                        </span>
                                    </div>
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
                                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                                        Ảnh chia sẻ mạng xã hội
                                        <span className="group relative ml-1">
                                            <Info className="w-3 h-3 inline-block text-blue-400 cursor-help align-middle" />
                                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block w-64 bg-gray-900 text-white text-xs rounded-lg p-2 z-10">
                                                Ảnh hiển thị khi chia sẻ bài viết lên Facebook, Zalo, Messenger. Kích thước khuyến nghị: 1200x630px.
                                            </span>
                                        </span>
                                    </label>
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
                                        Tải ảnh chia sẻ
                                    </button>
                                </div>
                            </div>

                            {/* Right Col: Content */}
                            <div className="lg:col-span-2 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <label className="block text-sm font-semibold text-muted-foreground">Tiêu đề <span className="text-red-500">*</span></label>
                                            <span className="group relative">
                                                <Info className="w-3.5 h-3.5 text-blue-400 cursor-help" />
                                                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block w-64 bg-gray-900 text-white text-xs rounded-lg p-2 z-10 leading-relaxed">
                                                    Tiêu đề bài viết. Dùng <b>từ khóa chính</b> và hấp dẫn để thu hút người đọc. VD: <b>5 phụ kiện Honda Wave Alpha phổ biến nhất 2024</b>.
                                                </span>
                                            </span>
                                        </div>
                                        <input
                                            type="text"
                                            value={editingPost.title}
                                            onChange={(e) => handleTitleChange(e.target.value)}
                                            className={`w-full px-4 py-3 bg-muted border rounded-lg text-foreground focus:outline-none focus:ring-2 transition-all ${
                                                errors.title ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-border focus:border-green-600/50 focus:ring-green-600/20'
                                            }`}
                                            placeholder="VD: 5 phụ kiện Honda Wave Alpha phổ biến nhất 2024"
                                        />
                                        {errors.title && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.title}</p>}
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <label className="block text-sm font-semibold text-muted-foreground">Đường dẫn</label>
                                            <span className="group relative">
                                                <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                                                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block w-64 bg-gray-900 text-white text-xs rounded-lg p-2 z-10">
                                                    Phần đuôi URL của bài viết. Ví dụ: <b>/tin-khuyen-mai</b>. Nên dùng tiếng Việt không dấu, các từ cách nhau bằng dấu gạch ngang.
                                                </span>
                                            </span>
                                            <span className="text-red-500">*</span>
                                            {!slugManuallyEdited && editingPost.title && (
                                                <span className="text-xs text-blue-400 flex items-center gap-1">
                                                    <RefreshCw className="w-3 h-3" /> Tự tạo
                                                </span>
                                            )}
                                        </div>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">/</span>
                                            <input
                                                type="text"
                                                value={editingPost.slug}
                                                onChange={(e) => handleSlugChange(e.target.value)}
                                                className={`w-full pl-8 pr-4 py-3 bg-muted border rounded-lg text-foreground focus:outline-none focus:ring-2 transition-all ${
                                                    errors.slug ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-border focus:border-green-600/50 focus:ring-green-600/20'
                                                }`}
                                                placeholder="duong-dan-bai-viet"
                                            />
                                        </div>
                                        {errors.slug && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.slug}</p>}
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <label className="block text-sm font-semibold text-muted-foreground">Trạng thái</label>
                                        <span className="group relative">
                                            <Info className="w-3.5 h-3.5 text-blue-400 cursor-help" />
                                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block w-64 bg-gray-900 text-white text-xs rounded-lg p-2 z-10 leading-relaxed">
                                                <b>Draft</b>: Bài chưa xuất bản, chỉ admin thấy.<br/>
                                                <b>Published</b>: Bài hiển thị công khai trên website và được SEO index.
                                            </span>
                                        </span>
                                    </div>
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
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-sm font-semibold text-muted-foreground">Tóm tắt</label>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-muted-foreground">{editingPost.excerpt?.length || 0} / 200</span>
                                            <span className="group relative">
                                                <Info className="w-3.5 h-3.5 text-blue-400 cursor-help" />
                                                <span className="absolute bottom-full right-0 mb-1 hidden group-hover:block w-64 bg-gray-900 text-white text-xs rounded-lg p-2 z-10 leading-relaxed">
                                                    Đoạn mô tả ngắn hiển thị trên danh sách bài viết và trong kết quả Google. Nên viết <b>1-2 câu ngắn gọn</b>, chứa từ khóa chính, không quá 200 ký tự.
                                                </span>
                                            </span>
                                        </div>
                                    </div>
                                    <textarea
                                        value={editingPost.excerpt || ''}
                                        onChange={(e) => handleInputChange('excerpt', e.target.value)}
                                        rows={2}
                                        maxLength={200}
                                        className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:border-green-600/50 focus:ring-2 focus:ring-green-600/20 resize-none"
                                        placeholder="VD: Tổng hợp các phụ kiện phổ biến nhất cho Honda Wave Alpha 2024, giá cả hợp lý và dễ lắp đặt."
                                    />
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-sm font-semibold text-muted-foreground">
                                            Nội dung <span className="text-red-500">*</span>
                                        </label>
                                        <span className="text-xs text-muted-foreground">{editingPost.content.length} ký tự</span>
                                    </div>
                                    <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1 bg-muted/50 rounded-lg px-3 py-2 border border-border">
                                        <Info className="w-3 h-3 flex-shrink-0" />
                                        <span>Mỗi dòng trống sẽ được ngắt dòng trong bài viết. Dùng <b>dấu gạch ngang (-)</b> ở đầu dòng để tạo danh sách.</span>
                                    </div>
                                    <textarea
                                        value={editingPost.content}
                                        onChange={(e) => handleInputChange('content', e.target.value)}
                                        rows={10}
                                        className={`w-full px-4 py-3 bg-muted border rounded-lg text-foreground focus:outline-none focus:ring-2 resize-none transition-all ${
                                            errors.content ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-border focus:border-green-600/50 focus:ring-green-600/20'
                                        }`}
                                        placeholder="Nhập nội dung bài viết. Mỗi dòng trống sẽ được xuống dòng..."
                                    />
                                    {errors.content && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.content}</p>}
                                </div>

                                <div className="bg-muted/30 border border-border rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-4">
                                        <h4 className="text-sm font-semibold text-muted-foreground">Tối ưu tìm kiếm (SEO)</h4>
                                        <span className="group relative">
                                            <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block w-72 bg-gray-900 text-white text-xs rounded-lg p-2 z-10">
                                                <b>Meta Title</b>: Tiêu đề hiển thị trên Google (nên 50-60 ký tự).<br/>
                                                <b>Meta Description</b>: Mô tả ngắn hiển thị dưới tiêu đề trên Google (nên 150-160 ký tự).<br/>
                                                Nếu bỏ trống, hệ thống sẽ dùng tiêu đề và tóm tắt mặc định.
                                            </span>
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="block text-sm font-semibold text-muted-foreground">Meta Title</label>
                                                <span className={`text-xs ${(editingPost.metaTitle?.length || 0) > 60 ? 'text-red-400' : 'text-muted-foreground'}`}>
                                                    {editingPost.metaTitle?.length || 0} / 60
                                                </span>
                                            </div>
                                            <input
                                                type="text"
                                                value={editingPost.metaTitle || ''}
                                                onChange={(e) => handleInputChange('metaTitle', e.target.value)}
                                                maxLength={70}
                                                className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:border-green-600/50 focus:ring-2 focus:ring-green-600/20"
                                            />
                                        </div>

                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="block text-sm font-semibold text-muted-foreground">Meta Description</label>
                                                <span className={`text-xs ${(editingPost.metaDescription?.length || 0) > 160 ? 'text-red-400' : 'text-muted-foreground'}`}>
                                                    {editingPost.metaDescription?.length || 0} / 160
                                                </span>
                                            </div>
                                            <input
                                                type="text"
                                                value={editingPost.metaDescription || ''}
                                                onChange={(e) => handleInputChange('metaDescription', e.target.value)}
                                                maxLength={200}
                                                className={`w-full px-4 py-3 bg-muted border rounded-lg text-foreground focus:outline-none focus:ring-2 transition-all ${
                                                    errors.metaDescription ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-border focus:border-green-600/50 focus:ring-green-600/20'
                                                }`}
                                                placeholder="Mô tả ngắn hiển thị trên Google..."
                                            />
                                            {errors.metaDescription && <p className="mt-1 text-xs text-red-500">{errors.metaDescription}</p>}
                                        </div>
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

            {/* Preview Modal */}
            {showPreview && editingPost && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
                    onClick={() => setShowPreview(false)}
                >
                    <motion.div
                        initial={{ scale: 0.95, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative bg-card border border-border rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto"
                    >
                        {/* Preview Header */}
                        <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between rounded-t-2xl z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-800 rounded-lg flex items-center justify-center">
                                    <Eye className="w-5 h-5 text-foreground" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-foreground">Xem trước bài viết</h3>
                                    <p className="text-xs text-muted-foreground">Đây là cách bài viết sẽ hiển thị với khách hàng</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowPreview(false)}
                                className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6">
                            {/* Featured Image */}
                            {editingPost.featuredImage ? (
                                <div className="w-full aspect-video rounded-xl overflow-hidden mb-6 bg-muted">
                                    <img src={editingPost.featuredImage} alt={editingPost.title} className="w-full h-full object-cover" />
                                </div>
                            ) : (
                                <div className="w-full aspect-video rounded-xl bg-muted border-2 border-dashed border-border flex items-center justify-center mb-6">
                                    <span className="text-muted-foreground text-sm">Chưa có ảnh đại diện</span>
                                </div>
                            )}

                            {/* Status badge */}
                            <div className="mb-4">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium ${
                                    editingPost.status === 'PUBLISHED'
                                        ? 'bg-green-500/10 border border-green-500/50 text-green-400'
                                        : 'bg-yellow-500/10 border border-yellow-500/50 text-yellow-400'
                                }`}>
                                    {editingPost.status === 'PUBLISHED' ? 'Đã xuất bản' : 'Bản nháp'}
                                </span>
                            </div>

                            {/* Title */}
                            <h1 className="text-2xl font-black text-foreground mb-3 leading-tight">
                                {editingPost.title || <span className="text-muted-foreground italic">Chưa có tiêu đề</span>}
                            </h1>

                            {/* Excerpt */}
                            {editingPost.excerpt && (
                                <p className="text-muted-foreground text-base mb-4 leading-relaxed border-l-4 border-green-500/50 pl-4 italic">
                                    {editingPost.excerpt}
                                </p>
                            )}

                            {/* Content */}
                            <div className="text-foreground leading-relaxed space-y-2">
                                {editingPost.content ? (
                                    editingPost.content.split('\n').map((line, i) => (
                                        <p key={i} className={line.startsWith('- ') ? 'pl-4 text-muted-foreground' : ''}>
                                            {line || <br />}
                                        </p>
                                    ))
                                ) : (
                                    <p className="text-muted-foreground italic">Chưa có nội dung</p>
                                )}
                            </div>

                            {/* SEO Preview */}
                            <div className="mt-8 pt-6 border-t border-border">
                                <h4 className="text-sm font-semibold text-muted-foreground mb-3">Xem trước trên Google</h4>
                                <div className="bg-white rounded-lg p-4 border border-gray-200">
                                    <p className="text-blue-600 text-sm truncate">
                                        {(editingPost.metaTitle || editingPost.title || 'Tiêu đề bài viết')}
                                    </p>
                                    <p className="text-green-700 text-xs truncate">
                                        {`https://vinpart.vn/${editingPost.slug || 'duong-dan-bai-viet'}`}
                                    </p>
                                    <p className="text-gray-600 text-sm leading-snug mt-1">
                                        {editingPost.metaDescription || editingPost.excerpt || 'Mô tả bài viết sẽ hiển thị ở đây trên Google...'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
}

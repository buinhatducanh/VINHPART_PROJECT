import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Shield, Plus, Trash2, Mail, AlertTriangle, Loader2, UserCheck } from 'lucide-react';
import { adminEmailsApi, AdminEmail } from '@/lib/api';
import { toast } from 'sonner';

interface ManageAdminEmailsPageProps {
    onBack: () => void;
}

export function ManageAdminEmailsPage({ onBack }: ManageAdminEmailsPageProps) {
    const [adminEmails, setAdminEmails] = useState<AdminEmail[]>([]);
    const [loading, setLoading] = useState(true);
    const [newEmail, setNewEmail] = useState('');
    const [adding, setAdding] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

    // Get current logged-in user email to prevent self-deletion
    const currentUserEmail = (() => {
        try {
            const saved = localStorage.getItem('vinhpart_user');
            return saved ? JSON.parse(saved)?.email?.toLowerCase() : '';
        } catch { return ''; }
    })();

    const fetchAdminEmails = async () => {
        try {
            setLoading(true);
            const data = await adminEmailsApi.getAll();
            setAdminEmails(data);
        } catch (error: any) {
            toast.error(error.message || 'Không thể tải danh sách admin');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdminEmails();
    }, []);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newEmail.trim() || !newEmail.includes('@')) {
            toast.error('Vui lòng nhập email hợp lệ');
            return;
        }

        setAdding(true);
        try {
            await adminEmailsApi.add(newEmail.trim());
            toast.success(`Đã thêm ${newEmail.trim()} làm quản trị viên`);
            setNewEmail('');
            fetchAdminEmails();
        } catch (error: any) {
            toast.error(error.message || 'Không thể thêm email');
        } finally {
            setAdding(false);
        }
    };

    const handleDelete = async (id: string) => {
        setDeletingId(id);
        try {
            await adminEmailsApi.remove(id);
            toast.success('Đã xóa quyền quản trị viên');
            setShowDeleteConfirm(null);
            fetchAdminEmails();
        } catch (error: any) {
            toast.error(error.message || 'Không thể xóa email');
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-foreground">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-gray-950/80 backdrop-blur-xl border-b border-border">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
                            <Shield className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold">Quản lý Admin</h1>
                            <p className="text-xs text-muted-foreground">Thêm / xóa email quản trị viên</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
                {/* Info Banner */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl"
                >
                    <div className="flex items-start gap-3">
                        <UserCheck className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-amber-200/80">
                            <p className="font-semibold text-amber-400 mb-1">Cách hoạt động</p>
                            <p>Thêm email Gmail vào danh sách bên dưới. Khi người dùng đăng nhập bằng Google với email trùng khớp, họ sẽ tự động có quyền Admin và truy cập được Dashboard quản trị.</p>
                        </div>
                    </div>
                </motion.div>

                {/* Add Email Form */}
                <motion.form
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    onSubmit={handleAdd}
                    className="mb-8 p-6 bg-card border border-border rounded-xl"
                >
                    <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
                        <Plus className="w-4 h-4 text-green-400" />
                        Thêm quản trị viên mới
                    </h2>
                    <div className="flex gap-3">
                        <div className="relative flex-1">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <input
                                type="email"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                placeholder="example@gmail.com"
                                className="w-full pl-12 pr-4 py-3 bg-muted border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-amber-500 transition-colors"
                                required
                            />
                        </div>
                        <motion.button
                            type="submit"
                            disabled={adding || !newEmail.trim()}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-semibold rounded-lg shadow-lg shadow-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                        >
                            {adding ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Plus className="w-4 h-4" />
                            )}
                            Thêm
                        </motion.button>
                    </div>
                </motion.form>

                {/* Admin Emails List */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-amber-400" />
                        Danh sách quản trị viên ({adminEmails.length})
                    </h2>

                    {loading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-16 bg-card border border-border rounded-xl animate-pulse" />
                            ))}
                        </div>
                    ) : adminEmails.length === 0 ? (
                        <div className="text-center py-12 bg-card border border-border rounded-xl">
                            <Shield className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                            <p className="text-muted-foreground">Chưa có email quản trị viên nào</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <AnimatePresence mode="popLayout">
                                {adminEmails.map((admin, index) => (
                                    <motion.div
                                        key={admin.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="flex items-center justify-between p-4 bg-card border border-border rounded-xl hover:border-amber-500/30 transition-colors group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center border border-amber-500/30">
                                                <Mail className="w-5 h-5 text-amber-400" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium text-foreground">{admin.email}</p>
                                                    {admin.email.toLowerCase() === currentUserEmail && (
                                                        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">Bạn</span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    {admin.addedBy === 'system' ? 'Mặc định' : `Thêm bởi ${admin.addedBy}`} · {new Date(admin.createdAt).toLocaleDateString('vi-VN')}
                                                </p>
                                            </div>
                                        </div>

                                        {admin.email.toLowerCase() === currentUserEmail ? (
                                            <div className="p-2 text-xs text-amber-500/50 italic">Tài khoản của bạn</div>
                                        ) : showDeleteConfirm === admin.id ? (
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-amber-400 mr-2">Xác nhận xóa?</span>
                                                <button
                                                    onClick={() => handleDelete(admin.id)}
                                                    disabled={deletingId === admin.id}
                                                    className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1"
                                                >
                                                    {deletingId === admin.id ? (
                                                        <Loader2 className="w-3 h-3 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="w-3 h-3" />
                                                    )}
                                                    Xóa
                                                </button>
                                                <button
                                                    onClick={() => setShowDeleteConfirm(null)}
                                                    className="px-3 py-1.5 bg-muted hover:bg-muted/80 text-foreground text-xs font-medium rounded-lg transition-colors"
                                                >
                                                    Hủy
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setShowDeleteConfirm(admin.id)}
                                                className="p-2 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                title="Xóa quyền admin"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </motion.div>

                {/* Warning Notice */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl"
                >
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-300/80">
                            <span className="font-semibold text-red-400">Lưu ý:</span> Xóa email admin sẽ tự động hạ quyền người dùng đó xuống USER. Không thể xóa email admin cuối cùng.
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

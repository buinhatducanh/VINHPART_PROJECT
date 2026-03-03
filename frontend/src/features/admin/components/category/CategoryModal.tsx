import { motion, AnimatePresence } from 'framer-motion';
import { X, Edit, Plus, Type, Link as LinkIcon, AlignLeft, Folder } from 'lucide-react';
import { Category } from '@/shared/types';

export interface CategoryForm {
    name: string;
    slug: string;
    description: string;
    image: string;
    parentId: string | null;
}

interface CategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    editingCategory: Category | null;
    formData: CategoryForm;
    setFormData: React.Dispatch<React.SetStateAction<CategoryForm>>;
    submitting: boolean;
    onNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function CategoryModal({
    isOpen,
    onClose,
    onSubmit,
    editingCategory,
    formData,
    setFormData,
    submitting,
    onNameChange
}: CategoryModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-background/90 backdrop-blur-md"
                    />
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className="relative bg-card border border-border rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl"
                    >
                        <div className="p-6 border-b border-border flex items-center justify-between bg-gradient-to-r from-orange-600/5 to-transparent">
                            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                                {editingCategory ? <Edit className="w-5 h-5 text-blue-500" /> : <Plus className="w-5 h-5 text-green-500" />}
                                {editingCategory ? 'CẬP NHẬT DANH MỤC' : 'THÊM DANH MỤC MỚI'}
                            </h2>
                            <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
                                <X className="w-5 h-5 text-muted-foreground" />
                            </button>
                        </div>

                        <form onSubmit={onSubmit} className="p-6 space-y-5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                    <Type className="w-3 h-3" /> Tên danh mục (bắt buộc)
                                </label>
                                <input
                                    autoFocus
                                    type="text"
                                    value={formData.name}
                                    onChange={onNameChange}
                                    className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-orange-600/50 transition-all"
                                    placeholder="VD: Phụ tùng động cơ"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                    <LinkIcon className="w-3 h-3" /> Đường dẫn (Slug)
                                </label>
                                <input
                                    type="text"
                                    value={formData.slug}
                                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                                    className="w-full bg-background border border-border rounded-lg px-4 py-3 text-muted-foreground focus:outline-none focus:border-orange-600/50 transition-all text-sm"
                                    placeholder="phu-tung-dong-co"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                    <AlignLeft className="w-3 h-3" /> Mô tả
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-orange-600/50 transition-all text-sm min-h-[100px]"
                                    placeholder="Mô tả ngắn gọn về danh mục..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                    <Folder className="w-3 h-3" /> Hình ảnh (URL)
                                </label>
                                <input
                                    type="text"
                                    value={formData.image}
                                    onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                                    className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-orange-600/50 transition-all text-sm"
                                    placeholder="https://example.com/image.jpg"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-6 py-2.5 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    HỦY BỎ
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className={`px-8 py-2.5 bg-orange-600 text-foreground text-sm font-bold rounded-lg hover:bg-orange-700 transition-all shadow-lg shadow-orange-600/20 flex items-center gap-2 ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {submitting ? 'ĐANG LƯU...' : (editingCategory ? 'LƯU THAY ĐỔI' : 'TẠO DANH MỤC')}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

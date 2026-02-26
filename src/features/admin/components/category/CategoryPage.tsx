import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Category } from '@/shared/types';
import { toast } from 'sonner';

// Import sub-components from the same directory
import { CategoryHeader } from './CategoryHeader';
import { CategorySearch } from './CategorySearch';
import { CategoryTree } from './CategoryTree';
import { CategoryModal, CategoryForm } from './CategoryModal';
import { CategoryDeleteConfirm } from './CategoryDeleteConfirm';

interface CategoryPageProps {
    onBack: () => void;
}

const initialForm: CategoryForm = {
    name: '',
    slug: '',
    description: '',
    image: '',
    parentId: null
};

export function CategoryPage({ onBack }: CategoryPageProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteProgress, setDeleteProgress] = useState(0);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [formData, setFormData] = useState<CategoryForm>(initialForm);
    const [submitting, setSubmitting] = useState(false);

    // Fetch categories from API
    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:3001/api/categories');
            if (res.ok) {
                const data = await res.json();
                const mapped = data.map((cat: any) => ({
                    id: cat.id,
                    name: cat.name,
                    parent_id: cat.parentId,
                    description: cat.description,
                    image: cat.image,
                    order: 0,
                    created_at: cat.createdAt,
                    updated_at: cat.updatedAt,
                    slug: cat.slug
                }));
                setCategories(mapped);
            } else {
                toast.error('Không thể tải danh mục');
            }
        } catch (error) {
            console.error('Fetch categories error:', error);
            toast.error('Lỗi kết nối API');
        } finally {
            setLoading(false);
        }
    };

    // Tạo slug tự động
    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[đĐ]/g, 'd')
            .replace(/([^0-9a-z-\s])/g, '')
            .replace(/(\s+)/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-+|-+$/g, '');
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        setFormData(prev => ({
            ...prev,
            name,
            slug: generateSlug(name)
        }));
    };

    // Mở modal thêm mới
    const openAddModal = (parentId: string | null = null) => {
        setFormData({ ...initialForm, parentId });
        setEditingCategory(null);
        setShowAddModal(true);
    };

    // Mở modal sửa
    const openEditModal = (category: Category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            slug: category.slug || generateSlug(category.name),
            description: category.description || '',
            image: category.image || '',
            parentId: category.parent_id || null
        });
        setShowAddModal(true);
    };

    // Xử lý gửi form
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) return toast.error('Vui lòng nhập tên danh mục');

        setSubmitting(true);
        try {
            const url = editingCategory
                ? `http://localhost:3001/api/categories/${editingCategory.id}`
                : 'http://localhost:3001/api/categories';

            const method = editingCategory ? 'PATCH' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    slug: formData.slug || generateSlug(formData.name),
                    description: formData.description,
                    image: formData.image,
                    parentId: formData.parentId
                })
            });

            if (res.ok) {
                toast.success(editingCategory ? 'Cập nhật thành công' : 'Thêm mới thành công');
                setShowAddModal(false);
                fetchCategories();
            } else {
                const error = await res.json();
                toast.error(error.error || 'Có lỗi xảy ra');
            }
        } catch (error) {
            console.error('Submit error:', error);
            toast.error('Lỗi kết nối API');
        } finally {
            setSubmitting(false);
        }
    };

    const toggleExpand = (id: string) => {
        const newExpanded = new Set(expandedCategories);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedCategories(newExpanded);
    };

    const handleDelete = async (id: string) => {
        setIsDeleting(true);
        setDeleteProgress(0);

        // Simulate progress while calling API
        const progressInterval = setInterval(() => {
            setDeleteProgress(prev => {
                if (prev >= 90) {
                    clearInterval(progressInterval);
                    return 90;
                }
                return prev + 10;
            });
        }, 100);

        try {
            const res = await fetch(`http://localhost:3001/api/categories/${id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                clearInterval(progressInterval);
                setDeleteProgress(100);

                // Short delay to show 100%
                await new Promise(resolve => setTimeout(resolve, 500));

                await fetchCategories();
                toast.success('Đã xóa danh mục');
            } else {
                clearInterval(progressInterval);
                const error = await res.json();
                toast.error(error.error || 'Không thể xóa');
            }
        } catch (error) {
            clearInterval(progressInterval);
            toast.error('Lỗi kết nối');
        } finally {
            setIsDeleting(false);
            setDeleteProgress(0);
            setShowDeleteConfirm(null);
        }
    };

    return (
        <div className="min-h-screen bg-black pb-20 selection:bg-orange-600/30">
            {/* Background Particles */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
                {[...Array(15)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-orange-600 rounded-full"
                        initial={{ x: Math.random() * 100 + '%', y: Math.random() * 100 + '%' }}
                        animate={{ y: [null, '-100%'], opacity: [0, 1, 0] }}
                        transition={{ duration: Math.random() * 10 + 5, repeat: Infinity, ease: 'linear' }}
                    />
                ))}
            </div>

            <CategoryHeader onBack={onBack} onAdd={() => openAddModal()} />

            <main className="max-w-4xl mx-auto px-4 py-8">
                <CategorySearch value={searchQuery} onChange={setSearchQuery} />

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="w-10 h-10 border-2 border-orange-600 border-t-transparent rounded-full animate-spin" />
                        <p className="text-gray-500 text-sm animate-pulse">Đang tải dữ liệu...</p>
                    </div>
                ) : (
                    <CategoryTree
                        categories={categories}
                        expandedCategories={expandedCategories}
                        onToggleExpand={toggleExpand}
                        onAddSub={openAddModal}
                        onEdit={openEditModal}
                        onDelete={setShowDeleteConfirm}
                        searchQuery={searchQuery}
                    />
                )}
            </main>

            <CategoryModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSubmit={handleSubmit}
                editingCategory={editingCategory}
                formData={formData}
                setFormData={setFormData}
                submitting={submitting}
                onNameChange={handleNameChange}
            />

            <CategoryDeleteConfirm
                isOpen={!!showDeleteConfirm}
                isDeleting={isDeleting}
                progress={deleteProgress}
                onClose={() => setShowDeleteConfirm(null)}
                onConfirm={() => showDeleteConfirm && handleDelete(showDeleteConfirm)}
            />
        </div>
    );
}

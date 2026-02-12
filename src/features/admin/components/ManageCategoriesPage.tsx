import { motion, AnimatePresence } from 'framer-motion';
import { Folder, ArrowLeft, Search, Edit, Trash2, Plus, ChevronRight, ChevronDown, X, Link as LinkIcon, AlignLeft, Type } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Category } from '@/shared/types';
import { toast } from 'sonner';

interface ManageCategoriesPageProps {
  onBack: () => void;
}

interface CategoryForm {
  name: string;
  slug: string;
  description: string;
  image: string;
  parentId: string | null;
}

const initialForm: CategoryForm = {
  name: '',
  slug: '',
  description: '',
  image: '',
  parentId: null
};

export function ManageCategoriesPage({ onBack }: ManageCategoriesPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
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
          updated_at: cat.updatedAt
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

  // Lấy danh mục con
  const getChildren = (parentId: string | null): Category[] => {
    return categories
      .filter(cat => cat.parent_id === parentId)
      .sort((a, b) => a.order - b.order);
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

  const countChildren = (id: string): number => {
    return categories.filter(cat => cat.parent_id === id).length;
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:3001/api/categories/${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        await fetchCategories();
        toast.success('Đã xóa danh mục');
      } else {
        const error = await res.json();
        toast.error(error.error || 'Không thể xóa');
      }
    } catch (error) {
      toast.error('Lỗi kết nối');
    } finally {
      setShowDeleteConfirm(null);
    }
  };

  const renderCategory = (category: Category, level: number = 0) => {
    const children = getChildren(category.id);
    const hasChildren = children.length > 0;
    const isExpanded = expandedCategories.has(category.id);

    return (
      <div key={category.id}>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="group flex items-center gap-3 p-4 bg-gray-800/30 hover:bg-gray-800/50 border border-gray-800 rounded-lg transition-all mb-2"
          style={{ marginLeft: level * 32 }}
        >
          {hasChildren ? (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => toggleExpand(category.id)}
              className="p-1 hover:bg-gray-700 rounded transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-400" />
              )}
            </motion.button>
          ) : (
            <div className="w-7" />
          )}

          <div className={`w-10 h-10 bg-gradient-to-br ${level === 0 ? 'from-orange-600 to-orange-800' :
            level === 1 ? 'from-blue-600 to-blue-800' :
              'from-green-600 to-green-800'
            } rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg`}>
            {category.image ? (
              <img src={category.image} alt={category.name} className="w-10 h-10 object-cover rounded-lg" />
            ) : (
              <Folder className="w-5 h-5 text-white" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-white font-semibold truncate">{category.name}</h3>
              {hasChildren && (
                <span className="px-2 py-0.5 bg-orange-500/10 border border-orange-500/50 rounded text-orange-400 text-[10px] font-bold">
                  {countChildren(category.id)} CON
                </span>
              )}
            </div>
            {category.description && (
              <p className="text-xs text-gray-500 truncate italic">{category.description}</p>
            )}
          </div>

          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => openAddModal(category.id)}
              className="p-2 bg-green-600/10 border border-green-600/50 rounded-lg hover:bg-green-600/20 transition-all"
              title="Thêm danh mục con"
            >
              <Plus className="w-4 h-4 text-green-400" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => openEditModal(category)}
              className="p-2 bg-blue-600/10 border border-blue-600/50 rounded-lg hover:bg-blue-600/20 transition-all"
            >
              <Edit className="w-4 h-4 text-blue-400" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowDeleteConfirm(category.id)}
              className="p-2 bg-red-600/10 border border-red-600/50 rounded-lg hover:bg-red-600/20 transition-all"
            >
              <Trash2 className="w-4 h-4 text-red-400" />
            </motion.button>
          </div>
        </motion.div>

        <AnimatePresence>
          {hasChildren && isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              {children.map(child => renderCategory(child, level + 1))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const rootCategories = getChildren(null);
  const filteredRootCategories = rootCategories.filter(cat =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black pb-20 selection:bg-orange-600/30">
      {/* Background Particles (Keep original logic) */}
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

      {/* Header */}
      <header className="sticky top-0 z-40 bg-black/60 backdrop-blur-xl border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.button
              onClick={onBack}
              whileHover={{ x: -2 }}
              className="p-2 bg-gray-900 border border-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
            <div>
              <h1 className="text-xl font-black text-white tracking-tight">DANH MỤC</h1>
              <p className="text-[10px] text-orange-600 font-bold tracking-widest uppercase">Management System</p>
            </div>
          </div>
          <motion.button
            onClick={() => openAddModal()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-lg flex items-center gap-2 hover:bg-red-800y  transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]"
          >
            <Plus className="w-4 h-4" />
            TẠO MỚI
          </motion.button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm danh mục..."
            className="w-full pl-12 pr-4 py-4 bg-gray-900/50 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-orange-600/50 focus:ring-1 focus:ring-orange-600/20 transition-all text-sm"
          />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-2 border-orange-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500 text-sm animate-pulse">Đang tải dữ liệu...</p>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredRootCategories.map(category => renderCategory(category))}
            {filteredRootCategories.length === 0 && (
              <div className="text-center py-20 bg-gray-900/20 border border-dashed border-gray-800 rounded-2xl">
                <Folder className="w-12 h-12 text-gray-800 mx-auto mb-4" />
                <p className="text-gray-600 text-sm font-medium">Không có danh mục nào được tìm thấy</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-gray-800 flex items-center justify-between bg-gradient-to-r from-orange-600/5 to-transparent">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  {editingCategory ? <Edit className="w-5 h-5 text-blue-500" /> : <Plus className="w-5 h-5 text-green-500" />}
                  {editingCategory ? 'CẬP NHẬT DANH MỤC' : 'THÊM DANH MỤC MỚI'}
                </h2>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                    <Type className="w-3 h-3" /> Tên danh mục (bắt buộc)
                  </label>
                  <input
                    autoFocus
                    type="text"
                    value={formData.name}
                    onChange={handleNameChange}
                    className="w-full bg-black border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-600/50 transition-all"
                    placeholder="VD: Phụ tùng động cơ"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                    <LinkIcon className="w-3 h-3" /> Đường dẫn (Slug)
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    className="w-full bg-black border border-gray-800 rounded-lg px-4 py-3 text-gray-400 focus:outline-none focus:border-orange-600/50 transition-all text-sm"
                    placeholder="phu-tung-dong-co"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                    <AlignLeft className="w-3 h-3" /> Mô tả
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full bg-black border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-600/50 transition-all text-sm min-h-[100px]"
                    placeholder="Mô tả ngắn gọn về danh mục..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                    <Folder className="w-3 h-3" /> Hình ảnh (URL)
                  </label>
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                    className="w-full bg-black border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-600/50 transition-all text-sm"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-6 py-2.5 text-sm font-bold text-gray-400 hover:text-white transition-colors"
                  >
                    HỦY BỎ
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`px-8 py-2.5 bg-orange-600 text-white text-sm font-bold rounded-lg hover:bg-orange-700 transition-all shadow-lg shadow-orange-600/20 flex items-center gap-2 ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {submitting ? 'ĐANG LƯU...' : (editingCategory ? 'LƯU THAY ĐỔI' : 'TẠO DANH MỤC')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirm (Keep original logic but style it) */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowDeleteConfirm(null)} className="absolute inset-0 bg-black/95" />
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="relative bg-gray-900 border border-red-900/20 rounded-2xl p-8 max-w-sm w-full text-center">
              <div className="w-16 h-16 bg-red-600/10 border border-red-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">XÁC NHẬN XÓA</h3>
              <p className="text-sm text-gray-500 mb-8 leading-relaxed">Hành động này sẽ xóa vĩnh viễn danh mục và tất cả danh mục con liên quan. Bạn chắc chứ?</p>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setShowDeleteConfirm(null)} className="px-6 py-3 bg-gray-800 text-white text-xs font-bold rounded-xl hover:bg-gray-700 transition-all">HUỶ</button>
                <button onClick={() => handleDelete(showDeleteConfirm)} className="px-6 py-3 bg-red-600 text-white text-xs font-bold rounded-xl hover:bg-red-700 transition-all">XÓA NGAY</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

import { motion } from 'motion/react';
import { Folder, ArrowLeft, Search, Edit, Trash2, Plus, ChevronRight, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Category } from '@/shared/types';
import { toast } from 'sonner';

interface ManageCategoriesPageProps {
  onBack: () => void;
}

export function ManageCategoriesPage({ onBack }: ManageCategoriesPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['cat-1', 'cat-2']));
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [_editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [_showAddModal, setShowAddModal] = useState(false);
  const [_selectedParent, setSelectedParent] = useState<string | null>(null);

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
        // Map API response to frontend Category type
        const mapped = data.map((cat: any) => ({
          id: cat.id,
          name: cat.name,
          parent_id: cat.parentId,
          description: cat.description,
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
      toast.error('Lỗi kết nối');
    } finally {
      setLoading(false);
    }
  };

  // Lấy danh mục con
  const getChildren = (parentId: string | null): Category[] => {
    return categories
      .filter(cat => cat.parent_id === parentId)
      .sort((a, b) => a.order - b.order);
  };

  // Toggle expand/collapse
  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedCategories(newExpanded);
  };

  // Đếm số con
  const countChildren = (id: string): number => {
    return categories.filter(cat => cat.parent_id === id).length;
  };

  // Xóa danh mục
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
        toast.error(error.error || 'Không thể xóa danh mục');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Lỗi kết nối');
    } finally {
      setShowDeleteConfirm(null);
    }
  };

  // Render danh mục đệ quy
  const renderCategory = (category: Category, level: number = 0) => {
    const children = getChildren(category.id);
    const hasChildren = children.length > 0;
    const isExpanded = expandedCategories.has(category.id);

    return (
      <div key={category.id}>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`group flex items-center gap-3 p-4 bg-gray-800/30 hover:bg-gray-800/50 border border-gray-800 rounded-lg transition-all ${level > 0 ? 'ml-' + (level * 8) : ''
            }`}
          style={{ marginLeft: level * 32 }}
        >
          {/* Expand/Collapse Button */}
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

          {/* Icon */}
          <div className={`w-10 h-10 bg-gradient-to-br ${level === 0 ? 'from-orange-600 to-orange-800' :
            level === 1 ? 'from-blue-600 to-blue-800' :
              'from-green-600 to-green-800'
            } rounded-lg flex items-center justify-center flex-shrink-0`}>
            <Folder className="w-5 h-5 text-white" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-white font-semibold truncate">{category.name}</h3>
              {hasChildren && (
                <span className="px-2 py-0.5 bg-orange-500/10 border border-orange-500/50 rounded text-orange-400 text-xs font-semibold">
                  {countChildren(category.id)} con
                </span>
              )}
            </div>
            {category.description && (
              <p className="text-sm text-gray-500 truncate">{category.description}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                setSelectedParent(category.id);
                setShowAddModal(true);
              }}
              className="p-2 bg-green-600/10 border border-green-600/50 rounded-lg hover:bg-green-600/20 transition-all"
              title="Thêm danh mục con"
            >
              <Plus className="w-4 h-4 text-green-400" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setEditingCategory(category)}
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

        {/* Render children if expanded */}
        {hasChildren && isExpanded && (
          <div className="mt-2 space-y-2">
            {children.map(child => renderCategory(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const rootCategories = getChildren(null);
  const filteredRootCategories = rootCategories.filter(cat =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-orange-800 rounded-xl flex items-center justify-center">
                  <Folder className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-transparent bg-gradient-to-r from-white via-gray-200 to-orange-600 bg-clip-text">
                    QUẢN LÝ DANH MỤC
                  </h1>
                  <p className="text-sm text-gray-500">{categories.length} danh mục</p>
                </div>
              </div>
            </div>

            {/* Add Category Button */}
            <motion.button
              onClick={() => {
                setSelectedParent(null);
                setShowAddModal(true);
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg hover:from-orange-700 hover:to-orange-800 transition-all shadow-lg shadow-orange-600/25 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Thêm danh mục gốc
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl p-4 mb-6"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm danh mục..."
              className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-600/50 focus:ring-2 focus:ring-orange-600/20 transition-all"
            />
          </div>
        </motion.div>

        {/* Categories Tree */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-2"
        >
          {filteredRootCategories.map(category => (
            <div key={category.id}>
              {renderCategory(category, 0)}
            </div>
          ))}
        </motion.div>

        {/* Empty State */}
        {filteredRootCategories.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl p-12 text-center"
          >
            <Folder className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Không tìm thấy danh mục</h3>
            <p className="text-gray-500 mb-4">Không có danh mục nào phù hợp với tìm kiếm của bạn.</p>
            <motion.button
              onClick={() => setSearchQuery('')}
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

              <h3 className="text-2xl font-bold text-white text-center mb-2">Xóa danh mục</h3>
              <p className="text-gray-400 text-center mb-6">
                Bạn có chắc chắn muốn xóa danh mục này? Tất cả danh mục con cũng sẽ bị xóa. Hành động này không thể hoàn tác.
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

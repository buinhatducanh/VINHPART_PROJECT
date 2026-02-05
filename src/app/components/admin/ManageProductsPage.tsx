import { motion } from 'motion/react';
import { Package, ArrowLeft, Search, Edit, Trash2, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Product } from '@/app/types';

interface ManageProductsPageProps {
  onBack: () => void;
  onAddProduct: () => void;
}

export function ManageProductsPage({ onBack, onAddProduct }: ManageProductsPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]); // Start empty
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch products on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = () => {
    setLoading(true);
    fetch('http://localhost:3001/api/products')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setProducts(data);
        else setProducts([]);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching products:", err);
        setLoading(false);
      });
  };

  const filteredProducts = products.filter(product =>
    product.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.compatible_brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value);
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:3001/api/products/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setProducts(products.filter(p => p.product_id !== id));
        setShowDeleteConfirm(null);
        alert("Đã xóa sản phẩm thành công");
      } else {
        alert("Lỗi khi xóa sản phẩm");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Lỗi kết nối");
    }
  };

  const handleSaveEdit = async () => {
    if (editingProduct) {
      try {
        const res = await fetch(`http://localhost:3001/api/products/${editingProduct.product_id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editingProduct)
        });

        if (res.ok) {
          await res.json(); // Consume body
          // Update local state is tricky because API returns generic object, but we map it. 
          // Simplest is to refetch or manually update if we know structure matches.
          // Let's refetch to be safe and consistent
          fetchProducts();
          setEditingProduct(null);
          alert("Cập nhật thành công");
        } else {
          alert("Lỗi cập nhật");
        }
      } catch (error) {
        console.error("Update error:", error);
        alert("Lỗi kết nối");
      }
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading products...</div>;
  }

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
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-transparent bg-gradient-to-r from-white via-gray-200 to-blue-600 bg-clip-text">
                    QUẢN LÝ SẢN PHẨM
                  </h1>
                  <p className="text-sm text-gray-500">{products.length} sản phẩm</p>
                </div>
              </div>
            </div>

            {/* Add Product Button */}
            <motion.button
              onClick={onAddProduct}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-600/25 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Thêm sản phẩm mới
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
              placeholder="Tìm kiếm sản phẩm theo tên, hãng, danh mục..."
              className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-600/50 focus:ring-2 focus:ring-blue-600/20 transition-all"
            />
          </div>
        </motion.div>

        {/* Products Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Sản phẩm
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Hãng
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Danh mục
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Giá
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Tồn kho
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredProducts.map((product, index) => (
                  <motion.tr
                    key={product.product_id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-800/30 transition-colors group"
                  >
                    {/* Product Info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                          <Package className="w-8 h-8 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-white font-semibold line-clamp-1">
                            {product.product_name}
                          </p>
                          <p className="text-sm text-gray-500">
                            ID: {product.product_id}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Brand */}
                    <td className="px-6 py-4">
                      <span className="text-white">{product.compatible_brand}</span>
                    </td>

                    {/* Category */}
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/50 rounded-lg text-blue-400 text-sm">
                        {product.category}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white font-bold">
                          {formatCurrency(product.discount_percentage
                            ? product.price * (1 - product.discount_percentage / 100)
                            : product.price
                          )}
                        </p>
                        {product.discount_percentage && product.discount_percentage > 0 && (
                          <p className="text-sm text-gray-500 line-through">
                            {formatCurrency(product.price)}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Stock */}
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${product.stock_status === 'in_stock'
                        ? 'bg-green-500/10 text-green-400 border border-green-500/50'
                        : product.stock_status === 'low_stock'
                          ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/50'
                          : 'bg-red-500/10 text-red-400 border border-red-500/50'
                        }`}>
                        {product.stock_status === 'in_stock' ? 'Còn hàng' :
                          product.stock_status === 'low_stock' ? 'Sắp hết' : 'Hết hàng'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setEditingProduct(product)}
                          className="p-2 bg-gray-800 border border-gray-700 rounded-lg hover:border-blue-600/50 transition-all group/edit"
                        >
                          <Edit className="w-4 h-4 text-gray-400 group-hover/edit:text-blue-600 transition-colors" />
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setShowDeleteConfirm(product.product_id)}
                          className="p-2 bg-gray-800 border border-gray-700 rounded-lg hover:border-red-600/50 transition-all group/delete"
                        >
                          <Trash2 className="w-4 h-4 text-gray-400 group-hover/delete:text-red-600 transition-colors" />
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
        {filteredProducts.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl p-12 text-center mt-6"
          >
            <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Không tìm thấy sản phẩm</h3>
            <p className="text-gray-500 mb-4">Không có sản phẩm nào phù hợp với tìm kiếm của bạn.</p>
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

      {/* Edit Modal */}
      {editingProduct && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
          onClick={() => setEditingProduct(null)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-gray-900 border border-gray-700 rounded-2xl p-8 max-w-2xl w-full my-8"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent rounded-2xl"></div>

            <div className="relative">
              <h3 className="text-2xl font-bold text-white mb-6">Chỉnh sửa sản phẩm</h3>

              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Tên sản phẩm</label>
                  <input
                    type="text"
                    value={editingProduct.product_name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, product_name: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-600/50 focus:ring-2 focus:ring-blue-600/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Giá (VND)</label>
                    <input
                      type="number"
                      value={editingProduct.price}
                      onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-600/50 focus:ring-2 focus:ring-blue-600/20"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Giảm giá (%)</label>
                    <input
                      type="number"
                      value={editingProduct.discount_percentage || 0}
                      onChange={(e) => setEditingProduct({ ...editingProduct, discount_percentage: parseFloat(e.target.value) })}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-600/50 focus:ring-2 focus:ring-blue-600/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Hãng xe</label>
                    <input
                      type="text"
                      value={editingProduct.compatible_brand}
                      onChange={(e) => setEditingProduct({ ...editingProduct, compatible_brand: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-600/50 focus:ring-2 focus:ring-blue-600/20"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Danh mục</label>
                    <input
                      type="text"
                      value={editingProduct.category}
                      onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-600/50 focus:ring-2 focus:ring-blue-600/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Tình trạng kho</label>
                  <select
                    value={editingProduct.stock_status}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock_status: e.target.value as any })}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-600/50 focus:ring-2 focus:ring-blue-600/20"
                  >
                    <option value="in_stock">Còn hàng</option>
                    <option value="low_stock">Sắp hết</option>
                    <option value="out_of_stock">Hết hàng</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Mô tả</label>
                  <textarea
                    value={editingProduct.description}
                    onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-600/50 focus:ring-2 focus:ring-blue-600/20"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setEditingProduct(null)}
                  className="flex-1 px-6 py-3 bg-gray-800 border border-gray-700 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Hủy
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSaveEdit}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-600/25"
                >
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

              <h3 className="text-2xl font-bold text-white text-center mb-2">Xóa sản phẩm</h3>
              <p className="text-gray-400 text-center mb-6">
                Bạn có chắc chắn muốn xóa sản phẩm này? Hành động này không thể hoàn tác.
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
import { motion } from 'motion/react';
import { useFirstVisit } from '@/shared/hooks/useFirstVisit';
import { Package, ArrowLeft, Search, Edit, Trash2, Plus, Upload, Save, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Product, Category } from '@/shared/types';
import { useI18n } from '@/shared/lib/i18n';
import { NotificationBell } from '@/features/notification/components/NotificationBell';
import { API_BASE_URL } from '@/lib/api';
import { CategorySelector } from './CategorySelector';

interface ManageProductsPageProps {
  onBack: () => void;
  onAddProduct: () => void;
}

export function ManageProductsPage({ onBack, onAddProduct }: ManageProductsPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const ITEMS_PER_PAGE = 50;
  const { t, language } = useI18n();
  const a = useFirstVisit('manage-products');

  const widgetRef = useRef<any>(null);
  const editingProductRef = useRef<Product | null>(null);

  useEffect(() => {
    editingProductRef.current = editingProduct;
  }, [editingProduct]);

  useEffect(() => {
    if ((window as any).cloudinary) {
      widgetRef.current = (window as any).cloudinary.createUploadWidget(
        {
          cloudName: (import.meta as any).env.VITE_CLOUDINARY_CLOUD_NAME || 'dmz66rbbk',
          uploadPreset: 'vinhpart_products_preset',
          sources: ['local', 'url', 'camera'],
          multiple: false,
          folder: 'vinhpart_products',
          resourceType: 'image',
          clientAllowedFormats: ['png', 'jpg', 'jpeg', 'webp'],
          maxFileSize: 10000000,
          maxImageWidth: 2000,
          maxImageHeight: 2000,
          cropping: true,
          croppingAspectRatio: 1,
          showSkipCropButton: true,
          styles: {
            palette: {
              window: "#1f2937",
              windowBorder: "#374151",
              tabIcon: "#ef4444",
              menuIcons: "#9ca3af",
              textDark: "#111827",
              textLight: "#f3f4f6",
              link: "#ef4444",
              action: "#ef4444",
              inactiveTabIcon: "#6b7280",
              error: "#dc2626",
              inProgress: "#f59e0b",
              complete: "#10b981",
              sourceBg: "#111827"
            }
          }
        },
        (error: any, result: any) => {
          if (!error && result && result.event === "success") {
            const url = result.info.secure_url;
            const current = editingProductRef.current;
            if (current) {
              setEditingProduct({ ...current, product_image: url });
              toast.success(t('admin.manageProducts.uploadSuccess'));
            }
          } else if (error) {
            toast.error(t('admin.manageProducts.uploadError') + error.message);
          }
        }
      );
    }
  }, [t]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch products when search/page/filters change
  useEffect(() => {
    fetchProducts(debouncedSearch, page, selectedCategory, selectedBrand);
  }, [debouncedSearch, page, selectedCategory, selectedBrand]);

  // Clear selection when page/filters change
  useEffect(() => {
    setSelectedIds(new Set());
  }, [page, debouncedSearch, selectedCategory, selectedBrand]);

  useEffect(() => {
    fetchCategories();
    fetchBrands();
  }, []);

  const fetchBrands = () => {
    fetch(`${API_BASE_URL}/products/brands`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setBrands(data);
        }
      })
      .catch(err => console.error('Error fetching brands:', err));
  };

  const fetchCategories = () => {
    fetch(`${API_BASE_URL}/categories`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const mapped = data.map((cat: any) => ({
            id: cat.id,
            name: cat.name,
            parent_id: cat.parentId,
            slug: cat.slug
          } as Category));
          setCategories(mapped);
        }
      })
      .catch(err => console.error('Error fetching categories:', err));
  };

  const fetchProducts = useCallback((search = '', pageNum = 1, category = '', brand = '') => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(pageNum),
      limit: String(ITEMS_PER_PAGE),
    });
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    if (brand) params.set('brand', brand);

    fetch(`${API_BASE_URL}/products?${params}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.data) {
          setProducts(data.data);
          if (data.metadata) {
            setTotalPages(data.metadata.totalPages || 1);
            setTotalProducts(data.metadata.total || 0);
          }
        } else if (Array.isArray(data)) {
          setProducts(data);
          setTotalProducts(data.length);
          setTotalPages(1);
        } else {
          setProducts([]);
          setTotalProducts(0);
          setTotalPages(1);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching products:', err);
        setLoading(false);
      });
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(language === 'vi' ? 'vi-VN' : 'en-US', {
      style: 'currency',
      currency: language === 'vi' ? 'VND' : 'USD'
    }).format(language === 'vi' ? value : value / 25000); // Simple conversion for demo purpose if USD
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setProducts(products.filter(p => p.product_id !== id));
        setShowDeleteConfirm(null);
        toast.success(t('admin.manageProducts.deleteSuccess'));
      } else {
        toast.error(t('admin.manageProducts.deleteError'));
      }
    } catch (error) {
      toast.error(t('admin.manageProducts.connError'));
    }
  };

  const handleSaveEdit = async () => {
    if (editingProduct) {
      if (!editingProduct.sku || editingProduct.sku.trim() === '') {
        toast.error('Mã sản phẩm (SKU) là bắt buộc.');
        return;
      }
      try {
        const res = await fetch(`${API_BASE_URL}/products/${editingProduct.product_id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            product_name: editingProduct.product_name,
            brand: editingProduct.compatible_brand,
            category: editingProduct.category,
            price: editingProduct.price,
            discount_percentage: editingProduct.discount_percentage,
            stock: editingProduct.stock,
            description: editingProduct.description,
            image_url: editingProduct.product_image,
            sku: editingProduct.sku,
            discount_start_date: editingProduct.discount_start_date || undefined,
            discount_end_date: editingProduct.discount_end_date || undefined
          })
        });

        if (res.ok) {
          await res.json();
          fetchProducts(debouncedSearch, page, selectedCategory, selectedBrand);
          setEditingProduct(null);
          toast.success(t('admin.manageProducts.updateSuccess'));
        } else {
          toast.error(t('admin.manageProducts.updateError'));
        }
      } catch (error) {
        toast.error(t('admin.manageProducts.connError'));
      }
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === products.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(products.map(p => p.product_id)));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkDelete = async () => {
    setBulkDeleting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/products/bulk-delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedIds) })
      });
      if (res.ok) {
        const data = await res.json();
        toast.success(`Đã xóa ${data.deletedCount} sản phẩm thành công`);
        setSelectedIds(new Set());
        setShowBulkDeleteConfirm(false);
        fetchProducts(debouncedSearch, page, selectedCategory, selectedBrand);
      } else {
        toast.error('Lỗi khi xóa hàng loạt');
      }
    } catch (error) {
      toast.error(t('admin.manageProducts.connError'));
    } finally {
      setBulkDeleting(false);
    }
  };

  if (loading && products.length === 0) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-foreground">{t('common.loading')}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black pb-20">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-red-600/30 rounded-full"
            initial={{ x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight }}
            animate={{ y: [null, Math.random() * window.innerHeight], opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: Math.random() * 5 + 3, repeat: Infinity, delay: Math.random() * 2 }}
          />
        ))}
      </div>

      <motion.div
        initial={a && { y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative border-b border-border bg-background/40 backdrop-blur-xl sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <motion.button onClick={onBack} whileHover={{ scale: 1.05, x: -5 }} whileTap={{ scale: 0.95 }} className="p-3 bg-card border border-border rounded-lg hover:border-red-600/50 transition-all group">
                <ArrowLeft className="w-5 h-5 text-muted-foreground group-hover:text-red-600 transition-colors" />
              </motion.button>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center">
                  <Package className="w-6 h-6 text-foreground" />
                </div>
                <div className="text-left">
                  <h1 className="text-2xl font-black text-transparent bg-gradient-to-r from-white via-gray-200 to-blue-600 bg-clip-text">
                    {t('admin.manageProducts.title')}
                  </h1>
                  <p className="text-sm text-muted-foreground">{t('admin.manageProducts.count', { count: totalProducts })}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <NotificationBell />
              <motion.button onClick={onAddProduct} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-foreground rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-600/25 flex items-center gap-2">
                <Plus className="w-5 h-5" />
                {t('admin.manageProducts.addBtn')}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={a && { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card/50 backdrop-blur-xl border border-border rounded-xl p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('admin.manageProducts.searchPlaceholder')}
                className="w-full pl-12 pr-4 py-3 bg-muted border border-border rounded-lg text-foreground placeholder-gray-500 focus:outline-none focus:border-blue-600/50 focus:ring-2 focus:ring-blue-600/20 transition-all"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
              className="px-4 py-3 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:border-blue-600/50 focus:ring-2 focus:ring-blue-600/20 transition-all min-w-[160px]"
            >
              <option value="">{t('admin.manageProducts.categoryLabel')}: Tất cả</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.slug}>{cat.name}</option>
              ))}
            </select>
            <select
              value={selectedBrand}
              onChange={(e) => { setSelectedBrand(e.target.value); setPage(1); }}
              className="px-4 py-3 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:border-blue-600/50 focus:ring-2 focus:ring-blue-600/20 transition-all min-w-[160px]"
            >
              <option value="">{t('admin.manageProducts.brandLabel')}: Tất cả</option>
              {brands.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
        </motion.div>

        <motion.div initial={a && { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card/50 backdrop-blur-xl border border-border rounded-xl overflow-hidden">
          {/* Bulk action bar */}
          {selectedIds.size > 0 && (
            <div className="px-4 py-3 bg-red-500/10 border-b border-red-500/30 flex items-center justify-between">
              <span className="text-sm text-red-400 font-medium">
                Đã chọn <span className="font-bold text-red-300">{selectedIds.size}</span> sản phẩm
              </span>
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedIds(new Set())}
                  className="px-3 py-1.5 bg-muted border border-border rounded-lg text-sm text-foreground hover:bg-muted/80 transition-all"
                >
                  Bỏ chọn
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowBulkDeleteConfirm(true)}
                  className="px-4 py-1.5 bg-gradient-to-r from-red-600 to-red-700 text-foreground rounded-lg text-sm font-medium hover:from-red-700 hover:to-red-800 transition-all shadow-lg shadow-red-600/25 flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  Xóa {selectedIds.size} sản phẩm
                </motion.button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-4 text-left w-10">
                    <input
                      type="checkbox"
                      checked={products.length > 0 && selectedIds.size === products.length}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-border bg-muted accent-red-600 cursor-pointer"
                    />
                  </th>
                  {['colProduct', 'colBrand', 'colCategory', 'colPrice', 'colStock', 'colActions'].map(key => (
                    <th key={key} className={`px-6 py-4 ${key === 'colActions' ? 'text-right' : 'text-left'} text-xs font-semibold text-muted-foreground uppercase tracking-wider`}>
                      {t(`admin.manageProducts.${key}`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {products.map((product, index) => (
                  <motion.tr key={product.product_id} initial={a && { opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.02 }} className={`hover:bg-muted/30 transition-colors group ${selectedIds.has(product.product_id) ? 'bg-red-500/5' : ''}`}>
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(product.product_id)}
                        onChange={() => toggleSelect(product.product_id)}
                        className="w-4 h-4 rounded border-border bg-muted accent-red-600 cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                          {product.product_image ? (
                            <img src={product.product_image} alt={product.product_name} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/logo192.png'; }} />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-8 h-8 text-gray-600" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-foreground font-semibold line-clamp-1">{product.product_name}</p>
                          {product.sku && (
                            <p className="text-xs text-muted-foreground font-mono mt-0.5">SKU: {product.sku}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-foreground">{product.compatible_brand}</span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/50 rounded-lg text-blue-400 text-sm">
                        {product.category}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="whitespace-nowrap">
                        <p className="text-foreground font-bold">
                          {formatCurrency(product.discount_percentage ? product.price * (1 - product.discount_percentage / 100) : product.price)}
                        </p>
                        {product.discount_percentage && product.discount_percentage > 0 && (
                          <p className="text-sm text-muted-foreground line-through">{formatCurrency(product.price)}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-foreground font-medium">{t('admin.manageProducts.stockCount', { count: product.stock })}</span>
                        <span className={`px-2 py-0.5 rounded-md text-xs font-medium w-fit ${product.stock_status === 'in_stock' ? 'bg-green-500/10 text-green-400 border border-green-500/50' : product.stock_status === 'low_stock' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/50' : 'bg-red-500/10 text-red-400 border border-red-500/50'}`}>
                          {product.stock_status === 'in_stock' ? t('admin.manageProducts.inStock') : product.stock_status === 'low_stock' ? t('admin.manageProducts.lowStock') : t('admin.manageProducts.outOfStock')}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setEditingProduct(product)} className="p-2 bg-muted border border-border rounded-lg hover:border-blue-600/50 transition-all group/edit">
                          <Edit className="w-4 h-4 text-muted-foreground group-hover/edit:text-blue-600 transition-colors" />
                        </motion.button>

                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setShowDeleteConfirm(product.product_id)} className="p-2 bg-muted border border-border rounded-lg hover:border-red-600/50 transition-all group/delete">
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

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <motion.div initial={a && { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card/50 backdrop-blur-xl border border-border rounded-xl p-4 mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Trang <span className="text-foreground font-bold">{page}</span> / <span className="text-foreground font-bold">{totalPages}</span> — Tổng <span className="text-foreground font-bold">{totalProducts.toLocaleString()}</span> sản phẩm
            </p>
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setPage(1)}
                disabled={page <= 1}
                className="px-3 py-2 bg-muted border border-border rounded-lg text-foreground text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:border-blue-600/50 transition-all"
              >
                Đầu
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-2 bg-muted border border-border rounded-lg text-foreground disabled:opacity-30 disabled:cursor-not-allowed hover:border-blue-600/50 transition-all flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" /> Trước
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-2 bg-muted border border-border rounded-lg text-foreground disabled:opacity-30 disabled:cursor-not-allowed hover:border-blue-600/50 transition-all flex items-center gap-1"
              >
                Sau <ChevronRight className="w-4 h-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setPage(totalPages)}
                disabled={page >= totalPages}
                className="px-3 py-2 bg-muted border border-border rounded-lg text-foreground text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:border-blue-600/50 transition-all"
              >
                Cuối
              </motion.button>
            </div>
          </motion.div>
        )}

        {products.length === 0 && !loading && (
          <motion.div initial={a && { opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-card/50 backdrop-blur-xl border border-border rounded-xl p-12 text-center mt-6">
            <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2">{t('admin.manageProducts.notFound')}</h3>
            <p className="text-muted-foreground mb-4">{t('admin.manageProducts.notFoundDesc')}</p>
            <motion.button onClick={() => { setSearchQuery(''); setSelectedCategory(''); setSelectedBrand(''); }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-6 py-3 bg-muted border border-border text-foreground rounded-lg hover:bg-muted/80 transition-all">
              {t('admin.manageProducts.clearFilter')}
            </motion.button>
          </motion.div>
        )}
      </div>

      {editingProduct && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setEditingProduct(null)}>
          <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} onClick={(e) => e.stopPropagation()} className="relative bg-card border border-border rounded-2xl p-8 max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent rounded-2xl pointer-events-none"></div>

            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-transparent bg-gradient-to-r from-white to-blue-500 bg-clip-text">
                  {t('admin.manageProducts.editTitle')}
                </h3>
                <button onClick={() => setEditingProduct(null)} className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-4">
                  <div className="aspect-square bg-muted rounded-xl overflow-hidden border-2 border-dashed border-border flex items-center justify-center relative group">
                    {editingProduct.product_image ? (
                      <img key={editingProduct.product_image} src={editingProduct.product_image} alt="Preview" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/logo192.png'; }} />
                    ) : (
                      <div className="text-center text-muted-foreground">
                        <Upload className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <span className="text-sm">{t('admin.manageProducts.noImage')}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">{t('admin.manageProducts.imageUrl')}</label>
                    <input type="url" value={editingProduct.product_image || ''} onChange={(e) => setEditingProduct({ ...editingProduct, product_image: e.target.value })} placeholder="https://example.com/image.jpg" className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground text-sm focus:outline-none focus:border-blue-600/50 transition-all" />
                  </div>

                  <button type="button" onClick={() => { if (widgetRef.current) { widgetRef.current.open(); } else { toast.error(t('admin.manageProducts.widgetError')); } }} className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-foreground font-medium rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20">
                    <Upload className="w-4 h-4" />
                    {t('admin.manageProducts.uploadBtn')}
                  </button>
                </div>

                <div className="lg:col-span-2 space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-muted-foreground mb-2">{t('admin.manageProducts.nameLabel')}</label>
                    <input type="text" value={editingProduct.product_name} onChange={(e) => setEditingProduct({ ...editingProduct, product_name: e.target.value })} className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:border-blue-600/50 focus:ring-2 focus:ring-blue-600/20 transition-all" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-muted-foreground mb-2">{t('admin.manageProducts.brandLabel')}</label>
                      <select value={editingProduct.compatible_brand} onChange={(e) => setEditingProduct({ ...editingProduct, compatible_brand: e.target.value })} className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:border-blue-600/50 focus:ring-2 focus:ring-blue-600/20">
                        <option value="">{t('admin.manageProducts.brandSelect')}</option>
                        {brands.map(b => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-muted-foreground mb-2">{t('admin.manageProducts.categoryLabel')} <span className="text-red-500">*</span></label>
                      <CategorySelector
                        categories={categories}
                        value={editingProduct.category}
                        onChange={(catName: string) => setEditingProduct({ ...editingProduct, category: catName })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-muted-foreground mb-2">Mã sản phẩm (SKU) <span className="text-red-500">*</span></label>
                      <input type="text" value={editingProduct.sku || ''} onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })} required placeholder="Nhập mã sản phẩm bắt buộc..." className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:border-blue-600/50 focus:ring-2 focus:ring-blue-600/20" />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-1">
                      <label className="block text-sm font-semibold text-muted-foreground mb-2">{t('admin.manageProducts.priceLabel')}</label>
                      <input type="number" value={editingProduct.price} onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })} className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:border-blue-600/50 focus:ring-2 focus:ring-blue-600/20" />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-sm font-semibold text-muted-foreground mb-2">{t('admin.manageProducts.discountLabel')}</label>
                      <input type="number" value={editingProduct.discount_percentage || 0} onChange={(e) => setEditingProduct({ ...editingProduct, discount_percentage: parseFloat(e.target.value) })} className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:border-blue-600/50 focus:ring-2 focus:ring-blue-600/20" />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-sm font-semibold text-muted-foreground mb-2">{t('admin.manageProducts.stockLabel')}</label>
                      <input type="number" value={editingProduct.stock || 0} onChange={(e) => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) || 0 })} placeholder="0" className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:border-blue-600/50 focus:ring-2 focus:ring-blue-600/20" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-muted-foreground mb-2">{t('admin.manageProducts.stockStatusLabel')}</label>
                    <select value={editingProduct.stock_status} onChange={(e) => setEditingProduct({ ...editingProduct, stock_status: e.target.value as any })} className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:border-blue-600/50 focus:ring-2 focus:ring-blue-600/20">
                      <option value="in_stock">{t('admin.manageProducts.inStock')}</option>
                      <option value="low_stock">{t('admin.manageProducts.lowStock')}</option>
                      <option value="out_of_stock">{t('admin.manageProducts.outOfStock')}</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-muted-foreground mb-2">Bắt đầu giảm giá</label>
                      <input type="datetime-local" value={editingProduct.discount_start_date ? new Date(editingProduct.discount_start_date).toISOString().slice(0, 16) : ''} onChange={(e) => setEditingProduct({ ...editingProduct, discount_start_date: e.target.value })} className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:border-blue-600/50 focus:ring-2 focus:ring-blue-600/20" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-muted-foreground mb-2">Kết thúc giảm giá</label>
                      <input type="datetime-local" value={editingProduct.discount_end_date ? new Date(editingProduct.discount_end_date).toISOString().slice(0, 16) : ''} onChange={(e) => setEditingProduct({ ...editingProduct, discount_end_date: e.target.value })} className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:border-blue-600/50 focus:ring-2 focus:ring-blue-600/20" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-muted-foreground mb-2">{t('admin.manageProducts.descLabel')}</label>
                    <textarea value={editingProduct.description} onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })} rows={5} className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:border-blue-600/50 focus:ring-2 focus:ring-blue-600/20 resize-none" />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-8 pt-6 border-t border-border">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setEditingProduct(null)} className="flex-1 px-6 py-3 bg-muted border border-border text-foreground rounded-lg hover:bg-muted/80 transition-colors font-medium">
                  {t('admin.manageProducts.cancel')}
                </motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSaveEdit} className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-foreground rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-600/25 font-bold flex items-center justify-center gap-2">
                  <Save className="w-5 h-5" />
                  {t('admin.manageProducts.save')}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {showDeleteConfirm && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowDeleteConfirm(null)}>
          <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} onClick={(e) => e.stopPropagation()} className="relative bg-card border border-border rounded-2xl p-8 max-w-md w-full">
            <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 to-transparent rounded-2xl"></div>
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-foreground" />
              </div>
              <h3 className="text-2xl font-bold text-foreground text-center mb-2">{t('admin.manageProducts.deleteTitle')}</h3>
              <p className="text-muted-foreground text-center mb-6">{t('admin.manageProducts.deleteConfirm')}</p>
              <div className="flex gap-3">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowDeleteConfirm(null)} className="flex-1 px-6 py-3 bg-muted border border-border text-foreground rounded-lg hover:bg-muted/80 transition-colors">
                  {t('admin.manageProducts.cancel')}
                </motion.button>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleDelete(showDeleteConfirm)} className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-foreground rounded-lg hover:from-red-700 hover:to-red-800 transition-all shadow-lg shadow-red-600/25">
                  {t('admin.manageProducts.deleteBtn')}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {showBulkDeleteConfirm && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowBulkDeleteConfirm(false)}>
          <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} onClick={(e) => e.stopPropagation()} className="relative bg-card border border-border rounded-2xl p-8 max-w-md w-full">
            <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 to-transparent rounded-2xl"></div>
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-foreground" />
              </div>
              <h3 className="text-2xl font-bold text-foreground text-center mb-2">Xóa hàng loạt</h3>
              <p className="text-muted-foreground text-center mb-6">
                Bạn có chắc chắn muốn xóa <span className="text-red-400 font-bold">{selectedIds.size}</span> sản phẩm đã chọn? Hành động này không thể hoàn tác.
              </p>
              <div className="flex gap-3">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowBulkDeleteConfirm(false)} disabled={bulkDeleting} className="flex-1 px-6 py-3 bg-muted border border-border text-foreground rounded-lg hover:bg-muted/80 transition-colors disabled:opacity-50">
                  {t('admin.manageProducts.cancel')}
                </motion.button>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleBulkDelete} disabled={bulkDeleting} className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-foreground rounded-lg hover:from-red-700 hover:to-red-800 transition-all shadow-lg shadow-red-600/25 disabled:opacity-50">
                  {bulkDeleting ? 'Đang xóa...' : `Xóa ${selectedIds.size} sản phẩm`}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

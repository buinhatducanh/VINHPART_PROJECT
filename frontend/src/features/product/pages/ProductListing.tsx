import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Filter, X, ChevronRight, ArrowUpDown, TrendingUp, TrendingDown } from 'lucide-react';
import { ProductCard } from '@/features/product/components/ProductCard';
import { PriceRangeSlider } from '@/features/product/components/PriceRangeSlider';
import { Product, Category } from '@/shared/types';
import { useProducts, useMaxPrice } from '@/hooks/useQueries';
import { ProductCardSkeleton } from '@/shared/components/skeletons/ProductCardSkeleton';
import { useI18n } from '@/shared/lib/i18n';

interface ProductListingProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  onAddToCart: (product: Product) => void;
  onBuyNow: (product: Product) => void;
  searchQuery?: string;
  onSearchQueryChange?: (query: string) => void;
  onProductClick?: (productId: string) => void;
}

export function ProductListing({
  selectedCategory,
  onCategoryChange,
  onAddToCart,
  onBuyNow,
  searchQuery = '',
  onSearchQueryChange,
  onProductClick
}: ProductListingProps) {
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000000]);
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'default' | 'price_asc' | 'price_desc'>('default');
  const [currentPage, setCurrentPage] = useState(1);
  const [appliedPriceRange, setAppliedPriceRange] = useState<[number, number]>([0, 5000000]);
  const [categories, setCategories] = useState<Category[]>([]);
  const { t } = useI18n();

  useEffect(() => {
    fetch('/api/categories')
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
      .catch(err => console.error("Error fetching categories:", err));
  }, []);

  const hierarchicalCategories = useMemo(() => {
    const parents = categories.filter(c => !c.parent_id);
    return parents.map(parent => ({
      ...parent,
      children: categories.filter(c => c.parent_id === parent.id)
    }));
  }, [categories]);

  const itemsPerPage = 20;

  // Use React Query for max price - cached for 30 minutes
  const { data: maxPriceData } = useMaxPrice();
  const maxPrice = useMemo(() => {
    if (maxPriceData) {
      return Math.ceil(maxPriceData / 100000) * 100000;
    }
    return 5000000;
  }, [maxPriceData]);

  // Initialize price range when max price is loaded
  useEffect(() => {
    if (maxPriceData) {
      const max = Math.ceil(maxPriceData / 100000) * 100000;
      setPriceRange([0, max]);
      setAppliedPriceRange([0, max]);
    }
  }, [maxPriceData]);

  // Use React Query for products - auto cached and deduped
  const { data: productsData, isLoading: loading } = useProducts({
    page: currentPage,
    limit: itemsPerPage,
    category: selectedCategory !== 'all' ? selectedCategory : undefined,
    brand: selectedBrand !== 'all' ? selectedBrand : undefined,
    minPrice: appliedPriceRange[0],
    maxPrice: appliedPriceRange[1],
    sortBy: sortBy !== 'default' ? sortBy : undefined,
    vehicle_type: 'Motorbike',
    search: searchQuery || undefined,
  });

  const products = productsData?.data || [];
  const totalProducts = productsData?.metadata?.total || 0;

  // Reset page when filters change
  const handleBrandChange = (brand: string) => {
    setSelectedBrand(brand);
    setCurrentPage(1);
  };

  const handlePriceRangeCommit = () => {
    setAppliedPriceRange(priceRange);
    setCurrentPage(1);
  };

  const handleCategoryChange = (category: string) => {
    onCategoryChange(category);
    setCurrentPage(1);
  };

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const brands = ['Honda', 'Yamaha', 'Suzuki', 'SYM', 'Piaggio', 'Kawasaki', 'Ducati', 'BMW', 'Triumph', 'Harley-Davidson'];

  const FilterSidebar = () => (
    <div className="space-y-6">
      {/* Categories với phân cấp */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-border rounded-xl p-4 shadow-lg">
        <h3 className="text-foreground font-bold mb-4 flex items-center gap-2">
          <span className="text-red-600">●</span> {t('settings.categories') || 'Danh mục'}
        </h3>
        <div className="space-y-1">
          <motion.button
            onClick={() => handleCategoryChange('all')}
            whileHover={{ scale: 1.02, x: 2 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full text-left px-4 py-3 rounded-lg transition-all font-medium ${selectedCategory === 'all'
              ? 'bg-gradient-to-r from-red-600 to-red-700 text-foreground shadow-lg shadow-red-600/30'
              : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:border-red-600/30 border border-transparent'
              }`}
          >
            {t('product.allProducts') || 'Tất cả sản phẩm'}
          </motion.button>

          {hierarchicalCategories.map(category => (
            <div key={category.id}>
              <motion.button
                onClick={() => {
                  if (category.children.length > 0) {
                    toggleCategory(category.id);
                  }
                  handleCategoryChange(category.slug || category.id);
                }}
                whileHover={{ scale: 1.02, x: 2 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center justify-between font-medium ${selectedCategory === category.slug || selectedCategory === category.id
                  ? 'bg-gradient-to-r from-red-600 to-red-700 text-foreground shadow-lg shadow-red-600/30'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:border-red-600/30 border border-transparent'
                  }`}
              >
                <span>{category.name}</span>
                {category.children.length > 0 && (
                  <motion.div
                    animate={{ rotate: expandedCategories.has(category.id) ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </motion.div>
                )}
              </motion.button>

              <AnimatePresence>
                {expandedCategories.has(category.id) && category.children.length > 0 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="ml-4 mt-1 space-y-1">
                      {category.children.map(sub => (
                        <motion.button
                          key={sub.id}
                          onClick={() => handleCategoryChange(sub.slug || sub.id)}
                          whileHover={{ scale: 1.02, x: 2 }}
                          whileTap={{ scale: 0.98 }}
                          className={`w-full text-left px-4 py-2 text-sm rounded-lg transition-all flex items-center gap-2 ${selectedCategory === sub.slug || selectedCategory === sub.id
                            ? 'bg-red-600/20 text-red-400 border border-red-600/50'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                            }`}
                        >
                          <ChevronRight className="w-3 h-3" />
                          {sub.name}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      {/* Brand Filter */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-border rounded-xl p-4 shadow-lg">
        <h3 className="text-foreground font-bold mb-4 flex items-center gap-2">
          <span className="text-red-600">●</span> {t('product.brand') || 'Thương hiệu'}
        </h3>
        <div className="space-y-2 max-h-64 overflow-y-auto overflow-x-hidden custom-scrollbar pr-1">
          <motion.button
            onClick={() => handleBrandChange('all')}
            whileHover={{ scale: 1.02, x: 2 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full text-left px-4 py-3 rounded-lg transition-all font-medium break-words ${selectedBrand === 'all'
              ? 'bg-gradient-to-r from-red-600 to-red-700 text-foreground shadow-lg shadow-red-600/30'
              : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:border-red-600/30 border border-transparent'
              }`}
          >
            {t('common.all') || 'Tất cả'}
          </motion.button>
          {brands.map(brand => (
            <motion.button
              key={brand}
              onClick={() => handleBrandChange(brand)}
              whileHover={{ scale: 1.02, x: 2 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full text-left px-4 py-3 rounded-lg transition-all font-medium break-words ${selectedBrand === brand
                ? 'bg-gradient-to-r from-red-600 to-red-700 text-foreground shadow-lg shadow-red-600/30'
                : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:border-red-600/30 border border-transparent'
                }`}
            >
              {brand}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-border rounded-xl p-4 shadow-lg">
        <h3 className="text-foreground font-bold mb-4 flex items-center gap-2">
          <span className="text-red-600">●</span> {t('product.priceRange') || 'Khoảng giá'}
        </h3>
        <PriceRangeSlider
          min={0}
          max={maxPrice}
          value={priceRange}
          onChange={setPriceRange} // Just update local state
          onApply={handlePriceRangeCommit} // Commit triggers effect via appliedPriceRange
        />
      </div>
    </div>
  );

  // Calculate pagination
  const totalPages = Math.ceil(totalProducts / itemsPerPage);

  // Generate skeleton items
  const skeletonItems = Array(8).fill(0);

  return (
    <div className="pt-20 min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">{t('header.products')}</h1>
            <p className="text-muted-foreground">
              {loading ? t('common.searching') : `${t('common.display') || 'Hiển thị'} ${products.length} / ${totalProducts} ${t('header.products').toLowerCase()}`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Sort by Price */}
            <div className="flex items-center bg-muted rounded-lg p-1">
              <button
                onClick={() => setSortBy('default')}
                className={`p-2 rounded-md transition-all ${sortBy === 'default' ? 'bg-red-600 text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                title="Mặc định"
              >
                <ArrowUpDown className="w-4 h-4" />
              </button>
              <button
                onClick={() => setSortBy('price_asc')}
                className={`p-2 rounded-md transition-all ${sortBy === 'price_asc' ? 'bg-red-600 text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                title="Giá tăng dần"
              >
                <TrendingUp className="w-4 h-4" />
              </button>
              <button
                onClick={() => setSortBy('price_desc')}
                className={`p-2 rounded-md transition-all ${sortBy === 'price_desc' ? 'bg-red-600 text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                title="Giá giảm dần"
              >
                <TrendingDown className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowMobileFilter(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 bg-red-600 text-foreground rounded-lg"
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24">
              <FilterSidebar />
            </div>
          </aside>

          {/* Mobile Sidebar */}
          <AnimatePresence>
            {showMobileFilter && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowMobileFilter(false)}
                  className="fixed inset-0 bg-background/80 z-40 lg:hidden"
                />
                <motion.div
                  initial={{ x: -300 }}
                  animate={{ x: 0 }}
                  exit={{ x: -300 }}
                  className="fixed left-0 top-0 bottom-0 w-80 bg-card z-50 overflow-y-auto lg:hidden"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold text-foreground">Bộ lọc</h2>
                      <button
                        onClick={() => setShowMobileFilter(false)}
                        className="p-2 hover:bg-muted rounded-lg"
                      >
                        <X className="w-5 h-5 text-muted-foreground" />
                      </button>
                    </div>
                    <FilterSidebar />
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Products Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-8">
                {skeletonItems.map((_, index) => (
                  <ProductCardSkeleton key={`skeleton-${index}`} />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-muted-foreground text-lg mb-4">Không tìm thấy sản phẩm phù hợp</p>
                <button
                  onClick={() => {
                    onCategoryChange('all');
                    if (onSearchQueryChange) onSearchQueryChange('');
                    setSelectedBrand('all');
                    setPriceRange([0, maxPrice]);
                    setAppliedPriceRange([0, maxPrice]);
                  }}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-foreground font-bold rounded-lg transition-all"
                >
                  Xóa bộ lọc
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-8">
                  {products.map((product, index) => (
                    <motion.div
                      key={product.product_id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <ProductCard
                        product={product}
                        onAddToCart={onAddToCart}
                        onBuyNow={onBuyNow}
                        onProductClick={onProductClick}
                      />
                    </motion.div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {/* First Page Button */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="px-3 py-2 rounded-lg font-bold transition-all bg-muted text-muted-foreground hover:bg-muted/80 disabled:opacity-30 disabled:cursor-not-allowed border border-border"
                    >
                      ««
                    </motion.button>

                    {/* Previous Page Button */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-2 rounded-lg font-bold transition-all bg-muted text-muted-foreground hover:bg-muted/80 disabled:opacity-30 disabled:cursor-not-allowed border border-border"
                    >
                      ‹
                    </motion.button>

                    {/* Page Numbers */}
                    {(() => {
                      const pages = [];
                      const showPages = 5;
                      let startPage = Math.max(1, currentPage - Math.floor(showPages / 2));
                      let endPage = Math.min(totalPages, startPage + showPages - 1);

                      if (endPage - startPage < showPages - 1) {
                        startPage = Math.max(1, endPage - showPages + 1);
                      }

                      for (let i = startPage; i <= endPage; i++) {
                        pages.push(
                          <motion.button
                            key={i}
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setCurrentPage(i)}
                            className={`min-w-[2.5rem] px-4 py-2 rounded-lg font-bold transition-all ${currentPage === i
                              ? 'bg-gradient-to-r from-red-600 to-red-700 text-foreground shadow-lg shadow-red-600/50 border-2 border-red-500'
                              : 'bg-muted text-muted-foreground hover:bg-muted/80 border border-border'
                              }`}
                          >
                            {i}
                          </motion.button>
                        );
                      }
                      return pages;
                    })()}

                    {/* Next Page Button */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 rounded-lg font-bold transition-all bg-muted text-muted-foreground hover:bg-muted/80 disabled:opacity-30 disabled:cursor-not-allowed border border-border"
                    >
                      ›
                    </motion.button>

                    {/* Last Page Button */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 rounded-lg font-bold transition-all bg-muted text-muted-foreground hover:bg-muted/80 disabled:opacity-30 disabled:cursor-not-allowed border border-border"
                    >
                      »»
                    </motion.button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Filter, X, ChevronRight } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { PriceRangeSlider } from './PriceRangeSlider';
import { mockProducts, hierarchicalCategories } from '@/app/data/mockProducts';
import { Product } from '@/app/types';

interface ProductListingProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  onAddToCart: (product: Product) => void;
  onBuyNow: (product: Product) => void;
}

export function ProductListing({
  selectedCategory,
  onCategoryChange,
  onAddToCart,
  onBuyNow
}: ProductListingProps) {
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000000]);
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3001/api/products')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setProducts(data);
        } else {
          console.error("API returned non-array:", data);
          setProducts(mockProducts);
        }
        setLoading(false);
      })
      .catch(error => {
        console.error("Failed to fetch products:", error);
        setProducts(mockProducts); // Fallback
        setLoading(false);
      });
  }, []);

  const itemsPerPage = 12;

  const displayProducts = products.length > 0 ? products : mockProducts;
  const maxPrice = Math.max(...displayProducts.map(p => p.price));

  // Reset page to 1 when filters change
  const handleBrandChange = (brand: string) => {
    setSelectedBrand(brand);
    setCurrentPage(1);
  };

  const handlePriceRangeChange = (range: [number, number]) => {
    setPriceRange(range);
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

  if (loading) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading products...</div>;
  }

  // Filter products - chỉ xe máy
  let filteredProducts = displayProducts.filter(p => p.vehicle_type === 'Motorbike');

  if (selectedCategory !== 'all') {
    filteredProducts = filteredProducts.filter(p => p.category === selectedCategory);
  }

  if (selectedBrand !== 'all') {
    filteredProducts = filteredProducts.filter(p => p.compatible_brand === selectedBrand);
  }

  // Apply price range filter
  filteredProducts = filteredProducts.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  const brands = Array.from(new Set(displayProducts.filter(p => p.vehicle_type === 'Motorbike').map(p => p.compatible_brand)));

  const FilterSidebar = () => (
    <div className="space-y-6">
      {/* Categories với phân cấp */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-xl p-4 shadow-lg">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <span className="text-red-600">●</span> Danh mục
        </h3>
        <div className="space-y-1">
          <motion.button
            onClick={() => handleCategoryChange('all')}
            whileHover={{ scale: 1.02, x: 2 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full text-left px-4 py-3 rounded-lg transition-all font-medium ${selectedCategory === 'all'
              ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-600/30'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:border-red-600/30 border border-transparent'
              }`}
          >
            Tất cả sản phẩm
          </motion.button>

          {hierarchicalCategories.map(category => (
            <div key={category.id}>
              <motion.button
                onClick={() => {
                  if (category.children.length > 0) {
                    toggleCategory(category.id);
                  }
                  handleCategoryChange(category.id);
                }}
                whileHover={{ scale: 1.02, x: 2 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center justify-between font-medium ${selectedCategory === category.id
                  ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-600/30'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:border-red-600/30 border border-transparent'
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
                          onClick={() => handleCategoryChange(sub.id)}
                          whileHover={{ scale: 1.02, x: 2 }}
                          whileTap={{ scale: 0.98 }}
                          className={`w-full text-left px-4 py-2 text-sm rounded-lg transition-all flex items-center gap-2 ${selectedCategory === sub.id
                            ? 'bg-red-600/20 text-red-400 border border-red-600/50'
                            : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700 hover:text-white'
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
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-xl p-4 shadow-lg">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <span className="text-red-600">●</span> Thương hiệu
        </h3>
        <div className="space-y-2 max-h-64 overflow-y-auto overflow-x-hidden custom-scrollbar pr-1">
          <motion.button
            onClick={() => handleBrandChange('all')}
            whileHover={{ scale: 1.02, x: 2 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full text-left px-4 py-3 rounded-lg transition-all font-medium break-words ${selectedBrand === 'all'
              ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-600/30'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:border-red-600/30 border border-transparent'
              }`}
          >
            Tất cả
          </motion.button>
          {brands.map(brand => (
            <motion.button
              key={brand}
              onClick={() => handleBrandChange(brand)}
              whileHover={{ scale: 1.02, x: 2 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full text-left px-4 py-3 rounded-lg transition-all font-medium break-words ${selectedBrand === brand
                ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-600/30'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:border-red-600/30 border border-transparent'
                }`}
            >
              {brand}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-xl p-4 shadow-lg">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <span className="text-red-600">●</span> Khoảng giá
        </h3>
        <PriceRangeSlider
          min={0}
          max={maxPrice}
          value={priceRange}
          onChange={handlePriceRangeChange}
          onApply={() => setCurrentPage(1)}
        />
      </div>
    </div>
  );

  return (
    <div className="pt-20 min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Sản phẩm</h1>
            <p className="text-gray-400">
              Hiển thị {paginatedProducts.length} / {filteredProducts.length} sản phẩm
            </p>
          </div>

          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setShowMobileFilter(true)}
            className="lg:hidden flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg"
          >
            <Filter className="w-4 h-4" />
            Lọc
          </button>
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
                  className="fixed inset-0 bg-black/80 z-40 lg:hidden"
                />
                <motion.div
                  initial={{ x: -300 }}
                  animate={{ x: 0 }}
                  exit={{ x: -300 }}
                  className="fixed left-0 top-0 bottom-0 w-80 bg-gray-900 z-50 overflow-y-auto lg:hidden"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold text-white">Bộ lọc</h2>
                      <button
                        onClick={() => setShowMobileFilter(false)}
                        className="p-2 hover:bg-gray-800 rounded-lg"
                      >
                        <X className="w-5 h-5 text-gray-400" />
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
            {paginatedProducts.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-400 text-lg mb-4">Không tìm thấy sản phẩm phù hợp</p>
                <button
                  onClick={() => {
                    onCategoryChange('all');
                    setSelectedBrand('all');
                    setPriceRange([0, 5000000]);
                  }}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-all"
                >
                  Xóa bộ lọc
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-8">
                  {paginatedProducts.map((product, index) => (
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
                      />
                    </motion.div>
                  ))}
                </div>

                {/* Enhanced Pagination */}
                {totalPages > 1 && (
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {/* First Page Button */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="px-3 py-2 rounded-lg font-bold transition-all bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed border border-gray-700"
                    >
                      ««
                    </motion.button>

                    {/* Previous Page Button */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-2 rounded-lg font-bold transition-all bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed border border-gray-700"
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
                              ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-600/50 border-2 border-red-500'
                              : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
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
                      className="px-3 py-2 rounded-lg font-bold transition-all bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed border border-gray-700"
                    >
                      ›
                    </motion.button>

                    {/* Last Page Button */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 rounded-lg font-bold transition-all bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed border border-gray-700"
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
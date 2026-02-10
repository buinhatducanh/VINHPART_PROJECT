import { motion } from 'motion/react';
import { Package, Upload, X, ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';
import { useState, useEffect, useRef } from 'react';

interface AddProductPageProps {
  onBack: () => void;
}

export function AddProductPage({ onBack }: AddProductPageProps) {
  // Format helpers
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  const parseNumber = (str: string): number => {
    const cleaned = str.replace(/\./g, '').replace(/[^\d]/g, '');
    return cleaned ? parseInt(cleaned, 10) : 0;
  };

  const [formData, setFormData] = useState({
    product_name: '',
    brand: '',
    category: '',
    model: '',
    price: '',
    discount_percent: '',
    stock: '',
    description: '',
    image_url: ''
  });

  const [imagePreview, setImagePreview] = useState<string>('');

  // Cloudinary Widget Ref
  const widgetRef = useRef<any>(null);

  useEffect(() => {
    if ((window as any).cloudinary) {
      widgetRef.current = (window as any).cloudinary.createUploadWidget(
        {
          cloudName: (import.meta as any).env.VITE_CLOUDINARY_CLOUD_NAME || 'dmz66rbbk',
          // ✅ FIX: Use unsigned upload with preset (simpler, no signature needed)
          uploadPreset: 'vinhpart_products_preset',
          sources: ['local', 'url', 'camera'],
          multiple: false,
          folder: 'vinhpart_products',
          resourceType: 'image',
          clientAllowedFormats: ['png', 'jpg', 'jpeg', 'webp'],
          maxFileSize: 10000000, // 10MB
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
          // Debug: Log tất cả events để hiểu flow
          console.log('Cloudinary event:', result?.event, result);

          if (!error && result && result.event === "success") {
            const url = result.info.secure_url;
            console.log('✅ Upload success:', url);
            setFormData(prev => ({ ...prev, image_url: url }));
            setImagePreview(url);
            toast.success('Ảnh đã được tải lên thành công!');
          } else if (error) {
            console.error('❌ Upload error:', error);
            toast.error('Lỗi khi tải ảnh lên: ' + error.message);
          }
        }
      );
    }
  }, []);


  const openWidget = () => {
    if (widgetRef.current) {
      widgetRef.current.open();
    } else {
      toast.error("Widget chưa tải xong. Hãy thử lại.");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Handle price formatting
    if (name === 'price' || name === 'discount_percentage' || name === 'discount_percent') {
      const raw = value.replace(/\./g, '').replace(/[^\d]/g, '');
      setFormData(prev => ({ ...prev, [name]: raw }));
    } else if (name === 'image_url') {
      setFormData(prev => ({ ...prev, [name]: value }));
      setImagePreview(value);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ FIX: Parse and validate numeric fields
    const price = parseFloat(formData.price);
    const stock = parseInt(formData.stock);
    const discount_percent = formData.discount_percent ? parseFloat(formData.discount_percent) : undefined;

    // Validation
    if (isNaN(price) || price <= 0) {
      toast.error('Giá sản phẩm không hợp lệ');
      return;
    }
    if (isNaN(stock) || stock < 0) {
      toast.error('Số lượng tồn kho không hợp lệ');
      return;
    }
    if (discount_percent !== undefined && (isNaN(discount_percent) || discount_percent < 0 || discount_percent > 100)) {
      toast.error('Phần trăm giảm giá phải từ 0-100');
      return;
    }

    const payload = {
      product_name: formData.product_name,
      brand: formData.brand,
      category: formData.category,
      model: formData.model,
      price: price.toString(),  // Backend expects string in parseFloat
      discount_percent: discount_percent?.toString(),
      stock: stock.toString(),
      description: formData.description,
      image_url: formData.image_url
    };

    console.log('Thêm sản phẩm:', payload);

    try {
      const response = await fetch('http://localhost:3001/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success('Sản phẩm đã được thêm thành công!');
        onBack();
      } else {
        const error = await response.json();
        toast.error('Lỗi khi thêm sản phẩm: ' + (error.details || error.error));
      }
    } catch (error) {
      console.error('Network error:', error);
      toast.error('Lỗi kết nối tới server.');
    }
  };

  const categories = [
    'Phụ tùng động cơ',
    'Phanh & Hệ thống phanh',
    'Lọc & Bảo dưỡng',
    'Điện & Đèn',
    'Phụ kiện ngoại thất'
  ];

  const brands = [
    'Honda',
    'Yamaha',
    'Suzuki',
    'Toyota',
    'Ford',
    'Mazda'
  ];

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
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
                  THÊM SẢN PHẨM MỚI
                </h1>
                <p className="text-sm text-gray-500">Tạo sản phẩm mới cho cửa hàng</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Form */}
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Image Preview */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-1"
            >
              <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 sticky top-24">
                <h3 className="text-lg font-bold text-white mb-4">Hình ảnh sản phẩm</h3>

                {/* Image Preview */}
                <div className="relative aspect-square bg-gray-800/50 rounded-xl overflow-hidden border-2 border-dashed border-gray-700 mb-4">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={() => setImagePreview('')}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                      <Upload className="w-16 h-16 mb-2 opacity-50" />
                      <p className="text-sm">Nhập URL hình ảnh</p>
                    </div>
                  )}
                </div>

                {/* Image URL Input */}
                <div className="flex flex-col gap-2">
                  <label className="block text-sm font-medium text-gray-400">
                    URL Hình ảnh
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="image_url"
                      value={formData.image_url}
                      onChange={handleInputChange}
                      placeholder="https://example.com/image.jpg"
                      className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-600/50 focus:ring-2 focus:ring-blue-600/20 transition-all"
                    />
                    <button
                      type="button"
                      onClick={openWidget}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Upload className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">Nhấn nút bên phải để tải ảnh lên Cloudinary</p>
                </div>
              </div>
            </motion.div>

            {/* Right Column - Product Details */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2"
            >
              <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-6">Thông tin sản phẩm</h3>

                <div className="space-y-6">
                  {/* Product Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Tên sản phẩm <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      name="product_name"
                      value={formData.product_name}
                      onChange={handleInputChange}
                      required
                      placeholder="Ví dụ: Lọc gió động cơ cao cấp"
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-600/50 focus:ring-2 focus:ring-blue-600/20 transition-all"
                    />
                  </div>

                  {/* Brand & Category */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Hãng xe <span className="text-red-600">*</span>
                      </label>
                      <select
                        name="brand"
                        value={formData.brand}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-600/50 focus:ring-2 focus:ring-blue-600/20 transition-all"
                      >
                        <option value="">Chọn hãng</option>
                        {brands.map(brand => (
                          <option key={brand} value={brand}>{brand}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Danh mục <span className="text-red-600">*</span>
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-600/50 focus:ring-2 focus:ring-blue-600/20 transition-all"
                      >
                        <option value="">Chọn danh mục</option>
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Model */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Model/Dòng xe
                    </label>
                    <input
                      type="text"
                      name="model"
                      value={formData.model}
                      onChange={handleInputChange}
                      placeholder="Ví dụ: Wave Alpha, Vios, Ranger"
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-600/50 focus:ring-2 focus:ring-blue-600/20 transition-all"
                    />
                  </div>

                  {/* Price, Discount, Stock */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Giá gốc (VNĐ) <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        name="price"
                        value={formData.price ? formatNumber(parseInt(formData.price)) : ''}
                        onChange={handleInputChange}
                        required
                        placeholder="0"
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-600/50 focus:ring-2 focus:ring-blue-600/20 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Giảm giá (%)
                      </label>
                      <input
                        type="text"
                        name="discount_percent"
                        value={formData.discount_percent ? formatNumber(parseInt(formData.discount_percent)) : ''}
                        onChange={handleInputChange}
                        placeholder="0 - 100"
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-600/50 focus:ring-2 focus:ring-blue-600/20 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Tồn kho <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="number"
                        name="stock"
                        value={formData.stock}
                        onChange={handleInputChange}
                        required
                        min="0"
                        placeholder="0"
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-600/50 focus:ring-2 focus:ring-blue-600/20 transition-all"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Mô tả sản phẩm
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={4}
                      placeholder="Nhập mô tả chi tiết về sản phẩm..."
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-600/50 focus:ring-2 focus:ring-blue-600/20 transition-all resize-none"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-4 border-t border-gray-800">
                    <motion.button
                      type="button"
                      onClick={onBack}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 px-6 py-3 bg-gray-800 border border-gray-700 text-white rounded-lg hover:bg-gray-700 transition-all flex items-center justify-center gap-2"
                    >
                      <X className="w-5 h-5" />
                      Hủy bỏ
                    </motion.button>

                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2"
                    >
                      <Save className="w-5 h-5" />
                      Thêm sản phẩm
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </form>
      </div>
    </div>
  );
}

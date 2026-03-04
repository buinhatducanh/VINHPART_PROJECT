import { motion } from 'motion/react';
import { Package, Upload, X, ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';
import { useState, useEffect, useRef } from 'react';
import { useI18n } from '@/shared/lib/i18n';

interface AddProductPageProps {
  onBack: () => void;
}

export function AddProductPage({ onBack }: AddProductPageProps) {
  const { t, language } = useI18n();
  // Format helpers
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat(language === 'vi' ? 'vi-VN' : 'en-US').format(num);
  };

  const parseNumber = (str: string): number => {
    const cleaned = str.replace(/\./g, "").replace(/[^\d]/g, "");
    return cleaned ? parseInt(cleaned, 10) : 0;
  };

  const [formData, setFormData] = useState({
    product_name: "",
    brand: "",
    category: "",
    model: "",
    price: "",
    discount_percent: "",
    stock: "",
    description: "",
    image_url: ""
  });

  const [imagePreview, setImagePreview] = useState<string>("");

  // Cloudinary Widget Ref
  const widgetRef = useRef<any>(null);

  useEffect(() => {
    if ((window as any).cloudinary) {
      widgetRef.current = (window as any).cloudinary.createUploadWidget(
        {
          cloudName: (import.meta as any).env.VITE_CLOUDINARY_CLOUD_NAME || "dmz66rbbk",
          uploadPreset: "vinhpart_products_preset",
          sources: ["local", "url", "camera"],
          multiple: false,
          folder: "vinhpart_products",
          resourceType: "image",
          clientAllowedFormats: ["png", "jpg", "jpeg", "webp"],
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
          if (!error && result && result.event === "success") {
            const url = result.info.secure_url;
            setFormData(prev => ({ ...prev, image_url: url }));
            setImagePreview(url);
            toast.success(t("admin.product.imgUploadSuccess"));
          } else if (error) {
            toast.error(t("admin.product.imgUploadError") + error.message);
          }
        }
      );
    }
  }, [t]);


  const openWidget = () => {
    if (widgetRef.current) {
      widgetRef.current.open();
    } else {
      toast.error(t("admin.product.widgetNotLoaded"));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === "price" || name === "discount_percentage" || name === "discount_percent") {
      const raw = value.replace(/\./g, "").replace(/[^\d]/g, "");
      setFormData(prev => ({ ...prev, [name]: raw }));
    } else if (name === "image_url") {
      setFormData(prev => ({ ...prev, [name]: value }));
      setImagePreview(value);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const price = parseFloat(formData.price);
    const stock = parseInt(formData.stock);
    const discount_percent = formData.discount_percent ? parseFloat(formData.discount_percent) : undefined;

    // Validation
    if (isNaN(price) || price <= 0) {
      toast.error(t("admin.product.invalidPrice"));
      return;
    }
    if (isNaN(stock) || stock < 0) {
      toast.error(t("admin.product.invalidStock"));
      return;
    }
    if (discount_percent !== undefined && (isNaN(discount_percent) || discount_percent < 0 || discount_percent > 100)) {
      toast.error(t("admin.product.invalidDiscount"));
      return;
    }

    const payload = {
      product_name: formData.product_name,
      brand: formData.brand,
      category: formData.category,
      model: formData.model,
      price: price.toString(),
      discount_percent: discount_percent?.toString(),
      stock: stock.toString(),
      description: formData.description,
      image_url: formData.image_url
    };

    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success(t("admin.product.successAdd"));
        onBack();
      } else {
        const error = await response.json();
        toast.error(t("admin.product.errorAdd") + (error.details || error.error));
      }
    } catch (error) {
      toast.error(t("admin.product.networkError"));
    }
  };

  const categories = [
    t('settings.categories'), // Use common categories if available, or keep Vietnamese for now but wrap in t() for potential future use
    "Phụ tùng động cơ",
    "Phanh & Hệ thống phanh",
    "Lọc & Bảo dưỡng",
    "Điện & Đèn",
    "Phụ kiện ngoại thất"
  ];

  const brands = [
    "Honda",
    "Yamaha",
    "Suzuki",
    "Toyota",
    "Ford",
    "Mazda"
  ];

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
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative border-b border-border bg-background/40 backdrop-blur-xl sticky top-0 z-10"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <motion.button onClick={onBack} whileHover={{ scale: 1.05, x: -5 }} whileTap={{ scale: 0.95 }} className="p-3 bg-card border border-border rounded-lg hover:border-red-600/50 transition-all group">
              <ArrowLeft className="w-5 h-5 text-muted-foreground group-hover:text-red-600 transition-colors" />
            </motion.button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-transparent bg-gradient-to-r from-white via-gray-200 to-blue-600 bg-clip-text">
                  {t("admin.product.addTitle")}
                </h1>
                <p className="text-sm text-muted-foreground">{t("admin.product.addSubtitle")}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-1">
              <div className="bg-card/50 backdrop-blur-xl border border-border rounded-2xl p-6 sticky top-24">
                <h3 className="text-lg font-bold text-foreground mb-4">{t("admin.product.image")}</h3>

                <div className="relative aspect-square bg-muted rounded-xl overflow-hidden border-2 border-dashed border-border mb-4">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" onError={() => setImagePreview("")} />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                      <Upload className="w-16 h-16 mb-2 opacity-50" />
                      <p className="text-sm">{t("admin.product.imageInputText")}</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="block text-sm font-medium text-muted-foreground">{t("admin.product.imageUrl")}</label>
                  <div className="flex gap-2">
                    <input type="text" name="image_url" value={formData.image_url} onChange={handleInputChange} placeholder="https://example.com/image.jpg" className="flex-1 px-4 py-3 bg-muted border border-border rounded-lg text-foreground placeholder-gray-500 focus:outline-none focus:border-blue-600/50 focus:ring-2 focus:ring-blue-600/20 transition-all" />
                    <button type="button" onClick={openWidget} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-foreground rounded-lg transition-colors flex items-center gap-2">
                      <Upload className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">{t("admin.product.imageUpload")}</p>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2">
              <div className="bg-card/50 backdrop-blur-xl border border-border rounded-2xl p-6">
                <h3 className="text-lg font-bold text-foreground mb-6">{t("admin.product.infoTitle")}</h3>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">{t("admin.product.nameLabel")} <span className="text-red-600">*</span></label>
                    <input type="text" name="product_name" value={formData.product_name} onChange={handleInputChange} required placeholder={t("admin.product.namePlaceholder")} className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-foreground placeholder-gray-500 focus:outline-none focus:border-blue-600/50 focus:ring-2 focus:ring-blue-600/20 transition-all" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">{t("admin.product.brandLabel")} <span className="text-red-600">*</span></label>
                      <select name="brand" value={formData.brand} onChange={handleInputChange} required className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:border-blue-600/50 focus:ring-2 focus:ring-blue-600/20 transition-all">
                        <option value="">{t("admin.product.brandSelect")}</option>
                        {brands.map(brand => <option key={brand} value={brand}>{brand}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">{t("admin.product.categoryLabel")} <span className="text-red-600">*</span></label>
                      <select name="category" value={formData.category} onChange={handleInputChange} required className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:border-blue-600/50 focus:ring-2 focus:ring-blue-600/20 transition-all">
                        <option value="">{t("admin.product.categorySelect")}</option>
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">{t("admin.product.modelLabel")}</label>
                    <input type="text" name="model" value={formData.model} onChange={handleInputChange} placeholder={t("admin.product.modelPlaceholder")} className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-foreground placeholder-gray-500 focus:outline-none focus:border-blue-600/50 focus:ring-2 focus:ring-blue-600/20 transition-all" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">{t("admin.product.priceLabel")} <span className="text-red-600">*</span></label>
                      <input type="text" name="price" value={formData.price ? formatNumber(parseInt(formData.price)) : ""} onChange={handleInputChange} required placeholder="0" className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-foreground placeholder-gray-500 focus:outline-none focus:border-blue-600/50 focus:ring-2 focus:ring-blue-600/20 transition-all" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">{t("admin.product.discountLabel")}</label>
                      <input type="text" name="discount_percent" value={formData.discount_percent ? formatNumber(parseInt(formData.discount_percent)) : ""} onChange={handleInputChange} placeholder="0 - 100" className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-foreground placeholder-gray-500 focus:outline-none focus:border-blue-600/50 focus:ring-2 focus:ring-blue-600/20 transition-all" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">{t("admin.product.stockLabel")} <span className="text-red-600">*</span></label>
                      <input type="number" name="stock" value={formData.stock} onChange={handleInputChange} required min="0" placeholder="0" className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-foreground placeholder-gray-500 focus:outline-none focus:border-blue-600/50 focus:ring-2 focus:ring-blue-600/20 transition-all" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">{t("admin.product.descLabel")}</label>
                    <textarea name="description" value={formData.description} onChange={handleInputChange} rows={4} placeholder={t("admin.product.descPlaceholder")} className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-foreground placeholder-gray-500 focus:outline-none focus:border-blue-600/50 focus:ring-2 focus:ring-blue-600/20 transition-all resize-none" />
                  </div>

                  <div className="flex gap-4 pt-4 border-t border-border">
                    <motion.button type="button" onClick={onBack} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1 px-6 py-3 bg-muted border border-border text-foreground rounded-lg hover:bg-muted/80 transition-all flex items-center justify-center gap-2">
                      <X className="w-5 h-5" />
                      {t("admin.product.cancel")}
                    </motion.button>

                    <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-foreground rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2">
                      <Save className="w-5 h-5" />
                      {t("admin.product.addBtn")}
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

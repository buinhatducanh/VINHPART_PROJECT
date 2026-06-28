import { motion } from 'motion/react';
import { ShoppingCart, Zap } from 'lucide-react';
import { Product } from '@/shared/types';
import { useState } from 'react';
import { useI18n } from '@/shared/lib/i18n';
import { formatImageUrl } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onBuyNow: (product: Product) => void;
  onProductClick?: (productId: string) => void;
}

export function ProductCard({ product, onAddToCart, onBuyNow, onProductClick }: ProductCardProps) {
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const { t, language } = useI18n();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(language === 'vi' ? 'vi-VN' : 'en-US', {
      style: 'currency',
      currency: language === 'vi' ? 'VND' : 'USD'
    }).format(language === 'vi' ? price : price / 25000); // Simple conversion for demo
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent navigation if clicking buttons
    if ((e.target as HTMLElement).closest('button')) return;

    if (onProductClick) {
      onProductClick(product.product_id);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -8 }}
      onClick={handleCardClick}
      className={`bg-gradient-to-b from-gray-900 to-gray-900/50 border border-border rounded-xl overflow-hidden group hover:border-red-600/50 hover:shadow-2xl hover:shadow-red-600/20 transition-all relative ${onProductClick ? 'cursor-pointer' : ''}`}
    >
      {/* Glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-b from-red-600/0 via-red-600/5 to-red-600/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

      {/* Product Image */}
      <div className="relative aspect-square bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
        <img
          src={formatImageUrl(product.product_image, 400)}
          alt={product.product_name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = '/placeholder-product.svg';
          }}
        />

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-60"></div>

        {/* Discount Badge */}
        {product.discount_percentage && (
          <div className="absolute top-3 left-3 z-10">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-yellow-500 rounded-full blur-md opacity-60"></div>
              <div className="relative bg-gradient-to-br from-yellow-400 to-yellow-600 text-foreground px-3 py-1.5 rounded-full font-black text-sm shadow-xl border-2 border-yellow-300">
                -{product.discount_percentage}%
              </div>
            </motion.div>
          </div>
        )}

        {/* Stock Badge */}
        <div className={`absolute top-3 z-10 ${product.discount_percentage ? 'right-3' : 'right-3'}`}>
          {product.stock_status === 'in_stock' && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="px-3 py-1.5 bg-gradient-to-r from-green-600 to-green-500 text-foreground text-xs font-bold rounded-full shadow-lg shadow-green-600/50"
            >
              {t('product.inStock')}
            </motion.span>
          )}
          {product.stock_status === 'low_stock' && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="px-3 py-1.5 bg-gradient-to-r from-yellow-600 to-yellow-500 text-foreground text-xs font-bold rounded-full shadow-lg shadow-yellow-600/50"
            >
              {t('product.lowStock')}
            </motion.span>
          )}
          {product.stock_status === 'out_of_stock' && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="px-3 py-1.5 bg-gradient-to-r from-gray-600 to-gray-500 text-foreground text-xs font-bold rounded-full shadow-lg"
            >
              {t('product.outOfStock')}
            </motion.span>
          )}
        </div>

        {/* Vehicle Type Badge */}
        <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 z-10">
          <span className="px-2 sm:px-3 py-1 sm:py-1.5 bg-background/80 backdrop-blur-md text-foreground text-[10px] sm:text-xs font-bold rounded-full border border-red-600/30 shadow-lg">
            {product.vehicle_type === 'Motorbike' ? `🏍️ ${t('product.motorbike')}` : `🚗 ${t('product.car')}`}
          </span>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-2.5 sm:p-4 relative z-10">
        <h3 className="text-foreground font-bold mb-1.5 sm:mb-2 line-clamp-2 text-sm sm:text-base min-h-[2.5rem] sm:min-h-[3rem] group-hover:text-red-400 transition-colors">
          {product.product_name}
        </h3>

        <div className="space-y-0.5 sm:space-y-1 mb-2 sm:mb-3">
          <p className="text-muted-foreground text-xs sm:text-sm font-medium line-clamp-1">
            {product.compatible_brand} {product.compatible_model}
          </p>
          <p className="text-muted-foreground text-[10px] sm:text-xs line-clamp-1">
            {product.engine_capacity}
          </p>
        </div>

        <div className="bg-gradient-to-r from-red-600/20 to-transparent border-l-2 sm:border-l-4 border-red-600 pl-2 sm:pl-3 py-1.5 sm:py-2 mb-2 sm:mb-4 min-h-[50px] sm:min-h-[76px] flex items-center">
          {product.discount_percentage ? (
            <div className="flex flex-col gap-0.5 sm:gap-1">
              <div className="text-muted-foreground text-[10px] sm:text-sm line-through">
                {formatPrice(product.original_price || (product.price / (1 - product.discount_percentage / 100)))}
              </div>
              <div className="text-red-500 text-sm sm:text-xl font-black">
                {formatPrice(product.price)}
              </div>
            </div>
          ) : (
            <div className="text-red-500 text-sm sm:text-xl font-black">
              {formatPrice(product.price)}
            </div>
          )}
        </div>

        {/* Action Buttons - Improved responsive layout */}
        <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-2">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onBuyNow(product)}
            disabled={product.stock_status === 'out_of_stock'}
            className="flex-1 flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-4 py-1.5 sm:py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-foreground font-bold rounded-lg transition-all text-[10px] sm:text-sm shadow-lg shadow-red-600/30 hover:shadow-red-600/50 whitespace-nowrap touch-manipulation"
          >
            <Zap className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="truncate">{t('product.buyNow')}</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={(e) => {
              onAddToCart(product);

              // Create ripple effect
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;
              const newRipple = { id: Date.now(), x, y };
              setRipples(prev => [...prev, newRipple]);

              // Remove ripple after animation
              setTimeout(() => {
                setRipples(prev => prev.filter(r => r.id !== newRipple.id));
              }, 600);
            }}
            disabled={product.stock_status === 'out_of_stock'}
            className="relative overflow-hidden flex items-center justify-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2.5 w-full sm:w-auto sm:min-w-[80px] bg-transparent border sm:border-2 border-red-600 hover:bg-red-600 disabled:border-border disabled:cursor-not-allowed text-red-600 hover:text-foreground disabled:text-muted-foreground font-bold rounded-lg transition-all text-[10px] sm:text-sm touch-manipulation"
          >
            {/* Ripple effects */}
            {ripples.map(ripple => (
              <motion.span
                key={ripple.id}
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: 4, opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="absolute bg-red-400 rounded-full w-8 h-8 pointer-events-none"
                style={{
                  left: ripple.x - 16,
                  top: ripple.y - 16,
                }}
              />
            ))}
            <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="hidden sm:inline truncate text-xs sm:text-sm">{t('product.addToCart')}</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
import { motion } from 'motion/react';
import { CartItem } from '@/shared/types';
import { productImages } from '@/shared/data/productImages';
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag } from 'lucide-react';
import { useI18n } from '@/shared/lib/i18n';

interface CartPageProps {
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, newQuantity: number) => void;
  onBackToShopping: () => void;
  onCheckout: () => void;
}

export function CartPage({ cartItems, onUpdateQuantity, onBackToShopping, onCheckout }: CartPageProps) {
  const { t, language } = useI18n();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(language === 'vi' ? 'vi-VN' : 'en-US', {
      style: 'currency',
      currency: language === 'vi' ? 'VND' : 'USD'
    }).format(language === 'vi' ? price : price / 25000);
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shipping = subtotal >= 500000 ? 0 : 50000;
  const total = subtotal + shipping;

  if (cartItems.length === 0) {
    return (
      <div className="pt-20 min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-32 h-32 bg-card rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-16 h-16 text-gray-600" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-4">{t('cart.empty')}</h2>
          <p className="text-muted-foreground mb-8">{t('cart.emptySub') || 'Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm'}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBackToShopping}
            className="px-8 py-3 bg-red-600 hover:bg-red-700 text-foreground font-bold rounded-lg transition-all inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            {t('cart.backToShopping')}
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBackToShopping}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('cart.backToShopping')}
          </button>
          <h1 className="text-3xl font-bold text-foreground">{t('cart.title')}</h1>
          <p className="text-muted-foreground mt-2">{cartItems.length} {t('header.products').toLowerCase()}</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item, index) => (
              <motion.div
                key={item.product.product_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-card border border-border rounded-lg p-4 md:p-6 hover:border-red-600/50 transition-all"
              >
                <div className="flex gap-4">
                  {/* Product Image */}
                  <div className="w-24 h-24 md:w-32 md:h-32 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={productImages[item.product.product_id] || `https://source.unsplash.com/400x400/?${item.product.product_image}`}
                      alt={item.product.product_name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-foreground font-bold mb-2 line-clamp-2">
                      {item.product.product_name}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-1">
                      {item.product.compatible_brand} {item.product.compatible_model}
                    </p>
                    <p className="text-muted-foreground text-xs mb-3">
                      {item.product.engine_capacity}
                    </p>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Price */}
                      <div>
                        <p className="text-red-600 text-xl font-bold">
                          {formatPrice(item.product.price)}
                        </p>
                        {item.quantity > 1 && (
                          <p className="text-muted-foreground text-sm">
                            {t('common.total') || 'Tổng'}: {formatPrice(item.product.price * item.quantity)}
                          </p>
                        )}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
                          <button
                            onClick={() => onUpdateQuantity(item.product.product_id, item.quantity - 1)}
                            className="p-2 hover:bg-muted/80 rounded-lg transition-colors"
                          >
                            <Minus className="w-4 h-4 text-foreground" />
                          </button>
                          <span className="text-foreground font-bold min-w-[2rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.product.product_id, item.quantity + 1)}
                            className="p-2 hover:bg-muted/80 rounded-lg transition-colors"
                          >
                            <Plus className="w-4 h-4 text-foreground" />
                          </button>
                        </div>

                        <button
                          onClick={() => onUpdateQuantity(item.product.product_id, 0)}
                          className="p-2 hover:bg-muted rounded-lg transition-colors group"
                        >
                          <Trash2 className="w-5 h-5 text-muted-foreground group-hover:text-red-600 transition-colors" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-lg p-6 sticky top-24"
            >
              <h2 className="text-xl font-bold text-foreground mb-6">{t('cart.summary')}</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-muted-foreground">
                  <span>{t('cart.subtotal')}:</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>

                <div className="flex justify-between text-muted-foreground">
                  <span>{t('cart.shipping')}:</span>
                  <span className={shipping === 0 ? 'text-green-600' : ''}>
                    {shipping === 0 ? (t('common.free') || 'Miễn phí') : formatPrice(shipping)}
                  </span>
                </div>

                {subtotal < 500000 && shipping > 0 && (
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                    {t('cart.shippingNote') || `Mua thêm ${formatPrice(500000 - subtotal)} để được miễn phí vận chuyển`}
                  </p>
                )}

                <div className="border-t border-border pt-4">
                  <div className="flex justify-between text-foreground text-xl font-bold">
                    <span>{t('cart.total')}:</span>
                    <span className="text-red-600">{formatPrice(total)}</span>
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onCheckout}
                className="w-full bg-red-600 hover:bg-red-700 text-foreground font-bold py-4 rounded-lg shadow-lg shadow-red-600/50 hover:shadow-red-600/80 transition-all"
              >
                {t('cart.checkout')}
              </motion.button>

              <button
                onClick={onBackToShopping}
                className="w-full mt-3 bg-transparent border-2 border-border hover:border-white text-foreground font-bold py-3 rounded-lg transition-all"
              >
                {t('cart.backToShopping')}
              </button>

              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t border-border space-y-3">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="w-8 h-8 bg-green-600/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600">✓</span>
                  </div>
                  <span>{t('common.securePayment') || 'Thanh toán an toàn'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="w-8 h-8 bg-green-600/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600">✓</span>
                  </div>
                  <span>{t('common.genuineWarranty') || 'Bảo hành chính hãng'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="w-8 h-8 bg-green-600/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600">✓</span>
                  </div>
                  <span>{t('common.returnPolicy') || 'Đổi trả trong 30 ngày'}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
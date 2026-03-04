import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, CheckCircle2, CreditCard, Truck, Shield } from 'lucide-react';
import { CartItem } from '@/shared/types';
import { productImages } from '@/shared/data/productImages';
import { useI18n } from '@/shared/lib/i18n';

interface CheckoutPageProps {
  cartItems: CartItem[];
  onBackToCart: () => void;
  onBackToShopping: () => void;
}

export function CheckoutPage({ cartItems, onBackToCart, onBackToShopping }: CheckoutPageProps) {
  const [orderComplete, setOrderComplete] = useState(false);
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

  const handlePlaceOrder = async () => {
    try {
      // Mock order data from form (in a real app, this would come from state)
      const orderData = {
        customerName: 'Nguyễn Văn A',
        customerEmail: 'example@email.com',
        customerPhone: '0901234567',
        address: 'Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố',
        city: 'Hồ Chí Minh',
        notes: 'Yêu cầu đặc biệt về đơn hàng...',
        totalAmount: total,
        items: cartItems.map(item => ({
          productId: item.product.product_id,
          name: item.product.product_name,
          price: item.product.price,
          quantity: item.quantity
        }))
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        setOrderComplete(true);
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại!');
    }
  };

  if (orderComplete) {
    return (
      <div className="pt-20 min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md mx-auto px-4"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-32 h-32 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-green-600/50"
          >
            <CheckCircle2 className="w-20 h-20 text-foreground" />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-3xl font-bold text-foreground mb-4"
          >
            {t('checkout.success')}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-muted-foreground mb-8"
          >
            {t('checkout.thanks')}
          </motion.p>
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBackToShopping}
            className="px-8 py-3 bg-red-600 hover:bg-red-700 text-foreground font-bold rounded-lg transition-all"
          >
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
            onClick={onBackToCart}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('checkout.backToCart') || 'Quay lại giỏ hàng'}
          </button>
          <h1 className="text-3xl font-bold text-foreground">{t('cart.checkout')}</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-lg p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                  <Truck className="w-5 h-5 text-foreground" />
                </div>
                <h2 className="text-xl font-bold text-foreground">{t('checkout.shippingInfo')}</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-muted-foreground mb-2">{t('checkout.fullName')} *</label>
                  <input
                    type="text"
                    placeholder={t('checkout.fullNamePlaceholder') || "Nguyễn Văn A"}
                    className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground placeholder-gray-500 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-muted-foreground mb-2">{t('checkout.phone')} *</label>
                  <input
                    type="tel"
                    placeholder={t('checkout.phonePlaceholder') || "0901234567"}
                    className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground placeholder-gray-500 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-muted-foreground mb-2">{t('checkout.email')}</label>
                  <input
                    type="email"
                    placeholder="example@email.com"
                    className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground placeholder-gray-500 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-muted-foreground mb-2">{t('checkout.address')} *</label>
                  <textarea
                    rows={3}
                    placeholder={t('checkout.addressPlaceholder') || "Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"}
                    className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground placeholder-gray-500 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-muted-foreground mb-2">{t('checkout.notes')}</label>
                  <textarea
                    rows={2}
                    placeholder={t('checkout.notesPlaceholder') || "Yêu cầu đặc biệt về đơn hàng..."}
                    className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground placeholder-gray-500 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all resize-none"
                  />
                </div>
              </div>
            </motion.div>

            {/* Payment Method */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card border border-border rounded-lg p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-foreground" />
                </div>
                <h2 className="text-xl font-bold text-foreground">{t('checkout.paymentMethod')}</h2>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-3 bg-muted border border-border rounded-lg p-4 cursor-pointer hover:border-red-600 transition-all group">
                  <input type="radio" name="payment" defaultChecked className="w-4 h-4 text-red-600" />
                  <div className="flex-1">
                    <div className="text-foreground font-bold">{t('checkout.cod')}</div>
                    <div className="text-muted-foreground text-sm">{t('checkout.codDesc') || 'Thanh toán bằng tiền mặt khi nhận hàng'}</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 bg-muted border border-border rounded-lg p-4 cursor-pointer hover:border-red-600 transition-all group">
                  <input type="radio" name="payment" className="w-4 h-4 text-red-600" />
                  <div className="flex-1">
                    <div className="text-foreground font-bold">{t('checkout.bankTransfer')}</div>
                    <div className="text-muted-foreground text-sm">{t('checkout.bankTransferDesc') || 'Chuyển khoản trước khi giao hàng'}</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 bg-muted border border-border rounded-lg p-4 cursor-pointer hover:border-red-600 transition-all group">
                  <input type="radio" name="payment" className="w-4 h-4 text-red-600" />
                  <div className="flex-1">
                    <div className="text-foreground font-bold">{t('checkout.eWallet')}</div>
                    <div className="text-muted-foreground text-sm">{t('checkout.eWalletDesc') || 'Thanh toán qua ví điện tử'}</div>
                  </div>
                </label>
              </div>
            </motion.div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card border border-border rounded-lg p-6 sticky top-24"
            >
              <h2 className="text-xl font-bold text-foreground mb-6">{t('checkout.orderSummary') || t('cart.summary')}</h2>

              {/* Products */}
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {cartItems.map(item => (
                  <div key={item.product.product_id} className="flex gap-3">
                    <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={productImages[item.product.product_id] || item.product.product_image}
                        alt={item.product.product_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-foreground text-sm line-clamp-1">{item.product.product_name}</h3>
                      <p className="text-muted-foreground text-xs">{t('common.quantity') || 'SL'}: {item.quantity}</p>
                      <p className="text-red-600 font-bold text-sm">{formatPrice(item.product.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="space-y-4 mb-6 pt-6 border-t border-border">
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
                onClick={handlePlaceOrder}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-foreground font-bold py-4 rounded-lg shadow-lg shadow-red-600/50 hover:shadow-red-600/80 transition-all"
              >
                {t('checkout.placeOrder')}
              </motion.button>

              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t border-border space-y-3">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Shield className="w-5 h-5 text-green-600" />
                  <span>{t('checkout.secureTransaction') || 'Giao dịch được mã hóa & bảo mật'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Truck className="w-5 h-5 text-green-600" />
                  <span>{t('checkout.nationwideShipping') || 'Giao hàng toàn quốc'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span>{t('checkout.guaranteedAuthentic') || 'Cam kết chính hãng 100%'}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

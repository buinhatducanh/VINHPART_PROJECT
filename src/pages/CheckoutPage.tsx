import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, CreditCard, Truck, Shield, CheckCircle2 } from 'lucide-react';
import { CartItem } from '@/types';
import { productImages } from '@/data/productImages';

interface CheckoutPageProps {
  cartItems: CartItem[];
  onBackToCart: () => void;
  onBackToShopping: () => void;
}

export function CheckoutPage({ cartItems, onBackToCart, onBackToShopping }: CheckoutPageProps) {
  const [orderComplete, setOrderComplete] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shipping = subtotal >= 500000 ? 0 : 50000;
  const total = subtotal + shipping;

  const handlePlaceOrder = () => {
    setOrderComplete(true);
  };

  if (orderComplete) {
    return (
      <div className="pt-20 min-h-screen bg-black flex items-center justify-center">
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
            <CheckCircle2 className="w-20 h-20 text-white" />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-3xl font-bold text-white mb-4"
          >
            Đặt hàng thành công!
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-gray-400 mb-8"
          >
            Cảm ơn bạn đã tin tưởng AutoParts. Chúng tôi sẽ liên hệ với bạn sớm nhất!
          </motion.p>
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBackToShopping}
            className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-all"
          >
            Tiếp tục mua sắm
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBackToCart}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại giỏ hàng
          </button>
          <h1 className="text-3xl font-bold text-white">Thanh toán</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-900 border border-gray-800 rounded-lg p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                  <Truck className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">Thông tin giao hàng</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 mb-2">Họ và tên *</label>
                  <input
                    type="text"
                    placeholder="Nguyễn Văn A"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Số điện thoại *</label>
                  <input
                    type="tel"
                    placeholder="0901234567"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    placeholder="example@email.com"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Địa chỉ *</label>
                  <textarea
                    rows={3}
                    placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Ghi chú (tùy chọn)</label>
                  <textarea
                    rows={2}
                    placeholder="Yêu cầu đặc biệt về đơn hàng..."
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all resize-none"
                  />
                </div>
              </div>
            </motion.div>

            {/* Payment Method */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-900 border border-gray-800 rounded-lg p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">Phương thức thanh toán</h2>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-3 bg-gray-800 border border-gray-700 rounded-lg p-4 cursor-pointer hover:border-red-600 transition-all group">
                  <input type="radio" name="payment" defaultChecked className="w-4 h-4 text-red-600" />
                  <div className="flex-1">
                    <div className="text-white font-bold">Thanh toán khi nhận hàng (COD)</div>
                    <div className="text-gray-400 text-sm">Thanh toán bằng tiền mặt khi nhận hàng</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 bg-gray-800 border border-gray-700 rounded-lg p-4 cursor-pointer hover:border-red-600 transition-all group">
                  <input type="radio" name="payment" className="w-4 h-4 text-red-600" />
                  <div className="flex-1">
                    <div className="text-white font-bold">Chuyển khoản ngân hàng</div>
                    <div className="text-gray-400 text-sm">Chuyển khoản trước khi giao hàng</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 bg-gray-800 border border-gray-700 rounded-lg p-4 cursor-pointer hover:border-red-600 transition-all group">
                  <input type="radio" name="payment" className="w-4 h-4 text-red-600" />
                  <div className="flex-1">
                    <div className="text-white font-bold">Ví điện tử (Momo, ZaloPay)</div>
                    <div className="text-gray-400 text-sm">Thanh toán qua ví điện tử</div>
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
              className="bg-gray-900 border border-gray-800 rounded-lg p-6 sticky top-24"
            >
              <h2 className="text-xl font-bold text-white mb-6">Đơn hàng của bạn</h2>

              {/* Products */}
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {cartItems.map(item => (
                  <div key={item.product.product_id} className="flex gap-3">
                    <div className="w-16 h-16 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={productImages[item.product.product_id]}
                        alt={item.product.product_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white text-sm line-clamp-1">{item.product.product_name}</h3>
                      <p className="text-gray-400 text-xs">SL: {item.quantity}</p>
                      <p className="text-red-600 font-bold text-sm">{formatPrice(item.product.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="space-y-4 mb-6 pt-6 border-t border-gray-800">
                <div className="flex justify-between text-gray-300">
                  <span>Tạm tính:</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>

                <div className="flex justify-between text-gray-300">
                  <span>Phí vận chuyển:</span>
                  <span className={shipping === 0 ? 'text-green-600' : ''}>
                    {shipping === 0 ? 'Miễn phí' : formatPrice(shipping)}
                  </span>
                </div>

                <div className="border-t border-gray-800 pt-4">
                  <div className="flex justify-between text-white text-xl font-bold">
                    <span>Tổng cộng:</span>
                    <span className="text-red-600">{formatPrice(total)}</span>
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handlePlaceOrder}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-4 rounded-lg shadow-lg shadow-red-600/50 hover:shadow-red-600/80 transition-all"
              >
                Đặt hàng ngay
              </motion.button>

              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t border-gray-800 space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <Shield className="w-5 h-5 text-green-600" />
                  <span>Giao dịch được mã hóa & bảo mật</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <Truck className="w-5 h-5 text-green-600" />
                  <span>Giao hàng toàn quốc</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span>Cam kết chính hãng 100%</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

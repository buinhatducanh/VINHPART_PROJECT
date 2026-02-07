import { motion } from 'motion/react';
import { Plus, Minus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';
import { CartItem } from '@/types';
import { productImages } from '@/data/productImages';

interface CartPageProps {
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, newQuantity: number) => void;
  onBackToShopping: () => void;
  onCheckout: () => void;
}

export function CartPage({ cartItems, onUpdateQuantity, onBackToShopping, onCheckout }: CartPageProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shipping = subtotal >= 500000 ? 0 : 50000;
  const total = subtotal + shipping;

  if (cartItems.length === 0) {
    return (
      <div className="pt-20 min-h-screen bg-black flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-32 h-32 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-16 h-16 text-gray-600" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Giỏ hàng trống</h2>
          <p className="text-gray-400 mb-8">Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBackToShopping}
            className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-all inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
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
            onClick={onBackToShopping}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Tiếp tục mua sắm
          </button>
          <h1 className="text-3xl font-bold text-white">Giỏ hàng của bạn</h1>
          <p className="text-gray-400 mt-2">{cartItems.length} sản phẩm</p>
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
                className="bg-gray-900 border border-gray-800 rounded-lg p-4 md:p-6 hover:border-red-600/50 transition-all"
              >
                <div className="flex gap-4">
                  {/* Product Image */}
                  <div className="w-24 h-24 md:w-32 md:h-32 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={productImages[item.product.product_id] || `https://source.unsplash.com/400x400/?${item.product.product_image}`}
                      alt={item.product.product_name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-bold mb-2 line-clamp-2">
                      {item.product.product_name}
                    </h3>
                    <p className="text-gray-400 text-sm mb-1">
                      {item.product.compatible_brand} {item.product.compatible_model}
                    </p>
                    <p className="text-gray-500 text-xs mb-3">
                      {item.product.engine_capacity}
                    </p>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Price */}
                      <div>
                        <p className="text-red-600 text-xl font-bold">
                          {formatPrice(item.product.price)}
                        </p>
                        {item.quantity > 1 && (
                          <p className="text-gray-400 text-sm">
                            Tổng: {formatPrice(item.product.price * item.quantity)}
                          </p>
                        )}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-gray-800 rounded-lg p-1">
                          <button
                            onClick={() => onUpdateQuantity(item.product.product_id, item.quantity - 1)}
                            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                          >
                            <Minus className="w-4 h-4 text-white" />
                          </button>
                          <span className="text-white font-bold min-w-[2rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.product.product_id, item.quantity + 1)}
                            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                          >
                            <Plus className="w-4 h-4 text-white" />
                          </button>
                        </div>

                        <button
                          onClick={() => onUpdateQuantity(item.product.product_id, 0)}
                          className="p-2 hover:bg-gray-800 rounded-lg transition-colors group"
                        >
                          <Trash2 className="w-5 h-5 text-gray-400 group-hover:text-red-600 transition-colors" />
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
              className="bg-gray-900 border border-gray-800 rounded-lg p-6 sticky top-24"
            >
              <h2 className="text-xl font-bold text-white mb-6">Tổng đơn hàng</h2>

              <div className="space-y-4 mb-6">
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

                {subtotal < 500000 && shipping > 0 && (
                  <p className="text-sm text-gray-400 bg-gray-800 p-3 rounded-lg">
                    Mua thêm {formatPrice(500000 - subtotal)} để được miễn phí vận chuyển
                  </p>
                )}

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
                onClick={onCheckout}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-lg shadow-lg shadow-red-600/50 hover:shadow-red-600/80 transition-all"
              >
                Thanh toán
              </motion.button>

              <button
                onClick={onBackToShopping}
                className="w-full mt-3 bg-transparent border-2 border-gray-700 hover:border-white text-white font-bold py-3 rounded-lg transition-all"
              >
                Tiếp tục mua sắm
              </button>

              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t border-gray-800 space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <div className="w-8 h-8 bg-green-600/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600">✓</span>
                  </div>
                  <span>Thanh toán an toàn</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <div className="w-8 h-8 bg-green-600/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600">✓</span>
                  </div>
                  <span>Bảo hành chính hãng</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <div className="w-8 h-8 bg-green-600/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600">✓</span>
                  </div>
                  <span>Đổi trả trong 30 ngày</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
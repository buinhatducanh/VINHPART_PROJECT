import { useState } from 'react';
import { Product } from '@/shared/types';
import { QuantitySelector } from '../atoms/QuantitySelector';
import { motion } from 'motion/react';
import { ShoppingCart, Zap } from 'lucide-react';
import { toast } from 'sonner';

interface ProductActionsProps {
    product: Product;
    onAddToCart: (product: Product, quantity: number) => void;
    onBuyNow: (product: Product, quantity: number) => void;
}

export function ProductActions({ product, onAddToCart, onBuyNow }: ProductActionsProps) {
    const [quantity, setQuantity] = useState(1);

    const handleAddToCart = () => {
        onAddToCart(product, quantity);
        // Toast is handled by parent or App.tsx usually, but we can do it here too if passed down
    };

    const handleBuyNow = () => {
        onBuyNow(product, quantity);
    };

    const isOutOfStock = product.stock_status === 'out_of_stock';

    return (
        <div className="flex flex-col gap-4 p-4 bg-gray-900/30 border-t border-gray-800 mt-auto">
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-400">Số lượng:</span>
                <QuantitySelector
                    value={quantity}
                    onChange={setQuantity}
                    max={product.stock || 10}
                    disabled={isOutOfStock}
                />
            </div>

            <div className="flex gap-3">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-transparent border-2 border-red-600 text-red-500 font-bold rounded-xl hover:bg-red-600 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ShoppingCart className="w-5 h-5" />
                    Thêm vào giỏ
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleBuyNow}
                    disabled={isOutOfStock}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-600/30 hover:from-red-500 hover:to-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Zap className="w-5 h-5" />
                    Mua ngay
                </motion.button>
            </div>
            {/* Extra product benefits */}
            <div className="mt-4 p-4 rounded-xl bg-red-950/40 border border-red-900/40 space-y-3">

                <div className="flex items-center gap-3">
                    <div className="w-5 h-5 flex items-center justify-center text-red-500">
                        ✓
                    </div>
                    <p className="text-sm text-gray-300">
                        Miễn phí vận chuyển cho đơn hàng trên 2.000.000 VND
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="w-5 h-5 flex items-center justify-center text-red-500">
                        ✓
                    </div>
                    <p className="text-sm text-gray-300">
                        Bộ ốc gắn đa năng đi kèm (8mm/10mm)
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="w-5 h-5 flex items-center justify-center text-red-500">
                        ✓
                    </div>
                    <p className="text-sm text-gray-300">
                        Điều chỉnh xoay 360 độ linh hoạt
                    </p>
                </div>
            </div>
            {isOutOfStock && (
                <p className="text-center text-sm text-red-500 font-medium">
                    Sản phẩm hiện đang tạm hết hàng
                </p>
            )}
        </div>
    );
}

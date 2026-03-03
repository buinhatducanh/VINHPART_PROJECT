import { useState } from 'react';
import { Product } from '@/shared/types';
import { QuantitySelector } from '../atoms/QuantitySelector';
import { motion } from 'motion/react';
import { ShoppingCart, Zap } from 'lucide-react';
import { useI18n } from '@/shared/lib/i18n';

interface ProductActionsProps {
    product: Product;
    onAddToCart: (product: Product, quantity: number) => void;
    onBuyNow: (product: Product, quantity: number) => void;
}

export function ProductActions({ product, onAddToCart, onBuyNow }: ProductActionsProps) {
    const [quantity, setQuantity] = useState(1);
    const { t } = useI18n();

    const handleAddToCart = () => {
        onAddToCart(product, quantity);
    };

    const handleBuyNow = () => {
        onBuyNow(product, quantity);
    };

    const isOutOfStock = product.stock_status === 'out_of_stock';

    return (
        <div className="flex flex-col gap-4 p-4 bg-card/30 border-t border-border mt-auto">
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Số lượng:</span>
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
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-transparent border-2 border-red-600 text-red-500 font-bold rounded-xl hover:bg-red-600 hover:text-foreground transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ShoppingCart className="w-5 h-5" />
                    {t('product.addToCart')}
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleBuyNow}
                    disabled={isOutOfStock}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-red-600 to-red-700 text-foreground font-bold rounded-xl shadow-lg shadow-red-600/30 hover:from-red-500 hover:to-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Zap className="w-5 h-5" />
                    {t('product.buyNow')}
                </motion.button>
            </div>
            {/* Extra product benefits */}
            <div className="mt-4 p-4 rounded-xl bg-red-950/40 border border-red-900/40 space-y-3">

                <div className="flex items-center gap-3">
                    <div className="w-5 h-5 flex items-center justify-center text-red-500">
                        ✓
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Miễn phí vận chuyển cho đơn hàng trên 2.000.000 VND
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="w-5 h-5 flex items-center justify-center text-red-500">
                        ✓
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Bộ ốc gắn đa năng đi kèm (8mm/10mm)
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="w-5 h-5 flex items-center justify-center text-red-500">
                        ✓
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Điều chỉnh xoay 360 độ linh hoạt
                    </p>
                </div>
            </div>
            {isOutOfStock && (
                <p className="text-center text-sm text-red-500 font-medium">
                    {t('product.outOfStock')}
                </p>
            )}
        </div>
    );
}

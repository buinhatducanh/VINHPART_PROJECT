import { motion } from 'motion/react';
import { Plus, Check, Package } from 'lucide-react';
import { BodyKitPart } from '@/shared/types';
import { useI18n } from '@/shared/lib/i18n';

interface BodyKitPartRowProps {
    part: BodyKitPart;
    isSelected: boolean;
    onToggle: (productId: string) => void;
}

export function BodyKitPartRow({ part, isSelected, onToggle }: BodyKitPartRowProps) {
    const { language } = useI18n();

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat(language === 'vi' ? 'vi-VN' : 'en-US', {
            style: 'currency',
            currency: language === 'vi' ? 'VND' : 'USD',
        }).format(language === 'vi' ? price : price / 25000);
    };

    const isOutOfStock = part.product.stock_status === 'out_of_stock';

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                isSelected
                    ? 'border-red-600 bg-red-600/5'
                    : 'border-border hover:border-red-600/30 bg-card'
            } ${isOutOfStock ? 'opacity-50' : ''}`}
        >
            <button
                onClick={() => !isOutOfStock && onToggle(part.product.product_id)}
                disabled={isOutOfStock}
                className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    isSelected
                        ? 'border-red-600 bg-red-600'
                        : 'border-muted-foreground/30 hover:border-red-600/50'
                } ${isOutOfStock ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            >
                {isSelected && <Check className="w-4 h-4 text-white" />}
            </button>

            <div className="w-16 h-16 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                {part.product.product_image ? (
                    <img
                        src={part.product.product_image}
                        alt={part.product.product_name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-6 h-6 text-muted-foreground/30" />
                    </div>
                )}
            </div>

            <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-foreground line-clamp-1">
                    {part.product.product_name}
                </h4>
                {part.position && (
                    <span className="text-xs text-muted-foreground">{part.position}</span>
                )}
                <div className="flex items-center gap-2 mt-1">
                    {part.product.stock_status === 'in_stock' && (
                        <span className="text-xs text-green-600 font-medium">
                            {language === 'vi' ? 'Còn hàng' : 'In stock'}
                        </span>
                    )}
                    {part.product.stock_status === 'low_stock' && (
                        <span className="text-xs text-yellow-600 font-medium">
                            {language === 'vi' ? 'Sắp hết' : 'Low stock'}
                        </span>
                    )}
                    {isOutOfStock && (
                        <span className="text-xs text-red-500 font-medium">
                            {language === 'vi' ? 'Hết hàng' : 'Out of stock'}
                        </span>
                    )}
                </div>
            </div>

            <div className="text-right flex-shrink-0">
                {part.product.discount_percentage > 0 && (
                    <span className="text-xs text-muted-foreground line-through block">
                        {formatPrice(part.product.original_price)}
                    </span>
                )}
                <span className="text-red-600 font-bold">
                    {formatPrice(part.product.price)}
                </span>
            </div>

            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => !isOutOfStock && onToggle(part.product.product_id)}
                disabled={isOutOfStock}
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                    isSelected
                        ? 'bg-red-600 text-white'
                        : 'bg-muted hover:bg-red-600/20 text-muted-foreground hover:text-red-600'
                } ${isOutOfStock ? 'cursor-not-allowed' : ''}`}
            >
                {isSelected ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </motion.button>
        </motion.div>
    );
}

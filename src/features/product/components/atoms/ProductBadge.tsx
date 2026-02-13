import { motion } from 'motion/react';

interface ProductBadgeProps {
    variant: 'in_stock' | 'low_stock' | 'out_of_stock' | 'discount' | 'vehicle';
    value?: string | number;
}

export function ProductBadge({ variant, value }: ProductBadgeProps) {
    if (variant === 'in_stock') {
        return (
            <motion.span
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="px-3 py-1 bg-gradient-to-r from-green-600 to-green-500 text-white text-xs font-bold rounded-full shadow-lg shadow-green-600/20 inline-flex items-center gap-1.5"
            >
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                Còn hàng
            </motion.span>
        );
    }

    if (variant === 'low_stock') {
        return (
            <motion.span
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="px-3 py-1 bg-gradient-to-r from-yellow-600 to-yellow-500 text-white text-xs font-bold rounded-full shadow-lg shadow-yellow-600/20 inline-flex items-center gap-1.5"
            >
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                Sắp hết hàng
            </motion.span>
        );
    }

    if (variant === 'out_of_stock') {
        return (
            <motion.span
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="px-3 py-1 bg-gradient-to-r from-gray-600 to-gray-500 text-white text-xs font-bold rounded-full shadow-lg inline-flex items-center gap-1.5"
            >
                <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                Hết hàng
            </motion.span>
        );
    }

    if (variant === 'discount') {
        return (
            <motion.div
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                className="relative inline-block"
            >
                <div className="absolute inset-0 bg-yellow-500 rounded-lg blur opacity-40 animate-pulse"></div>
                <div className="relative bg-gradient-to-br from-yellow-400 to-yellow-600 text-white px-3 py-1 rounded-lg font-black text-sm shadow-xl border border-yellow-300 flex items-center gap-1">
                    <span className="text-xs">GIẢM</span>
                    <span className="text-lg leading-none">{value}%</span>
                </div>
            </motion.div>
        );
    }

    if (variant === 'vehicle') {
        return (
            <span className="px-3 py-1.5 bg-black/40 backdrop-blur-md text-white text-xs font-bold rounded-full border border-white/10 shadow-sm inline-flex items-center gap-1.5">
                {value === 'Motorbike' ? '🏍️ Xe máy' : '🚗 Ô tô'}
            </span>
        );
    }

    return null;
}

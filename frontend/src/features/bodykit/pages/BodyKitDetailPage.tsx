import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'motion/react';
import { ChevronLeft, ShoppingCart, Package, Car, CheckCircle } from 'lucide-react';
import { bodykitApi } from '@/lib/api';
import { BodyKitPartRow } from '../components/BodyKitPartRow';
import { Product } from '@/shared/types';
import { useI18n } from '@/shared/lib/i18n';

interface BodyKitDetailPageProps {
    vehicleId: string;
    onBack: () => void;
    onAddToCart: (product: Product, quantity?: number) => void;
}

export function BodyKitDetailPage({ vehicleId, onBack, onAddToCart }: BodyKitDetailPageProps) {
    const { language } = useI18n();
    const [selectedParts, setSelectedParts] = useState<Set<string>>(new Set());

    const { data, isLoading } = useQuery({
        queryKey: ['bodykit-detail', vehicleId],
        queryFn: () => bodykitApi.getVehicleDetail(vehicleId),
    });

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat(language === 'vi' ? 'vi-VN' : 'en-US', {
            style: 'currency',
            currency: language === 'vi' ? 'VND' : 'USD',
        }).format(language === 'vi' ? price : price / 25000);
    };

    const togglePart = (productId: string) => {
        setSelectedParts(prev => {
            const next = new Set(prev);
            if (next.has(productId)) {
                next.delete(productId);
            } else {
                next.add(productId);
            }
            return next;
        });
    };

    const selectAll = () => {
        if (!data) return;
        const allAvailable = data.parts
            .filter(p => p.product.stock_status !== 'out_of_stock')
            .map(p => p.product.product_id);
        setSelectedParts(new Set(allAvailable));
    };

    const clearSelection = () => {
        setSelectedParts(new Set());
    };

    const selectedTotal = useMemo(() => {
        if (!data) return 0;
        return data.parts
            .filter(p => selectedParts.has(p.product.product_id))
            .reduce((sum, p) => sum + p.product.price, 0);
    }, [data, selectedParts]);

    const handleAddSelectedToCart = () => {
        if (!data) return;
        data.parts
            .filter(p => selectedParts.has(p.product.product_id))
            .forEach(p => {
                const product: Product = {
                    product_id: p.product.product_id,
                    product_name: p.product.product_name,
                    category: 'bodykit',
                    sub_category: p.position || 'Body Kit',
                    vehicle_type: 'Motorbike',
                    compatible_brand: data.vehicle.brand,
                    compatible_model: data.vehicle.model,
                    engine_capacity: '',
                    price: p.product.price,
                    original_price: p.product.original_price,
                    discount_percentage: p.product.discount_percentage,
                    stock: p.product.stock,
                    stock_status: p.product.stock_status,
                    description: p.product.description,
                    product_image: p.product.product_image,
                    images: p.product.images,
                    tags: [],
                };
                onAddToCart(product, 1);
            });
        setSelectedParts(new Set());
    };

    const handleAddAllToCart = () => {
        selectAll();
        setTimeout(() => {
            handleAddSelectedToCart();
        }, 0);
    };

    const handleAddSingleToCart = (productId: string) => {
        if (!data) return;
        const part = data.parts.find(p => p.product.product_id === productId);
        if (!part) return;

        const product: Product = {
            product_id: part.product.product_id,
            product_name: part.product.product_name,
            category: 'bodykit',
            sub_category: part.position || 'Body Kit',
            vehicle_type: 'Motorbike',
            compatible_brand: data.vehicle.brand,
            compatible_model: data.vehicle.model,
            engine_capacity: '',
            price: part.product.price,
            original_price: part.product.original_price,
            discount_percentage: part.product.discount_percentage,
            stock: part.product.stock,
            stock_status: part.product.stock_status,
            description: part.product.description,
            product_image: part.product.product_image,
            images: part.product.images,
            tags: [],
        };
        onAddToCart(product, 1);
    };

    if (isLoading) {
        return (
            <div className="pt-20 min-h-screen bg-background">
                <div className="container mx-auto px-4 py-8">
                    <div className="animate-pulse space-y-6">
                        <div className="h-8 bg-muted rounded w-48" />
                        <div className="h-64 bg-muted rounded-xl" />
                        <div className="space-y-4">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="h-20 bg-muted rounded-lg" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="pt-20 min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <Car className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                        {language === 'vi' ? 'Không tìm thấy dàn áo' : 'Body kit not found'}
                    </h3>
                    <button onClick={onBack} className="text-red-600 hover:underline mt-4">
                        {language === 'vi' ? 'Quay lại' : 'Go back'}
                    </button>
                </div>
            </div>
        );
    }

    const { vehicle, parts, totalPrice } = data;
    const availablePartsCount = parts.filter(p => p.product.stock_status !== 'out_of_stock').length;

    return (
        <div className="pt-20 min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
                >
                    <ChevronLeft className="w-4 h-4" />
                    {language === 'vi' ? 'Danh sách xe' : 'Back to vehicles'}
                </button>

                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-card border border-border rounded-xl overflow-hidden"
                        >
                            <div className="aspect-[16/9] bg-muted overflow-hidden">
                                {vehicle.image ? (
                                    <img
                                        src={vehicle.image}
                                        alt={vehicle.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Car className="w-24 h-24 text-muted-foreground/20" />
                                    </div>
                                )}
                            </div>
                            <div className="p-6">
                                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                                    {vehicle.brand}
                                </span>
                                <h1 className="text-2xl md:text-3xl font-bold text-foreground mt-1">
                                    {vehicle.name}
                                </h1>
                                <p className="text-muted-foreground mt-1">
                                    {vehicle.model} {vehicle.year ? `- ${vehicle.year}` : ''}
                                </p>
                                {vehicle.description && (
                                    <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                                        {vehicle.description}
                                    </p>
                                )}
                            </div>
                        </motion.div>

                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                                    <Package className="w-5 h-5 text-red-600" />
                                    {language === 'vi'
                                        ? `Phụ tùng dàn áo (${parts.length})`
                                        : `Body Kit Parts (${parts.length})`}
                                </h2>
                                <div className="flex items-center gap-2">
                                    {selectedParts.size > 0 ? (
                                        <button
                                            onClick={clearSelection}
                                            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            {language === 'vi' ? 'Bỏ chọn tất cả' : 'Deselect all'}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={selectAll}
                                            className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
                                        >
                                            {language === 'vi' ? 'Chọn tất cả' : 'Select all'}
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-3">
                                {parts.map((part, index) => (
                                    <motion.div
                                        key={part.bodyKitPartId}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <BodyKitPartRow
                                            part={part}
                                            isSelected={selectedParts.has(part.product.product_id)}
                                            onToggle={handleAddSingleToCart}
                                        />
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-card border border-border rounded-xl p-6 sticky top-24"
                        >
                            <h3 className="text-lg font-bold text-foreground mb-4">
                                {language === 'vi' ? 'Tổng quan dàn áo' : 'Body Kit Summary'}
                            </h3>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">
                                        {language === 'vi' ? 'Tổng phụ tùng' : 'Total parts'}
                                    </span>
                                    <span className="text-foreground font-medium">{parts.length}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">
                                        {language === 'vi' ? 'Còn hàng' : 'Available'}
                                    </span>
                                    <span className="text-green-600 font-medium">{availablePartsCount}</span>
                                </div>
                                <div className="border-t border-border pt-3">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            {language === 'vi' ? 'Giá trọn bộ' : 'Full kit price'}
                                        </span>
                                        <span className="text-red-600 font-bold text-lg">{formatPrice(totalPrice)}</span>
                                    </div>
                                </div>
                            </div>

                            {selectedParts.size > 0 && (
                                <div className="bg-red-600/5 border border-red-600/20 rounded-lg p-3 mb-4">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-muted-foreground">
                                            {language === 'vi' ? 'Đã chọn' : 'Selected'}
                                        </span>
                                        <span className="text-foreground font-medium">
                                            {selectedParts.size} {language === 'vi' ? 'món' : 'items'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground text-sm">
                                            {language === 'vi' ? 'Tạm tính' : 'Subtotal'}
                                        </span>
                                        <span className="text-red-600 font-bold">{formatPrice(selectedTotal)}</span>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-3">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleAddAllToCart}
                                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-lg shadow-lg shadow-red-600/30 hover:shadow-red-600/50 transition-all flex items-center justify-center gap-2"
                                >
                                    <ShoppingCart className="w-5 h-5" />
                                    {language === 'vi' ? 'Thêm trọn bộ vào giỏ' : 'Add Full Kit to Cart'}
                                </motion.button>

                                {selectedParts.size > 0 && (
                                    <motion.button
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleAddSelectedToCart}
                                        className="w-full bg-transparent border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle className="w-5 h-5" />
                                        {language === 'vi'
                                            ? `Thêm ${selectedParts.size} món đã chọn`
                                            : `Add ${selectedParts.size} Selected Items`}
                                    </motion.button>
                                )}
                            </div>

                            <div className="mt-6 pt-4 border-t border-border space-y-2">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span className="text-green-600">✓</span>
                                    {language === 'vi' ? 'Phụ tùng chính hãng' : 'Genuine parts'}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span className="text-green-600">✓</span>
                                    {language === 'vi' ? 'Bảo hành đầy đủ' : 'Full warranty'}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span className="text-green-600">✓</span>
                                    {language === 'vi' ? 'Miễn phí vận chuyển đơn > 500K' : 'Free shipping over 500K'}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}

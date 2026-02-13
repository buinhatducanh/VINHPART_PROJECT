import { Product } from '@/shared/types';
import { ProductBadge } from '../atoms/ProductBadge';
import { PriceDisplay } from '../atoms/PriceDisplay';
import { ProductTag } from '../atoms/ProductTag';
import { Tag, Truck, ShieldCheck, Box } from 'lucide-react';

interface ProductInfoProps {
    product: Product;
}

export function ProductInfo({ product }: ProductInfoProps) {
    return (
        <div className="flex flex-col gap-6">
            {/* Header: Name & Badges */}
            <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                    {product.stock_status === 'in_stock' && <ProductBadge variant="in_stock" />}
                    {product.stock_status === 'low_stock' && <ProductBadge variant="low_stock" />}
                    {product.stock_status === 'out_of_stock' && <ProductBadge variant="out_of_stock" />}
                    {product.discount_percentage && product.discount_percentage > 0 && (
                        <ProductBadge variant="discount" value={product.discount_percentage} />
                    )}
                    <ProductBadge variant="vehicle" value={product.vehicle_type} />
                </div>

                <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                    {product.product_name}
                </h1>

                {product.sku && (
                    <p className="text-sm text-gray-500 font-mono">SKU: {product.sku}</p>
                )}
            </div>

            {/* Price */}
            <div className="p-4 bg-gray-900/50 rounded-xl border border-gray-800">
                <PriceDisplay
                    price={product.price}
                    originalPrice={product.original_price}
                    discountPercentage={product.discount_percentage}
                    size="xl"
                />
            </div>

            {/* Info Tags Grid */}
            <div className="grid grid-cols-2 gap-3">
                {product.compatible_brand && (
                    <ProductTag
                        icon={<Tag className="w-4 h-4" />}
                        label="Thương hiệu"
                        value={product.compatible_brand}
                    />
                )}
                {product.compatible_model && (
                    <ProductTag
                        icon={<Box className="w-4 h-4" />}
                        label="Model"
                        value={product.compatible_model}
                    />
                )}
                {product.category && (
                    <ProductTag
                        icon={<Truck className="w-4 h-4" />}
                        label="Danh mục"
                        value={product.sub_category || product.category}
                    />
                )}
                <ProductTag
                    icon={<ShieldCheck className="w-4 h-4" />}
                    label="Bảo hành"
                    value="12 Tháng"
                />
            </div>
        </div>
    );
}

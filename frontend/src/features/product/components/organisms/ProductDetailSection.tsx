import { Product } from '@/shared/types';
import { ProductImageGallery } from '../molecules/ProductImageGallery';
import { ProductInfo } from '../molecules/ProductInfo';
import { ProductActions } from '../molecules/ProductActions';

interface ProductDetailSectionProps {
    product: Product;
    onAddToCart: (product: Product, quantity: number) => void;
    onBuyNow: (product: Product, quantity: number) => void;
}

export function ProductDetailSection({ product, onAddToCart, onBuyNow }: ProductDetailSectionProps) {
    // Use images array if available, otherwise just product_image as single item array
    const images = product.images && product.images.length > 0
        ? product.images
        : [product.product_image];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
            {/* Left: Gallery - Sticky on desktop */}
            <div className="lg:sticky lg:top-24 h-fit">
                <ProductImageGallery
                    images={images}
                    productName={product.product_name}
                />
            </div>

            {/* Right: Info & Actions */}
            <div className="flex flex-col h-full">
                <ProductInfo product={product} />

                <div className="mt-8 pt-8 border-t border-gray-800">
                    {/* Warranty / Shipping Info can go here if needed as extra molecules */}

                    <ProductActions
                        product={product}
                        onAddToCart={onAddToCart}
                        onBuyNow={onBuyNow}
                    />
                </div>
            </div>
        </div>
    );
}

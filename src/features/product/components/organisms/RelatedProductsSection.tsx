import { Product } from '@/shared/types';
import { useProducts } from '@/hooks/useQueries';
import { ProductCard } from '../ProductCard';
import { ProductCardSkeleton } from '@/shared/components/skeletons/ProductCardSkeleton';

interface RelatedProductsSectionProps {
    currentProduct: Product;
    onAddToCart: (product: Product) => void;
    onBuyNow: (product: Product) => void;
    onProductClick: (id: string) => void;
}

export function RelatedProductsSection({
    currentProduct,
    onAddToCart,
    onBuyNow,
    onProductClick
}: RelatedProductsSectionProps) {

    // Fetch related products (same category)
    const { data, isLoading } = useProducts({
        category: currentProduct.category,
        limit: 5 // Fetch 5 to have enough after filtering current one
    });

    // Filter out current product
    const relatedProducts = data?.data.filter(p => p.product_id !== currentProduct.product_id).slice(0, 4) || [];

    if (!isLoading && relatedProducts.length === 0) {
        return null;
    }

    return (
        <div className="mt-20 lg:mt-32 border-t border-gray-800/50 pt-16">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-white">Sản phẩm liên quan</h2>
                <a href="#" className="text-sm text-red-500 hover:text-red-400 font-medium">Xem tất cả &rarr;</a>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <ProductCardSkeleton key={i} />
                    ))
                ) : (
                    relatedProducts.map(product => (
                        <div key={product.product_id} onClick={() => onProductClick(product.product_id)}>
                            <ProductCard
                                product={product}
                                onAddToCart={(p) => onAddToCart(p)}
                                onBuyNow={(p) => onBuyNow(p)}
                            />
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

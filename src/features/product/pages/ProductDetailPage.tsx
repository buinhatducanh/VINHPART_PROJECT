import { useEffect } from 'react';
import { Product } from '@/shared/types';
import { useProduct } from '@/hooks/useQueries';
import { ProductDetailSection } from '../components/organisms/ProductDetailSection';
import { ProductDescriptionSection } from '../components/organisms/ProductDescriptionSection';
import { RelatedProductsSection } from '../components/organisms/RelatedProductsSection';
import { SEO } from '@/shared/components/SEO';
import { ChevronRight, Home, ArrowLeft } from 'lucide-react';
// import { toast } from 'sonner';

interface ProductDetailPageProps {
    productId: string;
    onAddToCart: (product: Product, quantity?: number) => void; // Main app uses simplified version, but we adapted actions
    onBuyNow: (product: Product) => void;
    onBack: () => void;
    onProductClick: (id: string) => void;
}

export function ProductDetailPage({
    productId,
    onAddToCart,
    onBuyNow,
    onBack,
    onProductClick
}: ProductDetailPageProps) {

    const { data: product, isLoading, error } = useProduct(productId);

    // Scroll to top when productId changes
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [productId]);

    if (isLoading) {
        return (
            <div className="min-h-screen pt-24 pb-20 px-4 container mx-auto">
                <div className="animate-pulse space-y-8">
                    <div className="h-4 w-48 bg-gray-800 rounded"></div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
                        <div className="aspect-square bg-gray-800 rounded-2xl"></div>
                        <div className="space-y-4">
                            <div className="h-8 w-3/4 bg-gray-800 rounded"></div>
                            <div className="h-4 w-1/2 bg-gray-800 rounded"></div>
                            <div className="h-24 bg-gray-800 rounded mt-8"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center pt-24 text-center px-4">
                <h2 className="text-2xl font-bold text-white mb-4">Không tìm thấy sản phẩm</h2>
                <p className="text-gray-400 mb-8 max-w-md">
                    Sản phẩm bạn đang tìm kiếm có thể đã bị xóa hoặc đường dẫn không hợp lệ.
                </p>
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Quay lại cửa hàng
                </button>
            </div>
        );
    }

    // Wrapper for actions to handle quantity
    const handleAddToCartWithQty = (p: Product, quantity: number) => {
        // Now App.tsx supports quantity
        onAddToCart(p, quantity); // TypeScript might complain if we don't update interface but let's try
    };

    return (
        <div className="bg-black/95 min-h-screen pb-20">
            <SEO
                title={`${product.product_name} | VINHPART`}
                description={product.description?.slice(0, 160)}
                image={product.product_image}
            />

            <div className="container mx-auto px-4 pt-24 lg:pt-32">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8 overflow-x-auto whitespace-nowrap pb-2 scrollbar-hide">
                    <button onClick={onBack} className="hover:text-red-500 transition-colors">
                        <Home className="w-4 h-4" />
                    </button>
                    <ChevronRight className="w-4 h-4 flex-shrink-0" />
                    <button onClick={onBack} className="hover:text-red-500 transition-colors">
                        Sản phẩm
                    </button>
                    <ChevronRight className="w-4 h-4 flex-shrink-0" />
                    <span className="text-gray-300 font-medium truncate max-w-[200px] sm:max-w-xs">
                        {product.product_name}
                    </span>
                </nav>

                {/* Main Sections */}
                <ProductDetailSection
                    product={product}
                    onAddToCart={handleAddToCartWithQty}
                    onBuyNow={(p) => onBuyNow(p)} // Buy now usually goes to checkout with 1 item or specific items.
                />

                <ProductDescriptionSection product={product} />

                <RelatedProductsSection
                    currentProduct={product}
                    onAddToCart={onAddToCart}
                    onBuyNow={onBuyNow}
                    onProductClick={onProductClick}
                />
            </div>
        </div>
    );
}

import { useEffect } from 'react';
import { Product, User } from '@/shared/types';
import { useProduct } from '@/hooks/useQueries';
import { ProductDetailSection } from '../components/organisms/ProductDetailSection';
import { ProductDescriptionSection } from '../components/organisms/ProductDescriptionSection';
import { RelatedProductsSection } from '../components/organisms/RelatedProductsSection';
import { SEO } from '@/shared/components/SEO';
import { ChevronRight, Home, ArrowLeft } from 'lucide-react';
// import { toast } from 'sonner';

interface ProductDetailPageProps {
    productId: string;
    onAddToCart: (product: Product, quantity?: number) => void;
    onBuyNow: (product: Product) => void;
    onBack: () => void;
    onProductClick: (id: string) => void;
    user?: User | null;
}

export function ProductDetailPage({
    productId,
    onAddToCart,
    onBuyNow,
    onBack,
    onProductClick,
    user
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
                    <div className="h-4 w-48 bg-muted rounded"></div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
                        <div className="aspect-square bg-muted rounded-2xl"></div>
                        <div className="space-y-4">
                            <div className="h-8 w-3/4 bg-muted rounded"></div>
                            <div className="h-4 w-1/2 bg-muted rounded"></div>
                            <div className="h-24 bg-muted rounded mt-8"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-screen pt-24 pb-20 px-4 flex flex-col items-center justify-center text-center">
                <h2 className="text-2xl font-bold text-foreground mb-4">Sản phẩm không tồn tại</h2>
                <p className="text-muted-foreground mb-8">Rất tiếc, sản phẩm bạn đang tìm kiếm không còn hoặc đã bị xóa.</p>
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 px-6 py-3 bg-red-600 text-foreground rounded-lg hover:bg-red-700 transition"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Quay lại danh sách
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
        <div className="bg-background text-foreground min-h-screen pb-20">
            <SEO
                title={`${product.product_name} - VINPART`}
                description={product.description?.slice(0, 160)}
                image={product.product_image}
            />

            <div className="container mx-auto px-4 pt-24 lg:pt-32">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8 overflow-x-auto whitespace-nowrap pb-2 scrollbar-hide">
                    <button onClick={onBack} className="hover:text-red-500 transition-colors">
                        <Home className="w-4 h-4" />
                    </button>
                    <ChevronRight className="w-4 h-4 flex-shrink-0" />
                    <button onClick={onBack} className="hover:text-red-500 transition-colors">
                        Sản phẩm
                    </button>
                    <ChevronRight className="w-4 h-4 flex-shrink-0" />
                    <span className="text-muted-foreground font-medium truncate max-w-[200px] sm:max-w-xs">
                        {product.product_name}
                    </span>
                </nav>

                {/* Main Sections */}
                <ProductDetailSection
                    product={product}
                    onAddToCart={handleAddToCartWithQty}
                    onBuyNow={(p) => onBuyNow(p)} // Buy now usually goes to checkout with 1 item or specific items.
                />

                <ProductDescriptionSection product={product} user={user} />

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

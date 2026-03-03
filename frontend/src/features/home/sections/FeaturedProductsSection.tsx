import { motion } from 'motion/react';
import { ProductCard } from '@/features/product/components/ProductCard';
import { Product } from '@/shared/types';
import { CAROUSEL_OPTIONS, FADE_IN_VARIANTS } from '../constants';
import { useI18n } from '@/shared/lib/i18n';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/shared/components/ui/carousel";

import { ProductCardSkeleton } from '@/shared/components/skeletons/ProductCardSkeleton';

interface FeaturedProductsSectionProps {
    products: Product[];
    onAddToCart: (product: Product) => void;
    onBuyNow: (product: Product) => void;
    isLoading: boolean;
    onProductClick?: (productId: string) => void;
}

export function FeaturedProductsSection({ products, onAddToCart, onBuyNow, isLoading, onProductClick }: FeaturedProductsSectionProps) {
    const { t } = useI18n();
    // Generate dummy items for skeleton loading
    const skeletonItems = Array(4).fill(0);

    return (
        <section className="py-20 bg-card">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={FADE_IN_VARIANTS.initial}
                    whileInView={FADE_IN_VARIANTS.animate}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                        {t('home.featuredProductsTitle')}
                    </h2>
                    <p className="text-muted-foreground">{t('home.featuredProductsSubtitle')}</p>
                </motion.div>

                <div className="mx-auto max-w-5xl px-4 lg:px-0">
                    <Carousel opts={CAROUSEL_OPTIONS}>
                        <CarouselContent className="-ml-2 md:-ml-4">
                            {isLoading ? (
                                skeletonItems.map((_, index) => (
                                    <CarouselItem
                                        key={`skeleton-${index}`}
                                        className="pl-4 basis-[85%] sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
                                    >
                                        <div className="h-full">
                                            <ProductCardSkeleton />
                                        </div>
                                    </CarouselItem>
                                ))
                            ) : (
                                products.map((product) => (
                                    <CarouselItem
                                        key={product.product_id}
                                        className="
                                            pl-4 
                                            basis-[85%] sm:basis-1/2 md:basis-1/3 lg:basis-1/4
                                            transition-transform
                                            duration-250
                                            ease-out
                                            hover:scale-[1.03]
                                          "
                                    >
                                        <div className="h-full">
                                            <ProductCard
                                                product={product}
                                                onAddToCart={onAddToCart}
                                                onBuyNow={onBuyNow}
                                                onProductClick={onProductClick}
                                            />
                                        </div>
                                    </CarouselItem>
                                ))
                            )}
                        </CarouselContent>
                        <CarouselPrevious className="hidden md:flex -left-12 bg-muted border-border text-foreground hover:bg-red-600 hover:border-red-600" />
                        <CarouselNext className="hidden md:flex -right-12 bg-muted border-border text-foreground hover:bg-red-600 hover:border-red-600" />
                    </Carousel>
                </div>
            </div>
        </section>
    );
}

import { motion } from 'motion/react';
import { ProductCard } from '@/features/product/components/ProductCard';
import { Product } from '@/shared/types';
import { CAROUSEL_OPTIONS, FADE_IN_VARIANTS } from '../constants';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/shared/components/ui/carousel";

interface FeaturedProductsSectionProps {
    products: Product[];
    onAddToCart: (product: Product) => void;
    onBuyNow: (product: Product) => void;
}

export function FeaturedProductsSection({ products, onAddToCart, onBuyNow }: FeaturedProductsSectionProps) {
    return (
        <section className="py-20 bg-gray-900">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={FADE_IN_VARIANTS.initial}
                    whileInView={FADE_IN_VARIANTS.animate}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Sản phẩm nổi bật
                    </h2>
                    <p className="text-gray-400">Được tin dùng bởi hàng nghìn khách hàng</p>
                </motion.div>

                <div className="mx-auto max-w-5xl px-4 lg:px-0">
                    <Carousel opts={CAROUSEL_OPTIONS}>
                        <CarouselContent className="-ml-2 md:-ml-4">
                            {products.map((product) => (
                                <CarouselItem
                                    key={product.product_id}
                                    className="
                    pl-2 md:pl-4 
                    md:basis-1/2 lg:basis-1/4
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
                                        />
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious className="hidden md:flex -left-12 bg-gray-800 border-gray-700 text-white hover:bg-red-600 hover:border-red-600" />
                        <CarouselNext className="hidden md:flex -right-12 bg-gray-800 border-gray-700 text-white hover:bg-red-600 hover:border-red-600" />
                    </Carousel>
                </div>
            </div>
        </section>
    );
}

import { motion } from 'motion/react';
import { Star } from 'lucide-react';
import { FADE_IN_VARIANTS } from '../constants';
import { useI18n } from '@/shared/lib/i18n';

interface Review {
    id: string;
    title: string;
    content: string;
    rating: number;
    customer_name: string;
    product_name: string;
    is_verified_purchase: boolean;
}

interface CustomerReviewsSectionProps {
    reviews: Review[];
}

export function CustomerReviewsSection({ reviews }: CustomerReviewsSectionProps) {
    const { t } = useI18n();

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
                        {t('home.reviewsTitle')}
                    </h2>
                    <p className="text-muted-foreground">{t('home.reviewsSubtitle')}</p>
                </motion.div>

                <div className="flex md:grid md:grid-cols-3 gap-6 md:gap-8 overflow-x-auto md:overflow-visible pb-4 snap-x snap-mandatory" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    {reviews.map((review, index) => (
                        <motion.div
                            key={review.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="min-w-[85vw] md:min-w-0 snap-center bg-card border border-border rounded-lg p-6 hover:border-red-600/50 transition-all shrink-0"
                        >
                            {/* Review Title */}
                            <h4 className="text-foreground font-bold text-lg mb-2">{review.title}</h4>

                            {/* Rating Stars */}
                            <div className="flex gap-1 mb-4">
                                {[...Array(review.rating)].map((_, i) => (
                                    <Star key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                                ))}
                            </div>

                            {/* Review Content */}
                            <p className="text-muted-foreground mb-4 italic line-clamp-3">"{review.content}"</p>

                            {/* Customer Info */}
                            <div className="border-t border-border pt-4">
                                <p className="text-foreground font-bold">{review.customer_name}</p>
                                <p className="text-muted-foreground text-sm">{review.product_name}</p>
                                {review.is_verified_purchase && (
                                    <span className="inline-block mt-2 px-2 py-1 bg-green-900/30 text-green-400 text-xs rounded border border-green-800">
                                        {t('home.verifiedPurchase')}
                                    </span>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

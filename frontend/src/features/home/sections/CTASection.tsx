import { motion } from 'motion/react';
import { FADE_IN_VARIANTS } from '../constants';
import { useI18n } from '@/shared/lib/i18n';

interface CTASectionProps {
    onShopNow: () => void;
}

export function CTASection({ onShopNow }: CTASectionProps) {
    const { t } = useI18n();

    return (
        <section className="py-20 bg-gradient-to-r from-red-600 to-red-800">
            <div className="container mx-auto px-4 text-center">
                <motion.div
                    initial={FADE_IN_VARIANTS.initial}
                    whileInView={FADE_IN_VARIANTS.animate}
                    viewport={{ once: true }}
                >
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                        {t('home.ctaTitle')}
                    </h2>
                    <p className="text-foreground/80 mb-8 max-w-2xl mx-auto">
                        {t('home.ctaSubtitle')}
                    </p>
                    <motion.button
                        onClick={onShopNow}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-10 py-4 bg-white text-red-600 font-bold rounded-lg shadow-lg hover:shadow-xl transition-all"
                    >
                        {t('home.ctaButton')}
                    </motion.button>
                </motion.div>
            </div>
        </section>
    );
}

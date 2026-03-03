import { motion } from 'motion/react';
import { BENEFITS_DATA, STAGGER_CONTAINER_VARIANTS, FADE_UP_VARIANTS } from '../constants';
import { useI18n } from '@/shared/lib/i18n';

export function BenefitsSection() {
    const { t } = useI18n();

    return (
        <section className="py-20 bg-gradient-to-b from-black to-gray-900">
            <div className="container mx-auto px-4">
                <motion.div
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    variants={STAGGER_CONTAINER_VARIANTS}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
                >
                    {BENEFITS_DATA.map((benefit, index) => (
                        <motion.div
                            key={index}
                            variants={FADE_UP_VARIANTS}
                            whileHover={{ scale: 1.03 }}
                            className="bg-card border border-border rounded-lg p-6 text-center hover:border-red-600/50 transition-colors group"
                        >
                            <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:shadow-lg group-hover:shadow-red-600/40 transition-shadow">
                                <benefit.icon className="w-8 h-8 text-foreground" />
                            </div>
                            <h3 className="text-lg font-bold text-foreground mb-2">
                                {t(benefit.titleKey)}
                            </h3>
                            <p className="text-muted-foreground text-sm">
                                {t(benefit.descriptionKey)}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}

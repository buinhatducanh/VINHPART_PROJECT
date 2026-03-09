import { motion } from 'motion/react';
import { HERO_VIDEO_URL, PARTICLE_COUNT } from '../constants';
import { useI18n } from '@/shared/lib/i18n';

interface HeroSectionProps {
    onShopNow: () => void;
    onViewCatalog: () => void;
}

export function HeroSection({ onShopNow, onViewCatalog }: HeroSectionProps) {
    const { t } = useI18n();

    return (
        <section className="relative h-screen flex items-center justify-center overflow-hidden">
            {/* Video Background */}
            <div className="absolute inset-0">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                >
                    <source src={HERO_VIDEO_URL} type="video/mp4" />
                </video>
            </div>

            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-background/70"></div>

            {/* Animated particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(PARTICLE_COUNT)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-red-600 rounded-full"
                        initial={{
                            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
                            y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
                            scale: Math.random() * 2
                        }}
                        animate={{
                            y: [null, Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800)],
                            opacity: [0, 1, 0]
                        }}
                        transition={{
                            duration: Math.random() * 3 + 2,
                            repeat: Infinity,
                            delay: Math.random() * 2
                        }}
                    />
                ))}
            </div>

            {/* Hero Content */}
            <div className="relative z-10 container mx-auto px-4 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold mb-4 md:mb-6 bg-gradient-to-r from-white via-gray-200 to-red-600 bg-clip-text text-transparent px-2">
                        {t('hero.title')}
                    </h1>
                    <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold mb-6 md:mb-8 text-red-600 px-2">
                        {t('hero.subtitle')}
                    </h2>
                    <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
                        {t('hero.description')}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <motion.button
                            onClick={onShopNow}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-full sm:w-auto px-8 py-3 md:py-4 bg-red-600 hover:bg-red-700 text-foreground font-bold rounded-lg shadow-lg shadow-red-600/50 hover:shadow-red-600/80 transition-all"
                        >
                            {t('hero.buyNow')}
                        </motion.button>
                        <motion.button
                            onClick={onViewCatalog}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-full sm:w-auto px-8 py-3 md:py-4 bg-transparent border-2 border-white hover:bg-white hover:text-black text-foreground font-bold rounded-lg transition-all"
                        >
                            {t('hero.viewCatalog')}
                        </motion.button>
                        <motion.button
                            onClick={() => {
                                const element = document.getElementById('body-kit-section');
                                if (element) {
                                    element.scrollIntoView({ behavior: 'smooth' });
                                }
                            }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-full sm:w-auto px-8 py-3 md:py-4 bg-transparent border-2 border-red-600 hover:bg-red-600 text-foreground font-bold rounded-lg transition-all"
                        >
                            {t('hero.bodyKit') || 'Dàn Áo Xe'}
                        </motion.button>
                    </div>
                </motion.div>

                {/* Scroll Indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 1 }}
                    className="absolute top-100 left-1/2 -translate-x-1/2"
                >
                    <motion.div
                        animate={{ y: [0, 10, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2"
                    >
                        <div className="w-1 h-2 bg-white/50 rounded-full"></div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}

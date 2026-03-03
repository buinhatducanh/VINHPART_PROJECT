import { Shield, Zap, Truck, RefreshCw } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// Hero Section
export const HERO_VIDEO_URL = 'https://assets.mixkit.co/videos/preview/mixkit-motorcycle-rider-at-high-speed-on-road-4653-large.mp4';
export const PARTICLE_COUNT = 20;

// Carousel Options
export const CAROUSEL_OPTIONS = {
    align: 'start' as const,
    loop: true,
    duration: 10,
    dragFree: true,
};

// Animation Variants
export const STAGGER_CONTAINER_VARIANTS = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.12,
        },
    },
};

export const FADE_UP_VARIANTS = {
    hidden: { opacity: 0, y: 10 },
    show: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: 'easeOut' },
    },
} as const;

export const FADE_IN_VARIANTS = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
};

// Benefits Data
export interface Benefit {
    icon: LucideIcon;
    titleKey: string;
    descriptionKey: string;
}

export const BENEFITS_DATA: Benefit[] = [
    {
        icon: Shield,
        titleKey: 'benefits.authentic',
        descriptionKey: 'benefits.authenticDesc',
    },
    {
        icon: Zap,
        titleKey: 'benefits.fit',
        descriptionKey: 'benefits.fitDesc',
    },
    {
        icon: Truck,
        titleKey: 'benefits.delivery',
        descriptionKey: 'benefits.deliveryDesc',
    },
    {
        icon: RefreshCw,
        titleKey: 'benefits.returns',
        descriptionKey: 'benefits.returnsDesc',
    },
];

// Footer Data
export const FOOTER_LINKS = {
    about: [
        { key: 'about', label: 'Giới thiệu' },
        { key: 'contact', label: 'Liên hệ' },
        { key: 'recruitment', label: 'Tuyển dụng' },
    ],
    policy: [
        { key: 'warranty', label: 'Chính sách bảo hành' },
        { key: 'return', label: 'Chính sách đổi trả' },
        { key: 'shipping', label: 'Chính sách vận chuyển' },
    ],
    support: [
        { key: 'shopping-guide', label: 'Hướng dẫn mua hàng' },
        { key: 'faq', label: 'Câu hỏi thường gặp' },
        { key: 'payment', label: 'Thanh toán' },
    ],
} as const;

export const CONTACT_INFO = {
    hotline: '1900 xxxx',
    email: 'support@autoparts.vn',
    workingHours: '8:00 - 22:00',
};

// Date Formatter
export const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

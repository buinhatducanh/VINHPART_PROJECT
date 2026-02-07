import { LucideIcon } from 'lucide-react';

export type AdminPage = 'dashboard' | 'addProduct' | 'manageProducts' | 'manageOrders' | 'statistics' | 'settings' | 'manageSEO' | 'manageCategories' | 'manageReviews';

export interface DashboardStats {
    products: number;
    orders: number;
    categories: number;
    banners: number;
}

export interface StatItem {
    label: string;
    value: string;
    icon: LucideIcon;
    color: string;
    gradient: string;
    border: string;
    shadow: string;
}

export interface QuickActionConfig {
    label: string;
    icon: LucideIcon;
    color: string;
    hoverColor: string;
    targetPage?: AdminPage;
    isHome?: boolean;
}

import { LucideIcon } from 'lucide-react';

export type AdminPage = 'dashboard' | 'addProduct' | 'manageProducts' | 'manageOrders' | 'statistics' | 'settings' | 'manageSEO' | 'manageCategories' | 'manageReviews' | 'managePosts' | 'manageBodyKit' | 'manageAdminEmails' | 'manageHomepageSections';

export interface DashboardStats {
    products: number;
    orders: number;
    categories: number;
    vehicles: number;
}

export interface StatItem {
    key?: string;
    label: string;
    value: string;
    icon: LucideIcon;
    color: string;
    gradient: string;
    border: string;
    shadow: string;
}

export interface QuickActionConfig {
    key?: string;
    label: string;
    icon: LucideIcon;
    color: string;
    hoverColor: string;
    targetPage?: AdminPage;
    isHome?: boolean;
}

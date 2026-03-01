import { LucideIcon } from 'lucide-react';

export type AdminPage = 'dashboard' | 'addProduct' | 'manageProducts' | 'manageOrders' | 'statistics' | 'settings' | 'manageSEO' | 'manageCategories' | 'manageReviews' | 'managePosts';

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
    targetPage?: AdminPage;
}

export interface NavMenuItem {
    label: string;
    description: string;
    icon: LucideIcon;
    color: string;
    bgColor: string;
    borderColor: string;
    targetPage: AdminPage;
}

export interface NavMenuGroup {
    title: string;
    items: NavMenuItem[];
}

import { Package, ShoppingCart, Folder, Plus, ClipboardList, Edit, FileText, MessageSquare, Layers, Shield } from 'lucide-react';
import { DashboardStats, StatItem, QuickActionConfig } from './types';

export const getStatsConfig = (stats: DashboardStats): StatItem[] => [
    {
        key: 'products',
        label: 'Sản phẩm',
        value: stats.products.toString(),
        icon: Package,
        color: 'from-blue-500 to-cyan-500',
        gradient: 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20',
        border: 'border-blue-500/50',
        shadow: 'shadow-blue-500/25'
    },
    {
        key: 'orders',
        label: 'Đơn hàng chờ xử lý',
        value: stats.orders.toString(),
        icon: ShoppingCart,
        color: 'from-purple-500 to-pink-500',
        gradient: 'bg-gradient-to-br from-purple-500/20 to-pink-500/20',
        border: 'border-purple-500/50',
        shadow: 'shadow-purple-500/25'
    },
    {
        key: 'categories',
        label: 'Danh mục',
        value: stats.categories.toString(),
        icon: Folder,
        color: 'from-orange-500 to-yellow-500',
        gradient: 'bg-gradient-to-br from-orange-500/20 to-yellow-500/20',
        border: 'border-orange-500/50',
        shadow: 'shadow-orange-500/25'
    },
    {
        key: 'vehicles',
        label: 'Dàn áo xe',
        value: stats.vehicles.toString(),
        icon: Layers,
        color: 'from-green-500 to-emerald-500',
        gradient: 'bg-gradient-to-br from-green-500/20 to-emerald-500/20',
        border: 'border-green-500/50',
        shadow: 'shadow-green-500/25'
    },
];

export const QUICK_ACTIONS_CONFIG: QuickActionConfig[] = [
    { key: 'addProduct', label: 'Thêm sản phẩm mới', icon: Plus, color: 'text-blue-400', hoverColor: 'hover:bg-blue-500/10', targetPage: 'addProduct' },
    { key: 'manageOrders', label: 'Xem đơn hàng mới', icon: ClipboardList, color: 'text-purple-400', hoverColor: 'hover:bg-purple-500/10', targetPage: 'manageOrders' },
    { key: 'manageProducts', label: 'Quản lý sản phẩm', icon: Edit, color: 'text-orange-400', hoverColor: 'hover:bg-orange-500/10', targetPage: 'manageProducts' },
    { key: 'managePosts', label: 'Quản lý bài viết', icon: FileText, color: 'text-green-400', hoverColor: 'hover:bg-green-500/10', targetPage: 'managePosts' },
    { key: 'manageCategories', label: 'Quản lý danh mục', icon: Folder, color: 'text-yellow-400', hoverColor: 'hover:bg-yellow-500/10', targetPage: 'manageCategories' },
    { key: 'manageReviews', label: 'Quản lý đánh giá', icon: MessageSquare, color: 'text-cyan-400', hoverColor: 'hover:bg-cyan-500/10', targetPage: 'manageReviews' },
    { key: 'manageBodyKit', label: 'Quản lý dàn áo', icon: Layers, color: 'text-red-400', hoverColor: 'hover:bg-red-500/10', targetPage: 'manageBodyKit' },
    { key: 'manageAdminEmails', label: 'Quản lý Admin', icon: Shield, color: 'text-amber-400', hoverColor: 'hover:bg-amber-500/10', targetPage: 'manageAdminEmails' },
];

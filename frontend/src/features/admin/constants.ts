import { Package, ShoppingCart, Folder, Image, Plus, ClipboardList, TrendingUp, Settings, FileText, MessageSquare, Search } from 'lucide-react';
import { DashboardStats, StatItem, NavMenuGroup } from './types';

export const getStatsConfig = (stats: DashboardStats): StatItem[] => [
    {
        label: 'Sản phẩm',
        value: stats.products.toString(),
        icon: Package,
        color: 'from-blue-500 to-cyan-500',
        gradient: 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20',
        border: 'border-blue-500/50',
        shadow: 'shadow-blue-500/25',
        targetPage: 'manageProducts',
    },
    {
        label: 'Đơn hàng chờ xử lý',
        value: stats.orders.toString(),
        icon: ShoppingCart,
        color: 'from-purple-500 to-pink-500',
        gradient: 'bg-gradient-to-br from-purple-500/20 to-pink-500/20',
        border: 'border-purple-500/50',
        shadow: 'shadow-purple-500/25',
        targetPage: 'manageOrders',
    },
    {
        label: 'Danh mục',
        value: stats.categories.toString(),
        icon: Folder,
        color: 'from-orange-500 to-yellow-500',
        gradient: 'bg-gradient-to-br from-orange-500/20 to-yellow-500/20',
        border: 'border-orange-500/50',
        shadow: 'shadow-orange-500/25',
        targetPage: 'manageCategories',
    },
    {
        label: 'Banner',
        value: stats.banners.toString(),
        icon: Image,
        color: 'from-green-500 to-emerald-500',
        gradient: 'bg-gradient-to-br from-green-500/20 to-emerald-500/20',
        border: 'border-green-500/50',
        shadow: 'shadow-green-500/25',
    },
];

export const NAV_MENU_CONFIG: NavMenuGroup[] = [
    {
        title: 'Sản phẩm & Kho hàng',
        items: [
            { label: 'Quản lý sản phẩm', description: 'Xem, sửa, xóa sản phẩm', icon: Package, color: 'text-blue-400', bgColor: 'from-blue-600 to-blue-800', borderColor: 'border-blue-600/30', targetPage: 'manageProducts' },
            { label: 'Thêm sản phẩm', description: 'Tạo sản phẩm mới', icon: Plus, color: 'text-cyan-400', bgColor: 'from-cyan-600 to-cyan-800', borderColor: 'border-cyan-600/30', targetPage: 'addProduct' },
            { label: 'Danh mục', description: 'Phân loại sản phẩm', icon: Folder, color: 'text-yellow-400', bgColor: 'from-yellow-600 to-yellow-800', borderColor: 'border-yellow-600/30', targetPage: 'manageCategories' },
        ],
    },
    {
        title: 'Đơn hàng & Khách hàng',
        items: [
            { label: 'Đơn hàng', description: 'Xử lý đơn hàng', icon: ClipboardList, color: 'text-purple-400', bgColor: 'from-purple-600 to-purple-800', borderColor: 'border-purple-600/30', targetPage: 'manageOrders' },
            { label: 'Đánh giá', description: 'Duyệt đánh giá', icon: MessageSquare, color: 'text-cyan-400', bgColor: 'from-cyan-600 to-teal-800', borderColor: 'border-cyan-600/30', targetPage: 'manageReviews' },
        ],
    },
    {
        title: 'Nội dung & SEO',
        items: [
            { label: 'Bài viết', description: 'Quản lý blog', icon: FileText, color: 'text-green-400', bgColor: 'from-green-600 to-green-800', borderColor: 'border-green-600/30', targetPage: 'managePosts' },
            { label: 'SEO', description: 'Tối ưu tìm kiếm', icon: Search, color: 'text-indigo-400', bgColor: 'from-indigo-600 to-indigo-800', borderColor: 'border-indigo-600/30', targetPage: 'manageSEO' },
        ],
    },
    {
        title: 'Hệ thống',
        items: [
            { label: 'Thống kê', description: 'Báo cáo & phân tích', icon: TrendingUp, color: 'text-emerald-400', bgColor: 'from-emerald-600 to-emerald-800', borderColor: 'border-emerald-600/30', targetPage: 'statistics' },
            { label: 'Cài đặt', description: 'Cấu hình hệ thống', icon: Settings, color: 'text-orange-400', bgColor: 'from-orange-600 to-orange-800', borderColor: 'border-orange-600/30', targetPage: 'settings' },
        ],
    },
];

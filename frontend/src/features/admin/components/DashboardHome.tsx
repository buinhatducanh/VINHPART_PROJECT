import { memo, useMemo } from 'react';
import { motion } from 'motion/react';
import { LogOut, Home, Settings, Package, TrendingUp, ShoppingCart, DollarSign, Users, ArrowUpRight } from 'lucide-react';
import { AdminPage, DashboardStats } from '../types';
import { getStatsConfig, QUICK_ACTIONS_CONFIG } from '../constants';
import { useSettings } from '@/shared/hooks/useSettings';
import { useOrders } from '@/hooks/useQueries';

interface DashboardHomeProps {
    stats: DashboardStats;
    onNavigate: (page: AdminPage) => void;
    onLogoutRequest: () => void;
    onBackToHome: () => void;
}

export const DashboardHome = memo(function DashboardHome({ stats, onNavigate, onLogoutRequest, onBackToHome }: DashboardHomeProps) {
    const { siteName } = useSettings();
    const statsConfig = useMemo(() => getStatsConfig(stats), [stats]);
    const { data: orders } = useOrders();

    // Compute analytics preview from real order data
    const analyticsPreview = useMemo(() => {
        if (!orders || !Array.isArray(orders)) {
            return { totalRevenue: 0, totalOrders: 0, pendingOrders: 0, deliveredOrders: 0 };
        }
        const totalRevenue = orders.reduce((sum: number, o: any) => sum + (o.total || 0), 0);
        const totalOrders = orders.length;
        const pendingOrders = orders.filter((o: any) => o.status === 'pending').length;
        const deliveredOrders = orders.filter((o: any) => o.status === 'delivered').length;
        return { totalRevenue, totalOrders, pendingOrders, deliveredOrders };
    }, [orders]);

    const formatCurrency = (value: number) => {
        if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
        if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
        return value.toString();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
            {/* Header */}
            <motion.header
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="relative border-b border-gray-800 bg-black/40 backdrop-blur-xl"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        {/* Logo & Title */}
                        <div className="flex items-center gap-4">
                            <div className="relative w-14 h-14">
                                <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-red-800 rounded-xl transform rotate-3"></div>
                                <div className="absolute inset-0.5 bg-black rounded-xl"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-3xl font-black text-transparent bg-gradient-to-br from-red-500 via-red-600 to-red-800 bg-clip-text">
                                        {siteName.charAt(0).toUpperCase()}
                                    </div>
                                </div>
                                <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-red-600"></div>
                                <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-red-600"></div>
                                <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-red-600"></div>
                                <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-red-600"></div>
                            </div>

                            <div className="text-left">
                                <h1 className="text-2xl font-black text-transparent bg-gradient-to-r from-white via-gray-200 to-red-600 bg-clip-text">
                                    {siteName.toUpperCase()}
                                </h1>
                                <p className="text-sm text-gray-500">Quản lý cửa hàng</p>
                            </div>
                        </div>

                        {/* User Info & Actions */}
                        <div className="flex items-center gap-4">
                            <div className="hidden md:block text-right">
                                <p className="text-sm font-semibold text-white">{siteName.toLowerCase()}@vinhpart.vn</p>
                                <p className="text-xs text-gray-500">Quản trị viên</p>
                            </div>

                            <motion.button
                                onClick={onLogoutRequest}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="group relative p-3 bg-gray-900 border border-gray-700 rounded-lg hover:border-red-600/50 transition-all"
                            >
                                <LogOut className="w-5 h-5 text-gray-400 group-hover:text-red-600 transition-colors" />
                            </motion.button>
                        </div>
                    </div>
                </div>
            </motion.header>

            {/* Main Content */}
            <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-8"
                >
                    <h2 className="text-3xl font-bold text-white mb-2">
                        Chào mừng trở lại!
                    </h2>
                    <p className="text-gray-400">Đây là tổng quan về cửa hàng {siteName.toUpperCase()} của bạn.</p>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {statsConfig.map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + index * 0.1 }}
                            whileHover={{ y: -5, scale: 1.02 }}
                            className="group relative"
                        >
                            <div className="relative bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 overflow-hidden hover:border-red-500/50 transition-all duration-300">
                                <div className={`absolute inset-0 ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>

                                <div className="relative mb-4">
                                    <div className={`w-14 h-14 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center group-hover:shadow-lg ${stat.shadow} transition-all duration-300`}>
                                        <stat.icon className="w-7 h-7 text-white" />
                                    </div>
                                </div>

                                <div className="relative">
                                    <p className="text-4xl font-black text-white mb-1">{stat.value}</p>
                                    <p className="text-gray-400 group-hover:text-gray-300 transition-colors">{stat.label}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Analytics Preview - External Summary */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mb-8"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <TrendingUp className="w-6 h-6 text-green-500" />
                            <h3 className="text-xl font-bold text-white">Tổng quan phân tích</h3>
                        </div>
                        <motion.button
                            onClick={() => onNavigate('statistics')}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-green-400 border border-green-600/30 rounded-lg hover:bg-green-600/10 transition-all"
                        >
                            Xem chi tiết
                            <ArrowUpRight className="w-4 h-4" />
                        </motion.button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-gray-900/50 backdrop-blur-xl border border-green-600/20 rounded-xl p-5">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                                    <DollarSign className="w-5 h-5 text-white" />
                                </div>
                                <p className="text-sm text-gray-400">Tổng doanh thu</p>
                            </div>
                            <p className="text-2xl font-bold text-white">{formatCurrency(analyticsPreview.totalRevenue)} VNĐ</p>
                        </div>

                        <div className="bg-gray-900/50 backdrop-blur-xl border border-blue-600/20 rounded-xl p-5">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
                                    <ShoppingCart className="w-5 h-5 text-white" />
                                </div>
                                <p className="text-sm text-gray-400">Tổng đơn hàng</p>
                            </div>
                            <p className="text-2xl font-bold text-white">{analyticsPreview.totalOrders}</p>
                        </div>

                        <div className="bg-gray-900/50 backdrop-blur-xl border border-yellow-600/20 rounded-xl p-5">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
                                    <ShoppingCart className="w-5 h-5 text-white" />
                                </div>
                                <p className="text-sm text-gray-400">Chờ xử lý</p>
                            </div>
                            <p className="text-2xl font-bold text-yellow-400">{analyticsPreview.pendingOrders}</p>
                        </div>

                        <div className="bg-gray-900/50 backdrop-blur-xl border border-purple-600/20 rounded-xl p-5">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                                    <Users className="w-5 h-5 text-white" />
                                </div>
                                <p className="text-sm text-gray-400">Đã giao thành công</p>
                            </div>
                            <p className="text-2xl font-bold text-green-400">{analyticsPreview.deliveredOrders}</p>
                        </div>
                    </div>
                </motion.div>

                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="relative bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 to-transparent"></div>

                    <div className="relative">
                        <div className="flex items-center gap-3 mb-6">
                            <Settings className="w-6 h-6 text-red-600" />
                            <h3 className="text-xl font-bold text-white">Thao tác nhanh</h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {QUICK_ACTIONS_CONFIG.map((action) => (
                                <motion.button
                                    key={action.label}
                                    whileHover={{ scale: 1.05, x: 5 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => action.targetPage ? onNavigate(action.targetPage) : onBackToHome()}
                                    className={`group relative flex items-center gap-3 p-4 bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl ${action.hoverColor} transition-all duration-300 hover:border-gray-600`}
                                >
                                    <div className={`${action.color} group-hover:scale-110 transition-transform`}>
                                        <action.icon className="w-6 h-6" />
                                    </div>
                                    <span className="text-white font-medium text-sm">{action.label}</span>

                                    <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* System Info */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                    <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-4 backdrop-blur">
                        <p className="text-xs text-gray-500 mb-1">Phiên bản hệ thống</p>
                        <p className="text-white font-semibold">VINPART v2.0.0</p>
                    </div>
                    <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-4 backdrop-blur">
                        <p className="text-xs text-gray-500 mb-1">Đăng nhập lần cuối</p>
                        <p className="text-white font-semibold">Hôm nay, 10:30 AM</p>
                    </div>
                    <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-4 backdrop-blur">
                        <p className="text-xs text-gray-500 mb-1">Trạng thái hệ thống</p>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <p className="text-white font-semibold">Hoạt động bình thường</p>
                        </div>
                    </div>
                </motion.div>

                {/* Management Menu */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                    <motion.button
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onNavigate('statistics')}
                        className="bg-gradient-to-br from-green-600/20 to-green-800/20 border border-green-600/30 rounded-xl p-6 text-left hover:border-green-600/50 transition-all group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-800 rounded-xl flex items-center justify-center group-hover:shadow-lg shadow-green-600/25 transition-all">
                                <TrendingUp className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h4 className="text-white font-bold mb-1">Thống kê</h4>
                                <p className="text-sm text-gray-400">Xem báo cáo chi tiết</p>
                            </div>
                        </div>
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onNavigate('manageProducts')}
                        className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border border-blue-600/30 rounded-xl p-6 text-left hover:border-blue-600/50 transition-all group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center group-hover:shadow-lg shadow-blue-600/25 transition-all">
                                <Package className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h4 className="text-white font-bold mb-1">Sản phẩm</h4>
                                <p className="text-sm text-gray-400">Quản lý kho hàng</p>
                            </div>
                        </div>
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onNavigate('settings')}
                        className="bg-gradient-to-br from-orange-600/20 to-orange-800/20 border border-orange-600/30 rounded-xl p-6 text-left hover:border-orange-600/50 transition-all group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-orange-800 rounded-xl flex items-center justify-center group-hover:shadow-lg shadow-orange-600/25 transition-all">
                                <Settings className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h4 className="text-white font-bold mb-1">Cài đặt</h4>
                                <p className="text-sm text-gray-400">Cấu hình hệ thống</p>
                            </div>
                        </div>
                    </motion.button>
                </motion.div>

                {/* Back to Home Button */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                    className="mt-8 flex justify-center"
                >
                    <motion.button
                        onClick={onBackToHome}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-8 py-3 bg-gray-900/50 border border-gray-700 text-white rounded-lg hover:border-gray-600 transition-all flex items-center gap-2 group"
                    >
                        <Home className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                        <span>Về trang chủ</span>
                    </motion.button>
                </motion.div>
            </main>
        </div>
    );
});

import { memo, useMemo } from 'react';
import { motion } from 'motion/react';
import { LogOut, Home, DollarSign, ShoppingCart, Users, ArrowUpRight, ChevronRight } from 'lucide-react';
import { AdminPage, DashboardStats } from '../types';
import { getStatsConfig, NAV_MENU_CONFIG } from '../constants';
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
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="relative w-12 h-12">
                                <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-red-800 rounded-xl transform rotate-3"></div>
                                <div className="absolute inset-0.5 bg-black rounded-xl"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-2xl font-black text-transparent bg-gradient-to-br from-red-500 via-red-600 to-red-800 bg-clip-text">
                                        {siteName.charAt(0).toUpperCase()}
                                    </div>
                                </div>
                            </div>
                            <div className="text-left">
                                <h1 className="text-xl font-black text-transparent bg-gradient-to-r from-white via-gray-200 to-red-600 bg-clip-text">
                                    {siteName.toUpperCase()}
                                </h1>
                                <p className="text-xs text-gray-500">Bảng điều khiển quản trị</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={onBackToHome}
                                className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm text-gray-400 border border-gray-700 rounded-lg hover:text-white hover:border-gray-600 transition-all"
                            >
                                <Home className="w-4 h-4" />
                                Trang chủ
                            </button>
                            <button
                                onClick={onLogoutRequest}
                                className="group p-2.5 bg-gray-900 border border-gray-700 rounded-lg hover:border-red-600/50 transition-all"
                            >
                                <LogOut className="w-4 h-4 text-gray-400 group-hover:text-red-500 transition-colors" />
                            </button>
                        </div>
                    </div>
                </div>
            </motion.header>

            {/* Main Content */}
            <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Section 1: Clickable Stats Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-8"
                >
                    <h2 className="text-lg font-semibold text-gray-400 mb-4">Tổng quan</h2>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {statsConfig.map((stat, index) => (
                            <motion.button
                                key={stat.label}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15 + index * 0.05 }}
                                whileHover={{ y: -4, scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => stat.targetPage && onNavigate(stat.targetPage)}
                                className="group relative text-left"
                            >
                                <div className={`relative bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-5 overflow-hidden transition-all duration-300 ${stat.targetPage ? 'cursor-pointer hover:border-red-500/40' : 'cursor-default'}`}>
                                    <div className={`absolute inset-0 ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                                    <div className="relative flex items-center gap-4">
                                        <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                                            <stat.icon className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-3xl font-black text-white">{stat.value}</p>
                                            <p className="text-sm text-gray-400 truncate">{stat.label}</p>
                                        </div>
                                    </div>
                                    {stat.targetPage && (
                                        <ChevronRight className="absolute top-1/2 right-4 -translate-y-1/2 w-4 h-4 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    )}
                                </div>
                            </motion.button>
                        ))}
                    </div>
                </motion.div>

                {/* Section 2: Analytics Preview (real data) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mb-8"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-400">Phân tích doanh thu</h2>
                        <button
                            onClick={() => onNavigate('statistics')}
                            className="flex items-center gap-1.5 text-sm text-green-400 hover:text-green-300 transition-colors"
                        >
                            Xem chi tiết
                            <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-gray-900/50 backdrop-blur-xl border border-green-600/20 rounded-xl p-4">
                            <div className="flex items-center gap-2.5 mb-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                                    <DollarSign className="w-4 h-4 text-white" />
                                </div>
                                <p className="text-xs text-gray-500">Doanh thu</p>
                            </div>
                            <p className="text-xl font-bold text-white">{formatCurrency(analyticsPreview.totalRevenue)} <span className="text-xs text-gray-500">VNĐ</span></p>
                        </div>

                        <div className="bg-gray-900/50 backdrop-blur-xl border border-blue-600/20 rounded-xl p-4">
                            <div className="flex items-center gap-2.5 mb-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
                                    <ShoppingCart className="w-4 h-4 text-white" />
                                </div>
                                <p className="text-xs text-gray-500">Tổng đơn</p>
                            </div>
                            <p className="text-xl font-bold text-white">{analyticsPreview.totalOrders}</p>
                        </div>

                        <div className="bg-gray-900/50 backdrop-blur-xl border border-yellow-600/20 rounded-xl p-4">
                            <div className="flex items-center gap-2.5 mb-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
                                    <ShoppingCart className="w-4 h-4 text-white" />
                                </div>
                                <p className="text-xs text-gray-500">Chờ xử lý</p>
                            </div>
                            <p className="text-xl font-bold text-yellow-400">{analyticsPreview.pendingOrders}</p>
                        </div>

                        <div className="bg-gray-900/50 backdrop-blur-xl border border-purple-600/20 rounded-xl p-4">
                            <div className="flex items-center gap-2.5 mb-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                                    <Users className="w-4 h-4 text-white" />
                                </div>
                                <p className="text-xs text-gray-500">Đã giao</p>
                            </div>
                            <p className="text-xl font-bold text-green-400">{analyticsPreview.deliveredOrders}</p>
                        </div>
                    </div>
                </motion.div>

                {/* Section 3: Unified Navigation Menu (grouped) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 }}
                >
                    <h2 className="text-lg font-semibold text-gray-400 mb-4">Quản lý</h2>

                    <div className="space-y-6">
                        {NAV_MENU_CONFIG.map((group) => (
                            <div key={group.title}>
                                <p className="text-xs font-medium text-gray-600 uppercase tracking-wider mb-3">{group.title}</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {group.items.map((item) => (
                                        <button
                                            key={item.label}
                                            onClick={() => onNavigate(item.targetPage)}
                                            className={`group relative flex items-center gap-4 p-4 bg-gray-900/40 backdrop-blur border ${item.borderColor} rounded-xl hover:bg-gray-800/50 transition-all duration-200 text-left`}
                                        >
                                            <div className={`w-10 h-10 bg-gradient-to-br ${item.bgColor} rounded-lg flex items-center justify-center flex-shrink-0 group-hover:shadow-lg transition-shadow`}>
                                                <item.icon className="w-5 h-5 text-white" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-white font-semibold text-sm">{item.label}</p>
                                                <p className="text-xs text-gray-500">{item.description}</p>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-gray-700 group-hover:text-gray-400 transition-colors flex-shrink-0" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Footer: System Info */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mt-10 pt-6 border-t border-gray-800/50 flex flex-wrap items-center justify-between gap-4 text-xs text-gray-600"
                >
                    <div className="flex items-center gap-4">
                        <span>VINHPART v2.0.0</span>
                        <span className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                            Hệ thống hoạt động
                        </span>
                    </div>
                    <button
                        onClick={onBackToHome}
                        className="sm:hidden flex items-center gap-1.5 text-gray-500 hover:text-white transition-colors"
                    >
                        <Home className="w-3.5 h-3.5" />
                        Về trang chủ
                    </button>
                </motion.div>
            </main>
        </div>
    );
});

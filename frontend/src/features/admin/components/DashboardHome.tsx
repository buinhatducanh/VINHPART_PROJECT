import { motion } from 'motion/react';
import { LogOut, Home, Settings, Package, TrendingUp } from 'lucide-react';
import { AdminPage, DashboardStats } from '../types';
import { getStatsConfig, QUICK_ACTIONS_CONFIG } from '../constants';
import { useSettings } from '@/shared/hooks/useSettings';
import { NotificationBell } from '@/features/notification/components/NotificationBell';

interface DashboardHomeProps {
    stats: DashboardStats;
    onNavigate: (page: AdminPage) => void;
    onLogoutRequest: () => void;
    onBackToHome: () => void;
}

export function DashboardHome({ stats, onNavigate, onLogoutRequest, onBackToHome }: DashboardHomeProps) {
    const { siteName } = useSettings();
    const statsConfig = getStatsConfig(stats);

    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
            {/* Animated background particles */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                {[...Array(30)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-red-600/30 rounded-full"
                        initial={{
                            x: Math.random() * window.innerWidth,
                            y: Math.random() * window.innerHeight,
                        }}
                        animate={{
                            y: [null, Math.random() * window.innerHeight],
                            opacity: [0.3, 0.8, 0.3]
                        }}
                        transition={{
                            duration: Math.random() * 5 + 3,
                            repeat: Infinity,
                            delay: Math.random() * 2
                        }}
                    />
                ))}
            </div>

            {/* Header */}
            <motion.header
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="relative z-50 border-b border-gray-800 bg-black/40 backdrop-blur-xl"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        {/* Logo & Title */}
                        <div className="flex items-center gap-4">
                            <motion.div
                                whileHover={{ scale: 1.05, rotate: 5 }}
                                className="relative w-14 h-14"
                            >
                                {/* Multi-layer V logo */}
                                <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-red-800 rounded-xl transform rotate-3"></div>
                                <div className="absolute inset-0.5 bg-black rounded-xl"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-3xl font-black text-transparent bg-gradient-to-br from-red-500 via-red-600 to-red-800 bg-clip-text">
                                        {siteName.charAt(0).toUpperCase()}
                                    </div>
                                </div>
                                {/* Corner accents */}
                                <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-red-600"></div>
                                <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-red-600"></div>
                                <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-red-600"></div>
                                <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-red-600"></div>
                                {/* Glow effect */}
                                <div className="absolute inset-0 bg-red-600/20 rounded-xl blur-xl"></div>
                            </motion.div>

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

                            <NotificationBell />

                            <motion.button
                                onClick={onLogoutRequest}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="group relative p-3 bg-gray-900 border border-gray-700 rounded-lg hover:border-red-600/50 transition-all"
                            >
                                <LogOut className="w-5 h-5 text-gray-400 group-hover:text-red-600 transition-colors" />
                                <div className="absolute inset-0 bg-red-600/0 group-hover:bg-red-600/10 rounded-lg transition-colors"></div>
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
                        Chào mừng trở lại! 👋
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
                            {/* Card */}
                            <div className={`relative bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 overflow-hidden hover:border-${stat.border} transition-all duration-300`}>
                                {/* Background gradient on hover */}
                                <div className={`absolute inset-0 ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>

                                {/* Icon with glow */}
                                <div className="relative mb-4">
                                    <div className={`w-14 h-14 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center group-hover:shadow-lg ${stat.shadow} transition-all duration-300`}>
                                        <stat.icon className="w-7 h-7 text-white" />
                                    </div>
                                    <div className={`absolute inset-0 w-14 h-14 bg-gradient-to-br ${stat.color} rounded-xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-300`}></div>
                                </div>

                                {/* Value */}
                                <div className="relative">
                                    <p className="text-4xl font-black text-white mb-1">{stat.value}</p>
                                    <p className="text-gray-400 group-hover:text-gray-300 transition-colors">{stat.label}</p>
                                </div>

                                {/* Corner accents */}
                                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-red-600/0 group-hover:border-red-600/30 transition-all duration-300 rounded-tr-2xl"></div>
                                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-red-600/0 group-hover:border-red-600/30 transition-all duration-300 rounded-bl-2xl"></div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="relative bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 overflow-hidden"
                >
                    {/* Background effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 to-transparent"></div>

                    <div className="relative">
                        <div className="flex items-center gap-3 mb-6">
                            <Settings className="w-6 h-6 text-red-600" />
                            <h3 className="text-xl font-bold text-white">Thao tác nhanh</h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {QUICK_ACTIONS_CONFIG.map((action, index) => (
                                <motion.button
                                    key={action.label}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.7 + index * 0.1 }}
                                    whileHover={{ scale: 1.05, x: 5 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => action.targetPage ? onNavigate(action.targetPage) : onBackToHome()}
                                    className={`group relative flex items-center gap-3 p-4 bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl ${action.hoverColor} transition-all duration-300 hover:border-gray-600`}
                                >
                                    <div className={`${action.color} group-hover:scale-110 transition-transform`}>
                                        <action.icon className="w-6 h-6" />
                                    </div>
                                    <span className="text-white font-medium text-sm">{action.label}</span>

                                    {/* Arrow indicator */}
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
                    transition={{ delay: 1.1 }}
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
                    transition={{ delay: 1.2 }}
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
                    transition={{ delay: 1.3 }}
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
}

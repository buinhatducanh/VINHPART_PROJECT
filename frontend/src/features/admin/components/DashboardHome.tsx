import { motion } from 'motion/react';
import { LogOut, Home, Settings, Package, TrendingUp } from 'lucide-react';
import { AdminPage, DashboardStats } from '../types';
import { getStatsConfig, QUICK_ACTIONS_CONFIG } from '../constants';
import { useSettings } from '@/shared/hooks/useSettings';
import { useI18n } from '@/shared/lib/i18n';
import { useFirstVisit } from '@/shared/hooks/useFirstVisit';

interface DashboardHomeProps {
    stats: DashboardStats;
    onNavigate: (page: AdminPage) => void;
    onLogoutRequest: () => void;
    onBackToHome: () => void;
}

export function DashboardHome({ stats, onNavigate, onLogoutRequest, onBackToHome }: DashboardHomeProps) {
    const { siteName } = useSettings();
    const statsConfig = getStatsConfig(stats);
    const { t } = useI18n();
    const a = useFirstVisit('dashboard-home');

    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                {[...Array(30)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-red-600/30 rounded-full"
                        initial={{ x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight }}
                        animate={{ y: [null, Math.random() * window.innerHeight], opacity: [0.3, 0.8, 0.3] }}
                        transition={{ duration: Math.random() * 5 + 3, repeat: Infinity, delay: Math.random() * 2 }}
                    />
                ))}
            </div>

            <motion.header
                initial={a && { y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="relative border-b border-border bg-background/40 backdrop-blur-xl"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <motion.div whileHover={{ scale: 1.05, rotate: 5 }} className="relative w-14 h-14">
                                <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-red-800 rounded-xl transform rotate-3"></div>
                                <div className="absolute inset-0.5 bg-background rounded-xl"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-3xl font-black text-transparent bg-gradient-to-br from-red-500 via-red-600 to-red-800 bg-clip-text">
                                        {siteName.charAt(0).toUpperCase()}
                                    </div>
                                </div>
                                <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-red-600"></div>
                                <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-red-600"></div>
                                <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-red-600"></div>
                                <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-red-600"></div>
                                <div className="absolute inset-0 bg-red-600/20 rounded-xl blur-xl"></div>
                            </motion.div>

                            <div className="text-left">
                                <h1 className="text-2xl font-black text-transparent bg-gradient-to-r from-white via-gray-200 to-red-600 bg-clip-text">
                                    {siteName.toUpperCase()}
                                </h1>
                                <p className="text-sm text-muted-foreground">{t('common.storeManagement')}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="hidden md:block text-right">
                                <p className="text-sm font-semibold text-foreground">{siteName.toLowerCase()}@vinhpart.vn</p>
                                <p className="text-xs text-muted-foreground">{t('common.admin')}</p>
                            </div>

                            <motion.button
                                onClick={onLogoutRequest}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="group relative p-3 bg-card border border-border rounded-lg hover:border-red-600/50 transition-all"
                            >
                                <LogOut className="w-5 h-5 text-muted-foreground group-hover:text-red-600 transition-colors" />
                                <div className="absolute inset-0 bg-red-600/0 group-hover:bg-red-600/10 rounded-lg transition-colors"></div>
                            </motion.button>
                        </div>
                    </div>
                </div>
            </motion.header>

            <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <motion.div initial={a && { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
                    <h2 className="text-3xl font-bold text-foreground mb-2">{t('admin.dashboard.welcome')} 👋</h2>
                    <p className="text-muted-foreground">{t('admin.dashboard.overview', { name: siteName.toUpperCase() })}</p>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {statsConfig.map((stat, index) => (
                        <motion.div key={stat.label} initial={a && { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + index * 0.1 }} whileHover={{ y: -5, scale: 1.02 }} className="group relative">
                            <div className={`relative bg-card/50 backdrop-blur-xl border border-border rounded-2xl p-6 overflow-hidden hover:border-${stat.border} transition-all duration-300`}>
                                <div className={`absolute inset-0 ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                                <div className="relative mb-4">
                                    <div className={`w-14 h-14 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center group-hover:shadow-lg ${stat.shadow} transition-all duration-300`}>
                                        <stat.icon className="w-7 h-7 text-foreground" />
                                    </div>
                                    <div className={`absolute inset-0 w-14 h-14 bg-gradient-to-br ${stat.color} rounded-xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-300`}></div>
                                </div>
                                <div className="relative">
                                    <p className="text-4xl font-black text-foreground mb-1">{stat.value}</p>
                                    <p className="text-muted-foreground group-hover:text-muted-foreground transition-colors">{t(`admin.stats.${stat.key}`)}</p>
                                </div>
                                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-red-600/0 group-hover:border-red-600/30 transition-all duration-300 rounded-tr-2xl"></div>
                                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-red-600/0 group-hover:border-red-600/30 transition-all duration-300 rounded-bl-2xl"></div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <motion.div initial={a && { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="relative bg-card/50 backdrop-blur-xl border border-border rounded-2xl p-6 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 to-transparent"></div>
                    <div className="relative">
                        <div className="flex items-center gap-3 mb-6">
                            <Settings className="w-6 h-6 text-red-600" />
                            <h3 className="text-xl font-bold text-foreground">{t('admin.dashboard.quickActions')}</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {QUICK_ACTIONS_CONFIG.map((action, index) => (
                                <motion.button
                                    key={action.label}
                                    initial={a && { opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.7 + index * 0.1 }}
                                    whileHover={{ scale: 1.05, x: 5 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => action.targetPage ? onNavigate(action.targetPage) : onBackToHome()}
                                    className={`group relative flex items-center gap-3 p-4 bg-muted backdrop-blur border border-border rounded-xl ${action.hoverColor} transition-all duration-300 hover:border-gray-600`}
                                >
                                    <div className={`${action.color} group-hover:scale-110 transition-transform`}>
                                        <action.icon className="w-6 h-6" />
                                    </div>
                                    <span className="text-foreground font-medium text-sm">{t(`admin.dashboard.actions.${action.key}`)}</span>
                                    <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                                        <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    </div>
                </motion.div>

                <motion.div initial={a && { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }} className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-card/30 border border-border rounded-xl p-4 backdrop-blur">
                        <p className="text-xs text-muted-foreground mb-1">{t('admin.dashboard.sysVersion')}</p>
                        <p className="text-foreground font-semibold">{siteName.toUpperCase()} v2.0.0</p>
                    </div>
                    <div className="bg-card/30 border border-border rounded-xl p-4 backdrop-blur">
                        <p className="text-xs text-muted-foreground mb-1">{t('admin.dashboard.lastLogin')}</p>
                        <p className="text-foreground font-semibold">{t('common.today')}, 10:30 AM</p>
                    </div>
                    <div className="bg-card/30 border border-border rounded-xl p-4 backdrop-blur">
                        <p className="text-xs text-muted-foreground mb-1">{t('admin.dashboard.sysStatus')}</p>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <p className="text-foreground font-semibold">{t('admin.dashboard.statusNormal')}</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div initial={a && { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }} className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <motion.button onClick={() => onNavigate('statistics')} whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }} className="bg-gradient-to-br from-green-600/20 to-green-800/20 border border-green-600/30 rounded-xl p-6 text-left hover:border-green-600/50 transition-all group">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-800 rounded-xl flex items-center justify-center group-hover:shadow-lg shadow-green-600/25 transition-all">
                                <TrendingUp className="w-6 h-6 text-foreground" />
                            </div>
                            <div>
                                <h4 className="text-foreground font-bold mb-1">{t('admin.dashboard.stats')}</h4>
                                <p className="text-sm text-muted-foreground">{t('admin.dashboard.statsDesc')}</p>
                            </div>
                        </div>
                    </motion.button>

                    <motion.button onClick={() => onNavigate('manageProducts')} whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }} className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border border-blue-600/30 rounded-xl p-6 text-left hover:border-blue-600/50 transition-all group">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center group-hover:shadow-lg shadow-blue-600/25 transition-all">
                                <Package className="w-6 h-6 text-foreground" />
                            </div>
                            <div>
                                <h4 className="text-foreground font-bold mb-1">{t('admin.dashboard.products')}</h4>
                                <p className="text-sm text-muted-foreground">{t('admin.dashboard.productsDesc')}</p>
                            </div>
                        </div>
                    </motion.button>

                    <motion.button onClick={() => onNavigate('settings')} whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }} className="bg-gradient-to-br from-orange-600/20 to-orange-800/20 border border-orange-600/30 rounded-xl p-6 text-left hover:border-orange-600/50 transition-all group">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-orange-800 rounded-xl flex items-center justify-center group-hover:shadow-lg shadow-orange-600/25 transition-all">
                                <Settings className="w-6 h-6 text-foreground" />
                            </div>
                            <div>
                                <h4 className="text-foreground font-bold mb-1">{t('admin.dashboard.settings')}</h4>
                                <p className="text-sm text-muted-foreground">{t('admin.dashboard.settingsDesc')}</p>
                            </div>
                        </div>
                    </motion.button>
                </motion.div>

                <motion.div initial={a && { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.3 }} className="mt-8 flex justify-center">
                    <motion.button onClick={onBackToHome} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-8 py-3 bg-card/50 border border-border text-foreground rounded-lg hover:border-gray-600 transition-all flex items-center gap-2 group">
                        <Home className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                        <span>{t('admin.dashboard.backToHome')}</span>
                    </motion.button>
                </motion.div>
            </main>
        </div>
    );
}

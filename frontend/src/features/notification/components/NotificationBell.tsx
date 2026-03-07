import { useState, useRef, useEffect } from 'react';
import { Bell, Package, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNotifications } from '../hooks/useNotifications';
import { OrderDetailsModal } from '@/features/admin/components/OrderDetailsModal';

export function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false);
    const [previewOrderId, setPreviewOrderId] = useState<string | null>(null);
    const { notifications, unreadCount, markAsRead, markAllAsRead, readIds } = useNotifications();
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    const handleNotificationClick = (notif: any) => {
        markAsRead(notif.id);
        setPreviewOrderId(notif.orderId || notif.id);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="group relative p-3 bg-gray-900 border border-gray-700 rounded-lg hover:border-red-600/50 transition-all"
            >
                <Bell className="w-5 h-5 text-gray-400 group-hover:text-red-600 transition-colors" />

                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-black animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}

                <div className="absolute inset-0 bg-red-600/0 group-hover:bg-red-600/10 rounded-lg transition-colors"></div>
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-80 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl overflow-hidden z-[9999]"
                    >
                        <div className="p-4 border-b border-gray-800 flex flex-col sm:flex-row justify-between sm:items-center bg-black/40 gap-2 sm:gap-0">
                            <h3 className="text-white font-bold leading-none">Thông báo</h3>
                            <div className="flex items-center gap-3">
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllAsRead}
                                        className="text-[10px] text-gray-400 hover:text-white transition-colors uppercase tracking-wider underline cursor-pointer leading-none mt-0.5"
                                    >
                                        Đánh dấu đã đọc
                                    </button>
                                )}
                                <span className="text-xs text-gray-500 leading-none mt-0.5">{unreadCount} đơn hàng mới</span>
                            </div>
                        </div>

                        <div className="max-h-96 overflow-y-auto">
                            {notifications.length > 0 ? (
                                notifications.map((notif) => {
                                    const isRead = readIds.has(notif.id);
                                    return (
                                        <div
                                            key={notif.id}
                                            onClick={() => handleNotificationClick(notif)}
                                            className={`p-4 border-b border-gray-800 hover:bg-gray-800/50 transition-colors cursor-pointer group ${isRead ? 'opacity-60' : ''}`}
                                        >
                                            <div className="flex gap-3">
                                                <div className={`w-10 h-10 ${isRead ? 'bg-gray-800' : 'bg-red-600/20'} rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-red-600 transition-colors`}>
                                                    <Package className={`w-5 h-5 ${isRead ? 'text-gray-500' : 'text-red-600'} group-hover:text-white`} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm ${isRead ? 'font-medium text-gray-300' : 'font-bold text-white'} mb-1`}>{notif.title}</p>
                                                    <p className={`text-xs ${isRead ? 'text-gray-500' : 'text-gray-400'} line-clamp-2 mb-2`}>
                                                        {notif.message}
                                                    </p>
                                                    <div className="flex justify-between items-center text-[10px] text-gray-500">
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            {formatTime(notif.createdAt)}
                                                        </span>
                                                        <span className="font-bold text-red-500">
                                                            {formatPrice(notif.amount)}
                                                        </span>
                                                    </div>
                                                </div>
                                                {!isRead && (
                                                    <div className="w-2 h-2 bg-red-600 rounded-full mt-1.5 flex-shrink-0 animate-pulse"></div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="p-8 text-center">
                                    <Bell className="w-8 h-8 text-gray-700 mx-auto mb-3" />
                                    <p className="text-gray-500 text-sm">Không có thông báo mới</p>
                                </div>
                            )}
                        </div>

                        {notifications.length > 0 && (
                            <button
                                onClick={() => {
                                    window.location.href = '/admin?page=manageOrders';
                                    setIsOpen(false);
                                }}
                                className="w-full p-3 text-center text-xs text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                            >
                                Xem tất cả đơn hàng
                            </button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {previewOrderId && (
                <OrderDetailsModal
                    orderId={previewOrderId}
                    isOpen={!!previewOrderId}
                    onClose={() => setPreviewOrderId(null)}
                />
            )}
        </div>
    );
}

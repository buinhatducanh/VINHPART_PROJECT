import { useState, useRef, useEffect } from 'react';
import { Bell, Package, Clock, Star, CheckCircle, Truck, PackageCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNotifications } from '../hooks/useNotifications';
import { OrderDetailsModal } from '@/features/admin/components/OrderDetailsModal';

interface UserNotificationBellProps {
    email: string;
    isAdmin?: boolean;
    onReviewClick?: (orderId: string) => void;
}

export function UserNotificationBell({ email, isAdmin, onReviewClick }: UserNotificationBellProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [previewOrderId, setPreviewOrderId] = useState<string | null>(null);
    const { notifications: userNotifs, unreadCount: userUnread, readIds: userReadIds, markAsRead: userMarkAsRead, markAllAsRead: userMarkAllAsRead } = useNotifications(email);
    // If admin, also fetch admin notifications
    const { notifications: adminNotifs, unreadCount: adminUnread, readIds: adminReadIds, markAsRead: adminMarkAsRead, markAllAsRead: adminMarkAllAsRead } = useNotifications(isAdmin ? undefined : 'DO_NOT_FETCH');
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

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'CONFIRMED': return <PackageCheck className="w-5 h-5 text-blue-500" />;
            case 'PROCESSING': return <Package className="w-5 h-5 text-yellow-500" />;
            case 'SHIPPED': return <Truck className="w-5 h-5 text-orange-500" />;
            case 'DELIVERED': return <CheckCircle className="w-5 h-5 text-green-500" />;
            default: return <Bell className="w-5 h-5 text-gray-500" />;
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });
    };

    const handleNotificationClick = (notif: any) => {
        if (notif.type === 'order' && isAdmin) {
            adminMarkAsRead(notif.id);
        } else {
            userMarkAsRead(notif.id);
        }

        if (notif.orderId || notif.id) {
            setPreviewOrderId(notif.orderId || notif.id);
        }
        setIsOpen(false);
    };

    const handleMarkAllAsRead = (e: React.MouseEvent) => {
        userMarkAllAsRead(e);
        if (isAdmin) {
            adminMarkAllAsRead(e);
        }
    };

    // Combine and sort notifications
    const allNotifications = [...userNotifs, ...(isAdmin && adminNotifs ? adminNotifs : [])]
        .filter(n => n.id) // Filter out DO_NOT_FETCH responses if any
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const totalUnread = userUnread + (isAdmin ? adminUnread : 0);

    return (
        <div className="relative" ref={dropdownRef}>
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="group relative p-2 hover:bg-gray-900 rounded-lg transition-all"
            >
                <Bell className="w-5 h-5 lg:w-6 lg:h-6 text-gray-400 group-hover:text-red-500 transition-colors" />

                {totalUnread > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-black animate-pulse">
                        {totalUnread > 9 ? '9+' : totalUnread}
                    </span>
                )}
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-80 bg-gray-950 border border-gray-800 rounded-xl shadow-2xl overflow-hidden z-[9999]"
                    >
                        <div className="p-4 border-b border-gray-800 flex flex-col sm:flex-row justify-between sm:items-center bg-black/40 gap-2 sm:gap-0">
                            <h3 className="text-white font-bold text-sm leading-none">Thông báo của bạn</h3>
                            <div className="flex items-center gap-3">
                                {totalUnread > 0 && (
                                    <button
                                        onClick={handleMarkAllAsRead}
                                        className="text-[10px] text-gray-400 hover:text-white transition-colors uppercase tracking-wider underline cursor-pointer leading-none mt-0.5"
                                    >
                                        Đánh dấu đã đọc
                                    </button>
                                )}
                                <span className="text-[10px] text-gray-500 uppercase tracking-wider leading-none mt-0.5">Mới nhất</span>
                            </div>
                        </div>

                        <div className="max-h-96 overflow-y-auto">
                            {allNotifications.length > 0 ? (
                                allNotifications.map((notif) => {
                                    const isRead = notif.type === 'order' && isAdmin
                                        ? adminReadIds.has(notif.id)
                                        : userReadIds.has(notif.id);

                                    return (
                                        <div
                                            key={notif.id}
                                            onClick={() => handleNotificationClick(notif)}
                                            className={`p-4 border-b border-gray-800/50 hover:bg-gray-900/50 transition-colors cursor-pointer group ${isRead ? 'opacity-60' : ''}`}
                                        >
                                            <div className="flex gap-3">
                                                <div className={`w-10 h-10 ${isRead ? 'bg-gray-900' : 'bg-gray-800'} rounded-lg flex items-center justify-center flex-shrink-0 transition-colors`}>
                                                    {notif.type === 'order' ? (
                                                        <Package className={`w-5 h-5 ${isRead ? 'text-gray-500' : 'text-red-500'}`} />
                                                    ) : (
                                                        getStatusIcon(notif.status || '')
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm ${isRead ? 'font-medium text-gray-300' : 'font-bold text-white'} mb-1`}>
                                                        {notif.type === 'order' && <span className="text-[10px] bg-red-600 text-white px-1 mr-1 rounded opacity-90">Admin</span>}
                                                        {notif.title}
                                                    </p>
                                                    <p className={`text-xs ${isRead ? 'text-gray-500' : 'text-gray-400'} line-clamp-2 mb-2 leading-relaxed`}>
                                                        {notif.message}
                                                    </p>

                                                    <div className="flex justify-between items-center">
                                                        <span className="flex items-center gap-1 text-[10px] text-gray-500">
                                                            <Clock className="w-3 h-3" />
                                                            {formatTime(notif.createdAt)}
                                                        </span>

                                                        {notif.status === 'DELIVERED' && (
                                                            <span
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if (onReviewClick) {
                                                                        onReviewClick(notif.orderId);
                                                                    } else {
                                                                        window.location.href = `/write-review?orderId=${notif.orderId}`;
                                                                    }
                                                                    setIsOpen(false);
                                                                }}
                                                                className={`flex items-center gap-1 px-2 py-0.5 ${isRead ? 'bg-gray-800 text-gray-400' : 'bg-red-600/20 text-red-500 animate-bounce'} text-[10px] font-bold rounded-full hover:bg-red-600 hover:text-white transition-colors cursor-pointer`}
                                                            >
                                                                <Star className="w-3 h-3 fill-current" />
                                                                Đánh giá ngay
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                {!isRead && (
                                                    <div className="w-2 h-2 bg-red-500 rounded-full mt-1.5 flex-shrink-0 animate-pulse"></div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="p-8 text-center">
                                    <Bell className="w-8 h-8 text-gray-800 mx-auto mb-3" />
                                    <p className="text-gray-500 text-sm">Không có thông báo mới</p>
                                </div>
                            )}
                        </div>

                        {allNotifications.length > 0 && (
                            <button className="w-full p-3 text-center text-[10px] text-gray-500 hover:text-white hover:bg-gray-900 transition-colors uppercase tracking-widest font-bold" onClick={() => setIsOpen(false)}>
                                Đóng
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
                    readOnly={!isAdmin}
                />
            )}
        </div>
    );
}

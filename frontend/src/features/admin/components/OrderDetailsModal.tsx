import { motion, AnimatePresence } from 'motion/react';
import { X, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useI18n } from '@/shared/lib/i18n';
import { API_BASE_URL } from '@/lib/api';

interface OrderDetailsModalProps {
    orderId: string;
    isOpen: boolean;
    onClose: () => void;
    onStatusUpdate?: (id: string, newStatus: string) => void;
    readOnly?: boolean;
}

export function OrderDetailsModal({ orderId, isOpen, onClose, onStatusUpdate, readOnly }: OrderDetailsModalProps) {
    const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const { language } = useI18n();

    useEffect(() => {
        if (isOpen && orderId) {
            fetchOrderDetails();
        }
    }, [isOpen, orderId]);

    const fetchOrderDetails = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/orders/${orderId}`);
            if (res.ok) {
                const data = await res.json();
                setSelectedOrder(data);
            }
        } catch (error) {
            console.error('Error fetching order details:', error);
        }
    };

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        setIsUpdating(true);
        try {
            const res = await fetch(`${API_BASE_URL}/orders/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus.toUpperCase() })
            });
            if (res.ok) {
                setSelectedOrder((prev: any) => prev ? { ...prev, status: newStatus.toUpperCase() } : prev);
                if (onStatusUpdate) {
                    onStatusUpdate(id, newStatus);
                }
            }
        } catch (error) {
            console.error('Error updating order status:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat(language === 'vi' ? 'vi-VN' : 'en-US', {
            style: 'currency',
            currency: language === 'vi' ? 'VND' : 'USD'
        }).format(language === 'vi' ? value : value / 25000);
    };

    if (!isOpen || !selectedOrder) return null;

    return (
        <AnimatePresence>
            <div
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-[#111] border border-border rounded-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
                >
                    <div className="flex items-center justify-between p-6 border-b border-white/10 shrink-0">
                        <div>
                            <h2 className="text-xl font-bold text-white mb-1">Chi tiết đơn hàng #{selectedOrder.orderNumber}</h2>
                            <p className="text-sm text-gray-400">Đặt lúc {new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-6 overflow-y-auto min-h-0 flex-1 custom-scrollbar">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">Thông tin khách hàng</h3>
                                <div>
                                    <p className="text-sm text-gray-400">Tên KH</p>
                                    <p className="text-white">{selectedOrder.customerName}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400">Email</p>
                                    <p className="text-white">{selectedOrder.customerEmail || 'Chưa cung cấp'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400">Số điện thoại</p>
                                    <p className="text-white">{selectedOrder.customerPhone || 'Chưa cung cấp'}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">Thông tin giao hàng</h3>
                                <div>
                                    <p className="text-sm text-gray-400">Địa chỉ</p>
                                    <p className="text-white">{selectedOrder.address}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400">Tỉnh/Thành phố</p>
                                    <p className="text-white">{selectedOrder.city}</p>
                                </div>
                                {selectedOrder.notes && (
                                    <div>
                                        <p className="text-sm text-gray-400">Ghi chú</p>
                                        <p className="text-white italic">{selectedOrder.notes}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4 mb-8">
                            <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">Sản phẩm</h3>
                            <div className="space-y-3">
                                {selectedOrder.items && selectedOrder.items.map((item: any) => (
                                    <div key={item.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                                        <div className="flex-1">
                                            <p className="text-white font-medium">{item.name}</p>
                                            <p className="text-sm text-gray-400">SL: {item.quantity} x {formatCurrency(item.price)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-white font-semibold">{formatCurrency(item.price * item.quantity)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between items-center pt-4 border-t border-white/10">
                                <span className="text-gray-400">Tổng cộng</span>
                                <span className="text-xl font-bold text-white border-b-2 border-purple-500 pb-1">{formatCurrency(selectedOrder.totalAmount)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border-t border-white/10 bg-white/[0.02] flex items-center justify-between shrink-0">
                        {readOnly ? (
                            <div className="flex items-center gap-3 w-full justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-400">Trạng thái hiện tại:</span>
                                    <span className="px-3 py-1 bg-purple-500/20 text-purple-400 font-bold text-sm rounded-full border border-purple-500/30 uppercase">
                                        {selectedOrder.status === 'PENDING' ? 'Chờ xử lý' :
                                            selectedOrder.status === 'PROCESSING' ? 'Đang xử lý' :
                                                selectedOrder.status === 'SHIPPED' ? 'Đang giao' :
                                                    selectedOrder.status === 'DELIVERED' ? 'Đã giao' :
                                                        selectedOrder.status === 'CANCELLED' ? 'Đã hủy' :
                                                            selectedOrder.status}
                                    </span>
                                </div>
                                <span className="text-sm text-gray-500 italic">Liên hệ Admin để thay đổi trạng thái hoặc huỷ đơn hàng.</span>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm text-gray-400">Cập nhật trạng thái:</span>
                                    <select
                                        value={selectedOrder.status.toLowerCase()}
                                        onClick={(e) => e.stopPropagation()}
                                        onChange={(e) => handleUpdateStatus(selectedOrder.id, e.target.value)}
                                        disabled={isUpdating}
                                        className="bg-[#222] border border-white/20 text-white text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block p-2.5 outline-none"
                                    >
                                        <option value="pending">Chờ xử lý</option>
                                        <option value="processing">Đang xử lý</option>
                                        <option value="shipped">Đang giao</option>
                                        <option value="delivered">Đã giao</option>
                                        <option value="cancelled">Đã hủy</option>
                                    </select>
                                </div>
                                {isUpdating && <span className="text-sm text-purple-400 flex items-center gap-2">
                                    <Clock className="w-4 h-4 animate-spin" /> Đang cập nhật...
                                </span>}
                            </>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

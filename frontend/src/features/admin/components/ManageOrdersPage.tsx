import { motion, AnimatePresence } from 'motion/react';
import { ClipboardList, ArrowLeft, Eye, Truck, CheckCircle, XCircle, Clock, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useI18n } from '@/shared/lib/i18n';
import { useFirstVisit } from '@/shared/hooks/useFirstVisit';
import { NotificationBell } from '@/features/notification/components/NotificationBell';
import { API_BASE_URL } from '@/lib/api';

interface ManageOrdersPageProps {
  onBack: () => void;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  date: string;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: number;
}

export function ManageOrdersPage({ onBack }: ManageOrdersPageProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { t, language } = useI18n();
  const a = useFirstVisit('manage-orders');

  const fetchOrders = () => {
    fetch(`${API_BASE_URL}/orders`)
      .then(res => res.json())
      .then(data => {
        setOrders(Array.isArray(data) ? data : []);
      })
      .catch(err => console.error('Error fetching orders:', err));
  };

  useEffect(() => {
    fetchOrders();

    // Check if there's an orderId in the URL to open automatically
    const params = new URLSearchParams(window.location.search);
    const orderIdParam = params.get('orderId');
    if (orderIdParam) {
      handleViewOrder(orderIdParam);
    }
  }, []);

  const handleViewOrder = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/orders/${id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedOrder(data);
        setIsModalOpen(true);
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
        fetchOrders();
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const statusConfig = {
    pending: {
      label: t('admin.manageOrders.status.pending'),
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/50',
      icon: Clock
    },
    processing: {
      label: t('admin.manageOrders.status.processing'),
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/50',
      icon: Truck
    },
    shipped: {
      label: t('admin.manageOrders.status.shipped'),
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/50',
      icon: Truck
    },
    delivered: {
      label: t('admin.manageOrders.status.delivered'),
      color: 'text-green-400',
      bg: 'bg-green-500/10',
      border: 'border-green-500/50',
      icon: CheckCircle
    },
    cancelled: {
      label: t('admin.manageOrders.status.cancelled'),
      color: 'text-red-400',
      bg: 'bg-red-500/10',
      border: 'border-red-500/50',
      icon: XCircle
    }
  };

  const filteredOrders = selectedStatus === 'all'
    ? orders
    : orders.filter(order => order.status === selectedStatus);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(language === 'vi' ? 'vi-VN' : 'en-US', {
      style: 'currency',
      currency: language === 'vi' ? 'VND' : 'USD'
    }).format(language === 'vi' ? value : value / 25000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black pb-20">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-red-600/30 rounded-full"
            initial={{ x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight }}
            animate={{ y: [null, Math.random() * window.innerHeight], opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: Math.random() * 5 + 3, repeat: Infinity, delay: Math.random() * 2 }}
          />
        ))}
      </div>

      <motion.div
        initial={a && { y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative border-b border-border bg-background/40 backdrop-blur-xl sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.button onClick={onBack} whileHover={{ scale: 1.05, x: -5 }} whileTap={{ scale: 0.95 }} className="p-3 bg-card border border-border rounded-lg hover:border-red-600/50 transition-all group">
                <ArrowLeft className="w-5 h-5 text-muted-foreground group-hover:text-red-600 transition-colors" />
              </motion.button>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl flex items-center justify-center">
                  <ClipboardList className="w-6 h-6 text-foreground" />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-transparent bg-gradient-to-r from-white via-gray-200 to-purple-600 bg-clip-text">
                    {t('admin.manageOrders.title')}
                  </h1>
                  <p className="text-sm text-muted-foreground">{t('admin.manageOrders.subtitle')}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <NotificationBell />
            </div>
          </div>
        </div>
      </motion.div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={a && { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card/50 backdrop-blur-xl border border-border rounded-xl p-2 mb-6 flex flex-wrap gap-2">
          <button onClick={() => setSelectedStatus('all')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedStatus === 'all' ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-foreground shadow-lg shadow-purple-600/25' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}>
            {t('admin.manageOrders.all', { count: orders.length })}
          </button>
          {Object.entries(statusConfig).map(([key, config]) => {
            const count = orders.filter(o => o.status === key).length;
            return (
              <button key={key} onClick={() => setSelectedStatus(key)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${selectedStatus === key ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-foreground shadow-lg shadow-purple-600/25' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}>
                <config.icon className="w-4 h-4" />
                {config.label} ({count})
              </button>
            );
          })}
        </motion.div>

        <div className="space-y-4">
          {filteredOrders.map((order, index) => {
            const statusInfo = statusConfig[order.status];
            const StatusIcon = statusInfo.icon;

            return (
              <motion.div key={order.id} onClick={() => handleViewOrder(order.id)} initial={a && { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} whileHover={{ y: -2 }} className="bg-card/50 backdrop-blur-xl border border-border rounded-xl p-6 hover:border-purple-600/30 transition-all group cursor-pointer">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">{t('admin.manageOrders.orderId')}</p>
                      <p className="text-foreground font-bold">{order.orderNumber}</p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground mb-1">{t('admin.manageOrders.customer')}</p>
                      <p className="text-foreground font-semibold">{order.customerName}</p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground mb-1">{t('admin.manageOrders.date')}</p>
                      <p className="text-foreground">{new Date(order.date).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US')}</p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground mb-1">{t('admin.manageOrders.total')}</p>
                      <p className="text-foreground font-bold">{formatCurrency(order.total)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className={`px-4 py-2 rounded-lg ${statusInfo.bg} border ${statusInfo.border} flex items-center gap-2`}>
                      <StatusIcon className={`w-4 h-4 ${statusInfo.color}`} />
                      <span className={`text-sm font-semibold ${statusInfo.color}`}>{statusInfo.label}</span>
                    </div>

                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="p-3 bg-muted border border-border rounded-lg hover:border-purple-600/50 transition-all group/btn">
                      <Eye className="w-5 h-5 text-muted-foreground group-hover/btn:text-purple-600 transition-colors" />
                    </motion.button>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{t('admin.manageOrders.items', { count: order.items })}</span>
                  <span>•</span>
                  <span>ID: {order.id}</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {filteredOrders.length === 0 && (
          <motion.div initial={a && { opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-card/50 backdrop-blur-xl border border-border rounded-xl p-12 text-center">
            <ClipboardList className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2">{t('admin.manageOrders.notFoundTitle')}</h3>
            <p className="text-muted-foreground">{t('admin.manageOrders.notFoundDesc')}</p>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && selectedOrder && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
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
                  onClick={() => setIsModalOpen(false)}
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
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

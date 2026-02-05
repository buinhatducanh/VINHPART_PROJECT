import { motion } from 'motion/react';
import { ClipboardList, ArrowLeft, Eye, Truck, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useState } from 'react';

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

  // Mock orders data
  const orders: Order[] = [
    {
      id: '1',
      orderNumber: 'ORD-2024-001',
      customerName: 'Nguyễn Văn A',
      date: '2024-02-04',
      total: 2450000,
      status: 'delivered',
      items: 3
    },
    {
      id: '2',
      orderNumber: 'ORD-2024-002',
      customerName: 'Trần Thị B',
      date: '2024-02-03',
      total: 1850000,
      status: 'shipped',
      items: 2
    },
    {
      id: '3',
      orderNumber: 'ORD-2024-003',
      customerName: 'Lê Văn C',
      date: '2024-02-03',
      total: 3200000,
      status: 'processing',
      items: 5
    },
    {
      id: '4',
      orderNumber: 'ORD-2024-004',
      customerName: 'Phạm Thị D',
      date: '2024-02-02',
      total: 980000,
      status: 'pending',
      items: 1
    },
    {
      id: '5',
      orderNumber: 'ORD-2024-005',
      customerName: 'Hoàng Văn E',
      date: '2024-02-01',
      total: 4500000,
      status: 'cancelled',
      items: 4
    },
  ];

  const statusConfig = {
    pending: {
      label: 'Chờ xử lý',
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/50',
      icon: Clock
    },
    processing: {
      label: 'Đang xử lý',
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/50',
      icon: Truck
    },
    shipped: {
      label: 'Đang giao',
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/50',
      icon: Truck
    },
    delivered: {
      label: 'Đã giao',
      color: 'text-green-400',
      bg: 'bg-green-500/10',
      border: 'border-green-500/50',
      icon: CheckCircle
    },
    cancelled: {
      label: 'Đã hủy',
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
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black pb-20">
      {/* Animated background particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
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
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative border-b border-gray-800 bg-black/40 backdrop-blur-xl sticky top-0 z-10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.button
                onClick={onBack}
                whileHover={{ scale: 1.05, x: -5 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 bg-gray-900 border border-gray-700 rounded-lg hover:border-red-600/50 transition-all group"
              >
                <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-red-600 transition-colors" />
              </motion.button>
              
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl flex items-center justify-center">
                  <ClipboardList className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-transparent bg-gradient-to-r from-white via-gray-200 to-purple-600 bg-clip-text">
                    QUẢN LÝ ĐƠN HÀNG
                  </h1>
                  <p className="text-sm text-gray-500">Xem và xử lý đơn hàng</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl p-2 mb-6 flex flex-wrap gap-2"
        >
          <button
            onClick={() => setSelectedStatus('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedStatus === 'all'
                ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-600/25'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            Tất cả ({orders.length})
          </button>
          {Object.entries(statusConfig).map(([key, config]) => {
            const count = orders.filter(o => o.status === key).length;
            return (
              <button
                key={key}
                onClick={() => setSelectedStatus(key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  selectedStatus === key
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-600/25'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <config.icon className="w-4 h-4" />
                {config.label} ({count})
              </button>
            );
          })}
        </motion.div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.map((order, index) => {
            const statusInfo = statusConfig[order.status];
            const StatusIcon = statusInfo.icon;

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -2 }}
                className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl p-6 hover:border-purple-600/30 transition-all group"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Order Info */}
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Mã đơn hàng</p>
                      <p className="text-white font-bold">{order.orderNumber}</p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Khách hàng</p>
                      <p className="text-white font-semibold">{order.customerName}</p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Ngày đặt</p>
                      <p className="text-white">{new Date(order.date).toLocaleDateString('vi-VN')}</p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Tổng tiền</p>
                      <p className="text-white font-bold">{formatCurrency(order.total)}</p>
                    </div>
                  </div>

                  {/* Status & Actions */}
                  <div className="flex items-center gap-3">
                    <div className={`px-4 py-2 rounded-lg ${statusInfo.bg} border ${statusInfo.border} flex items-center gap-2`}>
                      <StatusIcon className={`w-4 h-4 ${statusInfo.color}`} />
                      <span className={`text-sm font-semibold ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-3 bg-gray-800 border border-gray-700 rounded-lg hover:border-purple-600/50 transition-all group/btn"
                    >
                      <Eye className="w-5 h-5 text-gray-400 group-hover/btn:text-purple-600 transition-colors" />
                    </motion.button>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="mt-4 pt-4 border-t border-gray-800 flex items-center gap-2 text-sm text-gray-500">
                  <span>{order.items} sản phẩm</span>
                  <span>•</span>
                  <span>ID: {order.id}</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredOrders.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl p-12 text-center"
          >
            <ClipboardList className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Không có đơn hàng</h3>
            <p className="text-gray-500">Không tìm thấy đơn hàng nào phù hợp với bộ lọc này.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

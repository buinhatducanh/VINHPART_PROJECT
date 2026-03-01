import { memo, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, DollarSign, ShoppingCart, Users, ArrowLeft, Calendar, Package, CheckCircle, Clock, XCircle } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useOrders } from '@/hooks/useQueries';
import { useDashboardStats } from '@/hooks/useQueries';

interface StatisticsPageProps {
  onBack: () => void;
}

export const StatisticsPage = memo(function StatisticsPage({ onBack }: StatisticsPageProps) {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const { data: orders } = useOrders();
  const { data: dashboardStats } = useDashboardStats();

  // Compute real analytics from orders data
  const analytics = useMemo(() => {
    if (!orders || !Array.isArray(orders) || orders.length === 0) {
      return {
        totalRevenue: 0,
        totalOrders: 0,
        avgOrderValue: 0,
        revenueData: [],
        statusData: [],
        summaryStats: [],
      };
    }

    const totalRevenue = orders.reduce((sum: number, o: any) => sum + (o.total || 0), 0);
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Group orders by date for revenue chart
    const ordersByDate = new Map<string, { revenue: number; count: number }>();
    orders.forEach((order: any) => {
      const date = new Date(order.date || order.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
      const existing = ordersByDate.get(date) || { revenue: 0, count: 0 };
      ordersByDate.set(date, {
        revenue: existing.revenue + (order.total || 0),
        count: existing.count + 1,
      });
    });

    const revenueData = Array.from(ordersByDate.entries())
      .slice(-7)
      .map(([name, data]) => ({
        name,
        revenue: data.revenue,
        orders: data.count,
      }));

    // Status distribution
    const statusCounts = { pending: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0 };
    orders.forEach((order: any) => {
      if (order.status in statusCounts) {
        statusCounts[order.status as keyof typeof statusCounts]++;
      }
    });

    const statusData = [
      { name: 'Chờ xử lý', value: statusCounts.pending, color: '#f59e0b' },
      { name: 'Đang xử lý', value: statusCounts.processing, color: '#3b82f6' },
      { name: 'Đang giao', value: statusCounts.shipped, color: '#8b5cf6' },
      { name: 'Đã giao', value: statusCounts.delivered, color: '#10b981' },
      { name: 'Đã hủy', value: statusCounts.cancelled, color: '#ef4444' },
    ].filter(d => d.value > 0);

    const deliveryRate = totalOrders > 0 ? Math.round((statusCounts.delivered / totalOrders) * 100) : 0;
    const cancelRate = totalOrders > 0 ? Math.round((statusCounts.cancelled / totalOrders) * 100) : 0;

    const summaryStats = [
      {
        label: 'Tổng doanh thu',
        value: totalRevenue >= 1000000 ? `${(totalRevenue / 1000000).toFixed(1)}M` : `${(totalRevenue / 1000).toFixed(0)}K`,
        subLabel: 'VNĐ',
        icon: DollarSign,
        color: 'from-green-500 to-emerald-500',
        gradient: 'bg-gradient-to-br from-green-500/20 to-emerald-500/20',
        border: 'border-green-500/50',
      },
      {
        label: 'Tổng đơn hàng',
        value: totalOrders.toString(),
        subLabel: `${statusCounts.pending} chờ xử lý`,
        icon: ShoppingCart,
        color: 'from-blue-500 to-cyan-500',
        gradient: 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20',
        border: 'border-blue-500/50',
      },
      {
        label: 'Giá trị TB/đơn',
        value: avgOrderValue >= 1000000 ? `${(avgOrderValue / 1000000).toFixed(1)}M` : `${(avgOrderValue / 1000).toFixed(0)}K`,
        subLabel: 'VNĐ/đơn',
        icon: Users,
        color: 'from-purple-500 to-pink-500',
        gradient: 'bg-gradient-to-br from-purple-500/20 to-pink-500/20',
        border: 'border-purple-500/50',
      },
      {
        label: 'Tỷ lệ giao hàng',
        value: `${deliveryRate}%`,
        subLabel: `${cancelRate}% hủy`,
        icon: TrendingUp,
        color: 'from-orange-500 to-yellow-500',
        gradient: 'bg-gradient-to-br from-orange-500/20 to-yellow-500/20',
        border: 'border-orange-500/50',
      },
    ];

    return { totalRevenue, totalOrders, avgOrderValue, revenueData, statusData, summaryStats };
  }, [orders]);

  const formatCurrency = (value: number) => {
    return `${(value / 1000000).toFixed(1)}M`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black pb-20">
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
                <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-800 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-transparent bg-gradient-to-r from-white via-gray-200 to-green-600 bg-clip-text">
                    THỐNG KÊ & BÁO CÁO
                  </h1>
                  <p className="text-sm text-gray-500">Phân tích doanh thu và hiệu suất</p>
                </div>
              </div>
            </div>

            {/* Time Range Selector */}
            <div className="hidden md:flex items-center gap-2 bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-lg p-1">
              {(['week', 'month', 'year'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    timeRange === range
                      ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg shadow-green-600/25'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  {range === 'week' ? 'Tuần' : range === 'month' ? 'Tháng' : 'Năm'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {analytics.summaryStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="group relative"
            >
              <div className={`relative bg-gray-900/50 backdrop-blur-xl border ${stat.border} rounded-2xl p-6 overflow-hidden`}>
                <div className={`absolute inset-0 ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>

                <div className="relative">
                  <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>

                  <p className="text-3xl font-black text-white mb-1">{stat.value}</p>
                  <p className="text-gray-400 text-sm mb-2">{stat.label}</p>
                  <p className="text-sm font-semibold text-gray-500">
                    {stat.subLabel}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-white mb-1">Doanh thu theo thời gian</h3>
                <p className="text-sm text-gray-500">Dữ liệu doanh thu thực tế từ đơn hàng</p>
              </div>
              <Calendar className="w-6 h-6 text-green-600" />
            </div>

            {analytics.revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis tickFormatter={formatCurrency} stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                    formatter={(value: number) => [`${formatCurrency(value)} VNĐ`, 'Doanh thu']}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    name="Doanh thu"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ fill: '#10b981', r: 6 }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                <p>Chưa có dữ liệu đơn hàng</p>
              </div>
            )}
          </motion.div>

          {/* Orders by Status Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-white mb-1">Phân bố đơn hàng</h3>
                <p className="text-sm text-gray-500">Theo trạng thái xử lý</p>
              </div>
              <ShoppingCart className="w-6 h-6 text-blue-600" />
            </div>

            {analytics.statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.statusData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                  <Bar dataKey="value" name="Số đơn" radius={[8, 8, 0, 0]}>
                    {analytics.statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                <p>Chưa có dữ liệu đơn hàng</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Distribution Pie */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-white mb-1">Tỷ lệ trạng thái</h3>
                <p className="text-sm text-gray-500">Phân bố đơn hàng theo trạng thái</p>
              </div>
            </div>

            {analytics.statusData.length > 0 ? (
              <>
                <div className="flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analytics.statusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {analytics.statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1f2937',
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#fff'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4">
                  {analytics.statusData.map((cat) => (
                    <div key={cat.name} className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: cat.color }}></div>
                      <span className="text-sm text-gray-400">{cat.name} ({cat.value})</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                <p>Chưa có dữ liệu</p>
              </div>
            )}
          </motion.div>

          {/* Performance Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-white mb-1">Chỉ số hiệu suất</h3>
                <p className="text-sm text-gray-500">Dựa trên dữ liệu thực tế</p>
              </div>
            </div>

            <div className="space-y-4">
              <MetricBar
                label="Sản phẩm trong kho"
                value={dashboardStats?.products?.toString() || '0'}
                percentage={Math.min(100, (dashboardStats?.products || 0) / 5)}
                color="from-green-600 to-green-500"
                delay={0.8}
              />
              <MetricBar
                label="Đơn hàng chờ xử lý"
                value={dashboardStats?.orders?.toString() || '0'}
                percentage={analytics.totalOrders > 0 ? Math.round(((dashboardStats?.orders || 0) / analytics.totalOrders) * 100) : 0}
                color="from-yellow-600 to-yellow-500"
                delay={0.9}
              />
              <MetricBar
                label="Tổng đơn hàng"
                value={analytics.totalOrders.toString()}
                percentage={Math.min(100, analytics.totalOrders * 2)}
                color="from-blue-600 to-blue-500"
                delay={1.0}
              />
              <MetricBar
                label="Danh mục sản phẩm"
                value={dashboardStats?.categories?.toString() || '0'}
                percentage={Math.min(100, (dashboardStats?.categories || 0) * 10)}
                color="from-purple-600 to-purple-500"
                delay={1.1}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
});

function MetricBar({ label, value, percentage, color, delay }: {
  label: string;
  value: string;
  percentage: number;
  color: string;
  delay: number;
}) {
  return (
    <div className="bg-gray-800/50 rounded-xl p-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-gray-400 text-sm">{label}</span>
        <span className="text-white font-bold">{value}</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(percentage, 100)}%` }}
          transition={{ duration: 1, delay }}
          className={`bg-gradient-to-r ${color} h-2 rounded-full`}
        ></motion.div>
      </div>
    </div>
  );
}

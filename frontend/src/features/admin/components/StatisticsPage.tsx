import { motion } from 'motion/react';
import { TrendingUp, DollarSign, ShoppingCart, Users, ArrowLeft, Calendar, Loader2 } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useState } from 'react';
import { useFirstVisit } from '@/shared/hooks/useFirstVisit';
import { useStatistics } from '@/hooks/useQueries';

interface StatisticsPageProps {
  onBack: () => void;
}

export function StatisticsPage({ onBack }: StatisticsPageProps) {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const a = useFirstVisit('statistics');
  const { data: stats, isLoading } = useStatistics(timeRange);

  const summary = stats?.summary;
  const revenueData = stats?.revenueChart || [];
  const topProductsData = stats?.topProducts || [];
  const categoryData = stats?.categoryDistribution || [];

  const formatRevenueShort = (value: number) => {
    if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
    return value.toString();
  };

  const formatFullCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const avgOrderPercent = summary
    ? Math.min(100, Math.round(summary.avgOrderValue / 500000 * 100))
    : 0;

  const summaryStats = [
    {
      label: 'Tổng doanh thu',
      value: summary ? formatRevenueShort(summary.totalRevenue) : '—',
      change: summary ? `${summary.revenueGrowth >= 0 ? '+' : ''}${summary.revenueGrowth}%` : '—',
      icon: DollarSign,
      color: 'from-green-500 to-emerald-500',
      gradient: 'bg-gradient-to-br from-green-500/20 to-emerald-500/20',
      border: 'border-green-500/50',
    },
    {
      label: 'Đơn hàng',
      value: summary ? summary.totalOrders.toString() : '—',
      change: summary ? `${summary.ordersGrowth >= 0 ? '+' : ''}${summary.ordersGrowth}%` : '—',
      icon: ShoppingCart,
      color: 'from-blue-500 to-cyan-500',
      gradient: 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20',
      border: 'border-blue-500/50',
    },
    {
      label: 'Khách hàng',
      value: summary ? summary.uniqueCustomers.toString() : '—',
      change: summary ? `TB: ${formatRevenueShort(summary.avgOrderValue)}/đơn` : '—',
      icon: Users,
      color: 'from-purple-500 to-pink-500',
      gradient: 'bg-gradient-to-br from-purple-500/20 to-pink-500/20',
      border: 'border-purple-500/50',
    },
    {
      label: 'Tăng trưởng doanh thu',
      value: summary ? `${summary.revenueGrowth >= 0 ? '+' : ''}${summary.revenueGrowth}%` : '—',
      change: timeRange === 'week' ? 'So với tuần trước' : timeRange === 'year' ? 'So với năm trước' : 'So với tháng trước',
      icon: TrendingUp,
      color: 'from-orange-500 to-yellow-500',
      gradient: 'bg-gradient-to-br from-orange-500/20 to-yellow-500/20',
      border: 'border-orange-500/50',
    },
  ];

  const formatCurrency = (value: number) => {
    return formatRevenueShort(value);
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
        initial={a && { y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative border-b border-border bg-background/40 backdrop-blur-xl sticky top-0 z-10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.button
                onClick={onBack}
                whileHover={{ scale: 1.05, x: -5 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 bg-card border border-border rounded-lg hover:border-red-600/50 transition-all group"
              >
                <ArrowLeft className="w-5 h-5 text-muted-foreground group-hover:text-red-600 transition-colors" />
              </motion.button>
              
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-800 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-foreground" />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-transparent bg-gradient-to-r from-white via-gray-200 to-green-600 bg-clip-text">
                    THỐNG KÊ & BÁO CÁO
                  </h1>
                  <p className="text-sm text-muted-foreground">Phân tích doanh thu và hiệu suất</p>
                </div>
              </div>
            </div>

            {/* Time Range Selector */}
            <div className="hidden md:flex items-center gap-2 bg-card/50 backdrop-blur-xl border border-border rounded-lg p-1">
              {(['week', 'month', 'year'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    timeRange === range
                      ? 'bg-gradient-to-r from-green-600 to-green-700 text-foreground shadow-lg shadow-green-600/25'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {range === 'week' ? 'Tuần' : range === 'month' ? 'Tháng' : 'Năm'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
          </div>
        )}

        {!isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {summaryStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={a && { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="group relative"
            >
              <div className={`relative bg-card/50 backdrop-blur-xl border ${stat.border} rounded-2xl p-6 overflow-hidden`}>
                <div className={`absolute inset-0 ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                
                <div className="relative">
                  <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
                    <stat.icon className="w-6 h-6 text-foreground" />
                  </div>
                  
                  <p className="text-3xl font-black text-foreground mb-1">{stat.value}</p>
                  <p className="text-muted-foreground text-sm mb-2">{stat.label}</p>
                  <p className={`text-sm font-semibold ${stat.change.startsWith('+') ? 'text-green-500' : 'text-muted-foreground'}`}>
                    {stat.change}
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
            initial={a && { opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card/50 backdrop-blur-xl border border-border rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-foreground mb-1">Doanh thu theo thời gian</h3>
                <p className="text-sm text-muted-foreground">
                  {timeRange === 'week' ? '7 ngày gần nhất' : timeRange === 'year' ? '12 tháng gần nhất' : '30 ngày gần nhất'}
                </p>
              </div>
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
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
                  formatter={(value: number) => [formatFullCurrency(value), 'Doanh thu']}
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
          </motion.div>

          {/* Top Products Chart */}
          <motion.div
            initial={a && { opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-card/50 backdrop-blur-xl border border-border rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-foreground mb-1">Sản phẩm bán chạy</h3>
                <p className="text-sm text-muted-foreground">Top 5 sản phẩm theo doanh số</p>
              </div>
              <ShoppingCart className="w-6 h-6 text-blue-600" />
            </div>
            
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProductsData}>
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
                <Legend />
                <Bar dataKey="sales" name="Đã bán" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Category Distribution & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Distribution */}
          <motion.div
            initial={a && { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-card/50 backdrop-blur-xl border border-border rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-foreground mb-1">Phân bố danh mục</h3>
                <p className="text-sm text-muted-foreground">Tỷ lệ bán hàng theo danh mục</p>
              </div>
            </div>
            
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
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

            {/* Legend */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              {categoryData.map((cat) => (
                <div key={cat.name} className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: cat.color }}></div>
                  <span className="text-sm text-muted-foreground">{cat.name}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Performance Metrics */}
          <motion.div
            initial={a && { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-card/50 backdrop-blur-xl border border-border rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-foreground mb-1">Chỉ số hiệu suất</h3>
                <p className="text-sm text-muted-foreground">Các chỉ số quan trọng</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-muted rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-muted-foreground text-sm">Giá trị đơn hàng trung bình</span>
                  <span className="text-foreground font-bold">
                    {summary ? formatRevenueShort(summary.avgOrderValue) : '—'}
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <motion.div
                    initial={a && { width: 0 }}
                    animate={{ width: `${avgOrderPercent}%` }}
                    transition={{ duration: 1, delay: 0.8 }}
                    className="bg-gradient-to-r from-green-600 to-green-500 h-2 rounded-full"
                  ></motion.div>
                </div>
              </div>

              <div className="bg-muted rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-muted-foreground text-sm">Tăng trưởng đơn hàng</span>
                  <span className="text-foreground font-bold">
                    {summary ? `${summary.ordersGrowth >= 0 ? '+' : ''}${summary.ordersGrowth}%` : '—'}
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <motion.div
                    initial={a && { width: 0 }}
                    animate={{ width: `${summary ? Math.min(100, Math.max(5, Math.abs(summary.ordersGrowth))) : 0}%` }}
                    transition={{ duration: 1, delay: 0.9 }}
                    className="bg-gradient-to-r from-blue-600 to-blue-500 h-2 rounded-full"
                  ></motion.div>
                </div>
              </div>

              <div className="bg-muted rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-muted-foreground text-sm">Tăng trưởng doanh thu</span>
                  <span className="text-foreground font-bold">
                    {summary ? `${summary.revenueGrowth >= 0 ? '+' : ''}${summary.revenueGrowth}%` : '—'}
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <motion.div
                    initial={a && { width: 0 }}
                    animate={{ width: `${summary ? Math.min(100, Math.max(5, Math.abs(summary.revenueGrowth))) : 0}%` }}
                    transition={{ duration: 1, delay: 1.0 }}
                    className="bg-gradient-to-r from-purple-600 to-purple-500 h-2 rounded-full"
                  ></motion.div>
                </div>
              </div>

              <div className="bg-muted rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-muted-foreground text-sm">Đánh giá tích cực</span>
                  <span className="text-foreground font-bold">
                    {summary ? `${summary.positiveReviewRate}%` : '—'}
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <motion.div
                    initial={a && { width: 0 }}
                    animate={{ width: `${summary?.positiveReviewRate || 0}%` }}
                    transition={{ duration: 1, delay: 1.1 }}
                    className="bg-gradient-to-r from-orange-600 to-orange-500 h-2 rounded-full"
                  ></motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
        )}
      </div>
    </div>
  );
}

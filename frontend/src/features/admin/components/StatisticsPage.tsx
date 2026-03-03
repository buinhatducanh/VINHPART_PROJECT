import { motion } from 'motion/react';
import { TrendingUp, DollarSign, ShoppingCart, Users, ArrowLeft, Calendar } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useState } from 'react';

interface StatisticsPageProps {
  onBack: () => void;
}

export function StatisticsPage({ onBack }: StatisticsPageProps) {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

  // Mock data - Doanh thu theo thời gian
  const revenueData = [
    { name: 'T1', revenue: 12500000, orders: 45 },
    { name: 'T2', revenue: 15200000, orders: 52 },
    { name: 'T3', revenue: 18700000, orders: 68 },
    { name: 'T4', revenue: 14300000, orders: 48 },
    { name: 'T5', revenue: 22100000, orders: 78 },
    { name: 'T6', revenue: 25800000, orders: 89 },
    { name: 'T7', revenue: 19500000, orders: 65 },
  ];

  // Mock data - Sản phẩm bán chạy
  const topProductsData = [
    { name: 'Lọc gió động cơ', sales: 156, revenue: 23400000 },
    { name: 'Má phanh', sales: 142, revenue: 21300000 },
    { name: 'Dầu nhớt', sales: 128, revenue: 19200000 },
    { name: 'Lốp xe', sales: 98, revenue: 29400000 },
    { name: 'Ắc quy', sales: 87, revenue: 17400000 },
  ];

  // Mock data - Phân bố danh mục
  const categoryData = [
    { name: 'Động cơ', value: 35, color: '#3b82f6' },
    { name: 'Phanh', value: 25, color: '#8b5cf6' },
    { name: 'Lọc & BĐ', value: 20, color: '#f59e0b' },
    { name: 'Điện', value: 12, color: '#10b981' },
    { name: 'Khác', value: 8, color: '#ef4444' },
  ];

  // Summary Stats
  const summaryStats = [
    {
      label: 'Tổng doanh thu',
      value: '128.1M',
      change: '+12.5%',
      icon: DollarSign,
      color: 'from-green-500 to-emerald-500',
      gradient: 'bg-gradient-to-br from-green-500/20 to-emerald-500/20',
      border: 'border-green-500/50',
    },
    {
      label: 'Đơn hàng',
      value: '445',
      change: '+8.2%',
      icon: ShoppingCart,
      color: 'from-blue-500 to-cyan-500',
      gradient: 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20',
      border: 'border-blue-500/50',
    },
    {
      label: 'Khách hàng',
      value: '289',
      change: '+15.3%',
      icon: Users,
      color: 'from-purple-500 to-pink-500',
      gradient: 'bg-gradient-to-br from-purple-500/20 to-pink-500/20',
      border: 'border-purple-500/50',
    },
    {
      label: 'Tăng trưởng',
      value: '+18.7%',
      change: 'So với tháng trước',
      icon: TrendingUp,
      color: 'from-orange-500 to-yellow-500',
      gradient: 'bg-gradient-to-br from-orange-500/20 to-yellow-500/20',
      border: 'border-orange-500/50',
    },
  ];

  const formatCurrency = (value: number) => {
    return `${(value / 1000000).toFixed(1)}M`;
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

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {summaryStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
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
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card/50 backdrop-blur-xl border border-border rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-foreground mb-1">Doanh thu theo thời gian</h3>
                <p className="text-sm text-muted-foreground">Biểu đồ doanh thu 7 ngày gần nhất</p>
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
          </motion.div>

          {/* Top Products Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
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
            initial={{ opacity: 0, y: 20 }}
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
            initial={{ opacity: 0, y: 20 }}
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
              {/* Metric Item */}
              <div className="bg-muted rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-muted-foreground text-sm">Giá trị đơn hàng trung bình</span>
                  <span className="text-foreground font-bold">287.9K</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '72%' }}
                    transition={{ duration: 1, delay: 0.8 }}
                    className="bg-gradient-to-r from-green-600 to-green-500 h-2 rounded-full"
                  ></motion.div>
                </div>
              </div>

              <div className="bg-muted rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-muted-foreground text-sm">Tỷ lệ chuyển đổi</span>
                  <span className="text-foreground font-bold">4.3%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '43%' }}
                    transition={{ duration: 1, delay: 0.9 }}
                    className="bg-gradient-to-r from-blue-600 to-blue-500 h-2 rounded-full"
                  ></motion.div>
                </div>
              </div>

              <div className="bg-muted rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-muted-foreground text-sm">Khách hàng quay lại</span>
                  <span className="text-foreground font-bold">68%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '68%' }}
                    transition={{ duration: 1, delay: 1.0 }}
                    className="bg-gradient-to-r from-purple-600 to-purple-500 h-2 rounded-full"
                  ></motion.div>
                </div>
              </div>

              <div className="bg-muted rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-muted-foreground text-sm">Đánh giá tích cực</span>
                  <span className="text-foreground font-bold">94%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '94%' }}
                    transition={{ duration: 1, delay: 1.1 }}
                    className="bg-gradient-to-r from-orange-600 to-orange-500 h-2 rounded-full"
                  ></motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

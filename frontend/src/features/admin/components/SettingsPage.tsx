import { motion } from 'motion/react';
import { Settings, ArrowLeft, Bell, Lock, Palette, Globe, Mail, Save } from 'lucide-react';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { useSettings } from '@/shared/hooks/useSettings';

interface SettingsPageProps {
  onBack: () => void;
}

export function SettingsPage({ onBack }: SettingsPageProps) {
  const { siteName: persistedSiteName, setSiteName: savePersistedSiteName } = useSettings();
  const [settings, setSettings] = useState({
    siteName: persistedSiteName,
    email: 'admin@vinpart.vn',
    enableNotifications: true,
    emailOnNewOrder: true,
    emailOnLowStock: true,
    lowStockThreshold: 5,
    currency: 'VND',
    language: 'vi',
    theme: 'dark',
  });

  // Keep local state in sync if persistedSiteName changes elsewhere
  useEffect(() => {
    setSettings(prev => ({ ...prev, siteName: persistedSiteName }));
  }, [persistedSiteName]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = () => {
    console.log('Lưu cài đặt:', settings);
    savePersistedSiteName(settings.siteName);
    toast.success('Cài đặt đã được lưu thành công!');
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
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
              <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-orange-800 rounded-xl flex items-center justify-center">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-2xl font-black text-transparent bg-gradient-to-r from-white via-gray-200 to-orange-600 bg-clip-text">
                  CÀI ĐẶT HỆ THỐNG
                </h1>
                <p className="text-sm text-gray-500">Quản lý cấu hình cửa hàng</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* General Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <Globe className="w-6 h-6 text-orange-600" />
              <h3 className="text-xl font-bold text-white">Cài đặt chung</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Tên cửa hàng
                </label>
                <input
                  type="text"
                  name="siteName"
                  value={settings.siteName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-600/50 focus:ring-2 focus:ring-orange-600/20 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Ngôn ngữ
                  </label>
                  <select
                    name="language"
                    value={settings.language}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-600/50 focus:ring-2 focus:ring-orange-600/20 transition-all"
                  >
                    <option value="vi">Tiếng Việt</option>
                    <option value="en">English</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Đơn vị tiền tệ
                  </label>
                  <select
                    name="currency"
                    value={settings.currency}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-600/50 focus:ring-2 focus:ring-orange-600/20 transition-all"
                  >
                    <option value="VND">VNĐ (Vietnamese Dong)</option>
                    <option value="USD">USD (US Dollar)</option>
                  </select>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Email Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <Mail className="w-6 h-6 text-orange-600" />
              <h3 className="text-xl font-bold text-white">Cài đặt Email</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Email quản trị
                </label>
                <input
                  type="email"
                  name="email"
                  value={settings.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-600/50 focus:ring-2 focus:ring-orange-600/20 transition-all"
                />
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 bg-gray-800/50 border border-gray-700 rounded-lg cursor-pointer hover:bg-gray-800 transition-all">
                  <input
                    type="checkbox"
                    name="emailOnNewOrder"
                    checked={settings.emailOnNewOrder}
                    onChange={handleInputChange}
                    className="w-5 h-5 accent-orange-600"
                  />
                  <div>
                    <p className="text-white font-medium">Thông báo đơn hàng mới</p>
                    <p className="text-sm text-gray-500">Gửi email khi có đơn hàng mới</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 bg-gray-800/50 border border-gray-700 rounded-lg cursor-pointer hover:bg-gray-800 transition-all">
                  <input
                    type="checkbox"
                    name="emailOnLowStock"
                    checked={settings.emailOnLowStock}
                    onChange={handleInputChange}
                    className="w-5 h-5 accent-orange-600"
                  />
                  <div>
                    <p className="text-white font-medium">Cảnh báo tồn kho thấp</p>
                    <p className="text-sm text-gray-500">Gửi email khi sản phẩm sắp hết hàng</p>
                  </div>
                </label>
              </div>
            </div>
          </motion.div>

          {/* Notifications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <Bell className="w-6 h-6 text-orange-600" />
              <h3 className="text-xl font-bold text-white">Thông báo</h3>
            </div>

            <div className="space-y-4">
              <label className="flex items-center gap-3 p-4 bg-gray-800/50 border border-gray-700 rounded-lg cursor-pointer hover:bg-gray-800 transition-all">
                <input
                  type="checkbox"
                  name="enableNotifications"
                  checked={settings.enableNotifications}
                  onChange={handleInputChange}
                  className="w-5 h-5 accent-orange-600"
                />
                <div>
                  <p className="text-white font-medium">Bật thông báo</p>
                  <p className="text-sm text-gray-500">Nhận thông báo về hoạt động của cửa hàng</p>
                </div>
              </label>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Ngưỡng cảnh báo tồn kho
                </label>
                <input
                  type="number"
                  name="lowStockThreshold"
                  value={settings.lowStockThreshold}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-600/50 focus:ring-2 focus:ring-orange-600/20 transition-all"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Cảnh báo khi số lượng sản phẩm ≤ giá trị này
                </p>
              </div>
            </div>
          </motion.div>

          {/* Theme Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <Palette className="w-6 h-6 text-orange-600" />
              <h3 className="text-xl font-bold text-white">Giao diện</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Theme
                </label>
                <select
                  name="theme"
                  value={settings.theme}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-600/50 focus:ring-2 focus:ring-orange-600/20 transition-all"
                >
                  <option value="dark">Tối (Dark)</option>
                  <option value="light">Sáng (Light)</option>
                  <option value="auto">Tự động (Auto)</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Security */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <Lock className="w-6 h-6 text-orange-600" />
              <h3 className="text-xl font-bold text-white">Bảo mật</h3>
            </div>

            <div className="space-y-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full px-6 py-3 bg-gray-800 border border-gray-700 text-white rounded-lg hover:bg-gray-700 transition-all text-left"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">Đổi mật khẩu</p>
                    <p className="text-sm text-gray-500">Cập nhật mật khẩu đăng nhập</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </motion.button>
            </div>
          </motion.div>

          {/* Save Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex justify-end gap-4 pt-4"
          >
            <motion.button
              onClick={onBack}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 bg-gray-800 border border-gray-700 text-white rounded-lg hover:bg-gray-700 transition-all"
            >
              Hủy bỏ
            </motion.button>

            <motion.button
              onClick={handleSave}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg hover:from-orange-700 hover:to-orange-800 transition-all shadow-lg shadow-orange-600/25 flex items-center gap-2"
            >
              <Save className="w-5 h-5" />
              Lưu thay đổi
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

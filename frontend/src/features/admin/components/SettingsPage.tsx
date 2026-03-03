import { motion } from 'motion/react';
import { Settings, ArrowLeft, Bell, Lock, Palette, Globe, Mail, Save } from 'lucide-react';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { useSettings } from '@/shared/hooks/useSettings';
import { useI18n } from '@/shared/lib/i18n';

interface SettingsPageProps {
  onBack: () => void;
}

export function SettingsPage({ onBack }: SettingsPageProps) {
  const { t, setLanguage } = useI18n();
  const { siteName: persistedSiteName, setSiteName: savePersistedSiteName, language: persistedLanguage, theme: persistedTheme, setTheme: savePersistedTheme } = useSettings();
  
  const [settings, setSettings] = useState({
    siteName: persistedSiteName,
    email: 'admin@vinpart.vn',
    enableNotifications: true,
    emailOnNewOrder: true,
    emailOnLowStock: true,
    lowStockThreshold: 5,
    currency: 'VND',
    language: persistedLanguage,
    theme: persistedTheme,
  });

  // Keep local state in sync if persisted changes elsewhere
  useEffect(() => {
    setSettings(prev => ({ 
      ...prev, 
      siteName: persistedSiteName,
      language: persistedLanguage,
      theme: persistedTheme
    }));
  }, [persistedSiteName, persistedLanguage, persistedTheme]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = () => {
    // console.log('Save settings:', settings);
    savePersistedSiteName(settings.siteName);
    setLanguage(settings.language as any);
    savePersistedTheme(settings.theme);
    toast.success(t('settings.success'));
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
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
              <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-orange-800 rounded-xl flex items-center justify-center">
                <Settings className="w-6 h-6 text-foreground" />
              </div>
              <div className="text-left">
                <h1 className="text-2xl font-black text-transparent bg-gradient-to-r from-white via-gray-200 to-orange-600 bg-clip-text">
                  {t('settings.title')}
                </h1>
                <p className="text-sm text-muted-foreground">{t('settings.subtitle')}</p>
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
            className="bg-card/50 backdrop-blur-xl border border-border rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <Globe className="w-6 h-6 text-orange-600" />
              <h3 className="text-xl font-bold text-foreground">{t('settings.general')}</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  {t('settings.siteName')}
                </label>
                <input
                  type="text"
                  name="siteName"
                  value={settings.siteName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:border-orange-600/50 focus:ring-2 focus:ring-orange-600/20 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    {t('settings.language')}
                  </label>
                  <select
                    name="language"
                    value={settings.language}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:border-orange-600/50 focus:ring-2 focus:ring-orange-600/20 transition-all"
                  >
                    <option value="vi">Tiếng Việt</option>
                    <option value="en">English</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    {t('settings.currency')}
                  </label>
                  <select
                    name="currency"
                    value={settings.currency}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:border-orange-600/50 focus:ring-2 focus:ring-orange-600/20 transition-all"
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
            className="bg-card/50 backdrop-blur-xl border border-border rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <Mail className="w-6 h-6 text-orange-600" />
              <h3 className="text-xl font-bold text-foreground">{t('settings.emailSettings')}</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  {t('settings.adminEmail')}
                </label>
                <input
                  type="email"
                  name="email"
                  value={settings.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:border-orange-600/50 focus:ring-2 focus:ring-orange-600/20 transition-all"
                />
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 bg-muted border border-border rounded-lg cursor-pointer hover:bg-muted transition-all">
                  <input
                    type="checkbox"
                    name="emailOnNewOrder"
                    checked={settings.emailOnNewOrder}
                    onChange={handleInputChange}
                    className="w-5 h-5 accent-orange-600"
                  />
                  <div>
                    <p className="text-foreground font-medium">{t('settings.orderNotifications')}</p>
                    <p className="text-sm text-muted-foreground">{t('settings.orderNotificationsDesc')}</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 bg-muted border border-border rounded-lg cursor-pointer hover:bg-muted transition-all">
                  <input
                    type="checkbox"
                    name="emailOnLowStock"
                    checked={settings.emailOnLowStock}
                    onChange={handleInputChange}
                    className="w-5 h-5 accent-orange-600"
                  />
                  <div>
                    <p className="text-foreground font-medium">{t('settings.lowStockNotifications')}</p>
                    <p className="text-sm text-muted-foreground">{t('settings.lowStockNotificationsDesc')}</p>
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
            className="bg-card/50 backdrop-blur-xl border border-border rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <Bell className="w-6 h-6 text-orange-600" />
              <h3 className="text-xl font-bold text-foreground">{t('settings.notifications')}</h3>
            </div>

            <div className="space-y-4">
              <label className="flex items-center gap-3 p-4 bg-muted border border-border rounded-lg cursor-pointer hover:bg-muted transition-all">
                <input
                  type="checkbox"
                  name="enableNotifications"
                  checked={settings.enableNotifications}
                  onChange={handleInputChange}
                  className="w-5 h-5 accent-orange-600"
                />
                <div>
                  <p className="text-foreground font-medium">{t('settings.enableNotifications')}</p>
                  <p className="text-sm text-muted-foreground">{t('settings.enableNotificationsDesc')}</p>
                </div>
              </label>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  {t('settings.lowStockThreshold')}
                </label>
                <input
                  type="number"
                  name="lowStockThreshold"
                  value={settings.lowStockThreshold}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:border-orange-600/50 focus:ring-2 focus:ring-orange-600/20 transition-all"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  {t('settings.lowStockThresholdDesc')}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Theme Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card/50 backdrop-blur-xl border border-border rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <Palette className="w-6 h-6 text-orange-600" />
              <h3 className="text-xl font-bold text-foreground">{t('settings.appearance')}</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  {t('settings.theme')}
                </label>
                <select
                  name="theme"
                  value={settings.theme}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:border-orange-600/50 focus:ring-2 focus:ring-orange-600/20 transition-all"
                >
                  <option value="dark">{t('settings.themeDark')}</option>
                  <option value="light">{t('settings.themeLight')}</option>
                  <option value="auto">{t('settings.themeAuto')}</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Security */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card/50 backdrop-blur-xl border border-border rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <Lock className="w-6 h-6 text-orange-600" />
              <h3 className="text-xl font-bold text-foreground">{t('settings.security')}</h3>
            </div>

            <div className="space-y-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full px-6 py-3 bg-muted border border-border text-foreground rounded-lg hover:bg-muted/80 transition-all text-left"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{t('settings.changePassword')}</p>
                    <p className="text-sm text-muted-foreground">{t('settings.changePasswordDesc')}</p>
                  </div>
                  <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              className="px-6 py-3 bg-muted border border-border text-foreground rounded-lg hover:bg-muted/80 transition-all"
            >
              {t('common.cancel')}
            </motion.button>

            <motion.button
              onClick={handleSave}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-foreground rounded-lg hover:from-orange-700 hover:to-orange-800 transition-all shadow-lg shadow-orange-600/25 flex items-center gap-2"
            >
              <Save className="w-5 h-5" />
              {t('common.save')}
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

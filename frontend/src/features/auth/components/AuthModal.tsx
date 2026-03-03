import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User as UserIcon, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useI18n } from '@/shared/lib/i18n';

import { User } from '@/shared/types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
  onLogin: (user: User) => void;
}

export function AuthModal({ isOpen, onClose, initialMode = 'login', onLogin }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useI18n();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (mode === 'signup' && formData.password !== formData.confirmPassword) {
      setError(t('auth.passwordMismatch'));
      setLoading(false);
      return;
    }

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('common.error'));
      }

      onLogin(data); // data is User object from backend
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[90]"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-[100] p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-red-600/20 to-purple-600/20 rounded-2xl blur-2xl" />

              {/* Modal content */}
              <div className="relative bg-gradient-to-br from-gray-900 via-gray-900 to-black border border-border rounded-2xl shadow-2xl overflow-hidden">
                {/* Animated background lines */}
                <div className="absolute inset-0 opacity-10">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute h-px bg-gradient-to-r from-transparent via-red-600 to-transparent"
                      initial={{ x: '-100%', y: i * 100 }}
                      animate={{ x: '200%' }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: i * 0.5,
                        ease: 'linear'
                      }}
                    />
                  ))}
                </div>

                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 hover:bg-muted rounded-lg transition-colors z-10"
                >
                  <X className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
                </button>

                {/* Content */}
                <div className="relative p-8">
                  {/* Header */}
                  <div className="text-center mb-8">
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.2, type: 'spring' }}
                      className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-red-600 to-red-800 rounded-xl flex items-center justify-center shadow-xl shadow-red-600/50"
                    >
                      <UserIcon className="w-8 h-8 text-foreground" />
                    </motion.div>

                    <h2 className="text-2xl font-black text-foreground mb-2">
                      {mode === 'login' ? t('auth.login') : t('auth.signup')}
                    </h2>
                    {error && (
                      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4 text-center">
                        <p className="text-red-500 text-sm font-medium">{error}</p>
                      </div>
                    )}
                    <p className="text-muted-foreground text-sm">
                      {mode === 'login'
                        ? t('auth.loginSubtitle')
                        : t('auth.signupSubtitle')}
                    </p>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name field - only for signup */}
                    {mode === 'signup' && (
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <label className="block text-sm font-bold text-muted-foreground mb-2">
                          {t('checkout.fullName')}
                        </label>
                        <div className="relative">
                          <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-muted border border-border rounded-lg pl-12 pr-4 py-3 text-foreground placeholder-gray-500 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all"
                            placeholder={t('checkout.fullNamePlaceholder')}
                            required
                          />
                        </div>
                      </motion.div>
                    )}

                    {/* Email field */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: mode === 'signup' ? 0.2 : 0.1 }}
                    >
                      <label className="block text-sm font-bold text-muted-foreground mb-2">
                        {t('auth.email')}
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full bg-muted border border-border rounded-lg pl-12 pr-4 py-3 text-foreground placeholder-gray-500 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all"
                          placeholder="email@example.com"
                          required
                        />
                      </div>
                    </motion.div>

                    {/* Password field */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: mode === 'signup' ? 0.3 : 0.2 }}
                    >
                      <label className="block text-sm font-bold text-muted-foreground mb-2">
                        {t('auth.password')}
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="w-full bg-muted border border-border rounded-lg pl-12 pr-12 py-3 text-foreground placeholder-gray-500 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all"
                          placeholder="••••••••"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-muted-foreground transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </motion.div>

                    {/* Confirm Password - only for signup */}
                    {mode === 'signup' && (
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        <label className="block text-sm font-bold text-muted-foreground mb-2">
                          {t('auth.confirmPassword')}
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            className="w-full bg-muted border border-border rounded-lg pl-12 pr-4 py-3 text-foreground placeholder-gray-500 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all"
                            placeholder="••••••••"
                            required
                          />
                        </div>
                      </motion.div>
                    )}

                    {/* Submit button */}
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-foreground font-bold py-3 rounded-lg transition-all shadow-lg shadow-red-600/30 hover:shadow-red-600/50 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? t('common.processing') : (mode === 'login' ? t('auth.login') : t('auth.signup'))}
                    </motion.button>
                  </form>

                  {/* Toggle mode */}
                  <div className="mt-6 text-center">
                    <button
                      onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                      className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                    >
                      {mode === 'login'
                        ? t('auth.noAccount')
                        : t('auth.hasAccount')}
                      <span className="text-red-600 font-bold ml-1">
                        {mode === 'login' ? t('auth.signup') : t('auth.login')}
                      </span>
                    </button>
                  </div>

                  {/* Divider */}
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="px-2 bg-card text-muted-foreground uppercase">{t('auth.or')}</span>
                    </div>
                  </div>

                  {/* Social login */}
                  <div className="grid grid-cols-2 gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center justify-center gap-2 bg-muted hover:bg-muted/80 text-foreground py-2.5 rounded-lg transition-all border border-border"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      <span className="text-sm font-medium">Google</span>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center justify-center gap-2 bg-muted hover:bg-muted/80 text-foreground py-2.5 rounded-lg transition-all border border-border"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                      <span className="text-sm font-medium">Facebook</span>
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}

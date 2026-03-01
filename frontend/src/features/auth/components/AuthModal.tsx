import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User as UserIcon, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { GoogleLogin } from '@react-oauth/google';

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
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (mode === 'signup' && formData.password !== formData.confirmPassword) {
      setError('Mật khẩu nhập lại không khớp');
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
        throw new Error(data.error || 'Đã có lỗi xảy ra');
      }

      onLogin(data);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setGoogleLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          credential: credentialResponse.credential,
          clientId: credentialResponse.clientId
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Đăng nhập Google thất bại');
      }

      onLogin(data);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Đăng nhập Google thất bại. Vui lòng thử lại.');
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
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[90]"
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
              <div className="relative bg-gradient-to-br from-gray-900 via-gray-900 to-black border border-gray-800 rounded-2xl shadow-2xl overflow-hidden">
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
                  className="absolute top-4 right-4 p-2 hover:bg-gray-800 rounded-lg transition-colors z-10"
                >
                  <X className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
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
                      <UserIcon className="w-8 h-8 text-white" />
                    </motion.div>

                    <h2 className="text-2xl font-black text-white mb-2">
                      {mode === 'login' ? 'Đăng Nhập' : 'Đăng Ký'}
                    </h2>
                    {error && (
                      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4 text-center">
                        <p className="text-red-500 text-sm font-medium">{error}</p>
                      </div>
                    )}
                    <p className="text-gray-400 text-sm">
                      {mode === 'login'
                        ? 'Chào mừng bạn quay lại VINPART'
                        : 'Tạo tài khoản để trải nghiệm đầy đủ'}
                    </p>
                  </div>

                  {/* Google Login Button */}
                  <div className="mb-6">
                    <div className="flex justify-center [&_iframe]:!rounded-lg">
                      <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                        theme="filled_black"
                        shape="rectangular"
                        size="large"
                        width="360"
                        text={mode === 'login' ? 'signin_with' : 'signup_with'}
                        locale="vi"
                      />
                    </div>
                    {googleLoading && (
                      <div className="mt-3 text-center text-gray-400 text-sm">
                        <div className="animate-spin w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full mx-auto mb-1"></div>
                        Đang xác thực với Google...
                      </div>
                    )}
                  </div>

                  {/* Divider */}
                  <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-800"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="px-2 bg-gray-900 text-gray-500">HOẶC ĐĂNG NHẬP VỚI EMAIL</span>
                    </div>
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
                        <label className="block text-sm font-bold text-gray-300 mb-2">
                          Họ và tên
                        </label>
                        <div className="relative">
                          <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-gray-800/50 border border-gray-700 rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all"
                            placeholder="Nguyễn Văn A"
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
                      <label className="block text-sm font-bold text-gray-300 mb-2">
                        Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full bg-gray-800/50 border border-gray-700 rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all"
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
                      <label className="block text-sm font-bold text-gray-300 mb-2">
                        Mật khẩu
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="w-full bg-gray-800/50 border border-gray-700 rounded-lg pl-12 pr-12 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all"
                          placeholder="••••••••"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
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
                        <label className="block text-sm font-bold text-gray-300 mb-2">
                          Xác nhận mật khẩu
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            className="w-full bg-gray-800/50 border border-gray-700 rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all"
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
                      className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-red-600/30 hover:shadow-red-600/50 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Đang xử lý...' : (mode === 'login' ? 'Đăng nhập' : 'Đăng ký')}
                    </motion.button>
                  </form>

                  {/* Toggle mode */}
                  <div className="mt-6 text-center">
                    <button
                      onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                      className="text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      {mode === 'login'
                        ? 'Chưa có tài khoản? '
                        : 'Đã có tài khoản? '}
                      <span className="text-red-600 font-bold">
                        {mode === 'login' ? 'Đăng ký ngay' : 'Đăng nhập'}
                      </span>
                    </button>
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

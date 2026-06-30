// frontend/src/features/auth/components/AuthModal.tsx
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User as UserIcon, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useI18n } from '@/shared/lib/i18n';
import { toast } from 'sonner';
import { User } from '@/shared/types';
import { API_BASE_URL } from '@/lib/api';
import { GoogleLoginButton } from './GoogleLoginButton';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup' | 'forgot' | 'reset';
  onLogin: (user: User) => void;
  resetToken?: string;
}

type Mode = 'login' | 'signup' | 'forgot' | 'reset' | 'verify';

export function AuthModal({ isOpen, onClose, initialMode = 'login', onLogin, resetToken = '' }: AuthModalProps) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    currentPassword: '',
  });
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const { t } = useI18n();

  useEffect(() => {
    if (!isOpen) {
      setMode(initialMode);
      setFormData({ name: '', email: '', password: '', confirmPassword: '', currentPassword: '' });
      setVerificationSent(false);
    }
  }, [isOpen, initialMode]);

  // Nếu có resetToken và mode là reset, tự động mở modal reset
  useEffect(() => {
    if (resetToken && isOpen) {
      setMode('reset');
    }
  }, [resetToken, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'signup') {
        await handleRegister();
      } else if (mode === 'login') {
        await handleLogin();
      } else if (mode === 'forgot') {
        await handleForgotPassword();
      } else if (mode === 'reset') {
        await handleResetPassword();
      }
    } catch (error) {
      // Error handled in individual functions
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (formData.password !== formData.confirmPassword) {
      toast.error(t('auth.passwordMismatch'));
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Registration failed');

      setVerificationEmail(formData.email);
      setVerificationSent(true);
      toast.success('Registration successful! Please check your email to verify.');
    } catch (err: any) {
      toast.error(err.message || 'Registration failed');
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();
      
      // Xử lý các status code cụ thể
      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Invalid email or password. Please try again.');
        } else if (response.status === 423) {
          toast.error('Account is locked. Please try again after 3 minutes.');
        } else if (response.status === 429) {
          toast.error('Too many attempts. Please try again after 3 minutes.');
        } else if (response.status === 403) {
          toast.error('Please verify your email before logging in.');
        } else {
          toast.error(data.error || 'Login failed');
        }
        setLoading(false);
        return;
      }

      // Save tokens
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('vinhpart_user', JSON.stringify(data.user));

      onLogin(data.user);
      toast.success('Login successful!');
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Login failed');
    }
  };

  const handleForgotPassword = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to send reset link');

      toast.success('Reset link sent to your email!');
      setMode('login');
      toast.info('Please check your email for the reset link.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to send reset link');
    }
  };

  const handleResetPassword = async () => {
    if (formData.password !== formData.confirmPassword) {
      toast.error(t('auth.passwordMismatch'));
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: resetToken,
          newPassword: formData.password,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Password reset failed');

      toast.success('Password reset successfully! Please login.');
      setMode('login');
      setFormData({ ...formData, password: '', confirmPassword: '' });
    } catch (err: any) {
      toast.error(err.message || 'Password reset failed');
    }
  };

  // Render verification screen
  if (verificationSent) {
    return createPortal(
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[90]"
            />
            <div className="fixed inset-0 flex items-center justify-center z-[100] p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative w-full max-w-md bg-gradient-to-br from-gray-900 via-gray-900 to-black border border-border rounded-2xl shadow-2xl overflow-hidden p-8"
              >
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 hover:bg-muted rounded-lg transition-colors z-10"
                >
                  <X className="w-5 h-5 text-muted-foreground hover:text-foreground" />
                </button>

                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring' }}
                    className="w-20 h-20 mx-auto mb-4 bg-green-600 rounded-full flex items-center justify-center"
                  >
                    <CheckCircle className="w-10 h-10 text-white" />
                  </motion.div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Verify Your Email</h2>
                  <p className="text-muted-foreground mb-4">
                    We've sent a verification link to <br />
                    <span className="text-foreground font-medium">{verificationEmail}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Please check your email and click the verification link to complete registration.
                  </p>
                  <button
                    onClick={() => setVerificationSent(false)}
                    className="mt-6 text-red-600 hover:text-red-700 font-medium transition-colors"
                  >
                    Back to login
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>,
      document.body
    );
  }

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[90]"
          />

          <div className="fixed inset-0 flex items-center justify-center z-[100] p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-red-600/20 to-purple-600/20 rounded-2xl blur-2xl" />

              <div className="relative bg-gradient-to-br from-gray-900 via-gray-900 to-black border border-border rounded-2xl shadow-2xl overflow-hidden">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 hover:bg-muted rounded-lg transition-colors z-10"
                >
                  <X className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
                </button>

                <div className="relative p-8">
                  <div className="text-center mb-8">
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.2, type: 'spring' }}
                      className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-red-600 to-red-800 rounded-xl flex items-center justify-center shadow-xl shadow-red-600/50"
                    >
                      {mode === 'login' && <UserIcon className="w-8 h-8 text-white" />}
                      {mode === 'signup' && <UserIcon className="w-8 h-8 text-white" />}
                      {mode === 'forgot' && <Lock className="w-8 h-8 text-white" />}
                      {mode === 'reset' && <Lock className="w-8 h-8 text-white" />}
                    </motion.div>

                    <h2 className="text-2xl font-black text-foreground mb-2">
                      {mode === 'login' && 'Đăng nhập'}
                      {mode === 'signup' && 'Đăng ký'}
                      {mode === 'forgot' && 'Quên mật khẩu'}
                      {mode === 'reset' && 'Đặt lại mật khẩu'}
                    </h2>
                    <p className="text-muted-foreground text-sm">
                      {mode === 'login' && 'Chào mừng bạn quay lại AutoParts'}
                      {mode === 'signup' && 'Tạo tài khoản để trải nghiệm đầy đủ'}
                      {mode === 'forgot' && 'Nhập email để nhận link đặt lại mật khẩu'}
                      {mode === 'reset' && 'Nhập mật khẩu mới của bạn'}
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {mode === 'signup' && (
                      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                        <label className="block text-sm font-bold text-muted-foreground mb-2">Họ và tên</label>
                        <div className="relative">
                          <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <input
                            type="text"
                            autoComplete="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-muted border border-border rounded-lg pl-12 pr-4 py-3 text-foreground placeholder-gray-500 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all"
                            placeholder="Nhập họ tên của bạn"
                            required
                          />
                        </div>
                      </motion.div>
                    )}

                    {mode !== 'reset' && (
                      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: mode === 'signup' ? 0.2 : 0.1 }}>
                        <label className="block text-sm font-bold text-muted-foreground mb-2">Địa chỉ Email</label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <input
                            type="email"
                            autoComplete="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full bg-muted border border-border rounded-lg pl-12 pr-4 py-3 text-foreground placeholder-gray-500 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all"
                            placeholder="email@example.com"
                            required
                          />
                        </div>
                      </motion.div>
                    )}

                    {(mode === 'login' || mode === 'signup' || mode === 'reset') && (
                      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: mode === 'signup' ? 0.3 : 0.2 }}>
                        <label className="block text-sm font-bold text-muted-foreground mb-2">
                          {mode === 'reset' ? 'Mật khẩu mới' : 'Mật khẩu'}
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full bg-muted border border-border rounded-lg pl-12 pr-12 py-3 text-foreground placeholder-gray-500 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all"
                            placeholder={mode === 'reset' ? 'Nhập mật khẩu mới' : '••••••••'}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                        {mode === 'signup' && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Tối thiểu 8 ký tự, bao gồm chữ hoa, chữ thường và số
                          </p>
                        )}
                      </motion.div>
                    )}

                    {(mode === 'signup' || mode === 'reset') && (
                      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                        <label className="block text-sm font-bold text-muted-foreground mb-2">Xác nhận mật khẩu</label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            autoComplete="new-password"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            className="w-full bg-muted border border-border rounded-lg pl-12 pr-12 py-3 text-foreground placeholder-gray-500 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all"
                            placeholder="Xác nhận mật khẩu"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {mode === 'login' && (
                      <div className="text-right">
                        <button
                          type="button"
                          onClick={() => setMode('forgot')}
                          className="text-sm text-muted-foreground hover:text-red-600 transition-colors"
                        >
                          Quên mật khẩu?
                        </button>
                      </div>
                    )}

                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-red-600/30 hover:shadow-red-600/50 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Đang xử lý...' : (
                        mode === 'login' ? 'Đăng nhập' :
                        mode === 'signup' ? 'Đăng ký' :
                        mode === 'forgot' ? 'Gửi link đặt lại' :
                        'Đặt lại mật khẩu'
                      )}
                    </motion.button>
                  </form>

                  {(mode === 'login' || mode === 'signup') && (
                    <div className="mt-6 text-center">
                      <button
                        onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                        className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                      >
                        {mode === 'login' ? "Chưa có tài khoản?" : "Đã có tài khoản?"}
                        <span className="text-red-600 font-bold ml-1">
                          {mode === 'login' ? 'Đăng ký' : 'Đăng nhập'}
                        </span>
                      </button>
                    </div>
                  )}

                  {(mode === 'forgot' || mode === 'reset') && (
                    <div className="mt-6 text-center">
                      <button
                        onClick={() => setMode('login')}
                        className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                      >
                        ← Quay lại đăng nhập
                      </button>
                    </div>
                  )}

                  {(mode === 'login' || mode === 'signup') && (
                    <>
                      <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-border"></div>
                        </div>
                        <div className="relative flex justify-center text-xs">
                          <span className="px-2 bg-card text-muted-foreground uppercase">HOẶC</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {GOOGLE_CLIENT_ID ? (
                          <GoogleLoginButton onLogin={onLogin} onClose={onClose} />
                        ) : (
                          <button
                            type="button"
                            disabled
                            title="Google login not configured"
                            className="flex items-center justify-center gap-2 bg-muted text-foreground py-2.5 rounded-lg border border-border opacity-40 cursor-not-allowed"
                          >
                            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            <span className="text-sm font-medium">Google</span>
                          </button>
                        )}

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
                    </>
                  )}
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
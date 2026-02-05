import { Search, ShoppingCart, User, Menu } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AuthModal } from '@/app/components/AuthModal';

interface HeaderProps {
  cartCount: number;
  onCartClick: () => void;
  onLogoClick: () => void;
}

export function Header({ cartCount, onCartClick, onLogoClick }: HeaderProps) {
  const [searchFocused, setSearchFocused] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showFeatureToast, setShowFeatureToast] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isAtTop, setIsAtTop] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const accountMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Check if at top
      setIsAtTop(currentScrollY < 50);
      
      // Hiện header khi scroll lên, ẩn khi scroll xuống
      if (currentScrollY < lastScrollY || currentScrollY < 10) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
        setShowAccountMenu(false); // Đóng menu khi ẩn header
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Handle click outside to close menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setShowAccountMenu(false);
      }
    };

    if (showAccountMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAccountMenu]);

  const handleFeatureClick = () => {
    setShowAccountMenu(false);
    setShowFeatureToast(true);
    setTimeout(() => setShowFeatureToast(false), 3000);
  };

  return (
    <motion.header
      initial={{ y: 0 }}
      animate={{ y: isVisible ? 0 : -100 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${ 
        isAtTop 
          ? 'bg-transparent border-b border-transparent' 
          : 'bg-black/95 backdrop-blur-md border-b border-red-600/20 shadow-lg shadow-red-600/10'
      }`}
    >
      {showFeatureToast && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-gray-900 border border-gray-700 text-white px-6 py-3 rounded-lg shadow-xl"
        >
          Tính năng đang được cải tiến
        </motion.div>
      )}
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo - VINPART Design */}
          <button 
            onClick={onLogoClick}
            className="flex items-center gap-3 group cursor-pointer"
          >
            <motion.div 
              whileHover={{ scale: 1.08, rotate: 3 }}
              className="relative w-12 h-12 lg:w-16 lg:h-16"
            >
              {/* Outer glow ring - animated pulse */}
              <div className="absolute inset-0 bg-gradient-to-br from-red-500 via-red-600 to-red-800 rounded-xl blur-xl opacity-50 group-hover:opacity-100 transition-all duration-700 animate-pulse"></div>
              
              {/* Secondary glow layer */}
              <div className="absolute inset-0 bg-red-600 rounded-xl blur-2xl opacity-30 group-hover:opacity-60 transition-all duration-500"></div>
              
              {/* Main logo container - premium design */}
              <div className="relative w-full h-full bg-gradient-to-br from-red-600 via-red-700 to-red-900 rounded-xl flex items-center justify-center shadow-2xl shadow-red-600/70 group-hover:shadow-red-500/90 transition-all border-[3px] border-red-500/50 group-hover:border-red-400/70 overflow-hidden">
                {/* Animated background grid pattern */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:10px_10px]"></div>
                </div>
                
                {/* Top shine effect */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-transparent rounded-xl"></div>
                
                {/* The "V" Letter - 3D Style */}
                <div className="relative z-10">
                  <div className="relative">
                    {/* Shadow layer */}
                    <span className="absolute top-1 left-0.5 text-4xl lg:text-5xl font-black text-black/60 tracking-tighter blur-[1px]">V</span>
                    {/* Main V with gradient */}
                    <span className="relative text-4xl lg:text-5xl font-black bg-gradient-to-b from-white via-red-50 to-red-100 bg-clip-text text-transparent drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)] tracking-tighter">V</span>
                    {/* Top highlight */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1/3 bg-white/40 blur-md rounded-full"></div>
                  </div>
                  
                  {/* Accent dot indicator */}
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gradient-to-b from-red-400 to-red-600 rounded-full shadow-lg shadow-red-500/80 animate-pulse"></div>
                </div>
                
                {/* Corner accent borders - futuristic */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t-[3px] border-l-[3px] border-white/50 rounded-tl-xl"></div>
                <div className="absolute top-0 right-0 w-4 h-4 border-t-[3px] border-r-[3px] border-white/50 rounded-tr-xl"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-[3px] border-l-[3px] border-white/50 rounded-bl-xl"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-[3px] border-r-[3px] border-white/50 rounded-br-xl"></div>
                
                {/* Sparkle effect */}
                <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-white rounded-full opacity-90 shadow-lg shadow-white/60 animate-pulse"></div>
              </div>
              
              {/* Outer border frame */}
              <div className="absolute inset-0 rounded-xl border-2 border-red-400/30 group-hover:border-red-300/50 transition-all"></div>
            </motion.div>
            
            <div className="hidden md:block">
              <motion.div 
                className="text-base lg:text-xl font-black tracking-wide relative"
                whileHover={{ x: 2 }}
              >
                <span className="relative inline-block bg-gradient-to-r from-white via-red-50 to-white bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(220,38,38,0.5)]">
                  VINPART
                  {/* Underline accent */}
                  <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-60"></div>
                </span>
              </motion.div>
              <div className="text-xs text-gray-400 tracking-[0.2em] font-bold mt-0.5">
                AUTO EXCELLENCE
              </div>
            </div>
          </button>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className={`relative w-full transition-all ${searchFocused ? 'scale-105' : ''}`}>
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm phụ tùng, tên xe..."
                className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all"
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
            </div>
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-4">
            {/* Search Icon - Mobile */}
            <button className="md:hidden p-2 hover:bg-gray-900 rounded-lg transition-colors">
              <Search className="w-5 h-5 text-gray-400" />
            </button>

            {/* Account */}
            <div className="relative" ref={accountMenuRef}>
              <button
                onClick={() => setShowAccountMenu(!showAccountMenu)}
                className="p-2 hover:bg-gray-900 rounded-lg transition-colors relative"
              >
                <User className="w-5 h-5 text-gray-400" />
              </button>

              <AnimatePresence>
                {showAccountMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 top-full mt-2 w-48 bg-gray-900 border border-gray-800 rounded-lg shadow-xl overflow-hidden"
                  >
                    <button 
                      onClick={() => {
                        setAuthMode('login');
                        setShowAuthModal(true);
                        setShowAccountMenu(false);
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-gray-800 transition-colors text-white"
                    >
                      Đăng nhập
                    </button>
                    <button 
                      onClick={() => {
                        setAuthMode('signup');
                        setShowAuthModal(true);
                        setShowAccountMenu(false);
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-gray-800 transition-colors text-white"
                    >
                      Đăng ký
                    </button>
                    <div className="border-t border-gray-800"></div>
                    <button className="w-full px-4 py-3 text-left hover:bg-gray-800 transition-colors text-gray-400" onClick={handleFeatureClick}>
                      Tài khoản
                    </button>
                    <button className="w-full px-4 py-3 text-left hover:bg-gray-800 transition-colors text-gray-400" onClick={handleFeatureClick}>
                      Đơn hàng
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Cart */}
            <button
              onClick={onCartClick}
              className="relative p-2 hover:bg-gray-900 rounded-lg transition-colors group"
            >
              <ShoppingCart className="w-5 h-5 text-gray-400 group-hover:text-red-600 transition-colors" />
              {cartCount > 0 && (
                <motion.span
                  key={cartCount}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg shadow-red-600/50"
                >
                  {cartCount}
                </motion.span>
              )}
            </button>

            {/* Mobile Menu */}
            <button className="md:hidden p-2 hover:bg-gray-900 rounded-lg transition-colors">
              <Menu className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
      />
    </motion.header>
  );
}
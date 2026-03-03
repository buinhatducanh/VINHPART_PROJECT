import { Search, ShoppingCart, User, Menu, X, LogOut, Package, Settings, FileText } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AuthModal } from '@/features/auth/components/AuthModal';
import { UserNotificationBell } from '@/features/notification/components/UserNotificationBell';

import { User as UserType, Product } from '@/shared/types';
import { productApi } from '@/lib/api';
import { productImages } from '@/shared/data/productImages';
import { useSettings } from '@/shared/hooks/useSettings';

interface HeaderProps {
  cartCount: number;
  onCartClick: () => void;
  onLogoClick: () => void;
  user: UserType | null;
  onLogin: (user: UserType) => void;
  onLogout: () => void;
  onSearch?: (query: string) => void;
  onReviewRedirect?: (orderId: string) => void;
}

export function Header({ cartCount, onCartClick, onLogoClick, user, onLogin, onLogout, onSearch, onReviewRedirect }: HeaderProps) {
  const { siteName } = useSettings();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showFeatureToast, setShowFeatureToast] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isAtTop, setIsAtTop] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  // Mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Search suggestions state
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const accountMenuRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Check if at top
      setIsAtTop(currentScrollY < 50);

      // Hiện header khi scroll lên, ẩn khi scroll xuống
      if (currentScrollY < lastScrollY || currentScrollY < 10) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100 && !isMobileMenuOpen) {
        // Chỉ ẩn nếu mobile menu đang đóng
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

      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAccountMenu, showSuggestions]);

  // Debounced search for suggestions
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setIsSearching(true);
        try {
          const response = await productApi.getProducts({
            search: searchQuery,
            limit: 5
          });
          setSuggestions(response.data);
          setShowSuggestions(true);
        } catch (error) {
          console.error('Error fetching suggestions:', error);
          setSuggestions([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSuggestionClick = (product: Product) => {
    setSearchQuery(product.product_name);
    setShowSuggestions(false);
    if (onSearch) {
      onSearch(product.product_name);
    }
  };

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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isAtTop
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
          {/* Mobile Menu Button (Left on mobile, hidden on desktop) */}
          <button
            className="md:hidden p-2 -ml-2 hover:bg-gray-900 rounded-lg transition-colors z-50 text-white"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="w-5 h-5 lg:w-6 lg:h-6" />
          </button>

          {/* Logo - VINPART Design */}
          <button
            onClick={onLogoClick}
            className="flex items-center gap-2 lg:gap-3 group cursor-pointer absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0"
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
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:10px_10px]"></div>
                </div>

                {/* Top shine effect */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-transparent rounded-xl pointer-events-none"></div>

                {/* The Logo Character - 3D Style */}
                <div className="relative z-10 flex items-center justify-center">
                  <div className="relative flex items-center justify-center">
                    {/* Shadow layer */}
                    <span className="absolute translate-y-[2px] translate-x-[1px] text-4xl lg:text-5xl font-black text-black/60 blur-[1px]">
                      {siteName.charAt(0).toUpperCase()}
                    </span>
                    {/* Main character with gradient */}
                    <span className="relative text-4xl lg:text-5xl font-black bg-gradient-to-b from-white via-red-50 to-red-100 bg-clip-text text-transparent drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)]">
                      {siteName.charAt(0).toUpperCase()}
                    </span>
                    {/* Top highlight */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1/3 bg-white/40 blur-md rounded-full pointer-events-none"></div>
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

            <div className="hidden md:block text-left">
              <motion.div
                className="text-base lg:text-xl font-black tracking-wide relative"
                whileHover={{ x: 2 }}
              >
                <span className="relative inline-block bg-gradient-to-r from-white via-red-50 to-white bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(220,38,38,0.5)]">
                  {siteName.toUpperCase()}
                  {/* Underline accent */}
                  <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-60"></div>
                </span>
              </motion.div>
              <div className="text-xs text-gray-400 tracking-[0.2em] font-bold mt-0.5">
                Quản lý cửa hàng
              </div>
            </div>
          </button>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className={`relative w-full transition-all ${searchFocused ? 'scale-105' : ''}`} ref={searchContainerRef}>
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm phụ tùng, tên xe..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim() && onSearch) {
                    onSearch(searchQuery.trim());
                    setShowSuggestions(false);
                  }
                }}
                className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all"
                onFocus={() => {
                  setSearchFocused(true);
                  if (searchQuery.trim().length >= 2) {
                    setShowSuggestions(true);
                  }
                }}
                onBlur={() => {
                  setSearchFocused(false);
                  // Don't hide immediately to allow clicking on suggestions
                }}
              />

              {/* Search Suggestions Dropdown */}
              <AnimatePresence>
                {showSuggestions && (searchQuery.trim().length >= 2) && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-gray-800 rounded-lg shadow-xl overflow-hidden z-50"
                  >
                    {isSearching ? (
                      <div className="p-4 text-center text-gray-400">
                        <div className="animate-spin w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                        Đang tìm kiếm...
                      </div>
                    ) : suggestions.length > 0 ? (
                      <div className="py-2">
                        {suggestions.map((product) => (
                          <button
                            key={product.product_id}
                            onClick={() => handleSuggestionClick(product)}
                            className="w-full text-left px-4 py-3 hover:bg-gray-800 transition-colors flex items-center gap-3 group"
                          >
                            <div className="w-10 h-10 rounded-md bg-gray-800 overflow-hidden flex-shrink-0">
                              <img
                                src={productImages[product.product_id] || product.product_image}
                                alt={product.product_name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40';
                                }}
                              />
                            </div>
                            <div>
                              <p className="text-white font-medium text-sm group-hover:text-red-500 transition-colors line-clamp-1">
                                {product.product_name}
                              </p>
                              <p className="text-gray-500 text-xs">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        Không tìm thấy sản phẩm nào
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Search Icon - Mobile */}
            <button
              className="md:hidden p-2 hover:bg-gray-900 rounded-lg transition-colors text-white"
              onClick={() => {
                // Here you might want to open a mobile search overlay
                // For now, let's just focus the search input if visible, or open mobile menu with search active
                setIsMobileMenuOpen(true);
                setTimeout(() => {
                  document.getElementById('mobile-search-input')?.focus();
                }, 100);
              }}
            >
              <Search className="w-5 h-5 lg:w-6 lg:h-6" />
            </button>

            {/* Account */}
            <div className="relative hidden md:block" ref={accountMenuRef}>
              <button
                onClick={() => setShowAccountMenu(!showAccountMenu)}
                className="p-2 hover:bg-gray-900 rounded-lg transition-colors relative"
              >
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-7 h-7 rounded-full object-cover border-2 border-gray-700 hover:border-red-600 transition-colors"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <User className="w-5 h-5 text-gray-400" />
                )}
              </button>

              <AnimatePresence>
                {showAccountMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 top-full mt-2 w-48 bg-gray-900 border border-gray-800 rounded-lg shadow-xl overflow-hidden"
                  >
                    {user ? (
                      // Logged In Menu
                      <>
                        <div className="px-4 py-3 border-b border-gray-800 flex items-center gap-3">
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="w-9 h-9 rounded-full object-cover border-2 border-gray-700 flex-shrink-0"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 border border-gray-600 flex items-center justify-center flex-shrink-0">
                              <User className="w-5 h-5 text-gray-300" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-white font-bold truncate">{user.name}</p>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                          </div>
                        </div>
                        <button className="w-full px-4 py-3 text-left hover:bg-gray-800 transition-colors text-white" onClick={handleFeatureClick}>
                          Tài khoản của tôi
                        </button>
                        <button className="w-full px-4 py-3 text-left hover:bg-gray-800 transition-colors text-white" onClick={handleFeatureClick}>
                          Đơn mua
                        </button>
                        <div className="border-t border-gray-800"></div>
                        <button
                          onClick={() => {
                            onLogout();
                            setShowAccountMenu(false);
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-gray-800 transition-colors text-red-500 font-medium"
                        >
                          Đăng xuất
                        </button>
                      </>
                    ) : (
                      // Guest Menu
                      <>
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
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Cart */}
            <div className="flex items-center gap-1">
              {user && <UserNotificationBell email={user.email} onReviewClick={onReviewRedirect} />}
              <button
                onClick={onCartClick}
                className="relative p-2 hover:bg-gray-900 rounded-lg transition-colors group text-white"
              >
                <ShoppingCart className="w-5 h-5 lg:w-6 lg:h-6 group-hover:text-red-500 transition-colors" />
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
            </div>

          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-[100] md:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute top-0 left-0 bottom-0 w-[85vw] max-w-sm bg-gray-950 border-r border-gray-800 shadow-2xl overflow-y-auto flex flex-col"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center font-black text-white text-xl">
                    V
                  </div>
                  <span className="font-black text-lg bg-gradient-to-r from-white via-red-50 to-white bg-clip-text text-transparent">VINPART</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Mobile Search */}
              <div className="p-4 border-b border-gray-800">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    id="mobile-search-input"
                    type="text"
                    placeholder="Tìm kiếm phụ tùng..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && searchQuery.trim() && onSearch) {
                        onSearch(searchQuery.trim());
                        setShowSuggestions(false);
                        setIsMobileMenuOpen(false); // Close menu on search
                      }
                    }}
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
                  />
                  {/* Simplistic version of suggestions for mobile */}
                  {showSuggestions && suggestions.length > 0 && searchQuery.trim().length >= 2 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-gray-800 rounded-lg shadow-xl overflow-hidden z-50 max-h-60 overflow-y-auto">
                      {suggestions.map((product) => (
                        <button
                          key={product.product_id}
                          onClick={() => {
                            handleSuggestionClick(product);
                            setIsMobileMenuOpen(false); // Close menu on select
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-gray-800 transition-colors flex items-center gap-3"
                        >
                          <img
                            src={productImages[product.product_id] || product.product_image}
                            alt={product.product_name}
                            className="w-10 h-10 rounded-md object-cover bg-gray-800"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40';
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm truncate">{product.product_name}</p>
                            <p className="text-gray-400 text-xs">
                              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* User Section / Auth Links */}
              <div className="p-4 border-b border-gray-800 flex-1">
                {user ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-6 p-3 bg-gray-900/50 rounded-xl border border-gray-800/50">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 border border-gray-600 flex items-center justify-center">
                        <User className="w-6 h-6 text-gray-300" />
                      </div>
                      <div>
                        <p className="text-white font-bold">{user.name}</p>
                        <p className="text-sm text-gray-400">{user.email}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          handleFeatureClick();
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-900 text-gray-300 hover:text-white transition-colors"
                      >
                        <User className="w-5 h-5" />
                        <span>Tài khoản của tôi</span>
                      </button>
                      <button
                        onClick={() => {
                          handleFeatureClick();
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-900 text-gray-300 hover:text-white transition-colors"
                      >
                        <Package className="w-5 h-5" />
                        <span>Đơn mua</span>
                      </button>

                      {user.role === 'admin' && (
                        <button
                          onClick={() => {
                            // Can't access handleAdminClick here directly from App.tsx without passing it as prop
                            // So we trigger onLogoClick which goes to landing, then user needs to click admin button there
                            // For a real fix, pass onAdminClick to Header
                            setIsMobileMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-red-900/20 text-red-500 hover:bg-red-900/30 transition-colors"
                        >
                          <Settings className="w-5 h-5" />
                          <span>Trang quản trị (Admin)</span>
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => {
                        setAuthMode('login');
                        setShowAuthModal(true);
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full py-3 px-4 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold transition-colors"
                    >
                      Đăng nhập
                    </button>
                    <button
                      onClick={() => {
                        setAuthMode('signup');
                        setShowAuthModal(true);
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full py-3 px-4 rounded-lg bg-gray-900 hover:bg-gray-800 border border-gray-700 text-white font-bold transition-colors"
                    >
                      Đăng ký
                    </button>
                  </div>
                )}

                {/* Navigation Links (Demo) */}
                <div className="mt-8 space-y-1">
                  <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Danh mục</p>
                  <button onClick={() => { onLogoClick(); setIsMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-gray-900 text-gray-300 rounded-lg flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-600"></span>
                    Trang chủ
                  </button>
                  <button onClick={() => { onSearch?.(''); setIsMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-gray-900 text-gray-300 rounded-lg flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                    Sản phẩm
                  </button>
                  <button onClick={() => { setIsMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-gray-900 text-gray-300 rounded-lg flex items-center gap-3">
                    <FileText className="w-4 h-4 text-gray-500" />
                    Báo giá & Dịch vụ
                  </button>
                </div>
              </div>

              {/* Drawer Footer */}
              {user && (
                <div className="p-4 border-t border-gray-800">
                  <button
                    onClick={() => {
                      onLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg hover:bg-red-950/50 text-red-500 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Đăng xuất</span>
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
        onLogin={(u) => {
          onLogin(u);
          setShowAuthModal(false);
        }}
      />
    </motion.header>
  );
}
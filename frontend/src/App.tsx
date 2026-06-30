// frontend/src/App.tsx
import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { productApi, API_BASE_URL } from '@/lib/api';
import { Header } from '@/shared/components/layout/Header';
import { LandingPage } from '@/features/home/pages/LandingPage';
import { ProductListing } from '@/features/product/pages/ProductListing';
import { CartPage } from '@/features/cart/pages/CartPage';
import { CheckoutPage } from '@/features/checkout/pages/CheckoutPage';
import { AdminDashboard } from '@/features/admin/pages/AdminDashboard';
import { BlogDetailPage } from '@/features/blog/pages/BlogDetailPage';
import { BlogListPage } from '@/features/blog/pages/BlogListPage';
import { AddToCartToast } from '@/features/cart/components/AddToCartToast';
import { Toaster } from '@/shared/components/ui/sonner';
import { toast } from 'sonner';
import { Product, CartItem, User } from '@/shared/types';
import { ProductDetailPage } from '@/features/product/pages/ProductDetailPage';
import { BodyKitLandingPage } from '@/features/bodykit/pages/BodyKitLandingPage';
import { BodyKitDetailPage } from '@/features/bodykit/pages/BodyKitDetailPage';
import { useI18n } from '@/shared/lib/i18n';
import { AuthModal } from '@/features/auth/components/AuthModal';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 2,
    },
  },
});

export default function App() {
  const { t } = useI18n();
  const [currentPage, setCurrentPage] = useState<'landing' | 'products' | 'cart' | 'checkout' | 'admin' | 'blog-list' | 'blog-detail' | 'product-detail' | 'bodykit' | 'bodykit-detail'>('landing');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [currentBlogPostId, setCurrentBlogPostId] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [checkoutProduct, setCheckoutProduct] = useState<Product | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastProductName, setToastProductName] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot' | 'reset'>('login');
  const [resetToken, setResetToken] = useState<string>('');

  // Always force dark mode
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  // Check for reset token in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      setResetToken(token);
      setAuthMode('reset');
      setShowAuthModal(true);
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Check for verification token in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const verifyToken = params.get('verifyToken');
    if (verifyToken) {
      handleVerifyEmail(verifyToken);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Restore user from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('vinhpart_user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);

        // Re-validate user role from server
        fetch(`${API_BASE_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        })
          .then(res => res.ok ? res.json() : null)
          .then(freshUser => {
            if (freshUser) {
              const updatedUser = { ...parsedUser, ...freshUser };
              setUser(updatedUser);
              localStorage.setItem('vinhpart_user', JSON.stringify(updatedUser));
            }
          })
          .catch(err => console.error('Failed to re-validate user:', err));
      } catch (error) {
        console.error('Failed to parse saved user:', error);
        localStorage.removeItem('vinhpart_user');
      }
    }
  }, []);

  const handleVerifyEmail = async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify/${token}`);
      const data = await response.json();
      if (response.ok) {
        toast.success('Email verified successfully! Please login.');
        setAuthMode('login');
        setShowAuthModal(true);
      } else {
        toast.error(data.error || 'Verification failed');
      }
    } catch (error) {
      toast.error('Verification failed');
    }
  };

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    localStorage.setItem('vinhpart_user', JSON.stringify(loggedInUser));
    toast.success(t('auth.welcomeBack', { name: loggedInUser.name }));
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('vinhpart_user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setCurrentPage('landing');
    toast.info(t('auth.logoutSuccess'));
  };

  const handleAdminClick = () => {
    if (!user || user.role !== 'admin') {
      toast.error(t('auth.adminForbidden') || 'Bạn không có quyền truy cập trang quản trị');
      return;
    }
    setCurrentPage('admin');
  };

  const handleSearch = async (query: string) => {
    try {
      const response = await productApi.getProducts({
        search: query,
        limit: 1
      });

      if (response.metadata.total > 0) {
        setSearchQuery(query);
        setCurrentPage('products');
      } else {
        toast.info(t('header.noProductsFound', { query }));
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error(t('common.error'));
    }
  };

  const handleAddToCart = (product: Product, quantity: number = 1) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.product.product_id === product.product_id);
      if (existing) {
        return prev.map(item =>
          item.product.product_id === product.product_id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });

    setToastProductName(product.product_name);
    setShowToast(true);
  };

  const handleBuyNow = (product: Product) => {
    setCheckoutProduct(product);
    setCurrentPage('checkout');
  };

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      setCartItems(prev => prev.filter(item => item.product.product_id !== productId));
    } else {
      setCartItems(prev =>
        prev.map(item =>
          item.product.product_id === productId
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
    }
  };

  const handleCheckoutFromCart = () => {
    setCheckoutProduct(null);
    setCurrentPage('checkout');
  };

  const handleBlogPostClick = (postId: string) => {
    setCurrentBlogPostId(postId);
    setCurrentPage('blog-detail');
  };

  const handleViewAllPosts = () => {
    setCurrentPage('blog-list');
  };

  const handleProductClick = (productId: string) => {
    setSelectedProductId(productId);
    setCurrentPage('product-detail');
    window.scrollTo(0, 0);
  };

  const totalCartItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleOpenAuth = (mode: 'login' | 'signup' | 'forgot' = 'login') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background text-foreground">
        {currentPage !== 'admin' && (
          <Header
            cartCount={totalCartItems}
            onCartClick={() => setCurrentPage('cart')}
            onLogoClick={() => {
              setSearchQuery('');
              setCurrentPage('landing');
            }}
            user={user}
            onLogin={handleLogin}
            onLogout={handleLogout}
            onSearch={handleSearch}
            onAdminClick={handleAdminClick}
            onOpenAuth={handleOpenAuth}
          />
        )}

        <AuthModal
          isOpen={showAuthModal}
          onClose={() => {
            setShowAuthModal(false);
            setAuthMode('login');
          }}
          initialMode={authMode}
          onLogin={handleLogin}
          resetToken={resetToken}
        />

        <AddToCartToast
          show={showToast}
          productName={toastProductName}
          onClose={() => setShowToast(false)}
        />

        {currentPage === 'landing' && (
          <LandingPage
            onShopNow={() => setCurrentPage('products')}
            onViewCatalog={() => setCurrentPage('products')}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            onAdminClick={handleAdminClick}
            onBlogPostClick={handleBlogPostClick}
            onViewAllPosts={handleViewAllPosts}
            onProductClick={handleProductClick}
            onVehicleClick={(vehicleId) => {
              setSelectedVehicleId(vehicleId);
              setCurrentPage('bodykit-detail');
              window.scrollTo(0, 0);
            }}
          />
        )}

        {currentPage === 'products' && (
          <ProductListing
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            onProductClick={handleProductClick}
          />
        )}

        {currentPage === 'product-detail' && selectedProductId && (
          <ProductDetailPage
            productId={selectedProductId}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            onBack={() => setCurrentPage('products')}
            onProductClick={handleProductClick}
            user={user}
          />
        )}

        {currentPage === 'cart' && (
          <CartPage
            cartItems={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onBackToShopping={() => setCurrentPage('products')}
            onCheckout={handleCheckoutFromCart}
          />
        )}

        {currentPage === 'checkout' && (
          <CheckoutPage
            cartItems={checkoutProduct ? [{ product: checkoutProduct, quantity: 1 }] : cartItems}
            onBackToCart={() => setCurrentPage('cart')}
            onBackToShopping={() => setCurrentPage('products')}
          />
        )}

        {currentPage === 'admin' && (
          <AdminDashboard
            onBackToHome={() => setCurrentPage('landing')}
            onLogout={handleLogout}
          />
        )}

        {currentPage === 'bodykit' && (
          <BodyKitLandingPage
            onVehicleClick={(vehicleId) => {
              setSelectedVehicleId(vehicleId);
              setCurrentPage('bodykit-detail');
              window.scrollTo(0, 0);
            }}
            onBack={() => setCurrentPage('landing')}
          />
        )}

        {currentPage === 'bodykit-detail' && selectedVehicleId && (
          <BodyKitDetailPage
            vehicleId={selectedVehicleId}
            onBack={() => setCurrentPage('landing')}
            onAddToCart={handleAddToCart}
          />
        )}

        {currentPage === 'blog-list' && (
          <BlogListPage
            onBack={() => setCurrentPage('landing')}
            onPostClick={handleBlogPostClick}
          />
        )}

        {currentPage === 'blog-detail' && currentBlogPostId && (
          <BlogDetailPage
            postId={currentBlogPostId}
            onBack={() => setCurrentPage('landing')}
            onPostClick={handleBlogPostClick}
          />
        )}
        <Toaster position="bottom-left" richColors />
      </div>
    </QueryClientProvider>
  );
}
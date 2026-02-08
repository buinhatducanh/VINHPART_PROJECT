import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { productApi } from '@/lib/api';
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

// Create QueryClient with default options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes default
      gcTime: 10 * 60 * 1000, // 10 minutes cache
      refetchOnWindowFocus: false, // Disable refetch on window focus
      retry: 2, // Retry failed requests twice
    },
  },
});

export default function App() {
  const [currentPage, setCurrentPage] = useState<'landing' | 'products' | 'cart' | 'checkout' | 'admin' | 'blog-list' | 'blog-detail'>('landing');
  const [currentBlogPostId, setCurrentBlogPostId] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [checkoutProduct, setCheckoutProduct] = useState<Product | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastProductName, setToastProductName] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    toast.success(`Chào mừng quay lại, ${loggedInUser.name}!`);
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('landing');
    toast.info('Đã đăng xuất thành công');
  };

  const handleAdminClick = () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập tài khoản Admin để truy cập');
      return;
    }

    if (user.role !== 'admin') {
      toast.error('Bạn không có quyền truy cập trang quản trị');
      return;
    }

    setCurrentPage('admin');
  };

  const handleSearch = async (query: string) => {
    try {
      // Check if products exist for this query
      const response = await productApi.getProducts({
        search: query,
        limit: 1 // We only need to know if ANY exist
      });

      if (response.metadata.total > 0) {
        setSearchQuery(query);
        setCurrentPage('products');
      } else {
        toast.info(`Không tìm thấy sản phẩm nào phù hợp với từ khóa "${query}"`);
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Đã có lỗi xảy ra khi tìm kiếm');
    }
  };

  const handleAddToCart = (product: Product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.product.product_id === product.product_id);
      if (existing) {
        return prev.map(item =>
          item.product.product_id === product.product_id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });

    // Show toast notification
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

  const totalCartItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-black text-white">
        {/* Only show Header for non-admin pages */}
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
          />
        )}

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
            onBackToHome={handleLogout}
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
        <Toaster position="top-right" richColors />
      </div>
    </QueryClientProvider>
  );
}
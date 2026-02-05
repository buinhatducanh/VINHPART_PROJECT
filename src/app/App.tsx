import { useState } from 'react';
import { Header } from '@/app/components/Header';
import { LandingPage } from '@/app/components/LandingPage';
import { ProductListing } from '@/app/components/ProductListing';
import { CartPage } from '@/app/components/CartPage';
import { CheckoutPage } from '@/app/components/CheckoutPage';
import { AdminDashboard } from '@/app/components/AdminDashboard';
import { BlogDetailPage } from '@/app/components/BlogDetailPage';
import { BlogListPage } from '@/app/components/BlogListPage';
import { AddToCartToast } from '@/app/components/AddToCartToast';
import { Toaster } from '@/app/components/ui/sonner';
import { Product, CartItem } from '@/app/types';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'landing' | 'products' | 'cart' | 'checkout' | 'admin' | 'blog-list' | 'blog-detail'>('landing');
  const [currentBlogPostId, setCurrentBlogPostId] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [checkoutProduct, setCheckoutProduct] = useState<Product | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastProductName, setToastProductName] = useState('');

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
    <div className="min-h-screen bg-black text-white">
      {/* Only show Header for non-admin pages */}
      {currentPage !== 'admin' && (
        <Header
          cartCount={totalCartItems}
          onCartClick={() => setCurrentPage('cart')}
          onLogoClick={() => setCurrentPage('landing')}
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
          onAdminClick={() => setCurrentPage('admin')}
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
  );
}
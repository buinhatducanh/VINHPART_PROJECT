import { useState, useEffect } from 'react';
import { Product } from '@/shared/types';
import { Modal } from '@/shared/components/ui/Modal';
import { modalContents, ModalContentType } from '@/shared/data/modalContent';
import {
  HeroSection,
  BenefitsSection,
  FeaturedProductsSection,
  LatestPostsSection,
  CustomerReviewsSection,
  CTASection,
  FooterSection,
} from '../sections';

interface LandingPageProps {
  onShopNow: () => void;
  onViewCatalog: () => void;
  onAddToCart: (product: Product) => void;
  onBuyNow: (product: Product) => void;
  onAdminClick?: () => void;
  onBlogPostClick?: (postId: string) => void;
  onViewAllPosts?: () => void;
}

export function LandingPage({
  onShopNow,
  onViewCatalog,
  onAddToCart,
  onBuyNow,
  onAdminClick,
  onBlogPostClick,
  onViewAllPosts,
}: LandingPageProps) {
  // State for data from API
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [latestPosts, setLatestPosts] = useState<any[]>([]);
  const [topReviews, setTopReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch data from APIs
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch products (limit 10, can add filters later)
        const productsRes = await fetch('http://localhost:3001/api/products?limit=10');
        if (productsRes.ok) {
          const productsData = await productsRes.json();
          // Handle API response structure: {data: [], metadata: {...}}
          const productsList = productsData.data || productsData.products || productsData || [];
          setFeaturedProducts(Array.isArray(productsList) ? productsList : []);
        }

        // Fetch published blog posts (limit 3)
        const postsRes = await fetch('http://localhost:3001/api/posts?status=PUBLISHED&limit=3');
        if (postsRes.ok) {
          const postsData = await postsRes.json();
          setLatestPosts(postsData);
        }

        // Reviews - keep empty for now (can implement later)
        setTopReviews([]);
      } catch (error) {
        console.error('Failed to fetch landing page data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Modal State
  const [activeModal, setActiveModal] = useState<ModalContentType | null>(null);

  const handleModalOpen = (modalType: ModalContentType) => (e: React.MouseEvent) => {
    e.preventDefault();
    setActiveModal(modalType);
  };

  const handleModalClose = () => {
    setActiveModal(null);
  };

  return (
    <div className="pt-16 lg:pt-20">
      {/* Modal */}
      {activeModal && (
        <Modal
          isOpen={true}
          onClose={handleModalClose}
          title={modalContents[activeModal].title}
        >
          {modalContents[activeModal].content}
        </Modal>
      )}

      {/* Section Components */}
      <HeroSection onShopNow={onShopNow} onViewCatalog={onViewCatalog} />
      <BenefitsSection />
      <FeaturedProductsSection
        products={featuredProducts}
        onAddToCart={onAddToCart}
        onBuyNow={onBuyNow}
        isLoading={loading}
      />
      <LatestPostsSection
        posts={latestPosts}
        onBlogPostClick={onBlogPostClick}
        onViewAllPosts={onViewAllPosts}
        isLoading={loading}
      />
      <CustomerReviewsSection reviews={topReviews} />
      <CTASection onShopNow={onShopNow} />
      <FooterSection onAdminClick={onAdminClick} onModalOpen={handleModalOpen} />
    </div>
  );
}
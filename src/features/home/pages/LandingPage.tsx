import { useState } from 'react';
import { mockProducts } from '@/shared/data/mockProducts';
import { mockSEOPosts } from '@/shared/data/mockSEOPosts';
import { mockReviews } from '@/shared/data/mockReviews';
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
  // Data
  const featuredProducts = mockProducts.filter(p => p.vehicle_type === 'Motorbike').slice(0, 10);
  const latestPosts = mockSEOPosts.filter(p => p.status === 'published').slice(0, 3);
  const topReviews = mockReviews
    .filter(r => r.status === 'approved' && r.is_verified_purchase)
    .sort((a, b) => b.priority - a.priority || b.helpful_count - a.helpful_count)
    .slice(0, 3);

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
      />
      <LatestPostsSection
        posts={latestPosts}
        onBlogPostClick={onBlogPostClick}
        onViewAllPosts={onViewAllPosts}
      />
      <CustomerReviewsSection reviews={topReviews} />
      <CTASection onShopNow={onShopNow} />
      <FooterSection onAdminClick={onAdminClick} onModalOpen={handleModalOpen} />
    </div>
  );
}
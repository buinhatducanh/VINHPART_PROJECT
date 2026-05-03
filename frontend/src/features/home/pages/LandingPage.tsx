import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Product } from '@/shared/types';
import { Modal } from '@/shared/components/ui/Modal';
import { modalContents, ModalContentType } from '@/shared/data/modalContent';
import { useI18n } from '@/shared/lib/i18n';
import {
  HeroSection,
  BenefitsSection,
  FeaturedProductsSection,
  LatestPostsSection,
  CustomerReviewsSection,
  CTASection,
  FooterSection,
  BodyKitSection,
} from '../sections';
import { productApi, postsApi, homepageSectionsApi } from '@/lib/api';

interface LandingPageProps {
  onShopNow: () => void;
  onViewCatalog: () => void;
  onAddToCart: (product: Product) => void;
  onBuyNow: (product: Product) => void;
  onAdminClick?: () => void;
  onBlogPostClick?: (postId: string) => void;
  onViewAllPosts?: () => void;
  onProductClick?: (productId: string) => void;
  onVehicleClick?: (vehicleId: string) => void;
}

export function LandingPage({
  onShopNow,
  onViewCatalog,
  onAddToCart,
  onBuyNow,
  onAdminClick,
  onBlogPostClick,
  onViewAllPosts,
  onProductClick,
  onVehicleClick,
}: LandingPageProps) {
  const { t } = useI18n();

  // Modal State — MUST be before sectionMap (hooks must be called in consistent order)
  const [activeModal, setActiveModal] = useState<ModalContentType | null>(null);

  const handleModalOpen = (modalType: ModalContentType) => (e: React.MouseEvent) => {
    e.preventDefault();
    setActiveModal(modalType);
  };

  const handleModalClose = () => {
    setActiveModal(null);
  };

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => productApi.getProducts({ limit: 10, isFeatured: true }),
  });

  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: ['latest-posts'],
    queryFn: () => postsApi.getPosts('PUBLISHED', 3),
  });

  const { data: sections, isLoading: sectionsLoading } = useQuery({
    queryKey: ['homepage-sections'],
    queryFn: homepageSectionsApi.getAll,
  });

  const featuredProducts = productsData?.data || [];
  const latestPosts = Array.isArray(postsData) ? postsData : [];

  const sectionMap: Record<string, React.ReactNode> = {
    hero: <HeroSection onShopNow={onShopNow} onViewCatalog={onViewCatalog} />,
    benefits: <BenefitsSection />,
    body_kit: <BodyKitSection onVehicleClick={onVehicleClick} />,
    featured_products: (
      <FeaturedProductsSection
        products={featuredProducts}
        onAddToCart={onAddToCart}
        onBuyNow={onBuyNow}
        isLoading={productsLoading}
        onProductClick={onProductClick}
      />
    ),
    latest_posts: (
      <LatestPostsSection
        posts={latestPosts}
        onBlogPostClick={onBlogPostClick}
        onViewAllPosts={onViewAllPosts}
        isLoading={postsLoading}
      />
    ),
    reviews: <CustomerReviewsSection reviews={[]} />,
    cta: <CTASection onShopNow={onShopNow} />,
    footer: <FooterSection onAdminClick={onAdminClick} onModalOpen={handleModalOpen} />,
  };

  const defaultSectionOrder = [
    'hero', 'benefits', 'body_kit', 'featured_products',
    'latest_posts', 'reviews', 'cta', 'footer',
  ];

  return (
    <div className="pt-16 lg:pt-20">
      {/* Modal */}
      {activeModal && (
        <Modal
          isOpen={true}
          onClose={handleModalClose}
          title={t(`modals.${activeModal}`)}
        >
          {modalContents[activeModal].content}
        </Modal>
      )}

      {/* Section Components */}
      {sectionsLoading ? (
        <div className="min-h-screen bg-background" />
      ) : sections && sections.length > 0 ? (
        sections.filter(s => s.isEnabled).map(section => (
          <div key={section.id}>{sectionMap[section.key]}</div>
        ))
      ) : (
        defaultSectionOrder.map(key => (
          <div key={key}>{sectionMap[key]}</div>
        ))
      )}
    </div>
  );
}

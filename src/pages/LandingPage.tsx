import { motion } from 'motion/react';
import { Shield, Zap, Truck, RefreshCw, Star, Calendar, Eye, ArrowRight } from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';
import { mockProducts } from '@/data/mockProducts';
import { mockSEOPosts } from '@/data/mockSEOPosts';
import { mockReviews } from '@/data/mockReviews';
import { Product } from '@/types';
import { useState } from 'react';

interface LandingPageProps {
  onShopNow: () => void;
  onViewCatalog: () => void;
  onAddToCart: (product: Product) => void;
  onBuyNow: (product: Product) => void;
  onAdminClick?: () => void;
  onBlogPostClick?: (postId: string) => void;
  onViewAllPosts?: () => void;
}

export function LandingPage({ onShopNow, onViewCatalog, onAddToCart, onBuyNow, onAdminClick, onBlogPostClick, onViewAllPosts }: LandingPageProps) {
  const featuredProducts = mockProducts.filter(p => p.vehicle_type === 'Motorbike').slice(0, 4);
  const latestPosts = mockSEOPosts.filter(p => p.status === 'published').slice(0, 3);
  // Lấy top 3 reviews được approved và ưu tiên cao
  const topReviews = mockReviews
    .filter(r => r.status === 'approved' && r.is_verified_purchase)
    .sort((a, b) => b.priority - a.priority || b.helpful_count - a.helpful_count)
    .slice(0, 3);
  const [showFeatureToast, setShowFeatureToast] = useState(false);

  const handleFeatureClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowFeatureToast(true);
    setTimeout(() => setShowFeatureToast(false), 3000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="pt-16 lg:pt-20">
      {showFeatureToast && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-24 left-1/2 -translate-x-1/2 bg-gray-900 border border-gray-700 text-white px-6 py-3 rounded-lg shadow-xl z-50"
        >
          Tính năng đang được cải tiến
        </motion.div>
      )}

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="https://assets.mixkit.co/videos/preview/mixkit-motorcycle-rider-at-high-speed-on-road-4653-large.mp4" type="video/mp4" />
          </video>
        </div>

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/70"></div>

        {/* Animated particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-red-600 rounded-full"
              initial={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                scale: Math.random() * 2
              }}
              animate={{
                y: [null, Math.random() * window.innerHeight],
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                delay: Math.random() * 2
              }}
            />
          ))}
        </div>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-gray-200 to-red-600 bg-clip-text text-transparent">
              Nâng Cấp Hiệu Suất Xe
            </h1>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 text-red-600">
              Phụ Tùng Chính Hãng
            </h2>
            <p className="text-lg md:text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
              Chất lượng cao cấp, hiệu suất vượt trội, phù hợp mọi loại xe
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                onClick={onShopNow}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-lg shadow-red-600/50 hover:shadow-red-600/80 transition-all"
              >
                Mua ngay
              </motion.button>
              <motion.button
                onClick={onViewCatalog}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-transparent border-2 border-white hover:bg-white hover:text-black text-white font-bold rounded-lg transition-all"
              >
                Xem danh mục
              </motion.button>
            </div>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2"
            >
              <div className="w-1 h-2 bg-white/50 rounded-full"></div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-b from-black to-gray-900">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {[
              {
                icon: Shield,
                title: 'Chính hãng 100%',
                description: 'Bảo hành đầy đủ, nguồn gốc rõ ràng'
              },
              {
                icon: Zap,
                title: 'Phù hợp từng loại xe',
                description: 'Tư vấn chính xác theo hãng & model'
              },
              {
                icon: Truck,
                title: 'Giao hàng nhanh',
                description: 'Miễn phí vận chuyển đơn > 500k'
              },
              {
                icon: RefreshCw,
                title: 'Đổi trả dễ dàng',
                description: '30 ngày đổi trả không điều kiện'
              }
            ].map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-gray-900 border border-gray-800 rounded-lg p-6 text-center hover:border-red-600/50 transition-all group"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:shadow-lg group-hover:shadow-red-600/50 transition-all">
                  <benefit.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{benefit.title}</h3>
                <p className="text-gray-400 text-sm">{benefit.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Sản phẩm nổi bật
            </h2>
            <p className="text-gray-400">Được tin dùng bởi hàng nghìn khách hàng</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product, index) => (
              <motion.div
                key={product.product_id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <ProductCard
                  product={product}
                  onAddToCart={onAddToCart}
                  onBuyNow={onBuyNow}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Blog Posts Section */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Bài viết mới nhất
            </h2>
            <p className="text-gray-400">Kiến thức và kinh nghiệm chăm sóc xe máy</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {latestPosts.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="group bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-red-600/50 transition-all cursor-pointer"
                onClick={() => onBlogPostClick && onBlogPostClick(post.id)}
              >
                {/* Featured Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={post.featured_image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-red-500 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {post.excerpt}
                  </p>

                  {/* Meta Info */}
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(post.published_at || new Date().toISOString())}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      <span>{post.view_count} lượt xem</span>
                    </div>
                  </div>

                  {/* Read More Button */}
                  <button className="flex items-center gap-2 text-red-500 font-semibold text-sm group-hover:gap-3 transition-all">
                    <span>Đọc thêm</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.article>
            ))}
          </div>

          {/* View All Posts Button */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <motion.button
              onClick={onViewAllPosts}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-lg shadow-lg shadow-red-600/50 hover:shadow-red-600/80 transition-all"
            >
              Xem tất cả bài viết
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Customer Reviews */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Đánh giá từ khách hàng
            </h2>
            <p className="text-gray-400">Trải nghiệm thực tế từ người dùng</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {topReviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-red-600/50 transition-all"
              >
                {/* Review Title */}
                <h4 className="text-white font-bold text-lg mb-2">{review.title}</h4>

                {/* Rating Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  ))}
                </div>

                {/* Review Content */}
                <p className="text-gray-300 mb-4 italic line-clamp-3">"{review.content}"</p>

                {/* Customer Info */}
                <div className="border-t border-gray-800 pt-4">
                  <p className="text-white font-bold">{review.customer_name}</p>
                  <p className="text-gray-400 text-sm">{review.product_name}</p>
                  {review.is_verified_purchase && (
                    <span className="inline-block mt-2 px-2 py-1 bg-green-900/30 text-green-400 text-xs rounded border border-green-800">
                      ✓ Đã mua hàng
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-red-600 to-red-800">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Sẵn sàng nâng cấp xe của bạn?
            </h2>
            <p className="text-white/80 mb-8 max-w-2xl mx-auto">
              Khám phá hàng nghìn sản phẩm chính hãng với giá tốt nhất
            </p>
            <motion.button
              onClick={onShopNow}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-4 bg-white text-red-600 font-bold rounded-lg shadow-lg hover:shadow-xl transition-all"
            >
              Khám phá ngay
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-gray-800 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-bold mb-4">Về chúng tôi</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" onClick={handleFeatureClick} className="hover:text-red-600 transition-colors">Giới thiệu</a></li>
                <li><a href="#" onClick={handleFeatureClick} className="hover:text-red-600 transition-colors">Liên hệ</a></li>
                <li><a href="#" onClick={handleFeatureClick} className="hover:text-red-600 transition-colors">Tuyển dụng</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold mb-4">Chính sách</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" onClick={handleFeatureClick} className="hover:text-red-600 transition-colors">Chính sách bảo hành</a></li>
                <li><a href="#" onClick={handleFeatureClick} className="hover:text-red-600 transition-colors">Chính sách đổi trả</a></li>
                <li><a href="#" onClick={handleFeatureClick} className="hover:text-red-600 transition-colors">Chính sách vận chuyển</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold mb-4">Hỗ trợ</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" onClick={handleFeatureClick} className="hover:text-red-600 transition-colors">Hướng dẫn mua hàng</a></li>
                <li><a href="#" onClick={handleFeatureClick} className="hover:text-red-600 transition-colors">Câu hỏi thường gặp</a></li>
                <li><a href="#" onClick={handleFeatureClick} className="hover:text-red-600 transition-colors">Thanh toán</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold mb-4">Liên hệ</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>Hotline: 1900 xxxx</li>
                <li>Email: support@autoparts.vn</li>
                <li>Giờ làm việc: 8:00 - 22:00</li>
              </ul>
            </div>
          </div>

          {/* Admin Access Button */}
          <div className="border-t border-gray-800 pt-8 mb-8 flex justify-center">
            <motion.button
              onClick={onAdminClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group relative inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-900 to-black border border-gray-700 rounded-lg overflow-hidden transition-all duration-300 hover:border-red-600/50"
            >
              {/* Neon glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-red-600/0 via-red-600/10 to-red-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              {/* Icon with glow */}
              <div className="relative">
                <svg
                  className="w-5 h-5 text-gray-400 group-hover:text-red-600 transition-colors duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <div className="absolute inset-0 blur-md bg-red-600/0 group-hover:bg-red-600/50 transition-all duration-300"></div>
              </div>

              {/* Text */}
              <span className="relative text-sm font-medium text-gray-400 group-hover:text-red-600 transition-colors duration-300">
                Quản trị viên
              </span>

              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-red-600/0 group-hover:border-red-600/50 transition-all duration-300"></div>
              <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-red-600/0 group-hover:border-red-600/50 transition-all duration-300"></div>
              <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-red-600/0 group-hover:border-red-600/50 transition-all duration-300"></div>
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-red-600/0 group-hover:border-red-600/50 transition-all duration-300"></div>
            </motion.button>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2026 AutoParts. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
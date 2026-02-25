import { useState, useEffect } from 'react';
import { Product, Review } from '@/shared/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { ProductSpecifications } from '../molecules/ProductSpecifications';
import { Star, Send, CheckCircle, User, ThumbsUp, MessageSquare, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ProductDescriptionSectionProps {
    product: Product;
}

export function ProductDescriptionSection({ product }: ProductDescriptionSectionProps) {
    // ==================== REVIEW STATE ====================
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loadingReviews, setLoadingReviews] = useState(false);
    const [reviewCount, setReviewCount] = useState(0);

    // Form state
    const [formRating, setFormRating] = useState(0);
    const [formHoverRating, setFormHoverRating] = useState(0);
    const [formName, setFormName] = useState('');
    const [formEmail, setFormEmail] = useState('');
    const [formTitle, setFormTitle] = useState('');
    const [formContent, setFormContent] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [submitError, setSubmitError] = useState('');

    // Fetch reviews for this product
    const fetchReviews = async () => {
        try {
            setLoadingReviews(true);
            const res = await fetch(`http://localhost:3001/api/reviews?productId=${product.product_id}&status=approved`);
            if (res.ok) {
                const data = await res.json();
                setReviews(data);
                setReviewCount(data.length);
            }
        } catch (error) {
            console.error('Failed to fetch reviews:', error);
        } finally {
            setLoadingReviews(false);
        }
    };

    useEffect(() => {
        if (product.product_id) {
            fetchReviews();
        }
    }, [product.product_id]);

    // Calculate review stats
    const averageRating = reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : '0';
    const ratingDistribution = [5, 4, 3, 2, 1].map(star => ({
        star,
        count: reviews.filter(r => r.rating === star).length,
        percentage: reviews.length > 0
            ? (reviews.filter(r => r.rating === star).length / reviews.length) * 100
            : 0
    }));

    // Submit review
    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formRating === 0) {
            setSubmitError('Vui lòng chọn số sao đánh giá');
            return;
        }
        if (!formName.trim() || !formContent.trim()) {
            setSubmitError('Vui lòng điền đầy đủ tên và nội dung đánh giá');
            return;
        }

        try {
            setSubmitting(true);
            setSubmitError('');
            const res = await fetch('http://localhost:3001/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    product_id: product.product_id,
                    customer_name: formName,
                    customer_email: formEmail,
                    rating: formRating,
                    title: formTitle,
                    content: formContent,
                })
            });

            if (res.ok) {
                setSubmitSuccess(true);
                setFormRating(0);
                setFormName('');
                setFormEmail('');
                setFormTitle('');
                setFormContent('');
                setTimeout(() => setSubmitSuccess(false), 5000);
            } else {
                setSubmitError('Không thể gửi đánh giá. Vui lòng thử lại.');
            }
        } catch {
            setSubmitError('Lỗi kết nối. Vui lòng thử lại.');
        } finally {
            setSubmitting(false);
        }
    };

    // Render star rating
    const renderStars = (rating: number, size = 'w-4 h-4') => (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`${size} ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`}
                />
            ))}
        </div>
    );

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <div className="mt-16 lg:mt-24">
            <Tabs defaultValue="description" className="w-full">
                <div className="flex justify-center mb-8">
                    <TabsList className="bg-gray-900 border border-gray-800 p-1">
                        <TabsTrigger
                            value="description"
                            className="px-6 py-2 rounded-lg data-[state=active]:bg-red-600 data-[state=active]:text-white text-gray-400"
                        >
                            Mô tả sản phẩm
                        </TabsTrigger>
                        <TabsTrigger
                            value="specs"
                            className="px-6 py-2 rounded-lg data-[state=active]:bg-red-600 data-[state=active]:text-white text-gray-400"
                        >
                            Thông số kỹ thuật
                        </TabsTrigger>
                        <TabsTrigger
                            value="reviews"
                            className="px-6 py-2 rounded-lg data-[state=active]:bg-red-600 data-[state=active]:text-white text-gray-400"
                        >
                            Đánh giá ({reviewCount})
                        </TabsTrigger>
                    </TabsList>
                </div>

                {/* ============ MÔ TẢ SẢN PHẨM ============ */}
                <TabsContent value="description" className="mt-6 animate-fade-in">
                    <div className="bg-gray-900/30 rounded-2xl p-6 lg:p-10 border border-gray-800">
                        <h3 className="text-xl font-bold text-white mb-6">Chi tiết sản phẩm</h3>
                        <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed whitespace-pre-wrap">
                            {product.description || "Chưa có mô tả chi tiết cho sản phẩm này."}
                        </div>
                    </div>
                </TabsContent>

                {/* ============ THÔNG SỐ KỸ THUẬT ============ */}
                <TabsContent value="specs" className="mt-6 animate-fade-in">
                    <div className="max-w-3xl mx-auto">
                        <ProductSpecifications product={product} />
                    </div>
                </TabsContent>

                {/* ============ ĐÁNH GIÁ TỪ KHÁCH HÀNG ============ */}
                <TabsContent value="reviews" className="mt-6 animate-fade-in">
                    <div className="space-y-8">

                        {/* ---- TỔNG QUAN ĐÁNH GIÁ ---- */}
                        <div className="bg-gray-900/30 rounded-2xl p-6 lg:p-10 border border-gray-800">
                            <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-2">
                                <MessageSquare className="w-6 h-6 text-red-500" />
                                Đánh giá từ khách hàng
                            </h3>

                            {loadingReviews ? (
                                <div className="flex justify-center py-8">
                                    <div className="w-8 h-8 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
                                </div>
                            ) : reviews.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-8 lg:gap-12">
                                    {/* Left: Score summary */}
                                    <div className="flex flex-col items-center justify-center text-center p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50">
                                        <div className="text-6xl font-black text-white mb-2 bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-400">
                                            {averageRating}
                                        </div>
                                        <div className="mb-3">
                                            {renderStars(Math.round(Number(averageRating)), 'w-5 h-5')}
                                        </div>
                                        <p className="text-sm text-gray-400">
                                            {reviews.length} đánh giá
                                        </p>
                                    </div>

                                    {/* Right: Rating distribution bars */}
                                    <div className="flex flex-col justify-center gap-3">
                                        {ratingDistribution.map(({ star, count, percentage }) => (
                                            <div key={star} className="flex items-center gap-3">
                                                <span className="text-sm text-gray-400 w-12 text-right">{star} sao</span>
                                                <div className="flex-1 h-3 bg-gray-800 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${percentage}%` }}
                                                        transition={{ duration: 0.8, delay: (5 - star) * 0.1 }}
                                                        className={`h-full rounded-full ${star >= 4
                                                            ? 'bg-gradient-to-r from-green-500 to-emerald-400'
                                                            : star === 3
                                                                ? 'bg-gradient-to-r from-yellow-500 to-amber-400'
                                                                : 'bg-gradient-to-r from-red-500 to-orange-400'
                                                            }`}
                                                    />
                                                </div>
                                                <span className="text-sm text-gray-500 w-10">{count}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                /* Empty state */
                                <div className="text-center py-10">
                                    <MessageSquare className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                                    <p className="text-gray-400 text-lg mb-1">Chưa có đánh giá nào</p>
                                    <p className="text-gray-500 text-sm">Hãy là người đầu tiên đánh giá sản phẩm này!</p>
                                </div>
                            )}
                        </div>

                        {/* ---- DANH SÁCH REVIEW ---- */}
                        {reviews.length > 0 && (
                            <div className="space-y-4">
                                {reviews.map((review, index) => (
                                    <motion.div
                                        key={review.id}
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.06 }}
                                        className="bg-gray-900/40 rounded-2xl p-6 border border-gray-800 hover:border-gray-700 transition-colors"
                                    >
                                        {/* Review header */}
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600 to-orange-500 flex items-center justify-center text-white font-bold text-sm">
                                                    {review.customer_name?.charAt(0)?.toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-white">{review.customer_name}</span>
                                                        {review.is_verified_purchase && (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-900/30 text-green-400 text-xs rounded-full border border-green-800/50">
                                                                <ShieldCheck className="w-3 h-3" />
                                                                Đã mua hàng
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="text-xs text-gray-500">{formatDate(review.created_at)}</span>
                                                </div>
                                            </div>
                                            {renderStars(review.rating)}
                                        </div>

                                        {/* Review title & content */}
                                        {review.title && (
                                            <h4 className="font-bold text-white mb-2">{review.title}</h4>
                                        )}
                                        <p className="text-gray-300 leading-relaxed">{review.content}</p>

                                        {/* Review images */}
                                        {review.images && review.images.length > 0 && (
                                            <div className="flex gap-2 mt-4">
                                                {review.images.map((img, idx) => (
                                                    <div key={idx} className="w-20 h-20 rounded-lg overflow-hidden border border-gray-700">
                                                        <img src={img} alt="" className="w-full h-full object-cover" />
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Helpful count */}
                                        {review.helpful_count > 0 && (
                                            <div className="mt-4 pt-3 border-t border-gray-800/50">
                                                <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                                                    <ThumbsUp className="w-3.5 h-3.5" />
                                                    {review.helpful_count} người thấy hữu ích
                                                </span>
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        )}

                        {/* ---- FORM VIẾT ĐÁNH GIÁ ---- */}
                        <div className="bg-gray-900/30 rounded-2xl p-6 lg:p-10 border border-gray-800">
                            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <Star className="w-5 h-5 text-yellow-400" />
                                Viết đánh giá của bạn
                            </h3>

                            <AnimatePresence mode="wait">
                                {submitSuccess ? (
                                    <motion.div
                                        key="success"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="flex flex-col items-center justify-center py-10 text-center"
                                    >
                                        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4 border border-green-500/30">
                                            <CheckCircle className="w-8 h-8 text-green-400" />
                                        </div>
                                        <h4 className="text-lg font-bold text-white mb-2">Cảm ơn bạn đã đánh giá!</h4>
                                        <p className="text-gray-400 text-sm">Đánh giá của bạn đang chờ được duyệt và sẽ sớm được hiển thị.</p>
                                    </motion.div>
                                ) : (
                                    <motion.form
                                        key="form"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        onSubmit={handleSubmitReview}
                                        className="space-y-6"
                                    >
                                        {/* Star rating picker */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-3">
                                                Đánh giá của bạn <span className="text-red-400">*</span>
                                            </label>
                                            <div className="flex gap-1">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button
                                                        key={star}
                                                        type="button"
                                                        onClick={() => setFormRating(star)}
                                                        onMouseEnter={() => setFormHoverRating(star)}
                                                        onMouseLeave={() => setFormHoverRating(0)}
                                                        className="p-1 transition-transform hover:scale-110"
                                                    >
                                                        <Star
                                                            className={`w-8 h-8 transition-colors ${star <= (formHoverRating || formRating)
                                                                ? 'text-yellow-400 fill-yellow-400'
                                                                : 'text-gray-600'
                                                                }`}
                                                        />
                                                    </button>
                                                ))}
                                                {formRating > 0 && (
                                                    <span className="ml-3 text-sm text-gray-400 self-center">
                                                        {formRating === 5 ? 'Tuyệt vời' : formRating === 4 ? 'Tốt' : formRating === 3 ? 'Bình thường' : formRating === 2 ? 'Tệ' : 'Rất tệ'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Name & Email row */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                                    <User className="w-4 h-4 inline mr-1" />
                                                    Họ tên <span className="text-red-400">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formName}
                                                    onChange={(e) => setFormName(e.target.value)}
                                                    placeholder="Nhập tên của bạn"
                                                    className="w-full px-4 py-3 bg-gray-800/60 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 transition-all"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                                    Email
                                                </label>
                                                <input
                                                    type="email"
                                                    value={formEmail}
                                                    onChange={(e) => setFormEmail(e.target.value)}
                                                    placeholder="email@example.com"
                                                    className="w-full px-4 py-3 bg-gray-800/60 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 transition-all"
                                                />
                                            </div>
                                        </div>

                                        {/* Title */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                Tiêu đề đánh giá
                                            </label>
                                            <input
                                                type="text"
                                                value={formTitle}
                                                onChange={(e) => setFormTitle(e.target.value)}
                                                placeholder="Tóm tắt đánh giá của bạn"
                                                className="w-full px-4 py-3 bg-gray-800/60 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 transition-all"
                                            />
                                        </div>

                                        {/* Content */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                Nội dung đánh giá <span className="text-red-400">*</span>
                                            </label>
                                            <textarea
                                                value={formContent}
                                                onChange={(e) => setFormContent(e.target.value)}
                                                placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                                                rows={4}
                                                className="w-full px-4 py-3 bg-gray-800/60 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 transition-all resize-none"
                                                required
                                            />
                                        </div>

                                        {/* Error message */}
                                        {submitError && (
                                            <p className="text-red-400 text-sm">{submitError}</p>
                                        )}

                                        {/* Submit button */}
                                        <motion.button
                                            type="submit"
                                            disabled={submitting}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="w-full md:w-auto px-8 py-3.5 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-xl hover:from-red-700 hover:to-red-800 transition-all shadow-lg shadow-red-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {submitting ? (
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <Send className="w-4 h-4" />
                                            )}
                                            {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                                        </motion.button>
                                    </motion.form>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </TabsContent>

            </Tabs>
        </div>
    );
}

import { useState, useMemo } from 'react';
import { Review } from '@/shared/types';
import { useProductReviews, useCreateReview } from '@/hooks/useQueries';
import { Star, ThumbsUp, CheckCircle, Send, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

interface ProductReviewsTabProps {
    productId: string;
    productName: string;
}

// ===== Sub-component: Star Rating Input =====
function StarRatingInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
    const [hover, setHover] = useState(0);

    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => onChange(star)}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                    className="transition-transform hover:scale-125"
                >
                    <Star
                        className={`w-7 h-7 transition-colors ${(hover || value) >= star
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-600'
                            }`}
                    />
                </button>
            ))}
            {value > 0 && (
                <span className="ml-2 text-sm text-gray-400">
                    {value === 1 && 'Tệ'}
                    {value === 2 && 'Không hài lòng'}
                    {value === 3 && 'Bình thường'}
                    {value === 4 && 'Hài lòng'}
                    {value === 5 && 'Tuyệt vời'}
                </span>
            )}
        </div>
    );
}

// ===== Sub-component: Rating Bar =====
function RatingBar({ star, count, total }: { star: number; count: number; total: number }) {
    const percentage = total > 0 ? (count / total) * 100 : 0;

    return (
        <div className="flex items-center gap-3 text-sm">
            <span className="flex items-center gap-1 w-8 text-gray-400 shrink-0">
                {star} <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            </span>
            <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full rounded-full bg-gradient-to-r from-yellow-500 to-yellow-400"
                />
            </div>
            <span className="text-gray-500 w-8 text-right shrink-0">{count}</span>
        </div>
    );
}

// ===== Sub-component: Single Review Card =====
function ReviewCard({ review }: { review: Review }) {
    const date = new Date(review.created_at).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 bg-gray-900/50 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors"
        >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-white font-bold text-sm">
                        {review.customer_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-white font-semibold text-sm">{review.customer_name}</span>
                            {review.is_verified_purchase && (
                                <span className="flex items-center gap-1 text-xs text-green-400 bg-green-900/30 px-2 py-0.5 rounded-full">
                                    <CheckCircle className="w-3 h-3" />
                                    Đã mua
                                </span>
                            )}
                        </div>
                        <span className="text-xs text-gray-500">{date}</span>
                    </div>
                </div>

                {/* Stars */}
                <div className="flex items-center gap-0.5 shrink-0">
                    {[...Array(5)].map((_, i) => (
                        <Star
                            key={i}
                            className={`w-4 h-4 ${i < review.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-700'
                                }`}
                        />
                    ))}
                </div>
            </div>

            {/* Title */}
            {review.title && (
                <h4 className="text-white font-medium mb-2">{review.title}</h4>
            )}

            {/* Content */}
            <p className="text-gray-300 text-sm leading-relaxed">{review.content}</p>

            {/* Helpful */}
            {review.helpful_count > 0 && (
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-800">
                    <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors">
                        <ThumbsUp className="w-3.5 h-3.5" />
                        Hữu ích ({review.helpful_count})
                    </button>
                </div>
            )}
        </motion.div>
    );
}

// ===== Main Component =====
export function ProductReviewsTab({ productId, productName }: ProductReviewsTabProps) {
    const { data: reviews = [], isLoading } = useProductReviews(productId);
    const createReview = useCreateReview();

    const [showForm, setShowForm] = useState(false);
    const [visibleCount, setVisibleCount] = useState(3);
    const [formData, setFormData] = useState({
        customer_name: '',
        customer_email: '',
        rating: 0,
        title: '',
        content: '',
    });

    // Tính toán stats
    const stats = useMemo(() => {
        if (reviews.length === 0) return { avg: 0, total: 0, distribution: [0, 0, 0, 0, 0] };

        const total = reviews.length;
        const sum = reviews.reduce((acc: number, r: Review) => acc + r.rating, 0);
        const avg = sum / total;
        const distribution = [0, 0, 0, 0, 0];
        reviews.forEach((r: Review) => {
            if (r.rating >= 1 && r.rating <= 5) distribution[r.rating - 1]++;
        });

        return { avg, total, distribution };
    }, [reviews]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.rating === 0) {
            toast.error('Vui lòng chọn số sao đánh giá');
            return;
        }
        if (!formData.customer_name.trim()) {
            toast.error('Vui lòng nhập tên của bạn');
            return;
        }
        if (!formData.content.trim()) {
            toast.error('Vui lòng nhập nội dung đánh giá');
            return;
        }

        try {
            await createReview.mutateAsync({
                product_id: productId,
                customer_name: formData.customer_name,
                customer_email: formData.customer_email,
                rating: formData.rating,
                title: formData.title,
                content: formData.content,
            });
            toast.success('Đánh giá đã được gửi! Chờ duyệt.');
            setFormData({ customer_name: '', customer_email: '', rating: 0, title: '', content: '' });
            setShowForm(false);
        } catch {
            toast.error('Gửi đánh giá thất bại. Vui lòng thử lại.');
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-4 animate-pulse">
                <div className="h-20 bg-gray-800 rounded-xl" />
                <div className="h-32 bg-gray-800 rounded-xl" />
                <div className="h-32 bg-gray-800 rounded-xl" />
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8 items-start">
            {/* Left Column: Reviews List */}
            <div className="space-y-6 order-2 lg:order-1">
                {reviews.length > 0 ? (
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-white mb-6 border-b border-gray-800 pb-4">
                            Đánh giá từ khách hàng ({reviews.length})
                        </h3>
                        {reviews.slice(0, visibleCount).map((review: Review) => (
                            <ReviewCard key={review.id} review={review} />
                        ))}

                        {/* Show more / collapse buttons */}
                        <div className="flex justify-center gap-3 pt-4 border-t border-gray-800 mt-6">
                            {visibleCount < reviews.length && (
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setVisibleCount(v => v + 5)}
                                    className="px-6 py-2.5 bg-gray-800 border border-gray-700 text-white rounded-xl hover:border-red-600/60 hover:bg-gray-700 transition-all text-sm font-medium flex items-center gap-2"
                                >
                                    Xem thêm ({reviews.length - visibleCount} đánh giá còn lại)
                                </motion.button>
                            )}
                            {visibleCount > 3 && (
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setVisibleCount(3)}
                                    className="px-6 py-2.5 bg-gray-800 border border-gray-700 text-gray-400 rounded-xl hover:border-gray-600 hover:bg-gray-700 transition-all text-sm font-medium"
                                >
                                    Ẩn bớt
                                </motion.button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12 bg-gray-900/30 rounded-2xl border border-gray-800 border-dashed">
                        <Star className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">Chưa có đánh giá nào</p>
                        <p className="text-gray-600 text-sm mt-1">Hãy là người đầu tiên đánh giá sản phẩm này!</p>
                    </div>
                )}
            </div>

            {/* Right Column: Sticky Sidebar with Stats and Form */}
            <div className="space-y-6 order-1 lg:order-2 lg:sticky lg:top-24">
                {/* Overview Section */}
                <div className="p-6 bg-gray-900/50 rounded-2xl border border-gray-800">
                    <h3 className="text-lg font-bold text-white mb-6 text-center">Tổng quan đánh giá</h3>

                    <div className="flex flex-col items-center justify-center mb-6">
                        <div className="text-5xl font-bold text-white mb-2">
                            {stats.avg > 0 ? stats.avg.toFixed(1) : '—'}
                        </div>
                        <div className="flex items-center gap-1 mb-2">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    className={`w-5 h-5 ${i < Math.round(stats.avg)
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-gray-700'
                                        }`}
                                />
                            ))}
                        </div>
                        <span className="text-sm text-gray-500">
                            {stats.total > 0 ? `${stats.total} đánh giá` : 'Chưa có đánh giá'}
                        </span>
                    </div>

                    {/* Distribution */}
                    <div className="flex flex-col gap-2 mb-6 pt-6 border-t border-gray-800">
                        {[5, 4, 3, 2, 1].map((star) => (
                            <RatingBar
                                key={star}
                                star={star}
                                count={stats.distribution[star - 1]}
                                total={stats.total}
                            />
                        ))}
                    </div>

                    {/* Write Review Button */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowForm(!showForm)}
                        className="w-full py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-600/20 hover:from-red-500 hover:to-red-600 transition-all flex items-center justify-center gap-2"
                    >
                        <Send className="w-4 h-4" />
                        {showForm ? 'Đóng form' : 'Viết đánh giá'}
                    </motion.button>
                </div>

                {/* Review Form */}
                <AnimatePresence>
                    {showForm && (
                        <motion.form
                            initial={{ opacity: 0, height: 0, scale: 0.95 }}
                            animate={{ opacity: 1, height: 'auto', scale: 1 }}
                            exit={{ opacity: 0, height: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            onSubmit={handleSubmit}
                            className="overflow-hidden"
                        >
                            <div className="p-6 bg-gray-900/50 rounded-2xl border border-gray-800 space-y-5">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <User className="w-5 h-5 text-red-500" />
                                    Đánh giá: {productName}
                                </h3>

                                {/* Rating */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Mức độ hài lòng <span className="text-red-500">*</span>
                                    </label>
                                    <StarRatingInput
                                        value={formData.rating}
                                        onChange={(v) => setFormData(prev => ({ ...prev, rating: v }))}
                                    />
                                </div>

                                {/* Name & Email */}
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1.5">
                                            Tên của bạn <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.customer_name}
                                            onChange={(e) => setFormData(prev => ({ ...prev, customer_name: e.target.value }))}
                                            placeholder="Nguyễn Văn A"
                                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder:text-gray-600 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1.5">
                                            Email (không bắt buộc)
                                        </label>
                                        <input
                                            type="email"
                                            value={formData.customer_email}
                                            onChange={(e) => setFormData(prev => ({ ...prev, customer_email: e.target.value }))}
                                            placeholder="email@example.com"
                                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder:text-gray-600 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-colors"
                                        />
                                    </div>
                                </div>

                                {/* Title */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1.5">
                                        Tiêu đề
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                        placeholder="Tóm tắt đánh giá của bạn..."
                                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder:text-gray-600 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-colors"
                                    />
                                </div>

                                {/* Content */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1.5">
                                        Nội dung đánh giá <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={formData.content}
                                        onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                                        placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                                        rows={4}
                                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder:text-gray-600 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-colors resize-none"
                                    />
                                </div>

                                {/* Submit */}
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    disabled={createReview.isPending}
                                    className="w-full py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {createReview.isPending ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Đang gửi...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4" />
                                            Gửi đánh giá
                                        </>
                                    )}
                                </motion.button>
                            </div>
                        </motion.form>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

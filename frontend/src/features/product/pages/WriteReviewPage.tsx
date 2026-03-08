import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Star, ChevronLeft, Package, Send, CheckCircle, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { API_BASE_URL } from '@/lib/api';

interface WriteReviewPageProps {
    orderId: string;
    onBack: () => void;
}

interface OrderDetail {
    id: string;
    orderNumber: string;
    items: Array<{
        productId: string;
        name: string;
        price: number;
        quantity: number;
    }>;
}

export function WriteReviewPage({ orderId, onBack }: WriteReviewPageProps) {
    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [completed, setCompleted] = useState(false);

    // Store ratings and content for each product in the order
    const [reviews, setReviews] = useState<Record<string, { rating: number, content: string }>>({});

    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/orders/${orderId}`);
                const data = await response.json();
                setOrder(data);

                // Initialize reviews state
                const initialReviews: Record<string, { rating: number, content: string }> = {};
                data.items.forEach((item: any) => {
                    initialReviews[item.productId] = { rating: 5, content: '' };
                });
                setReviews(initialReviews);
            } catch (error) {
                console.error('Error fetching order:', error);
                toast.error('Không thể tải thông tin đơn hàng');
            } finally {
                setLoading(false);
            }
        };

        fetchOrderDetails();
    }, [orderId]);

    const handleRatingChange = (productId: string, rating: number) => {
        setReviews(prev => ({
            ...prev,
            [productId]: { ...prev[productId], rating }
        }));
    };

    const handleContentChange = (productId: string, content: string) => {
        setReviews(prev => ({
            ...prev,
            [productId]: { ...prev[productId], content }
        }));
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            // In a real app, we would send each review to the backend
            // For now, we simulate success
            await new Promise(resolve => setTimeout(resolve, 1500));
            setCompleted(true);
            toast.success('Cảm ơn bạn đã đánh giá sản phẩm!');
        } catch (error) {
            toast.error('Đã có lỗi xảy ra khi gửi đánh giá');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-20 flex flex-col items-center">
                <div className="animate-spin w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full mb-4"></div>
                <p className="text-gray-400">Đang tải thông tin đơn hàng...</p>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <p className="text-red-500 mb-4">Không tìm thấy đơn hàng</p>
                <button onClick={onBack} className="text-gray-400 hover:text-white flex items-center justify-center gap-2 mx-auto">
                    <ChevronLeft className="w-4 h-4" /> Quay lại
                </button>
            </div>
        );
    }

    if (completed) {
        return (
            <div className="container mx-auto px-4 py-20 max-w-2xl text-center">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-gray-900/50 border border-gray-800 p-12 rounded-3xl"
                >
                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-green-500" />
                    </div>
                    <h2 className="text-3xl font-black mb-4">Cảm ơn bạn!</h2>
                    <p className="text-gray-400 mb-8 leading-relaxed">
                        Đánh giá của bạn đã được gửi thành công. Ý kiến của bạn giúp chúng tôi cải thiện dịch vụ tốt hơn.
                    </p>
                    <button
                        onClick={onBack}
                        className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-600/30"
                    >
                        Quay lại trang chủ
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-10 max-w-3xl">
            <button onClick={onBack} className="mb-8 text-gray-400 hover:text-white flex items-center gap-2 group">
                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Quay lại
            </button>

            <div className="mb-10 text-center">
                <h1 className="text-3xl font-black mb-2">Đánh giá sản phẩm</h1>
                <p className="text-gray-500">Đơn hàng: <span className="text-red-500 font-bold">{order.orderNumber}</span></p>
            </div>

            <div className="space-y-8">
                {order.items.map((item) => (
                    <motion.div
                        key={item.productId}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gray-950 border border-gray-800 rounded-2xl overflow-hidden"
                    >
                        <div className="p-4 bg-white/5 border-b border-gray-800 flex items-center gap-4">
                            <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center">
                                <Package className="w-6 h-6 text-gray-700" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-bold text-white truncate">{item.name}</h3>
                                <p className="text-xs text-gray-500">Số lượng: {item.quantity}</p>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="mb-6">
                                <label className="block text-sm text-gray-400 mb-3">Chất lượng sản phẩm</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            onClick={() => handleRatingChange(item.productId, star)}
                                            className="focus:outline-none transition-transform hover:scale-110"
                                        >
                                            <Star
                                                className={`w-8 h-8 ${star <= (reviews[item.productId]?.rating || 0)
                                                    ? 'text-yellow-500 fill-yellow-500'
                                                    : 'text-gray-800'
                                                    }`}
                                            />
                                        </button>
                                    ))}
                                    <span className="ml-3 text-sm text-yellow-500 font-bold self-center">
                                        {reviews[item.productId]?.rating === 5 ? 'Tuyệt vời' :
                                            reviews[item.productId]?.rating === 4 ? 'Tốt' :
                                                reviews[item.productId]?.rating === 3 ? 'Bình thường' :
                                                    reviews[item.productId]?.rating === 2 ? 'Tệ' : 'Rất tệ'}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-3">Chia sẻ cảm nhận của bạn</label>
                                <textarea
                                    value={reviews[item.productId]?.content || ''}
                                    onChange={(e) => handleContentChange(item.productId, e.target.value)}
                                    placeholder="Sản phẩm rất tốt, giao hàng nhanh..."
                                    className="w-full bg-gray-900 border border-gray-800 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-red-600 transition-colors min-h-[120px] resize-none"
                                />
                            </div>

                            <div className="mt-4 flex gap-4">
                                <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-xs text-gray-400 hover:text-white transition-colors">
                                    <ImageIcon className="w-4 h-4" /> Thêm hình ảnh
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="mt-12">
                <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="w-full py-4 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black rounded-xl transition-all shadow-xl shadow-red-600/30 flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
                >
                    {submitting ? (
                        <>
                            <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                            Đang gửi...
                        </>
                    ) : (
                        <>
                            <Send className="w-5 h-5" />
                            Gửi đánh giá
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}

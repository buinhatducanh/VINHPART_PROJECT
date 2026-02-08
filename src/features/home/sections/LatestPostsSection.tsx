import { motion } from 'motion/react';
import { Calendar, Eye, ArrowRight } from 'lucide-react';
import { formatDate, FADE_IN_VARIANTS } from '../constants';

interface BlogPost {
    id: string;
    title: string;
    excerpt: string;
    featured_image?: string;
    published_at?: string;
    view_count: number;
}

interface LatestPostsSectionProps {
    posts: BlogPost[];
    onBlogPostClick?: (postId: string) => void;
    onViewAllPosts?: () => void;
}

export function LatestPostsSection({ posts, onBlogPostClick, onViewAllPosts }: LatestPostsSectionProps) {
    return (
        <section className="py-20 bg-black">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={FADE_IN_VARIANTS.initial}
                    whileInView={FADE_IN_VARIANTS.animate}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Bài viết mới nhất
                    </h2>
                    <p className="text-gray-400">Kiến thức và kinh nghiệm chăm sóc xe máy</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {posts.map((post) => (
                        <motion.article
                            key={post.id}
                            initial={{ opacity: 0, y: 12 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.35, ease: "easeOut" }}
                            onClick={() => onBlogPostClick?.(post.id)}
                            className="
                group
                bg-gray-900
                border border-gray-800
                rounded-xl
                overflow-hidden
                cursor-pointer
                transition-[transform,box-shadow,border-color]
                duration-200
                hover:scale-[1.02]
                hover:border-red-600/40
                hover:shadow-lg
                hover:shadow-red-600/20
              "
                        >
                            {/* Featured Image */}
                            <div className="relative h-48 overflow-hidden">
                                <img
                                    src={post.featured_image || '/placeholder-image.jpg'}
                                    alt={post.title}
                                    className="
                    w-full h-full object-cover
                    group-hover:scale-105
                    transition-transform
                    duration-500
                    ease-out
                  "
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
    );
}

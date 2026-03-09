import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'motion/react';
import { Search, Car, ChevronLeft, ChevronRight } from 'lucide-react';
import { bodykitApi } from '@/lib/api';
import { VehicleCard } from '@/features/bodykit/components/VehicleCard';
import { useI18n } from '@/shared/lib/i18n';

interface BodyKitSectionProps {
    onVehicleClick?: (vehicleId: string) => void;
}

export function BodyKitSection({ onVehicleClick }: BodyKitSectionProps) {
    const { language } = useI18n();
    const [page, setPage] = useState(1);
    const [searchInput, setSearchInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const { data, isLoading } = useQuery({
        queryKey: ['bodykit-vehicles', page, searchQuery],
        queryFn: () => bodykitApi.getVehicles({ page, limit: 12, search: searchQuery || undefined }),
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setSearchQuery(searchInput);
        setPage(1);
    };

    const vehicles = data?.data || [];
    const metadata = data?.metadata;

    return (
        <section id="body-kit-section" className="py-16 md:py-24 bg-background">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 bg-red-600/10 text-red-600 px-4 py-2 rounded-full text-sm font-medium mb-4"
                    >
                        <Car className="w-4 h-4" />
                        {language === 'vi' ? 'Dàn áo xe máy' : 'Body Kit'}
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-3xl md:text-4xl font-bold text-foreground mb-4"
                    >
                        {language === 'vi' ? 'Dàn Áo Theo Xe' : 'Body Kit By Vehicle'}
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-muted-foreground max-w-2xl mx-auto mb-8"
                    >
                        {language === 'vi'
                            ? 'Chọn loại xe để xem trọn bộ dàn áo phụ tùng. Mua lẻ hoặc mua nguyên bộ với giá ưu đãi.'
                            : 'Select a vehicle to view the complete body kit. Buy individual parts or the full set.'}
                    </motion.p>

                    <motion.form
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                        onSubmit={handleSearch}
                        className="max-w-md mx-auto relative"
                    >
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                            type="text"
                            value={searchInput}
                            onChange={e => setSearchInput(e.target.value)}
                            placeholder={language === 'vi' ? 'Tìm theo tên xe, hãng...' : 'Search by vehicle name, brand...'}
                            className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-red-600 transition-colors shadow-sm"
                        />
                    </motion.form>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="bg-card border border-border rounded-xl overflow-hidden animate-pulse">
                                <div className="aspect-[16/10] bg-muted" />
                                <div className="p-4 space-y-3">
                                    <div className="h-3 bg-muted rounded w-16" />
                                    <div className="h-5 bg-muted rounded w-3/4" />
                                    <div className="h-4 bg-muted rounded w-1/2" />
                                    <div className="h-6 bg-muted rounded w-1/3" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : vehicles.length === 0 ? (
                    <div className="text-center py-16 bg-card/50 rounded-2xl border border-border">
                        <Car className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                            {language === 'vi' ? 'Không tìm thấy xe nào' : 'No vehicles found'}
                        </h3>
                        <p className="text-muted-foreground">
                            {language === 'vi' ? 'Thử tìm kiếm với từ khóa khác' : 'Try searching with different keywords'}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {vehicles.map((vehicle, index) => (
                                <motion.div
                                    key={vehicle.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <VehicleCard vehicle={vehicle} onClick={onVehicleClick ? () => onVehicleClick(vehicle.id) : () => { }} />
                                </motion.div>
                            ))}
                        </div>

                        {metadata && metadata.totalPages > 1 && (
                            <div className="flex items-center justify-center gap-4 mt-12">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="p-2 rounded-lg bg-card border border-border hover:border-red-600 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <span className="text-sm font-medium text-muted-foreground">
                                    {page} / {metadata.totalPages}
                                </span>
                                <button
                                    onClick={() => setPage(p => Math.min(metadata.totalPages, p + 1))}
                                    disabled={page === metadata.totalPages}
                                    className="p-2 rounded-lg bg-card border border-border hover:border-red-600 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </section>
    );
}

import { motion } from 'motion/react';
import { Car, Layers, ArrowRight } from 'lucide-react';
import { Vehicle } from '@/shared/types';
import { useI18n } from '@/shared/lib/i18n';

interface VehicleCardProps {
    vehicle: Vehicle;
    onClick: (vehicleId: string) => void;
}

export function VehicleCard({ vehicle, onClick }: VehicleCardProps) {
    const { language } = useI18n();

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat(language === 'vi' ? 'vi-VN' : 'en-US', {
            style: 'currency',
            currency: language === 'vi' ? 'VND' : 'USD',
        }).format(language === 'vi' ? price : price / 25000);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            className="bg-card border border-border rounded-xl overflow-hidden hover:border-red-600/50 transition-all cursor-pointer group"
            onClick={() => onClick(vehicle.id)}
        >
            <div className="aspect-[16/10] bg-muted overflow-hidden relative">
                {vehicle.image ? (
                    <img
                        src={vehicle.image}
                        alt={vehicle.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Car className="w-16 h-16 text-muted-foreground/30" />
                    </div>
                )}
                <div className="absolute top-3 right-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1">
                    <Layers className="w-3 h-3" />
                    {vehicle.partsCount} parts
                </div>
            </div>

            <div className="p-4">
                <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                    {vehicle.brand}
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-1">
                    {vehicle.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-1">
                    {vehicle.model} {vehicle.year ? `(${vehicle.year})` : ''}
                </p>

                <div className="flex items-center justify-between">
                    <div>
                        <span className="text-xs text-muted-foreground block">
                            {language === 'vi' ? 'Trọn bộ' : 'Full kit'}
                        </span>
                        <span className="text-red-600 font-bold text-lg">
                            {formatPrice(vehicle.totalPrice)}
                        </span>
                    </div>
                    <motion.div
                        whileHover={{ x: 4 }}
                        className="w-10 h-10 rounded-full bg-red-600/10 flex items-center justify-center group-hover:bg-red-600 transition-colors"
                    >
                        <ArrowRight className="w-5 h-5 text-red-600 group-hover:text-white transition-colors" />
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}

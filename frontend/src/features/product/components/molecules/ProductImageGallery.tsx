import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { formatImageUrl } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface ProductImageGalleryProps {
    images: string[];
    productName: string;
}

export function ProductImageGallery({ images, productName }: ProductImageGalleryProps) {
    const [selectedIndex, setSelectedIndex] = useState(0);

    // Ensure we have at least one image/placeholder
    const displayImages = images.length > 0 ? images : [''];

    return (
        <div className="flex flex-col gap-4">
            {/* Main Image */}
            <div className="relative aspect-square bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 group">
                <AnimatePresence mode="wait">
                    <motion.img
                        key={selectedIndex}
                        src={formatImageUrl(displayImages[selectedIndex], 800)}
                        alt={`${productName} - View ${selectedIndex + 1}`}
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="w-full h-full object-cover"
                    />
                </AnimatePresence>

                {/* Helper text/overlay can go here */}
            </div>

            {/* Thumbnails */}
            {displayImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {displayImages.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => setSelectedIndex(idx)}
                            className={cn(
                                "relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all",
                                selectedIndex === idx
                                    ? "border-red-600 ring-2 ring-red-600/30"
                                    : "border-transparent opacity-70 hover:opacity-100 hover:border-gray-700"
                            )}
                        >
                            <img
                                src={formatImageUrl(img, 150)}
                                alt={`Thumbnail ${idx + 1}`}
                                className="w-full h-full object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

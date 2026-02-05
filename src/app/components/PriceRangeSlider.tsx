import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { RotateCcw } from 'lucide-react';

interface PriceRangeSliderProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  onApply?: () => void;
}

export function PriceRangeSlider({ min, max, value, onChange }: PriceRangeSliderProps) {
  const [isDragging, setIsDragging] = useState<'min' | 'max' | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef<'min' | 'max' | null>(null);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const formatPriceShort = (price: number) => {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)} triệu`;
    }
    if (price >= 1000) {
      return `${(price / 1000).toFixed(0)}k`;
    }
    return formatPrice(price);
  };

  const calculateValue = useCallback((clientX: number) => {
    if (!sliderRef.current) return null;
    
    const rect = sliderRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return Math.round(min + percent * (max - min));
  }, [min, max]);

  const handlePointerDown = (thumb: 'min' | 'max') => (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(thumb);
    isDraggingRef.current = thumb;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!isDraggingRef.current) return;
    
    const newValue = calculateValue(e.clientX);
    if (newValue === null) return;

    if (isDraggingRef.current === 'min') {
      const newMin = Math.min(newValue, value[1] - 100000);
      onChange([Math.max(min, newMin), value[1]]);
    } else {
      const newMax = Math.max(newValue, value[0] + 100000);
      onChange([value[0], Math.min(max, newMax)]);
    }
  }, [calculateValue, value, onChange, min, max]);

  const handlePointerUp = useCallback((e: PointerEvent) => {
    if (isDraggingRef.current) {
      (e.target as HTMLElement).releasePointerCapture((e as any).pointerId);
    }
    setIsDragging(null);
    isDraggingRef.current = null;
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      
      return () => {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
      };
    }
  }, [isDragging, handlePointerMove, handlePointerUp]);

  const handleReset = () => {
    onChange([min, max]);
  };

  const minPercent = ((value[0] - min) / (max - min)) * 100;
  const maxPercent = ((value[1] - min) / (max - min)) * 100;

  return (
    <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-6 select-none shadow-2xl">
      {/* Header */}
      <div className="text-center mb-6">
        <h3 className="text-xl font-black text-white tracking-wide">KHOẢNG GIÁ</h3>
        <div className="h-1 w-20 bg-gradient-to-r from-red-600 via-red-500 to-red-400 mx-auto mt-3 rounded-full shadow-lg shadow-red-600/50"></div>
      </div>

      {/* Current Price Range Display */}
      <div className="mb-6 text-center">
        <div className="inline-flex items-center gap-3 bg-gradient-to-r from-red-600/10 to-red-500/10 border border-red-600/30 rounded-xl px-6 py-3">
          <div className="flex flex-col items-end">
            <span className="text-xs text-gray-400 font-medium mb-0.5">TỪ</span>
            <span className="text-lg font-black text-red-500">{formatPrice(value[0])}đ</span>
          </div>
          <div className="w-px h-10 bg-gradient-to-b from-transparent via-red-600/50 to-transparent"></div>
          <div className="flex flex-col items-start">
            <span className="text-xs text-gray-400 font-medium mb-0.5">ĐẾN</span>
            <span className="text-lg font-black text-red-500">{formatPrice(value[1])}đ</span>
          </div>
        </div>
      </div>

      {/* Slider Labels */}
      <div className="flex justify-between items-center mb-3 px-1">
        <span className="text-xs text-gray-500 font-bold">0đ</span>
        <span className="text-xs text-gray-500 font-bold">{formatPriceShort(max)}</span>
      </div>

      {/* Slider */}
      <div className="mb-8">
        <div className="relative pb-2" ref={sliderRef}>
          {/* Track Background */}
          <div className="h-2.5 bg-gradient-to-r from-gray-800 via-gray-750 to-gray-800 rounded-full relative shadow-inner border border-gray-700/50">
            {/* Active Range with glow */}
            <div 
              className="absolute inset-y-0 bg-gradient-to-r from-red-600 via-red-500 to-red-600 rounded-full shadow-[0_0_20px_rgba(220,38,38,0.6)]"
              style={{
                left: `${minPercent}%`,
                right: `${100 - maxPercent}%`
              }}
            >
              {/* Inner glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-red-400/40 via-red-300/40 to-red-400/40 rounded-full blur-sm"></div>
            </div>
          </div>

          {/* Min Thumb */}
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 cursor-grab active:cursor-grabbing touch-none z-10"
            style={{ left: `${minPercent}%` }}
            onPointerDown={handlePointerDown('min')}
            whileHover={{ scale: 1.2 }}
            animate={{ 
              scale: isDragging === 'min' ? 1.3 : 1,
            }}
          >
            <div className="relative pointer-events-none">
              {/* Outer glow ring */}
              <div className="absolute inset-0 bg-red-600 rounded-full blur-xl opacity-60 scale-150"></div>
              {/* Middle glow */}
              <div className="absolute inset-0 bg-red-500 rounded-full blur-md opacity-80 scale-125"></div>
              {/* Thumb */}
              <div className="relative w-7 h-7 bg-gradient-to-br from-red-500 via-red-600 to-red-700 rounded-full shadow-2xl shadow-red-600/80 border-[3px] border-white/20 pointer-events-auto" >
                <div className="absolute inset-[3px] bg-gradient-to-br from-red-400/50 to-transparent rounded-full"></div>
              </div>
            </div>
          </motion.div>

          {/* Max Thumb */}
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 cursor-grab active:cursor-grabbing touch-none z-10"
            style={{ left: `${maxPercent}%` }}
            onPointerDown={handlePointerDown('max')}
            whileHover={{ scale: 1.2 }}
            animate={{ 
              scale: isDragging === 'max' ? 1.3 : 1,
            }}
          >
            <div className="relative pointer-events-none">
              {/* Outer glow ring */}
              <div className="absolute inset-0 bg-red-600 rounded-full blur-xl opacity-60 scale-150"></div>
              {/* Middle glow */}
              <div className="absolute inset-0 bg-red-500 rounded-full blur-md opacity-80 scale-125"></div>
              {/* Thumb */}
              <div className="relative w-7 h-7 bg-gradient-to-br from-red-500 via-red-600 to-red-700 rounded-full shadow-2xl shadow-red-600/80 border-[3px] border-white/20 pointer-events-auto" >
                <div className="absolute inset-[3px] bg-gradient-to-br from-red-400/50 to-transparent rounded-full"></div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Reset Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleReset}
        className="w-full py-3.5 bg-gradient-to-r from-gray-800 via-gray-750 to-gray-800 border-2 border-gray-700 text-gray-300 font-bold rounded-lg hover:bg-gradient-to-r hover:from-gray-700 hover:via-gray-650 hover:to-gray-700 hover:border-gray-600 transition-all flex items-center justify-center gap-2 group"
      >
        <RotateCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
        <span>Xoá lọc</span>
      </motion.button>
    </div>
  );
}
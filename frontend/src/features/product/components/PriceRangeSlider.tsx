import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { RotateCcw, ArrowDown, ArrowUp } from 'lucide-react';

interface PriceRangeSliderProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  onApply?: () => void;
}

const MIN_GAP = 100000;

export function PriceRangeSlider({ min, max, value, onChange, onApply }: PriceRangeSliderProps) {
  const [minInput, setMinInput] = useState('');
  const [maxInput, setMaxInput] = useState('');

  useEffect(() => {
    setMinInput(formatNumber(value[0]));
    setMaxInput(formatNumber(value[1]));
  }, [value]);

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  const parseNumber = (str: string): number => {
    const cleaned = str.replace(/\./g, '').replace(/[^\d]/g, '');
    return cleaned ? parseInt(cleaned, 10) : 0;
  };

  // Auto-format while typing
  const handleMinInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\./g, '').replace(/[^\d]/g, '');
    if (raw === '') {
      setMinInput('');
    } else {
      const num = parseInt(raw, 10);
      setMinInput(formatNumber(num));
    }
  };

  const handleMaxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\./g, '').replace(/[^\d]/g, '');
    if (raw === '') {
      setMaxInput('');
    } else {
      const num = parseInt(raw, 10);
      setMaxInput(formatNumber(num));
    }
  };

  const handleMinInputBlur = () => {
    const parsed = parseNumber(minInput);
    const currentMax = parseNumber(maxInput);
    let newMin = Math.max(min, Math.min(currentMax - MIN_GAP, parsed));
    setMinInput(formatNumber(newMin));
    onChange([newMin, currentMax]);
  };

  const handleMaxInputBlur = () => {
    const parsed = parseNumber(maxInput);
    const currentMin = parseNumber(minInput);
    let newMax = Math.max(currentMin + MIN_GAP, Math.min(max, parsed));
    setMaxInput(formatNumber(newMax));
    onChange([currentMin, newMax]);
  };

  const handleReset = () => {
    setMinInput(formatNumber(min));
    setMaxInput(formatNumber(max));
    onChange([min, max]);
    if (onApply) {
      setTimeout(() => onApply(), 0);
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-5 shadow-2xl">
      {/* Header */}
      <div className="text-center mb-5">
        <h3 className="text-lg font-black text-white tracking-wide">KHOẢNG GIÁ</h3>
        <div className="h-0.5 w-16 bg-gradient-to-r from-red-600 to-red-400 mx-auto mt-2 rounded-full"></div>
      </div>

      {/* Price Inputs */}
      <div className="space-y-3 mb-5">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <ArrowDown className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={minInput}
            onChange={handleMinInputChange}
            onBlur={handleMinInputBlur}
            onKeyDown={(e) => e.key === 'Enter' && handleMinInputBlur()}
            className="w-full pl-10 pr-10 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white font-semibold text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/50 transition-all"
            placeholder="0"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs font-medium">đ</span>
        </div>

        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <ArrowUp className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={maxInput}
            onChange={handleMaxInputChange}
            onBlur={handleMaxInputBlur}
            onKeyDown={(e) => e.key === 'Enter' && handleMaxInputBlur()}
            className="w-full pl-10 pr-10 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white font-semibold text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/50 transition-all"
            placeholder={formatNumber(max)}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs font-medium">đ</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleReset}
          className="flex-1 py-2.5 bg-gray-800 border border-gray-700 text-gray-300 font-semibold rounded-lg hover:bg-gray-700 transition-all flex items-center justify-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </motion.button>
        {onApply && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onApply}
            className="flex-[2] py-2.5 bg-gradient-to-r from-red-600 to-red-500 text-white font-bold rounded-lg hover:from-red-700 hover:to-red-600 transition-all shadow-lg shadow-red-600/30"
          >
            Áp dụng
          </motion.button>
        )}
      </div>
    </div>
  );
}
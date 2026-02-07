import { motion, AnimatePresence } from 'motion/react';
import { Check, ShoppingCart, Sparkles, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface AddToCartToastProps {
  show: boolean;
  productName: string;
  onClose: () => void;
}

export function AddToCartToast({ show, productName, onClose }: AddToCartToastProps) {
  const [confetti, setConfetti] = useState<Array<{ id: number; x: number; y: number; rotation: number; delay: number }>>([]);

  useEffect(() => {
    if (show) {
      // Generate confetti particles
      const particles = Array.from({ length: 15 }, (_, i) => ({
        id: i,
        x: Math.random() * 200 - 100,
        y: Math.random() * -200 - 50,
        rotation: Math.random() * 360,
        delay: Math.random() * 0.2
      }));
      setConfetti(particles);

      const timer = setTimeout(() => {
        onClose();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] pointer-events-none"
        >
          {/* Confetti particles */}
          {confetti.map((particle) => (
            <motion.div
              key={particle.id}
              initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
              animate={{
                x: particle.x,
                y: particle.y,
                opacity: 0,
                rotate: particle.rotation
              }}
              transition={{
                duration: 1,
                delay: particle.delay,
                ease: 'easeOut'
              }}
              className="absolute top-1/2 left-1/2"
            >
              <Sparkles className="w-3 h-3 text-yellow-400" />
            </motion.div>
          ))}

          {/* Toast card */}
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: [0.8, 1.1, 1] }}
            transition={{ duration: 0.5, times: [0, 0.6, 1] }}
            className="relative bg-gradient-to-r from-green-600 to-green-500 text-white px-6 py-4 rounded-xl shadow-2xl shadow-green-600/50 border-2 border-green-400 min-w-[300px] max-w-md"
          >
            {/* Glow effect */}
            <div className="absolute inset-0 bg-green-400 rounded-xl blur-xl opacity-30 -z-10"></div>

            <div className="flex items-center gap-3">
              {/* Success icon with ripple */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="relative"
              >
                <motion.div
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="absolute inset-0 bg-white rounded-full opacity-20"
                />
                <div className="relative bg-white rounded-full p-2">
                  <Check className="w-5 h-5 text-green-600" strokeWidth={3} />
                </div>
              </motion.div>

              <div className="flex-1">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="font-black text-sm"
                >
                  Đã thêm vào giỏ hàng!
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-xs text-green-100 line-clamp-1"
                >
                  {productName}
                </motion.div>
              </div>

              {/* Cart icon animation */}
              <motion.div
                animate={{
                  y: [0, -5, 0],
                  rotate: [0, -10, 10, 0]
                }}
                transition={{
                  duration: 0.5,
                  repeat: 2,
                  delay: 0.5
                }}
              >
                <ShoppingCart className="w-5 h-5" />
              </motion.div>
            </div>

            {/* Progress bar */}
            <motion.div
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: 3, ease: 'linear' }}
              className="absolute bottom-0 left-0 right-0 h-1 bg-white/30 origin-left rounded-b-xl"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

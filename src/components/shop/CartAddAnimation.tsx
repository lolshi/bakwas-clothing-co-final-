import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

interface CartAddAnimationProps {
  isVisible: boolean;
  productImage?: string;
}

const CartAddAnimation: React.FC<CartAddAnimationProps> = ({ isVisible }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-black/90 text-white px-4 py-3 rounded-full shadow-lg"
        >
          <CheckCircle2 className="w-5 h-5 text-neon-cyan animate-pulse" />
          <span className="text-sm font-medium">Added to cart</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CartAddAnimation; 
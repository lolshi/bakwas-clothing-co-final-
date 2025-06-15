import React from 'react';
import { animated, SpringValue } from '@react-spring/web';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart } from "lucide-react";

// Define the Product type based on its usage in FeaturedCoverflow.tsx
interface Product {
  id: string;
  name: string;
  price: number;
  images: string[] | null;
  is_featured?: boolean; // Optional, as it might not be used directly in card rendering
  // Add any other product fields if used by the card
}

interface CoverflowCardProps {
  product: Product;
  style: { 
    transform?: SpringValue<any>;
    zIndex?: SpringValue<number>; 
    opacity?: SpringValue<number>;
    display?: SpringValue<string>;
    [key: string]: any; // Allow other spring-driven properties
  };
  isActive: boolean;
  onCardClick: () => void;
  onAddToCart: (product: Product) => void;
  onWishlistToggle: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
}

export const CoverflowCard: React.FC<CoverflowCardProps> = ({
  product,
  style,
  isActive,
  onCardClick,
  onAddToCart,
  onWishlistToggle,
  isInWishlist
}) => {
  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when clicking button
    onAddToCart(product);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onWishlistToggle(product);
  };

  return (
    <animated.div
      style={style} // react-spring's animated component can handle SpringValues directly
      className={`absolute card w-64 h-[455px] md:w-80 md:h-[569px] rounded-3xl overflow-visible cursor-pointer border-2 transition-shadow duration-300 ease-in-out ${
        isActive 
          ? 'border-neon-purple shadow-neon-purple' 
          : 'border-neon-purple/40 shadow-neon-purple/40 hover:border-neon-purple/70 hover:shadow-neon-purple/60'
      }`}
      onClick={onCardClick} // Use the passed handler, usually to bring card to center
    >
      <div className="relative w-full h-full group bg-gradient-to-b from-black/10 via-black/30 to-black/80 backdrop-blur-md rounded-3xl overflow-hidden">
        {/* Product Image - Normalized 4:3 Aspect Ratio */}
        <div className="relative w-full h-4/5 overflow-hidden bg-black/20 rounded-t-3xl">
          <img 
            src={product.images?.[0] || "/placeholder-image.webp"} // Fallback image
            alt={product.name}
            className="w-full h-full object-cover object-center transition-transform duration-500 ease-in-out group-hover:scale-110 rounded-t-3xl"
            style={{ 
              aspectRatio: '4/3',
              minHeight: '100%',
              minWidth: '100%'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
          
          {/* Hot badge - Framer Motion for emphasis */}
          {isActive && (
            <motion.div 
              className="absolute top-3 right-3 bg-gradient-to-r from-neon-orange to-neon-pink text-white px-3 py-1 rounded-full text-xs font-anton shadow-lg"
              initial={{ scale: 0.8, opacity: 0, y: -10 }}
              animate={{ 
                scale: [1, 1.15, 1], 
                opacity: 1, 
                y: 0,
                boxShadow: [
                  "0 0 8px rgba(255,100,0,0.4), 0 0 12px rgba(255,0,100,0.4)",
                  "0 0 16px rgba(255,100,0,0.7), 0 0 24px rgba(255,0,100,0.7)",
                  "0 0 8px rgba(255,100,0,0.4), 0 0 12px rgba(255,0,100,0.4)"
                ]
              }}
              transition={{ 
                scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 },
                boxShadow: { duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 },
                opacity: { duration: 0.3, ease: "easeOut" },
                y: { duration: 0.3, ease: "easeOut" },
              }}
            >
              🔥 HOT
            </motion.div>
          )}
        </div>
        
        {/* Product Info */}
        <div className="p-3 md:p-4 h-1/5 flex flex-col justify-center bg-gradient-to-t from-black/90 via-black/60 to-transparent backdrop-blur-sm border-t border-neon-cyan/20 rounded-b-3xl">
          <div className="text-center">
            <h3 className="text-sm md:text-base lg:text-lg font-anton uppercase tracking-wider mb-1 text-transparent bg-gradient-to-r from-neon-pink via-neon-orange to-neon-purple bg-clip-text line-clamp-1 drop-shadow-md">
              {product.name}
            </h3>
            <p 
              className={`text-base md:text-lg lg:text-xl font-anton font-bold text-transparent bg-clip-text drop-shadow-md transition-all duration-300 ease-in-out ${
                isActive ? 'bg-gradient-to-r from-neon-cyan via-neon-pink to-neon-orange scale-105' : 'bg-gradient-to-r from-neon-cyan/80 via-neon-pink/80 to-neon-orange/80'
              }`}
            >
              ₹{product.price.toLocaleString()}
            </p>
          </div>
          
          {/* Action buttons - Appear on hover (if not active) or always visible if active */}
          <div className={`absolute bottom-3 left-3 right-3 flex gap-2 transition-all duration-300 ease-in-out ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
            <Button 
              size="sm"
              variant="default"
              className="flex-1 bg-neon-cyan hover:bg-neon-cyan/90 text-black font-space font-semibold text-xs md:text-sm py-2 rounded-xl transition-all transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg shadow-neon-cyan/40 hover:shadow-neon-cyan/60 border border-neon-cyan/50"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="h-3 w-3 md:h-4 md:w-4 mr-1" /> ADD
            </Button>
            <Button 
              size="sm"
              variant="outline"
              className={`flex-1 font-space font-semibold text-xs md:text-sm py-2 rounded-xl transition-all transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg ${isInWishlist(product.id) ? 'bg-neon-pink text-black border-neon-pink shadow-neon-pink/60 hover:shadow-neon-pink/80' : 'text-neon-pink border-neon-pink hover:bg-neon-pink/20 shadow-neon-pink/30 hover:shadow-neon-pink/50'}`}
              onClick={handleWishlistToggle}
            >
              <Heart className="h-3 w-3 md:h-4 md:w-4 mr-1" /> {isInWishlist(product.id) ? 'ADDED' : 'WISH'}
            </Button>
          </div>
        </div>
      </div>
    </animated.div>
  );
}; 
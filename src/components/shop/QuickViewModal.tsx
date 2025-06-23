import React, { useState, useRef, useEffect } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Heart, X, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { Product as BaseProduct } from '@/pages/Shop';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { motion, AnimatePresence } from 'framer-motion';
import { getColorDisplayName, getColorNameFromHex, getHexFromColorValue, getNearestColorFamilyAndShade } from '@/config/colors';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';

interface QuickViewModalProps {
  product: BaseProduct | null;
  isOpen: boolean;
  onClose: () => void;
  shouldFocus?: boolean;
  onDidFocus?: () => void;
}

// Extend Product type to include variants for modal use
interface ProductWithVariants extends BaseProduct {
  variants?: { color: string; size: string; stock: number; images: string[] }[];
  colorImages?: { [color: string]: string[] };
}

// Color mapping for swatches
const colorMap: Record<string, { name: string; code: string }> = {
  // Basic Colors
  'Black': { name: 'Black', code: '#000000' },
  'White': { name: 'White', code: '#FFFFFF' },
  'Navy Blue': { name: 'Navy Blue', code: '#000080' },
  'Grey': { name: 'Grey', code: '#808080' },
  'Red': { name: 'Red', code: '#FF0000' },
  'Royal Blue': { name: 'Royal Blue', code: '#4169E1' },
  'Maroon': { name: 'Maroon', code: '#800000' },
  'Olive Green': { name: 'Olive Green', code: '#556B2F' },
  'Mustard Yellow': { name: 'Mustard Yellow', code: '#FFDB58' },
  'Bottle Green': { name: 'Bottle Green', code: '#006A4E' },
  'Sky Blue': { name: 'Sky Blue', code: '#87CEEB' },
  'Pink': { name: 'Pink', code: '#FFC0CB' },
  'Beige': { name: 'Beige', code: '#F5F5DC' },
  'Brown': { name: 'Brown', code: '#A52A2A' },
  'Orange': { name: 'Orange', code: '#FFA500' },
  'Lavender': { name: 'Lavender', code: '#E6E6FA' },
  'Turquoise': { name: 'Turquoise', code: '#40E0D0' },
  'Peach': { name: 'Peach', code: '#FFDAB9' },
  'Charcoal': { name: 'Charcoal', code: '#36454F' },
  'Mint Green': { name: 'Mint Green', code: '#98FF98' },
  
  // Hex colors will use themselves
  '#000000': { name: 'Black', code: '#000000' },
  '#FFFFFF': { name: 'White', code: '#FFFFFF' }
};

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, isOpen, onClose, shouldFocus = false, onDidFocus }) => {
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { addToCart, items } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();
  const [justAdded, setJustAdded] = useState(false);

  // Reset selections when modal opens
  React.useEffect(() => {
    if (isOpen && product) {
      setSelectedSize('');
      setSelectedColor(product.selectedColor || product.colors?.[0] || '');
      setQuantity(1);
      setSelectedImageIndex(0);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, product]);

  // Focus trap for accessibility
  useEffect(() => {
    if (isOpen && shouldFocus && closeBtnRef.current) {
      closeBtnRef.current.focus();
      if (onDidFocus) onDidFocus();
    }
  }, [isOpen, shouldFocus, onDidFocus]);

  if (!isOpen || !product) return null;

  // Cast product to ProductWithVariants for type safety
  const productWithVariants = product as ProductWithVariants;

  // Get available images based on selected color
  const getAvailableImages = () => {
    console.log('🔍 [QuickViewModal] Getting available images:', {
      selectedColor,
      productVariants: productWithVariants.variants,
      productImages: product.images,
      productImage: product.image,
      colorImages: product.colorImages
    });

    if (productWithVariants.variants) {
      const variant = productWithVariants.variants.find(v => v.color === selectedColor);
      console.log('🎨 [QuickViewModal] Found variant:', variant);
      return variant?.images || product.images || [product.image];
    }
    return product.images || [product.image];
  };

  const availableImages = getAvailableImages();

  // Helper to check if the current variant is in the cart
  const isInCart = () => {
    if (!product || !selectedSize || !selectedColor) return false;
    return items.some(item =>
      item.productId === product.id &&
      item.selectedSize === selectedSize &&
      item.selectedColor === selectedColor
    );
  };

  const handleAddToCart = () => {
    addToCart(product, selectedSize, selectedColor, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1000);
  };

  const handleWishlistToggle = () => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const selectImage = (index: number) => {
    setSelectedImageIndex(index);
  };

  const selectColor = (color: string) => {
    setSelectedColor(color);
    setSelectedImageIndex(0); // Reset image index when color changes
  };

  // Get color display information
  const getColorDisplay = (color: string) => {
    if (color.startsWith('#')) {
      const nearest = getNearestColorFamilyAndShade(color);
      return { name: `${nearest.baseFamily} (${nearest.displayName})`, code: color };
    }
    // If it's a named color value
    return { name: getColorDisplayName(color), code: getHexFromColorValue(color) };
  };

  // Get available colors
  const availableColors = product.colors?.map(color => getColorDisplay(color)) || [];

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />
          {/* Modal Container */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 400 }}
            className="relative w-full max-w-5xl max-h-[100dvh] bg-black/40 backdrop-blur-2xl rounded-3xl overflow-hidden border border-white/10 shadow-2xl"
          >
            {/* Close Button */}
            <button
              ref={closeBtnRef}
              onClick={onClose}
              className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            {/* Scrollable Content */}
            <div className="h-[100dvh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
                {/* Left Column - Image Gallery */}
                <div className="space-y-4">
                  {/* Main Image */}
                  <motion.div 
                    key={selectedImageIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="relative rounded-2xl overflow-hidden flex items-center justify-center min-h-[400px] bg-gradient-to-br from-white/5 to-white/10 p-4"
                  >
                    <img 
                      src={availableImages[selectedImageIndex]}
                      alt={product.title}
                      className="max-w-full max-h-[500px] object-contain rounded-xl"
                    />

                    {/* Navigation Arrows */}
                    {availableImages.length > 1 && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            selectImage((selectedImageIndex - 1 + availableImages.length) % availableImages.length);
                          }}
                          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/20 hover:bg-black/30 backdrop-blur-md transition-all"
                        >
                          <ChevronLeft className="w-6 h-6 text-white" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            selectImage((selectedImageIndex + 1) % availableImages.length);
                          }}
                          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/20 hover:bg-black/30 backdrop-blur-md transition-all"
                        >
                          <ChevronRight className="w-6 h-6 text-white" />
                        </button>
                      </>
                    )}
                  </motion.div>

                  {/* Thumbnail Gallery */}
                  {availableImages.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {availableImages.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => selectImage(index)}
                          className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                            selectedImageIndex === index
                              ? 'border-neon-cyan shadow-lg shadow-neon-cyan/20'
                              : 'border-transparent hover:border-white/20'
                          }`}
                        >
                          <img
                            src={image}
                            alt={`${product.title} - View ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right Column - Product Details */}
                <div className="space-y-8">
                  {/* Header */}
                  <div>
                    <motion.h2 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-4xl font-bold text-white mb-2"
                    >
                      {product.title}
                    </motion.h2>
                    <motion.div 
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: '100px' }}
                      className="h-1 bg-gradient-to-r from-neon-cyan to-neon-pink"
                    />
                  </div>

                  {/* Price */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-baseline"
                  >
                    <span className="text-2xl text-white/60">₹</span>
                    <span className="text-5xl font-bold text-white ml-1">{product.price}</span>
                  </motion.div>

                  {/* Description */}
                  <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-lg text-white/80 leading-relaxed"
                  >
                    {product.description}
                  </motion.p>

                  {/* Color Selection */}
                  {availableColors.length > 0 && (
                    <div className="space-y-4">
                      <label className="block text-sm font-medium text-white/80">
                        Color: {selectedColor ? getColorDisplay(selectedColor).name : availableColors[0].name}
                      </label>
                      <div className="flex flex-wrap gap-3">
                        {availableColors.map(({ name, code }) => (
                          <button
                            key={code}
                            onClick={() => selectColor(code)}
                            className={`w-10 h-10 rounded-lg transition-all transform hover:scale-110 ${
                              selectedColor === code
                                ? 'ring-2 ring-offset-2 ring-offset-black ring-neon-cyan scale-110'
                                : 'ring-1 ring-white/20'
                            }`}
                            style={{ 
                              backgroundColor: code,
                              border: '1px solid rgba(255, 255, 255, 0.2)'
                            }}
                            title={name}
                          >
                            <span className="sr-only">{name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Size Selection */}
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-white/80">
                      Size: {selectedSize || 'Select a size'}
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {(productWithVariants.variants && selectedColor
                        ? productWithVariants.variants.filter((v: { color: string }) => v.color === selectedColor).map((v: { size: string }) => v.size)
                        : productWithVariants.sizes
                      ).filter((v: string, i: number, arr: string[]) => arr.indexOf(v) === i).map((size: string) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`px-4 py-2 rounded-lg transition-all ${
                            selectedSize === size
                              ? 'bg-neon-cyan text-black font-medium scale-105'
                              : 'bg-white/10 text-white hover:bg-white/20'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quantity Selection */}
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-white/80">
                      Quantity
                    </label>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                        className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                      >
                        -
                      </button>
                      <span className="text-xl font-medium text-white">{quantity}</span>
                      <button
                        onClick={() => setQuantity(q => q + 1)}
                        className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4">
                    <Button
                      onClick={handleAddToCart}
                      className={`flex-1 bg-gradient-to-r from-neon-cyan to-neon-pink hover:from-neon-cyan/80 hover:to-neon-pink/80 text-black font-bold py-6 relative overflow-hidden transition-all duration-300 ${justAdded ? 'bg-green-500 scale-105' : ''}`}
                      disabled={!selectedSize || !selectedColor}
                    >
                      {justAdded ? (
                        <span className="flex items-center gap-1 justify-center">
                          <CheckCircle className="w-5 h-5 mr-1" />
                          Added!
                        </span>
                      ) : (
                        <span className="flex items-center"><ShoppingCart className="w-5 h-5 mr-2" />Add to Cart</span>
                      )}
                    </Button>
                    <Button
                      onClick={() => navigate('/cart')}
                      className="flex-1 bg-gradient-to-r from-neon-pink to-neon-cyan text-black font-bold py-6 transition-all duration-300"
                      disabled={!isInCart()}
                    >
                      Go to Cart
                    </Button>
                    <button
                      onClick={handleWishlistToggle}
                      className={`relative transition-all duration-200 rounded-full w-12 h-12 flex items-center justify-center
                        ${isInWishlist(product.id)
                          ? 'bg-black/60 border border-neon-pink shadow-[0_0_12px_2px_rgba(255,0,153,0.4)]'
                          : 'bg-black/40 border border-white/20 hover:border-neon-cyan hover:shadow-[0_0_8px_2px_rgba(0,255,255,0.3)]'}
                        hover:scale-105 focus:outline-none focus:ring-2 focus:ring-neon-cyan/40`}
                      aria-label={isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                    >
                      <Heart
                        className={`w-6 h-6 transition-all duration-200
                          ${isInWishlist(product.id)
                            ? 'fill-neon-pink text-neon-pink drop-shadow-[0_0_6px_rgba(255,0,153,0.7)]'
                            : 'stroke-white text-white fill-none'}
                        `}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
    </div>,
    document.body
  );
};

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import "./FeaturedImageCard.css";

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[] | null;
}

interface FeaturedImageCardProps {
  product: Product;
  variant: "underline" | "ribbon" | "dock";
  onAddToCart: (product: Product) => void;
  onWishlistToggle: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  isActive?: boolean;
}

const FeaturedImageCard = ({
  product,
  variant,
  onAddToCart,
  onWishlistToggle,
  isInWishlist,
  isActive = false
}: FeaturedImageCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const renderUnderlineVariant = () => (
    <div className="relative w-full h-full overflow-hidden rounded-xl group">
      {/* Product Image */}
      <img 
        src={product.images?.[0] || "/lovable-uploads/7d520bd5-7bd2-434c-b701-948d803e6993.png"}
        alt={product.name}
        className="w-full h-full object-cover object-center transition-all duration-700 group-hover:scale-110"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = "/lovable-uploads/7d520bd5-7bd2-434c-b701-948d803e6993.png";
        }}
      />
      
      {/* Product Name Overlay */}
      <div className="absolute top-4 left-4 right-4 z-20">
        <h3 className="text-lg font-anton uppercase text-white text-center leading-tight"
            style={{
              textShadow: '2px 2px 4px rgba(0,0,0,0.8), 0 0 10px rgba(255,255,255,0.3)',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
              backdropFilter: 'blur(10px)',
              borderRadius: '12px',
              padding: '8px 16px',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
          {product.name}
        </h3>
      </div>

      {/* Wishlist Button */}
      <div className="absolute top-4 right-4 z-30">
        <Button 
          size="sm"
          variant="outline"
          className={`rounded-full p-2 backdrop-blur-md border-2 transition-all ${
            isInWishlist(product.id) 
              ? 'bg-gradient-to-r from-neon-pink to-red-500 text-white border-neon-pink' 
              : 'bg-white/20 text-white border-white/50 hover:bg-gradient-to-r hover:from-neon-pink hover:to-red-500'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            onWishlistToggle(product);
          }}
        >
          <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
        </Button>
      </div>

      {/* Underline Reveal Panel */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent backdrop-blur-md"
        initial={{ height: "2px", backgroundColor: "#00ffee" }}
        animate={{ 
          height: isHovered ? "20%" : "2px",
          backgroundColor: isHovered ? "transparent" : "#00ffee"
        }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        <AnimatePresence>
          {isHovered && (
            <motion.div
              className="flex flex-col items-center justify-center h-full p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2, delay: 0.1 }}
            >
              <p className="text-lg font-semibold text-white mb-2" style={{ fontFamily: 'Montserrat' }}>
                ₹{product.price.toLocaleString()}
              </p>
              <Button
                className="bg-white text-black hover:bg-gray-100 font-bold uppercase text-sm px-4 py-2"
                style={{ fontFamily: 'Lato' }}
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCart(product);
                }}
              >
                ADD TO CART
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );

  const renderRibbonVariant = () => (
    <div className="relative w-full h-full overflow-hidden rounded-xl group">
      {/* Product Image */}
      <img 
        src={product.images?.[0] || "/lovable-uploads/7d520bd5-7bd2-434c-b701-948d803e6993.png"}
        alt={product.name}
        className="w-full h-full object-cover object-center transition-all duration-700 group-hover:scale-110"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = "/lovable-uploads/7d520bd5-7bd2-434c-b701-948d803e6993.png";
        }}
      />
      
      {/* Product Name Overlay */}
      <div className="absolute top-4 left-4 right-4 z-20">
        <h3 className="text-lg font-anton uppercase text-white text-center leading-tight"
            style={{
              textShadow: '2px 2px 4px rgba(0,0,0,0.8), 0 0 10px rgba(255,255,255,0.3)',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
              backdropFilter: 'blur(10px)',
              borderRadius: '12px',
              padding: '8px 16px',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
          {product.name}
        </h3>
      </div>

      {/* Wishlist Button */}
      <div className="absolute top-4 right-4 z-30">
        <Button 
          size="sm"
          variant="outline"
          className={`rounded-full p-2 backdrop-blur-md border-2 transition-all ${
            isInWishlist(product.id) 
              ? 'bg-gradient-to-r from-neon-pink to-red-500 text-white border-neon-pink' 
              : 'bg-white/20 text-white border-white/50 hover:bg-gradient-to-r hover:from-neon-pink hover:to-red-500'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            onWishlistToggle(product);
          }}
        >
          <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
        </Button>
      </div>

      {/* Corner Ribbon Tab */}
      <motion.div
        className="absolute top-0 left-0 z-25"
        initial={{ rotate: -45, transformOrigin: "top left" }}
        animate={{ 
          rotate: isHovered ? 0 : -45,
          width: isHovered ? "100%" : "40px",
          height: isHovered ? "20%" : "40px"
        }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        style={{
          backgroundColor: "#ff0099",
          clipPath: isHovered ? "none" : "polygon(0 0, 100% 0, 0 100%)"
        }}
      >
        <div className="flex items-center justify-center h-full p-2">
          {!isHovered ? (
            <span className="text-white font-semibold text-sm rotate-45" style={{ fontFamily: 'Montserrat' }}>
              ₹{Math.floor(product.price / 1000)}K
            </span>
          ) : (
            <div className="flex items-center justify-between w-full px-4">
              <span className="text-white font-semibold text-lg" style={{ fontFamily: 'Montserrat' }}>
                ₹{product.price.toLocaleString()}
              </span>
              <Button
                className="bg-white text-pink-600 hover:bg-gray-100 font-bold uppercase text-sm px-4 py-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCart(product);
                }}
              >
                ADD
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );

  const renderDockVariant = () => (
    <div className="relative w-full h-full overflow-hidden rounded-xl group">
      {/* Product Image - Same size as other variants */}
      <img 
        src={product.images?.[0] || "/lovable-uploads/7d520bd5-7bd2-434c-b701-948d803e6993.png"}
        alt={product.name}
        className="w-full h-full object-cover object-center transition-all duration-700 group-hover:scale-110"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = "/lovable-uploads/7d520bd5-7bd2-434c-b701-948d803e6993.png";
        }}
      />

      {/* Wishlist Button */}
      <div className="absolute top-4 right-4 z-30">
        <Button 
          size="sm"
          variant="outline"
          className={`rounded-full p-2 backdrop-blur-md border-2 transition-all ${
            isInWishlist(product.id) 
              ? 'bg-gradient-to-r from-neon-pink to-red-500 text-white border-neon-pink' 
              : 'bg-white/20 text-white border-white/50 hover:bg-gradient-to-r hover:from-neon-pink hover:to-red-500'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            onWishlistToggle(product);
          }}
        >
          <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
        </Button>
      </div>

      {/* Price Display on Image - Always Visible */}
      <div className="absolute top-4 left-4 z-20">
        <div className="bg-black/60 backdrop-blur-md rounded-lg px-3 py-2 border border-white/20">
          <span className="text-white font-bold text-lg tracking-wide" 
                style={{ 
                  fontFamily: 'Inter, system-ui, sans-serif',
                  fontWeight: '700',
                  textShadow: '0 0 10px rgba(255,255,255,0.3)'
                }}>
            ₹{product.price.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Elegant Slide-Out Dock - ADD TO CART */}
      <motion.div
        className="absolute bottom-0 left-1/2 transform -translate-x-1/2 backdrop-blur-md"
        initial={{ 
          height: "3px", 
          width: "100%",
          y: 0,
          borderRadius: "0px",
          backgroundColor: "rgba(255, 255, 255, 0.2)"
        }}
        animate={{ 
          height: isHovered ? "45px" : "3px",
          width: isHovered ? "180px" : "100%",
          y: isHovered ? -8 : 0,
          borderRadius: isHovered ? "22px" : "0px",
          backgroundColor: isHovered ? "rgba(0, 0, 0, 0.4)" : "rgba(255, 255, 255, 0.2)"
        }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        style={{
          boxShadow: isHovered ? '0 4px 20px rgba(0, 0, 0, 0.3), 0 0 15px rgba(255, 255, 255, 0.1)' : 'none',
          border: isHovered ? '1px solid rgba(255, 255, 255, 0.2)' : 'none'
        }}
      >
        <AnimatePresence>
          {isHovered && (
            <motion.div
              className="flex items-center justify-center gap-2 h-full px-4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, delay: 0.05 }}
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(product);
              }}
              style={{ cursor: 'pointer' }}
            >
              <ShoppingCart className="h-4 w-4 text-white/90" />
              <span className="text-white/90 font-medium text-sm tracking-wide whitespace-nowrap" 
                    style={{ 
                      fontFamily: 'Inter, system-ui, sans-serif',
                      fontWeight: '500',
                      textShadow: '0 1px 3px rgba(0,0,0,0.5)'
                    }}>
                Add to Cart
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );

  const renderVariant = () => {
    switch (variant) {
      case "underline":
        return renderUnderlineVariant();
      case "ribbon":
        return renderRibbonVariant();
      case "dock":
        return renderDockVariant();
      default:
        return renderUnderlineVariant();
    }
  };

  return (
    <div 
      className="w-80 h-[30rem] cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {renderVariant()}
    </div>
  );
};

export default FeaturedImageCard; 
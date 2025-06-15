import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSprings, animated, config } from "@react-spring/web";
import { useDrag } from "@use-gesture/react";
import { ChevronLeft, ChevronRight, PauseCircle, PlayCircle, Heart, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuickViewModal } from "@/components/shop/QuickViewModal";
import { Product } from "@/pages/Shop";
import "./FeaturedCoverflow.css";
import { useNavigate } from "react-router-dom";

interface FeaturedCoverflowProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onWishlistToggle: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  title?: string;
}

const CARD_WIDTH = 320;
const CARD_HEIGHT = 480;
const CARD_GAP = 80;

const FeaturedCoverflow = ({ 
  products,
  onAddToCart,
  onWishlistToggle,
  isInWishlist,
  title = "Hot Right Now"
}: FeaturedCoverflowProps) => {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [isAutoAdvancing, setIsAutoAdvancing] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const autoAdvanceRef = useRef<NodeJS.Timeout>();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  const TOTAL = products.length;

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-advance functionality
  useEffect(() => {
    if (isAutoAdvancing && TOTAL > 1) {
      autoAdvanceRef.current = setInterval(() => {
        setIndex(prev => (prev + 1) % TOTAL);
      }, 4000);
    }
    return () => {
      if (autoAdvanceRef.current) {
        clearInterval(autoAdvanceRef.current);
      }
    };
  }, [isAutoAdvancing, TOTAL]);

  // Calculate coverflow style for each card with consistent scaling
  const coverflowStyle = (i: number, currentIndex: number) => {
    // Calculate the relative position from current index
    let offset = i - currentIndex;
    
    // Normalize offset to handle circular array
    if (offset > TOTAL / 2) {
      offset -= TOTAL;
    } else if (offset < -TOTAL / 2) {
      offset += TOTAL;
    }
    
    const absOffset = Math.abs(offset);
    
    // Consistent card dimensions
    const cardWidth = isMobile ? 224 : 320;
    const cardGap = isMobile ? 60 : 80;
    
    // Calculate position and rotation with consistent scaling
    const translateX = offset * (cardWidth * 0.6 + cardGap);
    const rotateY = offset * 25; // Reduced rotation for subtlety
    const scale = Math.max(0.75, 1 - Math.min(absOffset * 0.12, 0.25));
    const translateZ = absOffset === 0 ? 100 : -absOffset * 50; // Center card more forward
    const zIndex = TOTAL - absOffset;
    const opacity = absOffset > 2 ? 0 : Math.max(0.7, 1 - absOffset * 0.15);
    
    return {
      transform: `translateX(${translateX}px) translateZ(${translateZ}px) perspective(1200px) rotateY(${-rotateY}deg) scale(${scale})`,
      zIndex,
      opacity,
      display: absOffset > 3 ? 'none' : 'block',
      isCenter: absOffset === 0, // Center card identification
    };
  };

  const [springs, api] = useSprings(TOTAL, (i) => ({
    ...coverflowStyle(i, index),
    config: config.gentle,
  }));

  // Update springs when index changes
  useEffect(() => {
    api.start((i) => coverflowStyle(i, index));
  }, [index, isMobile, api]);

  // Drag/swipe functionality
  const bind = useDrag(
    ({ down, movement: [mx], direction: [dx], cancel }) => {
      if (down) {
        setIsAutoAdvancing(false);
      }
      
      if (!down && Math.abs(mx) > (isMobile ? 30 : 50)) {
        const newIndex = dx > 0 
          ? (index - 1 + TOTAL) % TOTAL 
          : (index + 1) % TOTAL;
        setIndex(newIndex);
        cancel();
        
        // Resume auto-advance after 3 seconds
        setTimeout(() => setIsAutoAdvancing(true), 3000);
      }
    },
    {
      axis: 'x',
      threshold: 10,
      filterTaps: true,
    }
  );

  const goToIndex = (newIndex: number) => {
    setIndex(newIndex);
    setIsAutoAdvancing(false);
    setTimeout(() => setIsAutoAdvancing(true), 3000);
  };

  const next = () => goToIndex((index + 1) % TOTAL);
  const previous = () => goToIndex((index - 1 + TOTAL) % TOTAL);

  const handleCardClick = (product: Product, i: number) => {
    if (i === index) {
      // Navigate to dedicated product page
      navigate(`/mobile-product-detail-test/${product.id}`);
    } else {
      // Bring clicked card to center
      goToIndex(i);
    }
  };

  if (products.length === 0) {
    return (
      <div className="py-16 text-center">
        <h2 className="text-3xl font-anton text-neon-purple mb-4">{title}</h2>
        <p className="text-slate-400 text-lg">No featured products available at the moment. Stay tuned!</p>
      </div>
    );
  }

  return (
    <motion.section 
      className="relative w-full py-6 md:py-8 overflow-hidden"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8 }}
    >
      <div className="container mx-auto px-4">
        {/* Clean 3D Header */}
        <section className="relative overflow-hidden py-2 mb-1">
          <div className="relative z-10 text-center">
            <h2 
              className="inline-block uppercase font-anton font-bold tracking-tight text-6xl md:text-8xl lg:text-9xl xl:text-[10rem]"
              style={{
                color: '#ffffff',
                textShadow: `
                  1px 1px 0 #e91e63,
                  2px 2px 0 #d81b60,
                  3px 3px 0 #c2185b,
                  4px 4px 0 #ad1457,
                  5px 5px 0 #880e4f,
                  6px 6px 0 #6a1b9a,
                  8px 8px 15px rgba(0,0,0,0.6)
                `,
                filter: 'drop-shadow(0 0 20px rgba(233,30,99,0.5))',
                transform: 'perspective(1000px) rotateX(3deg)'
              }}
            >
              HOT RIGHT NOW
            </h2>
            <p className="mt-2 text-xl md:text-2xl lg:text-3xl font-space-grotesk max-w-4xl mx-auto font-semibold text-white">
              Handpicked drip. Limited edition. Maximum impact. <span className="text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text font-bold">Don't sleep on these.</span>
            </p>
          </div>
        </section>
      </div>

      {/* 3D Coverflow Container */}
      <div 
        className="coverflow-container relative w-full overflow-hidden"
        style={{ 
          perspective: '1200px',
          perspectiveOrigin: 'center center',
          height: isMobile ? '420px' : '600px'
        }}
      >
        <div 
          {...bind()}
          className="flex items-center justify-center h-full cursor-grab active:cursor-grabbing touch-pan-y"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {springs.map((style, i) => (
            <animated.div
              key={products[i].id}
              style={style}
              className={`card absolute rounded-xl overflow-hidden ${
                isMobile ? 'w-56 h-96' : 'w-80 h-[30rem]'
              }`}
              onClick={() => handleCardClick(products[i], i)}
            >
              {/* Main Card */}
              <div 
                className="relative w-full h-full backdrop-blur-sm rounded-xl overflow-hidden"
                style={{
                  boxShadow: '0 10px 20px rgba(139, 92, 246, 0.4)',
                  ...(i === index && {
                    boxShadow: '0 15px 30px rgba(255,0,153,0.5), 0 0 40px rgba(255,0,153,0.4)',
                  })
                }}
              >
                {/* Normalized Product Image - 4:3 Aspect Ratio with Dock Variant */}
                <div className="relative w-full h-full overflow-hidden group rounded-xl bg-black/20">
                  <img 
                    src={products[i].images?.[0] || products[i].image}
                    alt={products[i].title}
                    className="w-full h-full object-cover object-center transition-all duration-700 group-hover:scale-110"
                    style={{ 
                      aspectRatio: '4/3',
                      minHeight: '100%',
                      minWidth: '100%'
                    }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/lovable-uploads/7d520bd5-7bd2-434c-b701-948d803e6993.png";
                    }}
                  />

                  {/* Wishlist button - Top right */}
                  <div className="absolute top-4 right-4 z-30">
                    <Button 
                      size="sm"
                      variant="outline"
                      className={`rounded-full p-2 backdrop-blur-md border-2 transition-all ${
                        isInWishlist(products[i].id) 
                          ? 'bg-gradient-to-r from-neon-pink to-red-500 text-white border-neon-pink' 
                          : 'bg-white/20 text-white border-white/50 hover:bg-gradient-to-r hover:from-neon-pink hover:to-red-500'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onWishlistToggle(products[i]);
                      }}
                    >
                      <Heart className={`h-4 w-4 ${isInWishlist(products[i].id) ? 'fill-current' : ''}`} />
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
                        ₹{products[i].price.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Hot badge for center card */}
                  {coverflowStyle(i, index).isCenter && (
                    <motion.div 
                      className="absolute top-16 right-4 z-30"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ 
                        scale: [1, 1.1, 1], 
                        opacity: 1,
                      }}
                      transition={{ 
                        scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                        opacity: { duration: 0.3 }
                      }}
                    >
                      <div className="bg-gradient-to-r from-neon-orange via-red-500 to-neon-pink text-white px-3 py-1 rounded-full text-sm font-anton shadow-xl"
                           style={{
                             boxShadow: '0 0 20px rgba(255,100,100,0.6), 0 0 40px rgba(255,0,150,0.4)'
                           }}>
                        🔥 HOT
                      </div>
                    </motion.div>
                  )}

                  {/* ADD TO CART DOCK - ABSOLUTELY CENTERED */}
                  {i === index && (
                    <div
                      className="absolute bottom-0 w-full flex justify-center"
                      style={{ 
                        zIndex: 50,
                        pointerEvents: 'none' // Allow clicks to pass through container
                      }}
                    >
                      <motion.div
                        className="backdrop-blur-md"
                        style={{
                          pointerEvents: 'auto', // Re-enable clicks on the actual button
                          cursor: 'pointer'
                        }}
                        initial={{ 
                          height: "4px", 
                          width: "100%",
                          y: 0,
                          borderRadius: "0px",
                          backgroundColor: "rgba(255, 255, 255, 0.2)"
                        }}
                        animate={{ 
                          height: "60px",
                          width: "220px",
                          y: -12,
                          borderRadius: "30px",
                          backgroundColor: "rgba(0, 0, 0, 0.5)"
                        }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        whileHover={{
                          scale: 1.02,
                          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5), 0 0 25px rgba(255, 255, 255, 0.2)'
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddToCart(products[i]);
                          navigate(`/mobile-product-detail-test/${products[i].id}`);
                        }}
                      >
                        <motion.div
                          className="flex items-center justify-center gap-3 h-full px-6"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.25, delay: 0.1 }}
                        >
                          <ShoppingCart className="h-5 w-5 text-white" />
                          <span className="text-white font-semibold text-base tracking-wide whitespace-nowrap" 
                                style={{ 
                                  fontFamily: 'Inter, system-ui, sans-serif',
                                  fontWeight: '600',
                                  textShadow: '0 2px 4px rgba(0,0,0,0.7)'
                                }}>
                            Add to Cart
                          </span>
                        </motion.div>
                      </motion.div>
                    </div>
                  )}

                  {/* Subtle bottom rail for non-center cards */}
                  {i !== index && (
                    <div
                      className="absolute bottom-0 left-0 w-full h-1 bg-white/20"
                      style={{ borderRadius: '0px' }}
                    />
                  )}

                  {/* Product Name - Below Image */}
                  <div className="absolute -bottom-8 left-0 right-0 z-20">
                    <h3 className="text-lg font-anton uppercase text-white text-center leading-tight tracking-wide"
                        style={{
                          textShadow: '2px 2px 4px rgba(0,0,0,0.9), 0 0 10px rgba(255,255,255,0.3)',
                          fontWeight: '700'
                        }}>
                      {products[i].title}
                    </h3>
                  </div>
                </div>

              </div>

              {/* Reflection */}
              <div 
                className="reflection absolute bottom-0 left-0 w-full h-full pointer-events-none"
                style={{
                  background: `url(${products[i].images?.[0] || "/lovable-uploads/7d520bd5-7bd2-434c-b701-948d803e6993.png"})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  transform: 'scaleY(-1) translateY(100%)',
                  opacity: 0.2,
                  maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, transparent 60%)',
                  WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, transparent 60%)',
                  filter: 'blur(2px)',
                }}
              />
            </animated.div>
          ))}
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="mt-4 flex flex-col items-center space-y-4">
        <div className="flex items-center space-x-6">
          <motion.button
            onClick={previous}
            className="w-12 h-12 md:w-14 md:h-14 rounded-full border-4 border-neon-purple bg-black/90 flex items-center justify-center shadow-lg transition-all"
            whileHover={{ scale: 1.12, boxShadow: "0 0 24px #c72cff" }}
            whileTap={{ scale: 0.95 }}
            aria-label="Previous featured product"
            title="Previous"
          >
            <ChevronLeft className="h-8 w-8 text-white drop-shadow" />
          </motion.button>
          <motion.button
            onClick={() => setIsAutoAdvancing(!isAutoAdvancing)}
            className="w-12 h-12 md:w-14 md:h-14 rounded-full border-4 border-neon-cyan bg-black/90 flex items-center justify-center shadow-lg transition-all"
            whileHover={{ scale: 1.12, boxShadow: "0 0 24px #00fff7" }}
            whileTap={{ scale: 0.95 }}
            animate={isAutoAdvancing ? { scale: [1, 1.08, 1], boxShadow: "0 0 32px #00fff7" } : { scale: 1, boxShadow: "none" }}
            transition={isAutoAdvancing ? { duration: 1, repeat: Infinity, repeatType: "loop" } : { duration: 0.2 }}
            aria-label={isAutoAdvancing ? "Pause auto-advance" : "Play auto-advance"}
            title={isAutoAdvancing ? "Pause" : "Play"}
          >
            {isAutoAdvancing
              ? <PauseCircle className="h-8 w-8 text-white drop-shadow" />
              : <PlayCircle className="h-8 w-8 text-white drop-shadow" />}
          </motion.button>
          <motion.button
            onClick={next}
            className="w-12 h-12 md:w-14 md:h-14 rounded-full border-4 border-neon-purple bg-black/90 flex items-center justify-center shadow-lg transition-all"
            whileHover={{ scale: 1.12, boxShadow: "0 0 24px #c72cff" }}
            whileTap={{ scale: 0.95 }}
            aria-label="Next featured product"
            title="Next"
          >
            <ChevronRight className="h-8 w-8 text-white drop-shadow" />
          </motion.button>
        </div>
        <div className="mb-2" />
      </div>

      {/* QuickView Modal */}
      <QuickViewModal
        product={selectedProduct}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
      />
    </motion.section>
  );
};

export default FeaturedCoverflow; 
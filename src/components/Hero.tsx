import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useBanners } from "@/hooks/useBanners";
import { Banner } from "@/types/banner";

const Hero = () => {
  const { banners, loading, error } = useBanners();
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [buttonLeft, setButtonLeft] = useState<string | undefined>(undefined);
  const shopRef = useRef<HTMLAnchorElement>(null);
  const exploreRef = useRef<HTMLAnchorElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Add resize listener to detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Pixel-perfect button alignment for desktop
  useEffect(() => {
    function updateButtonLeft() {
      if (!isMobile && shopRef.current && exploreRef.current) {
        const shopWidth = shopRef.current.offsetWidth;
        setButtonLeft(`calc(50% - ${shopWidth + 5}px)`);
      }
    }
    updateButtonLeft();
    window.addEventListener('resize', updateButtonLeft);
    // Observe button width changes (e.g., font load, dynamic content)
    let resizeObserver: ResizeObserver | null = null;
    if (shopRef.current) {
      resizeObserver = new ResizeObserver(updateButtonLeft);
      resizeObserver.observe(shopRef.current);
    }
    return () => {
      window.removeEventListener('resize', updateButtonLeft);
      if (resizeObserver && shopRef.current) {
        resizeObserver.disconnect();
      }
    };
  }, [isMobile, currentBannerIndex, banners]);

  // Handle video errors
  const handleVideoError = (e: any) => {
    console.error('Video failed to load:', e);
    console.error('Video source:', videoRef.current?.currentSrc);
        setVideoError(true);
      };

  // Reset video error state when banner changes
  useEffect(() => {
    setVideoError(false);
  }, [currentBannerIndex]);

  // Log banner data for debugging
  useEffect(() => {
    if (banners.length > 0) {
      console.log('Current banner:', banners[currentBannerIndex]);
    }
  }, [banners, currentBannerIndex]);

  // If there are no banners, show the default video hero
  if (loading || error || banners.length === 0) {
    return (
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Default Video Background */}
        <video 
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover hero-video-enhanced"
          autoPlay 
          muted 
          loop 
          playsInline
          onError={handleVideoError}
          poster="/lovable-uploads/b687c006-4250-445a-9bac-26f34cf86b87.png"
        >
          <source src="/images-videos-logo/1000113803.mp4" type="video/mp4" />
          {/* Fallback image if video fails to load */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: "url('/lovable-uploads/b687c006-4250-445a-9bac-26f34cf86b87.png')"
            }}
          />
        </video>
        
        {/* Semi-transparent overlay */}
        <div className="absolute inset-0 bg-black/30"></div>

        <DefaultHeroContent />
      </section>
    );
  }

  const currentBanner = banners[currentBannerIndex];
  console.log('Rendering banner:', {
    isMobile,
    mediaType: currentBanner.media_type,
    videoUrl: currentBanner.video_url,
    mobileVideoUrl: currentBanner.mobile_video_url,
    imageUrl: currentBanner.image_url,
    mobileImageUrl: currentBanner.mobile_image_url
  });

  const mediaUrl = isMobile 
    ? (currentBanner.mobile_video_url || currentBanner.video_url || currentBanner.mobile_image_url || currentBanner.image_url)
    : (currentBanner.video_url || currentBanner.image_url);
  
  const isVideo = currentBanner.media_type === 'video' && (mediaUrl?.endsWith('.mp4') || mediaUrl?.endsWith('.webm'));
  const fallbackImage = isMobile 
    ? (currentBanner.mobile_image_url || currentBanner.image_url)
    : currentBanner.image_url;

  console.log('Media details:', {
    mediaUrl,
    isVideo,
    fallbackImage,
    videoError
  });

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden w-full">
      {/* Banner Background */}
      {isVideo && !videoError ? (
        <div className="absolute inset-0 w-full h-full">
          <video 
            ref={videoRef}
            key={mediaUrl}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 hero-video-enhanced"
            autoPlay 
            muted 
            loop 
            playsInline
            onError={handleVideoError}
            poster={fallbackImage}
            style={{
              objectPosition: isMobile ? 'center center' : 'center center',
              width: '100%',
              height: '100%',
              maxHeight: isMobile ? '100vh' : '100vh'
            }}
          >
            <source src={mediaUrl} type="video/mp4" />
            <source src={mediaUrl} type="video/webm" />
          </video>
        </div>
      ) : (
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-500 hero-image-enhanced"
          style={{ 
            backgroundImage: `url(${fallbackImage})`,
            backgroundPosition: isMobile ? 'center center' : 'center center',
            backgroundSize: 'cover',
            width: '100%',
            height: '100%',
            maxHeight: isMobile ? '100vh' : '100vh'
          }}
        />
      )}
      
      {/* Semi-transparent overlay - reduced opacity for better brightness */}
      <div className="absolute inset-0 bg-black/20"></div>

      {/* Banner Content */}
      <div className="container relative z-20 text-center flex flex-col items-center justify-center min-h-screen px-4 w-full">
        {currentBanner.title && currentBanner.show_title && (
          <motion.h1 
            className="text-4xl md:text-6xl font-bold text-white mb-4 max-w-4xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {currentBanner.title}
          </motion.h1>
        )}
        
        {currentBanner.subtitle && currentBanner.show_subtitle && (
          <motion.p 
            className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {currentBanner.subtitle}
          </motion.p>
        )}

        {/* Banner Navigation Dots */}
        {banners.length > 1 && (
          <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {banners.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentBannerIndex 
                    ? 'bg-white w-4' 
                    : 'bg-white/50 hover:bg-white/70'
                }`}
                onClick={() => setCurrentBannerIndex(index)}
              />
            ))}
          </div>
        )}

        {/* CTA Buttons */}
        {/* Mobile Button Group */}
        {isMobile && (
          <div
            className="hero-buttons-container"
            style={{
              position: 'absolute',
              bottom: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '90vw',
              maxWidth: '250px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              alignItems: 'center',
              zIndex: 20,
              padding: '0',
              margin: '0',
              height: 'auto',
              minHeight: 'auto'
            }}
          >
            <a 
              href="/shop" 
              className="btn-3d shop-drip"
              style={{
                width: '100%',
                maxWidth: '100%',
                fontSize: '16px',
                padding: '12px 20px'
              }}
            >
              <span className="btn-text">Shop the Drip</span>
              <span className="arrow">→</span>
            </a>
            <a
              href="/shop?filter=collection"
              className="btn-3d explore-collection"
              style={{
                width: '100%',
                maxWidth: '100%',
                fontSize: '16px',
                padding: '12px 20px'
              }}
            >
              <span className="btn-text">Explore Collection</span>
            </a>
          </div>
        )}
        {/* Desktop Button Group */}
        {!isMobile && (
          <motion.div
            className="hero-buttons-container absolute bottom-[10px] z-20 px-4"
            style={buttonLeft ? { left: buttonLeft, gap: '10px', display: 'flex', position: 'absolute' } : undefined}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.6 }}
          >
            <a
              ref={shopRef}
              href="/shop"
              className="btn-3d shop-drip"
            >
              <span className="btn-text">Shop the Drip</span>
              <span className="arrow">→</span>
            </a>
            <a
              ref={exploreRef}
              href="/shop?filter=collection"
              className="btn-3d explore-collection text-center"
            >
              <span className="btn-text">Explore Collection</span>
            </a>
        </motion.div>
        )}
      </div>
    </section>
  );
};

// Default Hero Content Component
const DefaultHeroContent = () => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  return (
    <>
      {/* Mobile Button Group */}
      {isMobile && (
        <div
          className="hero-buttons-container"
          style={{
            position: 'absolute',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '90vw',
            maxWidth: '250px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            alignItems: 'center',
            zIndex: 20,
            padding: '0',
            margin: '0',
            height: 'auto',
            minHeight: 'auto'
          }}
        >
          <a 
            href="/shop" 
            className="btn-3d shop-drip"
            style={{
              width: '100%',
              maxWidth: '100%',
              fontSize: '16px',
              padding: '12px 20px'
            }}
          >
            <span className="btn-text">Shop the Drip</span>
            <span className="arrow">→</span>
          </a>
          <a
            href="/shop?filter=collection"
            className="btn-3d explore-collection"
            style={{
              width: '100%',
              maxWidth: '100%',
              fontSize: '16px',
              padding: '12px 20px'
            }}
          >
            <span className="btn-text">Explore Collection</span>
          </a>
        </div>
      )}
      {/* Desktop Button Group */}
      {!isMobile && (
  <motion.div 
          className="hero-buttons-container absolute bottom-[10px] left-1/2 transform -translate-x-1/2 z-20 px-4"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.6 }}
  >
          <div className="flex flex-row justify-center gap-4 items-center">
            <a href="/shop" className="btn-3d shop-drip text-center">
        <span className="btn-text">Shop the Drip</span>
        <span className="arrow">→</span>
      </a>
            <a href="/shop?filter=collection" className="btn-3d explore-collection text-center">
        <span className="btn-text">Explore Collection</span>
      </a>
    </div>
  </motion.div>
      )}
    </>
);
};

export default Hero;

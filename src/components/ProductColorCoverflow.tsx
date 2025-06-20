import React, { useState, useEffect, useImperativeHandle, forwardRef, useRef } from 'react';
import { useSprings, animated, config } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';

export interface ProductColorCoverflowHandle {
  goToIndex: (idx: number) => void;
}

interface ProductColorCoverflowProps {
  images: string[];
  alt: string;
  colors?: { hex: string; displayName: string; original: string }[];
  onColorIndexChange?: (idx: number) => void;
  aspectRatio?: string;
  centerOffset?: number;
  cardWidthMobile?: string;
  cardHeightMobile?: string;
}

const CARD_WIDTH_DESKTOP = 320;
const CARD_WIDTH_MOBILE = 200;
const CARD_GAP_DESKTOP = 48;
const CARD_GAP_MOBILE = 24;

const ProductColorCoverflow = forwardRef<ProductColorCoverflowHandle, ProductColorCoverflowProps>(
  ({ images, alt, colors = [], onColorIndexChange, aspectRatio = '1/1', centerOffset, cardWidthMobile, cardHeightMobile }, ref) => {
    const [index, setIndex] = useState(0);
    const [isMobile, setIsMobile] = useState(false);
    const TOTAL = images.length;
    const lastIndexRef = useRef(index);

    useEffect(() => {
      const handleResize = () => setIsMobile(window.innerWidth < 640);
      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
      if (onColorIndexChange && lastIndexRef.current !== index) {
        onColorIndexChange(index);
        lastIndexRef.current = index;
      }
    }, [index, onColorIndexChange]);

    // 3D coverflow style logic
    const coverflowStyle = (i: number, currentIndex: number) => {
      let offset = i - currentIndex;
      if (offset > TOTAL / 2) offset -= TOTAL;
      else if (offset < -TOTAL / 2) offset += TOTAL;
      const absOffset = Math.abs(offset);
      const cardWidth = isMobile ? CARD_WIDTH_MOBILE : CARD_WIDTH_DESKTOP;
      const cardGap = isMobile ? CARD_GAP_MOBILE : CARD_GAP_DESKTOP;
      const translateX = offset * (cardWidth * 0.6 + cardGap);
      const rotateY = offset * 25;
      const scale = Math.max(0.75, 1 - Math.min(absOffset * 0.12, 0.25));
      const translateZ = absOffset === 0 ? 60 : -absOffset * 30;
      const zIndex = TOTAL - absOffset;
      const opacity = absOffset > 2 ? 0 : Math.max(0.7, 1 - absOffset * 0.15);
      return {
        transform: `translateX(${translateX}px) translateZ(${translateZ}px) perspective(800px) rotateY(${-rotateY}deg) scale(${scale})`,
        zIndex,
        opacity,
        display: absOffset > 3 ? 'none' : 'block',
        isCenter: absOffset === 0,
      };
    };

    const [springs, api] = useSprings(TOTAL, (i) => ({
      ...coverflowStyle(i, index),
      config: config.gentle,
    }));

    useEffect(() => {
      api.start((i) => coverflowStyle(i, index));
    }, [index, isMobile, api]);

    // Drag/swipe functionality
    const bind = useDrag(
      ({ down, movement: [mx], direction: [dx], cancel }) => {
        if (!down && Math.abs(mx) > (isMobile ? 30 : 50)) {
          const newIndex = dx > 0 
            ? (index - 1 + TOTAL) % TOTAL 
            : (index + 1) % TOTAL;
          setIndex(newIndex);
          cancel();
        }
      },
      {
        axis: 'x',
        threshold: 10,
        filterTaps: true,
      }
    );

    const goToIndex = (newIndex: number) => setIndex(newIndex);
    const next = () => goToIndex((index + 1) % TOTAL);
    const previous = () => goToIndex((index - 1 + TOTAL) % TOTAL);

    useImperativeHandle(ref, () => ({ goToIndex }), [goToIndex]);

    // Determine card size classes for mobile
    const mobileWidth = cardWidthMobile || 'w-48';
    const mobileHeight = cardHeightMobile || 'h-60';

    if (!images || images.length === 0) return null;

    return (
      <div className="relative w-full flex flex-col items-center justify-center" style={{ height: isMobile ? 260 : 380, perspective: '800px', transform: centerOffset ? `translateX(${centerOffset}px)` : undefined }}>
        {/* Left arrow */}
        {TOTAL > 1 && (
          <button onClick={previous} className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        )}
        {/* Right arrow */}
        {TOTAL > 1 && (
          <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        )}
        {/* 3D Coverflow Cards */}
        <div {...bind()} className="relative w-full h-full flex items-center justify-center" style={{ transformStyle: 'preserve-3d', minHeight: isMobile ? 200 : 320 }}>
          {springs.map((style, i) => (
            <animated.div
              key={i}
              style={style}
              className={`absolute rounded-2xl overflow-hidden shadow-2xl bg-black/20 ${isMobile ? `${mobileWidth} ${mobileHeight}` : 'w-80 h-96'}`}
              onClick={() => goToIndex(i)}
            >
              <img
                src={images[i]}
                alt={alt + ' color variation'}
                className="w-full h-full object-cover rounded-2xl"
                style={{ aspectRatio }}
                onError={e => {
                  (e.target as HTMLImageElement).src = '/lovable-uploads/7d520bd5-7bd2-434c-b701-948d803e6993.png';
                }}
              />
            </animated.div>
          ))}
        </div>
        {/* Dots */}
        {TOTAL > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {colors.map((color, idx) => (
              <span
                key={idx}
                className={`w-2 h-2 rounded-full ${idx === index ? 'bg-white' : 'bg-white/40'}`}
                style={{ backgroundColor: color.hex }}
                title={color.displayName}
              ></span>
            ))}
          </div>
        )}
      </div>
    );
  }
);

export default ProductColorCoverflow; 
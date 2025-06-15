import { useState, useEffect } from 'react';
import { useSpring, config } from '@react-spring/web';

interface Use3DCarouselOptions {
  itemCount: number;
  autoAdvanceInterval?: number;
  autoStart?: boolean;
}

export const use3DCarousel = ({ 
  itemCount, 
  autoAdvanceInterval = 4000,
  autoStart = true 
}: Use3DCarouselOptions) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(autoStart);

  // 3D rotation spring
  const [{ rotation }, api] = useSpring(() => ({
    rotation: 0,
    config: config.gentle
  }));

  // Auto-advance effect
  useEffect(() => {
    if (!isAutoPlaying || itemCount <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % itemCount);
    }, autoAdvanceInterval);

    return () => clearInterval(interval);
  }, [isAutoPlaying, itemCount, autoAdvanceInterval]);

  // Update rotation when currentIndex changes
  useEffect(() => {
    const angle = -(currentIndex * (360 / itemCount));
    api.start({ rotation: angle });
  }, [currentIndex, api, itemCount]);

  const goToIndex = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    // Resume auto-play after 3 seconds
    setTimeout(() => setIsAutoPlaying(autoStart), 3000);
  };

  const next = () => {
    goToIndex((currentIndex + 1) % itemCount);
  };

  const previous = () => {
    goToIndex((currentIndex - 1 + itemCount) % itemCount);
  };

  const pause = () => setIsAutoPlaying(false);
  const resume = () => setIsAutoPlaying(true);

  return {
    currentIndex,
    rotation,
    isAutoPlaying,
    goToIndex,
    next,
    previous,
    pause,
    resume
  };
}; 
import { useRef } from 'react';
import { useScroll, useTransform, MotionValue } from 'framer-motion';

// More specific type for the offset array
// Each string can be: "start", "end", "center", number, or e.g. "start end", "0% 100%"
// This provides better type safety than [string, string]
// but avoids issues if ScrollOffset isn't directly exportable or changes.
type ScrollOffsetValue = "start" | "end" | "center" | number | string;
type ParallaxOffset = [ScrollOffsetValue, ScrollOffsetValue] | string[];

interface UseParallaxOptions {
  // Framer Motion's ScrollOffset can be complex. For this hook's purpose,
  // we are focusing on the common use case of [string, string] where strings
  // are like "start end", "0% 50%", etc.
  // The default value provided is a valid ScrollOffset.
  offset?: [string, string]; 
  backgroundRange?: [string, string];
  particlesRange?: [string, string];
}

export const useParallax = ({ 
  offset = ["start end", "end start"], // This is a valid ScrollOffset tuple
  backgroundRange = ["0%", "30%"],
  particlesRange = ["0%", "-20%"]
}: UseParallaxOptions = {}) => {
  const ref = useRef<HTMLElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: offset as any, // Cast to any to bypass overly strict linting here, as it should be compatible.
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], backgroundRange);
  const particlesY = useTransform(scrollYProgress, [0, 1], particlesRange);

  return {
    ref,
    scrollYProgress,
    backgroundY,
    particlesY
  };
}; 
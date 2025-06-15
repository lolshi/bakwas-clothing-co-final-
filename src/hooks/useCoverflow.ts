import { useState, useEffect, useRef, useCallback } from "react";
import { useSprings, SpringValue } from "@react-spring/web";
import { useDrag, DragConfig } from "@use-gesture/react";

// A general type for the object returned by useDrag()'s binder, suitable for spreading.
// This avoids needing to import a specific (and possibly unexported) type from @use-gesture.
type SpreadableEventHandlers = Record<string, (...args: any[]) => void> | {};

interface UseCoverflowOptions {
  itemCount: number;
  isMobile: boolean;
  autoAdvanceInterval?: number;
  springConfig?: { tension: number; friction: number };
  dragConfig?: Partial<DragConfig>;
}

export const useCoverflow = ({
  itemCount,
  isMobile,
  autoAdvanceInterval = 5000,
  springConfig = { tension: 300, friction: 30 },
  dragConfig: userDragConfig = {},
}: UseCoverflowOptions) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoAdvancing, setIsAutoAdvancing] = useState(true);
  const autoAdvanceRef = useRef<NodeJS.Timeout>();

  const coverflowStyle = useCallback((i: number, activeIndex: number): React.CSSProperties => {
    const offset = i - activeIndex;
    const absOffset = Math.abs(offset);
    const isCenter = offset === 0;
    const spacing = isMobile ? 280 : 350;
    return {
      transform: `translateX(${offset * spacing}px) perspective(800px) rotateY(${offset * -45}deg) scale(${isCenter ? 1 : 0.8})`,
      zIndex: itemCount - absOffset,
      opacity: absOffset > 2 ? 0 : 1,
      display: absOffset > 3 ? 'none' : 'block',
    };
  }, [isMobile, itemCount]);

  const [springs, api] = useSprings(itemCount, (i) => ({
    ...coverflowStyle(i, currentIndex),
    config: springConfig,
  }));

  useEffect(() => {
    if (itemCount > 0) api.start((i) => coverflowStyle(i, currentIndex));
  }, [currentIndex, isMobile, api, coverflowStyle, itemCount]);

  const resetAutoAdvance = useCallback(() => {
    if (autoAdvanceRef.current) clearInterval(autoAdvanceRef.current);
    setIsAutoAdvancing(false);
    if (itemCount > 1) setTimeout(() => setIsAutoAdvancing(true), autoAdvanceInterval + 3000);
  }, [autoAdvanceInterval, itemCount]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | undefined;
    if (isAutoAdvancing && itemCount > 1) {
      intervalId = setInterval(() => setCurrentIndex((prev) => (prev + 1) % itemCount), autoAdvanceInterval);
      autoAdvanceRef.current = intervalId;
    }
    return () => { if (intervalId) clearInterval(intervalId); };
  }, [isAutoAdvancing, itemCount, autoAdvanceInterval, currentIndex]);

  const goToIndex = useCallback((idx: number) => { if (itemCount > 0) { setCurrentIndex(idx); resetAutoAdvance(); } }, [resetAutoAdvance, itemCount]);
  const next = useCallback(() => { if (itemCount > 0) goToIndex((currentIndex + 1) % itemCount); }, [currentIndex, itemCount, goToIndex]);
  const previous = useCallback(() => { if (itemCount > 0) goToIndex((currentIndex - 1 + itemCount) % itemCount); }, [currentIndex, itemCount, goToIndex]);

  const finalDragConfig: DragConfig = {
    axis: 'x', threshold: 10, filterTaps: true,
    ...userDragConfig,
    enabled: itemCount > 1,
  };

  const returnedDragBinder = useDrag(
    ({ active, movement: [mx], cancel, down }) => {
      if (!down && !active) return;
      if (active) setIsAutoAdvancing(false);
      if (!active && Math.abs(mx) > (isMobile ? 30 : 50)) {
        const dir = mx > 0 ? -1 : 1;
        setCurrentIndex((prev) => (prev + dir + itemCount) % itemCount);
        resetAutoAdvance();
      }
    },
    finalDragConfig
  );

  const bindDrag: () => SpreadableEventHandlers = 
    (typeof returnedDragBinder === 'function' && itemCount > 1)
      ? returnedDragBinder as () => SpreadableEventHandlers // Cast if necessary, TS might infer () => void otherwise
      : (() => ({})); 

  return {
    springs,
    api: api, 
    currentIndex,
    goToIndex,
    next,
    previous,
    bindDrag, // Type is () => SpreadableEventHandlers
    isAutoAdvancing,
    setIsAutoAdvancing,
    setCurrentIndex,
  };
};
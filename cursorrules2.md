# BAKWAS E-Commerce Platform - Expanded Development Guidelines

**Extends:** `cursorrules.md`  
**Purpose:** Comprehensive development standards for BAKWAS neon streetwear platform  
**Last Updated:** December 19, 2024

---

## 📁 **File & Component Naming Conventions**

### **Component Naming**
```typescript
// ✅ Correct - PascalCase for components
export const ProductCard3D = () => { ... }
export const WhyBakwasSection = () => { ... }
export const NeonButton = () => { ... }

// ❌ Incorrect
export const productCard = () => { ... }
export const why_bakwas_section = () => { ... }
```

### **File Structure Standards**
```
src/
├── components/
│   ├── ui/                    # shadcn/ui base components
│   ├── animations/            # Animation-specific components
│   │   ├── LottieWrapper.tsx
│   │   ├── TypewriterText.tsx
│   │   └── ParticleSystem.tsx
│   ├── 3d/                    # 3D effect components
│   │   ├── Carousel3D.tsx
│   │   ├── TiltCard.tsx
│   │   └── PerspectiveWrapper.tsx
│   ├── sections/              # Page sections
│   │   ├── Hero.tsx
│   │   ├── WhyBakwas.tsx
│   │   └── ProductShowcase.tsx
│   └── layout/                # Layout components
│       ├── Header.tsx
│       ├── Footer.tsx
│       └── Navigation.tsx
├── hooks/                     # Custom React hooks
│   ├── useIntersectionObserver.ts
│   ├── useParallax.ts
│   └── use3DTilt.ts
├── utils/                     # Utility functions
│   ├── animations.ts
│   ├── constants.ts
│   └── helpers.ts
├── types/                     # TypeScript definitions
│   ├── product.ts
│   ├── animation.ts
│   └── global.ts
└── styles/                    # Style-related files
    ├── animations.css
    ├── components.css
    └── utilities.css
```

### **File Naming Rules**
- **Components:** `PascalCase.tsx` (e.g., `ProductCard3D.tsx`)
- **Hooks:** `camelCase.ts` starting with `use` (e.g., `useParallax.ts`)
- **Utils:** `camelCase.ts` (e.g., `animationHelpers.ts`)
- **Types:** `camelCase.ts` (e.g., `productTypes.ts`)
- **CSS:** `kebab-case.css` (e.g., `neon-animations.css`)

---

## 🎨 **Tailwind & Styling Guidelines**

### **Neon Color Palette Usage**
```typescript
// ✅ Use semantic color names
const NEON_COLORS = {
  primary: '#00E1FF',    // neon-cyan
  secondary: '#8B5CF6',  // neon-purple  
  accent: '#EC4899',     // neon-pink
  warning: '#F97316',    // neon-orange
  brand: '#FF00FF'       // brand-accent
} as const;

// ✅ Tailwind class usage
<div className="text-neon-cyan border-neon-purple bg-gradient-to-r from-neon-pink to-neon-orange">

// ❌ Avoid hardcoded hex values in JSX
<div style={{ color: '#00E1FF' }}>
```

### **Animation Utility Classes**
```css
/* ✅ Semantic animation names */
.animate-breathing-rock { ... }
.animate-neon-pulse { ... }
.animate-typewriter { ... }
.animate-carousel-spin { ... }

/* ✅ Responsive animation controls */
.animate-on-desktop { 
  @apply md:animate-breathing-rock; 
}

.reduce-motion-safe { 
  @media (prefers-reduced-motion: reduce) {
    animation: none !important;
  }
}
```

### **3D Transform Standards**
```css
/* ✅ Consistent perspective values */
.perspective-800 { perspective: 800px; }
.perspective-1000 { perspective: 1000px; }
.perspective-1200 { perspective: 1200px; }

/* ✅ Standard transform origins */
.transform-center { transform-origin: center center; }
.transform-bottom { transform-origin: center bottom; }

/* ✅ GPU acceleration for performance */
.gpu-accelerated {
  transform: translateZ(0);
  backface-visibility: hidden;
  will-change: transform;
}
```

### **Responsive Design Patterns**
```typescript
// ✅ Mobile-first approach
<div className="
  w-full h-64                    // Mobile base
  md:w-80 md:h-96               // Tablet
  lg:w-96 lg:h-[500px]          // Desktop
  xl:w-[400px] xl:h-[600px]     // Large desktop
">

// ✅ Animation responsiveness
<div className="
  animate-none                   // No animation on mobile
  md:animate-breathing-rock      // Enable on tablet+
  lg:animate-carousel-spin       // Enhanced on desktop
">
```

---

## 🎬 **Animation & Canvas Guidelines**

### **Framer Motion Standards**
```typescript
// ✅ Consistent animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
};

// ✅ Performance-optimized animations
<motion.div
  initial="initial"
  animate="animate"
  variants={fadeInUp}
  layoutId="unique-id"           // For layout animations
  style={{ willChange: 'transform' }}  // Performance hint
>
```

### **CSS Animation Performance**
```css
/* ✅ GPU-accelerated properties only */
@keyframes neon-pulse {
  0%, 100% { 
    transform: scale(1) translateZ(0);
    filter: brightness(1);
  }
  50% { 
    transform: scale(1.05) translateZ(0);
    filter: brightness(1.2);
  }
}

/* ❌ Avoid animating layout properties */
@keyframes bad-animation {
  0% { width: 100px; height: 100px; }  /* Causes reflow */
  100% { width: 200px; height: 200px; }
}
```

### **Lottie Animation Integration**
```typescript
// ✅ Proper Lottie setup
import { useLottie } from 'lottie-react';

const AnimatedIcon = ({ animationData, autoplay = true }) => {
  const { View, play, pause } = useLottie({
    animationData,
    autoplay,
    loop: true,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice'
    }
  });

  return (
    <div 
      className="w-16 h-16"
      onMouseEnter={() => play()}
      onMouseLeave={() => pause()}
    >
      {View}
    </div>
  );
};
```

### **Three.js/Canvas Best Practices**
```typescript
// ✅ Proper Canvas setup with error boundaries
import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';

const Scene3D = () => (
  <Canvas
    camera={{ position: [0, 0, 5], fov: 75 }}
    gl={{ 
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    }}
    dpr={[1, 2]}  // Responsive pixel ratio
  >
    <Suspense fallback={<LoadingSpinner />}>
      <Scene />
    </Suspense>
  </Canvas>
);

// ✅ Cleanup and performance
useEffect(() => {
  return () => {
    // Cleanup Three.js resources
    renderer.dispose();
    geometry.dispose();
    material.dispose();
  };
}, []);
```

---

## ♿ **Accessibility & Performance Mandates**

### **Accessibility Requirements**
```typescript
// ✅ Proper ARIA labels and roles
<button
  className="btn-3d shop-drip"
  aria-label="Shop the latest streetwear collection"
  role="button"
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
>
  Shop the Drip
</button>

// ✅ Screen reader friendly animations
<motion.div
  animate={{ opacity: 1 }}
  aria-live="polite"
  aria-label="Content is loading"
>

// ✅ Reduced motion support
const prefersReducedMotion = useReducedMotion();

<motion.div
  animate={prefersReducedMotion ? {} : { rotate: 360 }}
  transition={{ duration: prefersReducedMotion ? 0 : 2 }}
>
```

### **Keyboard Navigation Standards**
```typescript
// ✅ Focus management
const FocusableComponent = () => {
  const focusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-focus on mount if needed
    if (shouldAutoFocus) {
      focusRef.current?.focus();
    }
  }, []);

  return (
    <div
      ref={focusRef}
      tabIndex={0}
      className="focus:outline-2 focus:outline-neon-cyan focus:outline-offset-2"
      onKeyDown={handleKeyDown}
    >
      Content
    </div>
  );
};
```

### **Performance Mandates**

#### **Lazy Loading Implementation**
```typescript
// ✅ Image lazy loading
import { lazy, Suspense } from 'react';

const LazyImage = lazy(() => import('./OptimizedImage'));

<Suspense fallback={<ImageSkeleton />}>
  <LazyImage
    src="/images/product.webp"
    alt="Product description"
    loading="lazy"
    decoding="async"
  />
</Suspense>

// ✅ Component lazy loading
const HeavyComponent = lazy(() => import('./HeavyComponent'));

<Suspense fallback={<ComponentSkeleton />}>
  <HeavyComponent />
</Suspense>
```

#### **Bundle Optimization Rules**
```typescript
// ✅ Dynamic imports for heavy libraries
const loadLottie = async () => {
  const { default: lottie } = await import('lottie-web');
  return lottie;
};

// ✅ Tree shaking friendly imports
import { motion } from 'framer-motion';  // ✅ Named import
import * as FramerMotion from 'framer-motion';  // ❌ Namespace import

// ✅ Code splitting by route
const ProductPage = lazy(() => import('../pages/ProductPage'));
const CheckoutPage = lazy(() => import('../pages/CheckoutPage'));
```

#### **Memory Management**
```typescript
// ✅ Cleanup animations and listeners
useEffect(() => {
  const animation = lottie.loadAnimation({...});
  
  return () => {
    animation.destroy();  // Cleanup Lottie
  };
}, []);

// ✅ Debounced event handlers
const debouncedResize = useMemo(
  () => debounce(handleResize, 100),
  [handleResize]
);

useEffect(() => {
  window.addEventListener('resize', debouncedResize);
  return () => {
    window.removeEventListener('resize', debouncedResize);
    debouncedResize.cancel();
  };
}, [debouncedResize]);
```

---

## 🔧 **Development Workflow Standards**

### **Commit Message Format**
```bash
# ✅ Semantic commit format
feat(hero): add 3D transparent CTA buttons with neon effects
fix(carousel): resolve infinite rotation pause on mobile
style(animations): optimize GPU acceleration for breathing effects
perf(images): implement lazy loading for product showcase
docs(readme): update setup instructions for Three.js dependencies

# Commit types:
# feat: New feature
# fix: Bug fix
# style: Styling changes
# perf: Performance improvements
# refactor: Code refactoring
# docs: Documentation updates
# test: Test additions/updates
# chore: Build process or auxiliary tool changes
```

### **Pull Request Title Format**
```
[COMPONENT] Brief description of changes

Examples:
[HERO] Implement 3D transparent CTA buttons with enhanced vibrancy
[CAROUSEL] Add infinite rotation with pause-on-hover functionality  
[ANIMATIONS] Optimize CSS animations for mobile performance
[TYPES] Add comprehensive TypeScript interfaces for products
[ACCESSIBILITY] Implement keyboard navigation for 3D carousel
```

### **Branch Naming Convention**
```bash
# Feature branches
feature/hero-3d-buttons
feature/carousel-infinite-rotation
feature/typewriter-animation

# Bug fix branches
fix/carousel-mobile-overflow
fix/animation-performance-mobile
fix/typescript-eslint-errors

# Style/design branches
style/neon-color-palette
style/responsive-animations
style/glass-morphism-effects

# Performance branches
perf/lazy-loading-images
perf/bundle-optimization
perf/animation-gpu-acceleration
```

### **Code Review Checklist**
```markdown
## Pre-Review Checklist
- [ ] All TypeScript errors resolved
- [ ] ESLint warnings addressed
- [ ] Responsive design tested (mobile, tablet, desktop)
- [ ] Accessibility features implemented (ARIA, keyboard nav)
- [ ] Performance optimizations applied (lazy loading, GPU acceleration)
- [ ] Animation performance tested (60fps target)
- [ ] Cross-browser compatibility verified
- [ ] Reduced motion preferences respected

## Review Focus Areas
- [ ] Component reusability and modularity
- [ ] Consistent naming conventions followed
- [ ] Proper error handling implemented
- [ ] Memory leaks prevented (cleanup functions)
- [ ] Bundle size impact assessed
- [ ] Animation smoothness verified
- [ ] Mobile touch interactions tested
- [ ] Brand consistency maintained (neon palette, fonts)
```

---

## 🎯 **Component Development Patterns**

### **Reusable 3D Component Pattern**
```typescript
// ✅ Flexible 3D wrapper component
interface Transform3DProps {
  children: React.ReactNode;
  perspective?: number;
  rotateX?: number;
  rotateY?: number;
  rotateZ?: number;
  scale?: number;
  translateZ?: number;
  className?: string;
}

const Transform3D: React.FC<Transform3DProps> = ({
  children,
  perspective = 1000,
  rotateX = 0,
  rotateY = 0,
  rotateZ = 0,
  scale = 1,
  translateZ = 0,
  className = ""
}) => {
  const transform = `
    perspective(${perspective}px)
    rotateX(${rotateX}deg)
    rotateY(${rotateY}deg)
    rotateZ(${rotateZ}deg)
    scale(${scale})
    translateZ(${translateZ}px)
  `;

  return (
    <div 
      className={`transform-gpu ${className}`}
      style={{ transform }}
    >
      {children}
    </div>
  );
};
```

### **Animation Hook Pattern**
```typescript
// ✅ Reusable animation hook
interface UseBreathingAnimationOptions {
  duration?: number;
  scale?: [number, number];
  autoStart?: boolean;
}

const useBreathingAnimation = ({
  duration = 4000,
  scale = [1, 1.05],
  autoStart = true
}: UseBreathingAnimationOptions = {}) => {
  const [isAnimating, setIsAnimating] = useState(autoStart);
  
  const controls = useAnimation();

  useEffect(() => {
    if (isAnimating) {
      controls.start({
        scale: scale,
        transition: {
          duration: duration / 1000,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut"
        }
      });
    } else {
      controls.stop();
    }
  }, [isAnimating, controls, duration, scale]);

  return {
    controls,
    isAnimating,
    start: () => setIsAnimating(true),
    stop: () => setIsAnimating(false),
    toggle: () => setIsAnimating(prev => !prev)
  };
};
```

---

## 📱 **Mobile-First Development Rules**

### **Touch Interaction Standards**
```typescript
// ✅ Touch-friendly component
const TouchFriendlyCard = () => {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <motion.div
      className="min-h-[44px] min-w-[44px] cursor-pointer"  // Minimum touch target
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      onTouchCancel={() => setIsPressed(false)}
      animate={{
        scale: isPressed ? 0.95 : 1,
        transition: { duration: 0.1 }
      }}
      whileTap={{ scale: 0.95 }}  // Framer Motion touch feedback
    >
      Content
    </motion.div>
  );
};
```

### **Responsive Animation Rules**
```css
/* ✅ Mobile-optimized animations */
@media (max-width: 640px) {
  .animate-breathing-rock {
    animation-duration: 6s;  /* Slower on mobile */
    animation-timing-function: ease-in-out;
  }
  
  .carousel-3d {
    animation: none;  /* Disable complex 3D on mobile */
  }
  
  .parallax-background {
    transform: none;  /* Disable parallax on mobile */
  }
}

/* ✅ Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .animate-breathing-rock,
  .animate-carousel-spin,
  .animate-typewriter {
    animation: none !important;
  }
  
  .motion-safe-only {
    display: none;
  }
}
```

---

## 🔒 **Security & Error Handling**

### **Input Validation Pattern**
```typescript
// ✅ Comprehensive input validation
import { z } from 'zod';

const ProductSchema = z.object({
  name: z.string().min(1).max(100),
  price: z.number().positive(),
  category: z.enum(['hoodies', 'tees', 'accessories', 'bottoms']),
  image: z.string().url(),
  inStock: z.boolean()
});

type Product = z.infer<typeof ProductSchema>;

const validateProduct = (data: unknown): Product => {
  try {
    return ProductSchema.parse(data);
  } catch (error) {
    throw new Error(`Invalid product data: ${error.message}`);
  }
};
```

### **Error Boundary Implementation**
```typescript
// ✅ Animation-aware error boundary
class AnimationErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log animation-specific errors
    console.error('Animation Error:', error, errorInfo);
    
    // Cleanup any running animations
    this.cleanupAnimations();
  }

  cleanupAnimations = () => {
    // Stop all CSS animations
    document.querySelectorAll('*').forEach(el => {
      el.style.animationPlayState = 'paused';
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <h2>Something went wrong with the animations.</h2>
          <button onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

## 📊 **Performance Monitoring**

### **Core Web Vitals Targets**
```typescript
// ✅ Performance monitoring setup
const performanceTargets = {
  LCP: 2.5,    // Largest Contentful Paint (seconds)
  FID: 100,    // First Input Delay (milliseconds)
  CLS: 0.1,    // Cumulative Layout Shift
  FCP: 1.8,    // First Contentful Paint (seconds)
  TTI: 3.8     // Time to Interactive (seconds)
};

// ✅ Animation performance monitoring
const monitorAnimationPerformance = () => {
  let frameCount = 0;
  let lastTime = performance.now();

  const measureFPS = () => {
    frameCount++;
    const currentTime = performance.now();
    
    if (currentTime - lastTime >= 1000) {
      const fps = frameCount;
      frameCount = 0;
      lastTime = currentTime;
      
      if (fps < 55) {
        console.warn(`Low FPS detected: ${fps}`);
        // Reduce animation complexity
        document.body.classList.add('reduce-animations');
      }
    }
    
    requestAnimationFrame(measureFPS);
  };
  
  requestAnimationFrame(measureFPS);
};
```

---

## 🔗 **Integration Guidelines**

### **Supabase Integration Pattern**
```typescript
// ✅ Type-safe Supabase client
import { createClient } from '@supabase/supabase-js';

interface Database {
  public: {
    Tables: {
      products: {
        Row: Product;
        Insert: Omit<Product, 'id' | 'created_at'>;
        Update: Partial<Omit<Product, 'id'>>;
      };
    };
  };
}

const supabase = createClient<Database>(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

// ✅ Error handling for API calls
const fetchProducts = async (): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('inStock', true);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Failed to fetch products:', error);
    throw new Error('Unable to load products. Please try again.');
  }
};
```

### **Payment Integration Standards**
```typescript
// ✅ Secure payment handling
interface PaymentData {
  amount: number;
  currency: 'INR';
  orderId: string;
  customerEmail: string;
}

const processPayment = async (paymentData: PaymentData) => {
  try {
    // Validate on client
    const validatedData = PaymentSchema.parse(paymentData);
    
    // Process through secure backend
    const response = await fetch('/api/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(validatedData)
    });
    
    if (!response.ok) {
      throw new Error('Payment processing failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Payment error:', error);
    throw error;
  }
};
```

---

This expanded guidelines document ensures consistent, high-quality development practices across the entire BAKWAS platform while maintaining the neon streetwear aesthetic and premium user experience. 
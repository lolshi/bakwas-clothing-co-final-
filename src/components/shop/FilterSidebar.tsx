import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FilterState } from '@/pages/Shop';
import { ChevronDown, Search, X, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { COLOR_FAMILIES, ColorShade, getColorValueFromHex, getHexFromColorValue, getColorHexCode, getNearestColorFamilyAndShade } from '@/config/colors';
import { supabase } from '@/integrations/supabase/client';
import { Dialog } from '@/components/ui/dialog';
import { useAvailableColorsFromVariants } from '@/hooks/useAvailableColorsFromVariants';

interface FilterSidebarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  minPrice: number;
  maxPrice: number;
}

const categories = [
  { id: 'oversized', label: 'Oversized Tee' },
  { id: 'weekly', label: 'Weekly Drop' },
  { id: 'limited', label: 'Limited Drop' }
];

const sizes = ['S', 'M', 'L', 'XL', 'XXL'];

const colours = [
  { name: 'Black', value: 'black', hex: '#000000' },
  { name: 'White', value: 'white', hex: '#FFFFFF' },
  { name: 'Navy Blue', value: 'navy-blue', hex: '#000080' },
  { name: 'Grey', value: 'grey', hex: '#808080' },
  { name: 'Red', value: 'red', hex: '#FF0000' },
  { name: 'Royal Blue', value: 'royal-blue', hex: '#4169E1' },
  { name: 'Maroon', value: 'maroon', hex: '#800000' },
  { name: 'Olive Green', value: 'olive-green', hex: '#556B2F' },
  { name: 'Mustard Yellow', value: 'mustard-yellow', hex: '#FFDB58' },
  { name: 'Bottle Green', value: 'bottle-green', hex: '#006A4E' },
  { name: 'Sky Blue', value: 'sky-blue', hex: '#87CEEB' },
  { name: 'Pink', value: 'pink', hex: '#FFC0CB' },
  { name: 'Beige', value: 'beige', hex: '#F5F5DC' },
  { name: 'Brown', value: 'brown', hex: '#A52A2A' },
  { name: 'Orange', value: 'orange', hex: '#FFA500' },
  { name: 'Lavender', value: 'lavender', hex: '#E6E6FA' },
  { name: 'Turquoise', value: 'turquoise', hex: '#40E0D0' },
  { name: 'Peach', value: 'peach', hex: '#FFDAB9' },
  { name: 'Charcoal', value: 'charcoal', hex: '#36454F' },
  { name: 'Mint Green', value: 'mint-green', hex: '#98FF98' }
];

const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'popular', label: 'Most Popular' }
];

// Add CSS optimizations at the top of the file after imports
const filterStyles = {
  filterBar: {
    transform: 'translateZ(0)',
    backfaceVisibility: 'hidden' as const,
    perspective: '1000px',
    willChange: 'transform',
    contain: 'layout style paint',
  },
  popover: {
    willChange: 'transform, opacity',
    transform: 'translateZ(0)',
    backfaceVisibility: 'hidden' as const,
    contain: 'layout style paint',
  },
  colorGrid: {
    contain: 'layout style',
    willChange: 'transform',
  }
} as const;

// Add debug utilities
const DEBUG = true;

const debugLog = (...args: any[]) => {
  if (DEBUG) {
    console.log('[FilterSidebar]', ...args);
  }
};

export const FilterSidebar: React.FC<FilterSidebarProps> = ({ 
  filters, 
  onFiltersChange,
  minPrice,
  maxPrice
}) => {
  const [openPopover, setOpenPopover] = useState<string | null>(null);
  const [priceValues, setPriceValues] = useState(filters.priceRange);
  const [isDragging, setIsDragging] = useState<'min' | 'max' | null>(null);
  const { colors: availableColors, loading: colorsLoading } = useAvailableColorsFromVariants({
    sizes: filters.sizes,
    priceRange: filters.priceRange,
    // categories: filters.categories, // To fully support, would require a join with products table
  });
  const sliderRef = useRef<HTMLDivElement>(null);
  const popoverRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Debounced filter update
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const handleFilterChange = useCallback((newFilters: FilterState) => {
    if (typeof window !== 'undefined') {
      console.log('[FilterSidebar] onFiltersChange', newFilters);
    }
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    debounceTimeout.current = setTimeout(() => {
      onFiltersChange(newFilters);
    }, 200);
  }, [onFiltersChange]);

  // Track size changes
  useEffect(() => {
    const filterContainer = document.querySelector('.filter-bar-container');
    if (!filterContainer) return;

    const resizeObserver = new ResizeObserver((entries) => {
      entries.forEach(entry => {
        console.log('Size change detected:', {
          width: entry.contentRect.width,
          height: entry.contentRect.height,
          target: entry.target.className,
          timestamp: Date.now()
        });
      });
    });
    
    resizeObserver.observe(filterContainer);
    return () => resizeObserver.disconnect();
  }, []);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openPopover && popoverRefs.current[openPopover]) {
        const popoverElement = popoverRefs.current[openPopover];
        if (popoverElement && !popoverElement.contains(event.target as Node)) {
          setOpenPopover(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openPopover]);

  const togglePopover = (popoverName: string) => {
    setOpenPopover(openPopover === popoverName ? null : popoverName);
  };

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    const newCategories = checked
      ? [...filters.categories, categoryId]
      : filters.categories.filter(c => c !== categoryId);
    
    handleFilterChange({ ...filters, categories: newCategories });
  };

  const handleSizeChange = (size: string, checked: boolean) => {
    const newSizes = checked
      ? [...filters.sizes, size]
      : filters.sizes.filter(s => s !== size);
    
    handleFilterChange({ ...filters, sizes: newSizes });
  };

  const handleColorChange = (colorHex: string, checked: boolean) => {
    const newColors = checked
      ? [...filters.colors, colorHex]
      : filters.colors.filter(c => c !== colorHex);
    
    handleFilterChange({ ...filters, colors: newColors });
  };

  const handlePriceChange = (min: number, max: number) => {
    setPriceValues([min, max]);
    handleFilterChange({ ...filters, priceRange: [min, max] });
  };

  const handleSortChange = (value: string) => {
    console.log('Applying sort:', value);
    handleFilterChange({ ...filters, sortBy: value });
    setOpenPopover(null); // Close the popover after selection
  };

  const clearFilter = (filterType: string, value?: string) => {
    switch (filterType) {
      case 'categories':
        handleFilterChange({ ...filters, categories: value ? filters.categories.filter(c => c !== value) : [] });
        break;
      case 'sizes':
        handleFilterChange({ ...filters, sizes: value ? filters.sizes.filter(s => s !== value) : [] });
        break;
      case 'colors':
        handleFilterChange({ ...filters, colors: value ? filters.colors.filter(c => c !== value) : [] });
        break;
      case 'price':
        handleFilterChange({ ...filters, priceRange: [0, 10000] });
        break;
      case 'sort':
        handleFilterChange({ ...filters, sortBy: 'newest' });
        break;
      case 'all':
        handleFilterChange({
          categories: [],
          sizes: [],
          colors: [],
          priceRange: [0, 10000],
          sortBy: 'newest'
        });
        break;
    }
  };

  const getActiveFilters = () => {
    const activeFilters: Array<{ type: string; label: string; value?: string }> = [];
    
    filters.categories.forEach(cat => {
      const category = categories.find(c => c.id === cat);
      if (category) activeFilters.push({ type: 'categories', label: category.label, value: cat });
    });
    
    filters.sizes.forEach(size => {
      activeFilters.push({ type: 'sizes', label: `Size ${size}`, value: size });
    });
    
    filters.colors.forEach(colorHex => {
      const colorObj = availableColors.find(c => c.hex === colorHex);
      if (colorObj) activeFilters.push({ type: 'colors', label: colorObj.displayName, value: colorHex });
    });
    
    if (filters.priceRange[0] !== 0 || filters.priceRange[1] !== 10000) {
      activeFilters.push({ 
        type: 'price', 
        label: `₹${filters.priceRange[0]} - ₹${filters.priceRange[1]}` 
      });
    }
    
    if (filters.sortBy !== 'newest') {
      const sortOption = sortOptions.find(s => s.value === filters.sortBy);
      if (sortOption) activeFilters.push({ type: 'sort', label: `Sort: ${sortOption.label}` });
    }
    
    return activeFilters;
  };

  const FilterPopover = ({ 
    name, 
    label, 
    children, 
    hasActiveFilters = false 
  }: { 
    name: string; 
    label: string; 
    children: React.ReactNode; 
    hasActiveFilters?: boolean;
  }) => (
    <div 
      className="relative filter-popover"
      ref={(el) => { popoverRefs.current[name] = el; }}
    >
      <button
        onClick={() => togglePopover(name)}
        data-open={openPopover === name}
        data-active={hasActiveFilters}
        className="filter-button flex items-center space-x-1 px-3 py-2 border-b-2 border-transparent text-white"
      >
        <span className="font-space text-base tracking-wide font-medium">{label}</span>
        {hasActiveFilters && (
          <span className="bg-neon-pink text-black text-xs px-1.5 py-0.5 rounded-full font-semibold">
            {name === 'categories' ? filters.categories.length :
             name === 'sizes' ? filters.sizes.length :
             name === 'colors' ? filters.colors.length :
             name === 'price' ? (filters.priceRange[0] !== 0 || filters.priceRange[1] !== 10000 ? 1 : 0) :
             name === 'sort' ? (filters.sortBy !== 'newest' ? 1 : 0) : 0}
          </span>
        )}
        <ChevronDown 
          className={`h-4 w-4 transition-transform duration-200 ${
            openPopover === name ? 'rotate-180' : ''
          }`} 
        />
      </button>
      
      <AnimatePresence>
        {openPopover === name && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="popover-panel absolute mt-2 bg-black/80 backdrop-blur-xl border border-white/20 shadow-2xl p-6 rounded-2xl w-80 max-h-[28rem] overflow-y-auto z-50"
            tabIndex={-1}
            onKeyDown={e => { if (e.key === 'Escape') setOpenPopover(null); }}
            style={{
              boxShadow: '0 8px 32px 0 rgba(255,0,204,0.18), 0 1.5px 8px 0 rgba(51,51,153,0.10)',
              border: '1.5px solid rgba(255,255,255,0.12)',
            }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const CircularCheckbox = ({ 
    id, 
    checked, 
    onChange, 
    label 
  }: { 
    id: string; 
    checked: boolean; 
    onChange: (checked: boolean) => void; 
    label: string;
  }) => (
    <label className="flex items-center gap-3 cursor-pointer hover:bg-white/5 p-2 rounded transition-colors">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      <span className={`w-3 h-3 rounded-full border-2 flex-shrink-0 transition-all ${
        checked 
          ? 'border-neon-cyan bg-neon-cyan' 
          : 'border-white/40 hover:border-white/60'
      }`}>
        {checked && <div className="w-1 h-1 bg-black rounded-full m-auto mt-0.5" />}
      </span>
      <span className="text-white text-sm">{label}</span>
    </label>
  );

  const ColorSwatch = ({ color, isSelected, onClick }: { 
    color: ColorShade; 
    isSelected: boolean; 
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className={`relative w-6 h-6 rounded-full border-2 transition-all group ${
        isSelected 
          ? 'border-neon-pink shadow-[0_0_8px_rgba(236,72,153,0.6)]' 
          : 'border-white/30 hover:border-white/60'
      }`}
      style={{ backgroundColor: color.hex }}
      title={color.displayName}
      aria-pressed={isSelected}
    >
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black/90 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">
        {color.displayName}
      </div>
    </button>
  );

  const PriceSlider = () => {
    // Use dynamic min/max for the slider
    const MIN_PRICE = minPrice;
    const MAX_PRICE = maxPrice;
    const [localMin, setLocalMin] = useState(priceValues[0]);
    const [localMax, setLocalMax] = useState(priceValues[1]);
    // Use local string state for input values
    const [localMinInput, setLocalMinInput] = useState(priceValues[0].toString());
    const [localMaxInput, setLocalMaxInput] = useState(priceValues[1].toString());
    const [inputFocus, setInputFocus] = useState<'min' | 'max' | null>(null);
    
    useEffect(() => {
      setLocalMin(priceValues[0]);
      setLocalMax(priceValues[1]);
      setLocalMinInput(priceValues[0].toString());
      setLocalMaxInput(priceValues[1].toString());
    }, [priceValues]);

    const minPercent = ((localMin - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * 100;
    const maxPercent = ((localMax - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * 100;

    // Only update parent on blur or Enter
    const updateParent = (min: number, max: number) => {
      handlePriceChange(min, max);
      if (typeof window !== 'undefined') {
        console.log('[FilterSidebar] PriceSlider updateParent', min, max);
      }
    };

    // Handle number input changes (local string only)
    const handleNumberInputChange = (type: 'min' | 'max', value: string) => {
      if (type === 'min') {
        setLocalMinInput(value);
      } else {
        setLocalMaxInput(value);
      }
    };

    // Commit value on blur or Enter
    const handleInputCommit = (type: 'min' | 'max') => {
      if (type === 'min') {
        const parsed = parseInt(localMinInput, 10);
        const clamped = isNaN(parsed) ? MIN_PRICE : Math.max(MIN_PRICE, Math.min(MAX_PRICE, parsed));
        setLocalMin(clamped);
        setLocalMinInput(clamped.toString());
        updateParent(clamped, localMax);
      } else {
        const parsed = parseInt(localMaxInput, 10);
        const clamped = isNaN(parsed) ? MAX_PRICE : Math.max(localMin + 1, Math.min(MAX_PRICE, parsed));
        setLocalMax(clamped);
        setLocalMaxInput(clamped.toString());
        updateParent(localMin, clamped);
      }
      setInputFocus(null);
    };

    // Handle Enter key
    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, type: 'min' | 'max') => {
      if (e.key === 'Enter') {
        handleInputCommit(type);
        (e.target as HTMLInputElement).blur();
      }
    };

    // Prevent popover from closing while interacting
    const stopPropagation = (e: React.MouseEvent | React.FocusEvent) => {
      e.stopPropagation();
    };

    // Handle range slider changes
    const handleRangeChange = (type: 'min' | 'max', value: string) => {
      const numValue = parseInt(value);
      
      if (type === 'min') {
        const newMin = Math.min(numValue, localMax - 1);
        setLocalMin(newMin);
        updateParent(newMin, localMax);
      } else {
        const newMax = Math.max(numValue, localMin + 1);
        setLocalMax(newMax);
        updateParent(localMin, newMax);
      }
    };

    // Handle visual thumb dragging
    const handleThumbMouseDown = (type: 'min' | 'max') => (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(type);
    };

    const handleThumbMouseMove = useCallback((e: MouseEvent) => {
      if (!isDragging || !sliderRef.current) return;
      
      const rect = sliderRef.current.getBoundingClientRect();
      const percentage = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const value = Math.round(MIN_PRICE + percentage * (MAX_PRICE - MIN_PRICE));
      
      if (isDragging === 'min') {
        const newMin = Math.min(value, localMax - 1);
        setLocalMin(newMin);
        updateParent(newMin, localMax);
      } else if (isDragging === 'max') {
        const newMax = Math.max(value, localMin + 1);
        setLocalMax(newMax);
        updateParent(localMin, newMax);
      }
    }, [isDragging, localMin, localMax]);

    const handleThumbMouseUp = useCallback(() => {
      setIsDragging(null);
    }, []);

    useEffect(() => {
      if (isDragging) {
        document.addEventListener('mousemove', handleThumbMouseMove);
        document.addEventListener('mouseup', handleThumbMouseUp);
        return () => {
          document.removeEventListener('mousemove', handleThumbMouseMove);
          document.removeEventListener('mouseup', handleThumbMouseUp);
        };
      }
    }, [isDragging, handleThumbMouseMove, handleThumbMouseUp]);

    return (
      <div className="space-y-6 min-h-0 w-full" onMouseDown={stopPropagation} onFocus={stopPropagation}>
        {/* Glassy Card for Price Range */}
        <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl px-6 py-6 flex flex-col items-center gap-4 w-full overflow-hidden" style={{ minWidth: 260, maxWidth: 340, margin: '0 auto' }}>
          {/* Price Range Display */}
          <div className="flex items-center justify-center gap-3 mb-2 w-full">
            <div className="relative">
              <span className="absolute left-1 top-1/2 transform -translate-y-1/2 text-lg font-semibold text-neon-cyan pointer-events-none">₹</span>
              <input
                type="number"
                className="bg-transparent text-lg font-semibold text-white text-right border-b border-transparent hover:border-neon-cyan focus:border-neon-cyan focus:outline-none w-24 min-w-[70px] pl-6 pr-2 py-1 transition-all cursor-pointer rounded-md"
                value={inputFocus === 'min' ? localMinInput : localMin.toString()}
                min={MIN_PRICE}
                max={MAX_PRICE}
                onChange={(e) => handleNumberInputChange('min', e.target.value)}
                onFocus={() => setInputFocus('min')}
                onBlur={() => handleInputCommit('min')}
                onKeyDown={e => handleInputKeyDown(e, 'min')}
                placeholder={MIN_PRICE.toString()}
                title="Click to edit minimum price"
                style={{ background: 'rgba(255,255,255,0.08)' }}
              />
            </div>
            <span className="text-lg font-semibold text-white mx-2">-</span>
            <div className="relative">
              <span className="absolute left-1 top-1/2 transform -translate-y-1/2 text-lg font-semibold text-neon-pink pointer-events-none">₹</span>
              <input
                type="number"
                className="bg-transparent text-lg font-semibold text-white text-right border-b border-transparent hover:border-neon-pink focus:border-neon-pink focus:outline-none w-24 min-w-[70px] pl-6 pr-2 py-1 transition-all cursor-pointer rounded-md"
                value={inputFocus === 'max' ? localMaxInput : localMax.toString()}
                min={MIN_PRICE}
                max={MAX_PRICE}
                onChange={(e) => handleNumberInputChange('max', e.target.value)}
                onFocus={() => setInputFocus('max')}
                onBlur={() => handleInputCommit('max')}
                onKeyDown={e => handleInputKeyDown(e, 'max')}
                placeholder={MAX_PRICE.toString()}
                title="Click to edit maximum price"
                style={{ background: 'rgba(255,255,255,0.08)' }}
              />
            </div>
          </div>
          <div className="text-xs text-gray-300 mb-2 w-full text-center">Click or drag to set price range</div>
          {/* Minimal Glassy Slider */}
          <div className="relative w-full h-10 flex items-center px-7 overflow-hidden" style={{ minWidth: 200, maxWidth: 300 }} ref={sliderRef}>
            {/* Glassy Track */}
            <div className="absolute top-1/2 left-0 right-0 h-3 bg-white/20 backdrop-blur-sm rounded-full shadow-inner -translate-y-1/2" />
            {/* Active Track */}
            <div 
              className="absolute top-1/2 h-3 bg-gradient-to-r from-neon-cyan to-neon-pink rounded-full shadow-lg -translate-y-1/2 transition-all duration-200"
              style={{ 
                left: `${minPercent}%`,
                width: `${maxPercent - minPercent}%`
              }}
            />
            {/* Range Inputs (Hidden but functional) */}
            <input
              type="range"
              className="absolute w-full h-10 opacity-0 cursor-pointer z-10"
              min={MIN_PRICE}
              max={MAX_PRICE}
              step="1"
              value={localMin}
              onChange={e => {
                const value = Math.min(Number(e.target.value), localMax - 1);
                setLocalMin(value);
              }}
              onMouseUp={() => updateParent(localMin, localMax)}
              onTouchEnd={() => updateParent(localMin, localMax)}
            />
            <input
              type="range"
              className="absolute w-full h-10 opacity-0 cursor-pointer z-10"
              min={MIN_PRICE}
              max={MAX_PRICE}
              step="1"
              value={localMax}
              onChange={e => {
                const value = Math.max(Number(e.target.value), localMin + 1);
                setLocalMax(value);
              }}
              onMouseUp={() => updateParent(localMin, localMax)}
              onTouchEnd={() => updateParent(localMin, localMax)}
            />
            {/* Thumbs */}
            <div 
              className="absolute top-1/2 left-0 z-20"
              style={{ left: `${minPercent}%`, transform: 'translate(-50%, -50%)' }}
              onMouseDown={handleThumbMouseDown('min')}
              tabIndex={0}
              role="slider"
              aria-valuenow={localMin}
              aria-valuemin={MIN_PRICE}
              aria-valuemax={localMax - 1}
              aria-label="Minimum price"
            >
              <div className="w-6 h-6 rounded-full bg-white/70 border-2 border-white shadow-xl cursor-pointer transition-all duration-200 hover:scale-110 hover:shadow-2xl" style={{ backdropFilter: 'blur(2px)' }} />
            </div>
            <div 
              className="absolute top-1/2 left-0 z-20"
              style={{ left: `${maxPercent}%`, transform: 'translate(-50%, -50%)' }}
              onMouseDown={handleThumbMouseDown('max')}
              tabIndex={0}
              role="slider"
              aria-valuenow={localMax}
              aria-valuemin={localMin + 1}
              aria-valuemax={MAX_PRICE}
              aria-label="Maximum price"
            >
              <div className="w-6 h-6 rounded-full bg-white/70 border-2 border-white shadow-xl cursor-pointer transition-all duration-200 hover:scale-110 hover:shadow-2xl" style={{ backdropFilter: 'blur(2px)' }} />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const FilterBadges = () => {
    const activeFilters = getActiveFilters();
    
    if (activeFilters.length === 0) return null;

    return (
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="text-lg text-gray-400">Active filters:</span>
        {activeFilters.map((filter, index) => (
          <motion.div
            key={`${filter.type}-${filter.value || filter.label}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-1 bg-white/10 border border-white/20 rounded-full px-3 py-1 text-lg text-white"
          >
            <span>{filter.label}</span>
            <button
              onClick={() => clearFilter(filter.type, filter.value)}
              className="text-white/60 hover:text-neon-pink transition-colors"
              aria-label={`Remove ${filter.label} filter`}
            >
              <X className="h-3 w-3" />
            </button>
          </motion.div>
        ))}
        <button
          onClick={() => clearFilter('all')}
          className="text-lg text-neon-cyan hover:text-neon-pink transition-colors underline"
        >
          Clear All
        </button>
      </div>
    );
  };

  return (
    <div className="w-full">
      {/* Modern Filter Bar */}
      <div className="flex justify-center sticky top-16 z-50 mb-8">
        <div className="filter-bar-container max-w-5xl w-full mx-auto">
          <div className="filter-bar bg-black/80 backdrop-blur-md px-6 py-3 rounded-2xl flex justify-center items-center gap-4 border border-gray-700/30 shadow-2xl" style={{marginBottom: '1.5rem'}}>
            {/* Pill-shaped filter buttons with badges */}
            {[
              { name: 'sort', label: 'Sort', active: filters.sortBy !== 'newest' },
              { name: 'categories', label: 'Categories', active: filters.categories.length > 0 },
              { name: 'sizes', label: 'Size', active: filters.sizes.length > 0 },
              { name: 'colors', label: 'Colours', active: filters.colors.length > 0 },
              { name: 'price', label: 'Price', active: filters.priceRange[0] !== 0 || filters.priceRange[1] !== 10000 },
            ].map(btn => (
              <div key={btn.name} className="relative">
                <button
                  onClick={() => togglePopover(btn.name)}
                  className={`px-5 py-2 rounded-full font-semibold text-base transition-all border border-white/10 shadow-sm flex items-center gap-2 bg-white/10 hover:bg-white/20 focus:outline-none ${btn.active ? 'ring-2 ring-neon-pink text-neon-pink' : 'text-white'}`}
                  aria-pressed={openPopover === btn.name}
                  aria-label={btn.label}
                >
                  {btn.label}
                  {btn.active && <span className="ml-1 bg-neon-pink text-black text-xs px-2 py-0.5 rounded-full font-bold">•</span>}
                  <ChevronDown className={`w-4 h-4 transition-transform ${openPopover === btn.name ? 'rotate-180' : ''}`} />
                </button>
                {/* Popover Panel */}
                <AnimatePresence>
                  {openPopover === btn.name && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.15, ease: 'easeOut' }}
                      className="popover-panel absolute left-0 mt-2 bg-black/80 backdrop-blur-xl border border-white/20 shadow-2xl p-6 rounded-2xl w-80 max-h-[28rem] overflow-y-auto z-50"
                      tabIndex={-1}
                      onKeyDown={e => { if (e.key === 'Escape') setOpenPopover(null); }}
                      style={{
                        boxShadow: '0 8px 32px 0 rgba(255,0,204,0.18), 0 1.5px 8px 0 rgba(51,51,153,0.10)',
                        border: '1.5px solid rgba(255,255,255,0.12)',
                      }}
                    >
                      {/* Render the correct filter content here, e.g. Sort, Categories, etc. */}
                      {btn.name === 'sort' && (
                        <div className="space-y-3">
                {sortOptions.map(option => (
                            <button
                              key={option.value}
                              className={`w-full text-left px-5 py-3 rounded-xl font-semibold text-lg transition-all border border-transparent hover:bg-white/10 focus:outline-none ${filters.sortBy === option.value ? 'bg-neon-pink/20 text-neon-pink border-neon-pink' : 'text-white'}`}
                              onClick={() => { handleSortChange(option.value); setOpenPopover(null); }}
                              aria-pressed={filters.sortBy === option.value}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      )}
                      {btn.name === 'categories' && (
                        <div className="space-y-3">
                          {categories.map(category => (
                            <label key={category.id} className="flex items-center gap-4 cursor-pointer hover:bg-white/5 p-3 rounded-xl transition-colors text-lg">
                    <input
                                type="checkbox"
                                checked={filters.categories.includes(category.id)}
                                onChange={e => handleCategoryChange(category.id, e.target.checked)}
                      className="sr-only"
                    />
                              <span className={`w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all ${filters.categories.includes(category.id) ? 'border-neon-cyan bg-neon-cyan' : 'border-white/40 hover:border-white/60'}`}></span>
                              <span className="text-white">{category.label}</span>
                  </label>
                ))}
              </div>
                      )}
                      {btn.name === 'sizes' && (
                        <div className="flex flex-wrap gap-3">
                          {sizes.map(size => (
                            <button
                              key={size}
                              onClick={() => handleSizeChange(size, !filters.sizes.includes(size))}
                              className={`px-4 py-2 rounded-xl text-base font-bold border transition-all ${filters.sizes.includes(size) ? 'bg-neon-pink text-black border-neon-pink' : 'bg-[#181824] text-white border-gray-700 hover:bg-neon-pink/10'}`}
                              aria-pressed={filters.sizes.includes(size)}
                            >
                              {size}
                            </button>
                ))}
              </div>
                      )}
                      {btn.name === 'colors' && (
                        <div className="grid grid-cols-6 gap-4 py-2">
                          {availableColors.length === 0 && (
                            <div className="col-span-6 text-center py-8">
                              <p className="text-gray-400 text-sm">No colors found. (Check if your product_variants table has color hex codes.)</p>
              </div>
                          )}
                          {availableColors.map(color => {
                            // Robust: support both hex and color names in filter
                            const isSelected = filters.colors.map(c => c.toLowerCase()).includes(color.hex.toLowerCase()) ||
                              filters.colors.map(c => c.toLowerCase()).includes(color.displayName.toLowerCase());
                            return (
                    <button
                      key={color.hex}
                                onClick={() => handleColorChange(color.hex, !isSelected)}
                                className={`relative w-10 h-10 rounded-full border-2 transition-all group flex items-center justify-center
                                  ${isSelected ? 'border-neon-pink shadow-[0_0_12px_rgba(236,72,153,0.7)]' : 'border-white/30 hover:border-white/60'}`}
                      style={{ backgroundColor: color.hex }}
                                aria-pressed={isSelected}
                      title={color.displayName}
                              >
                                {isSelected && (
                                  <span className="absolute inset-0 flex items-center justify-center">
                                    <svg width="20" height="20" viewBox="0 0 20 20" className="text-neon-pink" fill="none">
                                      <circle cx="10" cy="10" r="8" stroke="white" strokeWidth="2" />
                                      <path d="M6 10.5l2.5 2.5L14 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                  </span>
                                )}
                                <span className="sr-only">{color.displayName}</span>
                      {/* Tooltip */}
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black/90 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity z-50">
                        {color.displayName}
                      </div>
                    </button>
                            );
                          })}
                    </div>
                  )}
                      {btn.name === 'price' && (
                        <PriceSlider />
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Active Filters as chips below the bar */}
      <div className="flex flex-wrap items-center gap-2 mb-12 justify-center">
        {getActiveFilters().map((filter, index) => (
          <div key={`${filter.type}-${filter.value || filter.label}`} className="flex items-center gap-1 bg-white/10 border border-white/20 rounded-full px-4 py-1 text-base text-white shadow">
            <span>{filter.label}</span>
            <button
              onClick={() => clearFilter(filter.type, filter.value)}
              className="text-white/60 hover:text-neon-pink transition-colors ml-1"
              aria-label={`Remove ${filter.label} filter`}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
        {getActiveFilters().length > 0 && (
          <button
            onClick={() => clearFilter('all')}
            className="text-base text-neon-cyan hover:text-neon-pink transition-colors underline ml-4"
          >
            Clear All
          </button>
        )}
      </div>
      {/* Spacer before product grid */}
      <div className="w-full" style={{marginTop: '2rem'}} />
    </div>
  );
};

// Add debug styles
if (DEBUG) {
  const style = document.createElement('style');
  style.textContent = `
    .debug-filter-bar {
      outline: 2px solid red;
    }
    .debug-filter-bar * {
      outline: 1px solid blue;
    }
    .popover-panel {
      outline: 2px solid green;
    }
  `;
  document.head.appendChild(style);
}

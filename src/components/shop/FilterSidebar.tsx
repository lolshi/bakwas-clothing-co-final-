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
  { value: 'price-low', label: 'Price: Low → High' },
  { value: 'price-high', label: 'Price: High → Low' },
  { value: 'best-selling', label: 'Best Selling' }
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
}) => {
  const [openPopover, setOpenPopover] = useState<string | null>(null);
  const [priceValues, setPriceValues] = useState(filters.priceRange);
  const [isDragging, setIsDragging] = useState<'min' | 'max' | null>(null);
  const { colors: availableColors, loading: colorsLoading } = useAvailableColorsFromVariants();
  const sliderRef = useRef<HTMLDivElement>(null);
  const popoverRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Debounced filter update
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const handleFilterChange = useCallback((newFilters: FilterState) => {
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
    handleFilterChange({ ...filters, sortBy: value });
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
            className="popover-panel absolute mt-2 bg-[#14141a] rounded-lg shadow-xl border border-gray-700/50 p-4 w-64 max-h-80 overflow-y-auto z-30"
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
    const MIN_PRICE = priceValues[0];
    const MAX_PRICE = priceValues[1];
    const [localMin, setLocalMin] = useState(priceValues[0]);
    const [localMax, setLocalMax] = useState(priceValues[1]);
    const [isDraggingLocal, setIsDraggingLocal] = useState<'min' | 'max' | null>(null);
    
    // Update local state when props change
    useEffect(() => {
      setLocalMin(priceValues[0]);
      setLocalMax(priceValues[1]);
    }, [priceValues]);

    const minPercent = ((localMin - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * 100;
    const maxPercent = ((localMax - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * 100;

    // Debounced update to parent
    const updateParent = (min: number, max: number) => {
      handlePriceChange(min, max);
    };

    // Handle number input changes
    const handleNumberInputChange = (type: 'min' | 'max', value: string) => {
      const numValue = parseInt(value) || (type === 'min' ? MIN_PRICE : MAX_PRICE);
      const clampedValue = Math.max(MIN_PRICE, Math.min(MAX_PRICE, numValue));
      
      if (type === 'min') {
        const newMin = Math.min(clampedValue, localMax - 1);
        setLocalMin(newMin);
        updateParent(newMin, localMax);
      } else {
        const newMax = Math.max(clampedValue, localMin + 1);
        setLocalMax(newMax);
        updateParent(localMin, newMax);
      }
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
      setIsDraggingLocal(type);
    };

    const handleThumbMouseMove = useCallback((e: MouseEvent) => {
      if (!isDraggingLocal || !sliderRef.current) return;
      
      const rect = sliderRef.current.getBoundingClientRect();
      const percentage = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const value = Math.round(MIN_PRICE + percentage * (MAX_PRICE - MIN_PRICE));
      
      if (isDraggingLocal === 'min') {
        const newMin = Math.min(value, localMax - 1);
        setLocalMin(newMin);
        updateParent(newMin, localMax);
      } else if (isDraggingLocal === 'max') {
        const newMax = Math.max(value, localMin + 1);
        setLocalMax(newMax);
        updateParent(localMin, newMax);
      }
    }, [isDraggingLocal, localMin, localMax]);

    const handleThumbMouseUp = useCallback(() => {
      setIsDraggingLocal(null);
    }, []);

    useEffect(() => {
      if (isDraggingLocal) {
        document.addEventListener('mousemove', handleThumbMouseMove);
        document.addEventListener('mouseup', handleThumbMouseUp);
        return () => {
          document.removeEventListener('mousemove', handleThumbMouseMove);
          document.removeEventListener('mouseup', handleThumbMouseUp);
        };
      }
    }, [isDraggingLocal, handleThumbMouseMove, handleThumbMouseUp]);

    return (
      <div className="space-y-6 min-h-0 w-full">
        {/* Interactive Price Range Display */}
        <div className="text-center min-h-0 w-full">
          <div className="flex items-center justify-center gap-2 mb-1 min-h-0 w-full">
            <div className="relative min-h-0">
              <span className="absolute left-1 top-1/2 transform -translate-y-1/2 text-lg font-semibold text-neon-cyan pointer-events-none">₹</span>
              <input
                type="number"
                className="bg-transparent text-lg font-semibold text-white text-center border-b border-transparent hover:border-neon-cyan focus:border-neon-cyan focus:outline-none w-24 pl-6 pr-2 py-1 transition-all cursor-pointer min-h-0"
                value={localMin}
                min={MIN_PRICE}
                max={MAX_PRICE}
                onChange={(e) => handleNumberInputChange('min', e.target.value)}
                onFocus={(e) => e.target.select()}
                placeholder="299"
                title="Click to edit minimum price"
              />
            </div>
            <span className="text-lg font-semibold text-white mx-2">-</span>
            <div className="relative min-h-0">
              <span className="absolute left-1 top-1/2 transform -translate-y-1/2 text-lg font-semibold text-neon-pink pointer-events-none">₹</span>
              <input
                type="number"
                className="bg-transparent text-lg font-semibold text-white text-center border-b border-transparent hover:border-neon-pink focus:border-neon-pink focus:outline-none w-24 pl-6 pr-2 py-1 transition-all cursor-pointer min-h-0"
                value={localMax}
                min={MIN_PRICE}
                max={MAX_PRICE}
                onChange={(e) => handleNumberInputChange('max', e.target.value)}
                onFocus={(e) => e.target.select()}
                placeholder="1499"
                title="Click to edit maximum price"
              />
            </div>
          </div>
          <div className="text-xs text-gray-400 min-h-0 w-full">
            Click to edit price range
          </div>
        </div>
        {/* Number Inputs */}
        <div className="flex items-center gap-4 min-h-0 w-full">
          <div className="flex-1 min-h-0">
            <label htmlFor="minPriceInput" className="block text-xs text-gray-400 mb-2 min-h-0">
              Minimum Price
            </label>
            <input
              type="number"
              id="minPriceInput"
              name="minPriceInput"
              className="w-full bg-white/10 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm text-center focus:outline-none focus:border-neon-cyan focus:bg-white/15 transition-all min-h-0"
              min={MIN_PRICE}
              max={MAX_PRICE}
              step="1"
              value={localMin}
              onChange={(e) => handleNumberInputChange('min', e.target.value)}
              onBlur={(e) => {
                if (!e.target.value) {
                  setLocalMin(MIN_PRICE);
                  updateParent(MIN_PRICE, localMax);
                }
              }}
            />
          </div>
          <div className="text-gray-400 mt-6 min-h-0">-</div>
          <div className="flex-1 min-h-0">
            <label htmlFor="maxPriceInput" className="block text-xs text-gray-400 mb-2 min-h-0">
              Maximum Price
            </label>
            <input
              type="number"
              id="maxPriceInput"
              name="maxPriceInput"
              className="w-full bg-white/10 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm text-center focus:outline-none focus:border-neon-cyan focus:bg-white/15 transition-all min-h-0"
              min={MIN_PRICE}
              max={MAX_PRICE}
              step="1"
              value={localMax}
              onChange={(e) => handleNumberInputChange('max', e.target.value)}
              onBlur={(e) => {
                if (!e.target.value) {
                  setLocalMax(MAX_PRICE);
                  updateParent(localMin, MAX_PRICE);
                }
              }}
            />
          </div>
        </div>
        {/* Dual Range Slider */}
        <div className="relative min-h-0 w-full h-auto">
          <div className="relative px-2 min-h-0 w-full h-auto" ref={sliderRef}>
            {/* Background Track */}
            <div className="absolute top-1/2 left-2 right-2 h-2 bg-gray-700 rounded-full transform -translate-y-1/2 min-h-0 w-auto" />
            {/* Active Track */}
            <div 
              className="absolute top-1/2 h-2 bg-gradient-to-r from-neon-cyan to-neon-pink rounded-full transform -translate-y-1/2 transition-all duration-200 min-h-0 w-auto"
              style={{ 
                left: `calc(${minPercent}% + 8px)`, 
                width: `calc(${maxPercent - minPercent}% - 16px)` 
              }}
            />
            {/* Range Inputs (Hidden but functional) */}
            <input
              type="range"
              className="absolute w-full h-10 opacity-0 cursor-pointer z-10 min-h-0"
              min={MIN_PRICE}
              max={MAX_PRICE}
              step="1"
              value={localMin}
              onChange={(e) => handleRangeChange('min', e.target.value)}
              style={{ pointerEvents: 'auto' }}
            />
            <input
              type="range"
              className="absolute w-full h-10 opacity-0 cursor-pointer z-10 min-h-0"
              min={MIN_PRICE}
              max={MAX_PRICE}
              step="1"
              value={localMax}
              onChange={(e) => handleRangeChange('max', e.target.value)}
              style={{ pointerEvents: 'auto' }}
            />
            {/* Visual Thumbs */}
            <div 
              className={`absolute w-6 h-6 bg-neon-cyan rounded-full border-3 border-white cursor-grab transform -translate-x-1/2 -translate-y-1/2 top-1/2 z-20 shadow-lg transition-all duration-200 min-h-0 w-6 h-6`}
              style={{ left: `calc(${minPercent}% + 8px)` }}
              onMouseDown={handleThumbMouseDown('min')}
              title={`Min: ₹${localMin}`}
            >
              <div className="absolute inset-1 bg-white rounded-full opacity-30 min-h-0" />
            </div>
            <div 
              className={`absolute w-6 h-6 bg-neon-pink rounded-full border-3 border-white cursor-grab transform -translate-x-1/2 -translate-y-1/2 top-1/2 z-20 shadow-lg transition-all duration-200 min-h-0 w-6 h-6`}
              style={{ left: `calc(${maxPercent}% + 8px)` }}
              onMouseDown={handleThumbMouseDown('max')}
              title={`Max: ₹${localMax}`}
            >
              <div className="absolute inset-1 bg-white rounded-full opacity-30 min-h-0" />
            </div>
          </div>
          {/* Price Labels */}
          <div className="flex justify-between text-xs text-gray-400 mt-2 px-2 min-h-0 w-full">
            <span>₹{MIN_PRICE.toLocaleString()}</span>
            <span>₹{MAX_PRICE.toLocaleString()}</span>
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
      {/* Filter Bar */}
      <div className="flex justify-center sticky top-16 z-20">
        <div className="filter-bar-container max-w-4xl w-full mx-auto">
          <div className="filter-bar bg-black bg-opacity-60 backdrop-blur-sm px-6 py-2 rounded-full flex justify-center items-center space-x-6 border border-gray-700/30">
            {/* Sort Popover */}
            <FilterPopover 
              name="sort" 
              label="Sort" 
              hasActiveFilters={filters.sortBy !== 'newest'}
            >
              <div className="space-y-2">
                <h4 className="popover-title">Sort By</h4>
                {sortOptions.map(option => (
                  <label key={option.value} className="flex items-center gap-3 cursor-pointer hover:bg-white/5 p-2 rounded transition-colors">
                    <input
                      type="radio"
                      name="sort"
                      value={option.value}
                      checked={filters.sortBy === option.value}
                      onChange={(e) => handleSortChange(e.target.value)}
                      className="sr-only"
                    />
                    <span className={`w-3 h-3 rounded-full border-2 flex-shrink-0 ${
                      filters.sortBy === option.value 
                        ? 'border-neon-cyan bg-neon-cyan' 
                        : 'border-white/40'
                    }`}>
                      {filters.sortBy === option.value && (
                        <div className="w-1 h-1 bg-black rounded-full m-auto mt-0.5" />
                      )}
                    </span>
                    <span className="text-white text-sm">{option.label}</span>
                  </label>
                ))}
              </div>
            </FilterPopover>

            {/* Categories Popover */}
            <FilterPopover 
              name="categories" 
              label="Categories" 
              hasActiveFilters={filters.categories.length > 0}
            >
              <div className="space-y-2">
                <h4 className="popover-title">Categories</h4>
                {categories.map(category => (
                  <CircularCheckbox
                    key={category.id}
                    id={category.id}
                    checked={filters.categories.includes(category.id)}
                    onChange={(checked) => handleCategoryChange(category.id, checked)}
                    label={category.label}
                  />
                ))}
              </div>
            </FilterPopover>

            {/* Sizes Popover */}
            <FilterPopover 
              name="sizes" 
              label="Size" 
              hasActiveFilters={filters.sizes.length > 0}
            >
              <div className="space-y-2">
                <h4 className="popover-title">Size</h4>
                {sizes.map(size => (
                  <CircularCheckbox
                    key={size}
                    id={size}
                    checked={filters.sizes.includes(size)}
                    onChange={(checked) => handleSizeChange(size, checked)}
                    label={size}
                  />
                ))}
              </div>
            </FilterPopover>

            {/* Colors Popover */}
            <FilterPopover 
              name="colors" 
              label="Colours" 
              hasActiveFilters={filters.colors.length > 0}
            >
              <div className="space-y-4">
                <h4 className="popover-title">Colours</h4>
                {/* Color Swatches */}
                <div className="grid grid-cols-6 gap-2">
                  {availableColors.map(color => (
                    <button
                      key={color.hex}
                      onClick={() => handleColorChange(color.hex, !filters.colors.includes(color.hex))}
                      className={`relative w-6 h-6 rounded-full border-2 transition-all group ${
                        filters.colors.includes(color.hex)
                          ? 'border-neon-pink shadow-[0_0_8px_rgba(236,72,153,0.6)]'
                          : 'border-white/30 hover:border-white/60'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.displayName}
                      aria-pressed={filters.colors.includes(color.hex)}
                    >
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black/90 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">
                        {color.displayName}
                      </div>
                    </button>
                  ))}
                  {availableColors.length === 0 && !colorsLoading && (
                    <div className="col-span-6 text-center py-8">
                      <p className="text-gray-400 text-sm">No colors found</p>
                    </div>
                  )}
                  {colorsLoading && (
                    <div className="col-span-6 text-center py-8">
                      <p className="text-gray-400 text-sm">Loading colors...</p>
                    </div>
                  )}
                </div>
              </div>
            </FilterPopover>

            {/* Price Popover */}
            <FilterPopover 
              name="price" 
              label="Price" 
              hasActiveFilters={filters.priceRange[0] !== 0 || filters.priceRange[1] !== 10000}
            >
              <div className="space-y-4">
                <h4 className="popover-title">Price Range</h4>
                <PriceSlider />
              </div>
            </FilterPopover>
          </div>
        </div>
      </div>

      {/* Active Filters */}
      <div className="mt-4">
        <FilterBadges />
      </div>
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

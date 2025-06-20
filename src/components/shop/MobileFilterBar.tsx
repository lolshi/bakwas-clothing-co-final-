import React, { useState, useEffect } from 'react';
import { Filter, ChevronDown, Package, Ruler, Palette, DollarSign, ArrowUpDown, X, SlidersHorizontal } from 'lucide-react';
import { FilterState } from '@/pages/Shop';
import { useAvailableColorsFromVariants } from '@/hooks/useAvailableColorsFromVariants';
import { Dialog, DialogTrigger, DialogContent } from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';

// You may want to move these mock data arrays to a shared config if needed
const categories = [
  { id: '1', label: 'T-Shirts', count: 24 },
  { id: '2', label: 'Hoodies', count: 18 },
  { id: '3', label: 'Pants', count: 12 },
  { id: '4', label: 'Accessories', count: 8 },
];

const sizes = [
  { value: 'XS', count: 15 },
  { value: 'S', count: 28 },
  { value: 'M', count: 32 },
  { value: 'L', count: 25 },
  { value: 'XL', count: 18 },
  { value: 'XXL', count: 10 },
];

const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'popular', label: 'Most Popular' },
];

const priceRanges = [
  { label: 'Under ₹500', value: [0, 500] },
  { label: '₹500 - ₹1000', value: [500, 1000] },
  { label: '₹1000 - ₹2000', value: [1000, 2000] },
  { label: '₹2000 - ₹5000', value: [2000, 5000] },
  { label: 'Over ₹5000', value: [5000, 10000] },
];

interface MobileFilterBarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
}

const MobileFilterBar: React.FC<MobileFilterBarProps> = ({ filters, setFilters }) => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);

  useEffect(() => {
    if (!isPanelOpen) {
      setLocalFilters(filters);
    }
  }, [isPanelOpen, filters]);

  const clearAllFilters = () => {
    setLocalFilters({
      categories: [],
      sizes: [],
      colors: [],
      priceRange: [0, 10000],
      sortBy: 'newest',
    });
  };

  const getActiveFilterCount = () => {
    return Object.values(filters).reduce<number>((acc, f) =>
      acc + (Array.isArray(f) ? f.length : f !== 'newest' ? 1 : 0), 0
    );
  };

  const { colors: availableColors } = useAvailableColorsFromVariants({
    sizes: localFilters.sizes,
    priceRange: localFilters.priceRange,
  });

  const handleColorChange = (color: string, add: boolean) => {
    setLocalFilters(prev => ({
      ...prev,
      colors: add ? [...prev.colors, color] : prev.colors.filter(c => c !== color)
    }));
  };

  // --- UI ---
  return (
    <>
      {/* Modern, subtle funnel button at the top right */}
      <div
        className="w-full flex justify-end items-center px-4 pt-4 md:hidden z-50"
        style={{ position: 'relative', top: '-25px' }}
      >
        <button
          className="relative flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 backdrop-blur border border-white/20 shadow-lg hover:bg-black/60 transition z-50"
          style={{ minWidth: 44, minHeight: 44 }}
          aria-label="Open filters"
          onClick={() => setIsPanelOpen(true)}
        >
          <SlidersHorizontal className="w-6 h-6 text-white drop-shadow z-50" />
          {getActiveFilterCount() > 0 && (
            <span className="absolute -top-2 -right-2 bg-neon-pink text-black text-xs font-bold px-1.5 py-0.5 rounded-full border border-white/30 shadow z-50">
              {getActiveFilterCount()}
            </span>
          )}
        </button>
      </div>

      {/* Improved Sidebar Panel */}
      <AnimatePresence>
        {isPanelOpen && (
          <>
            {/* Backdrop with blur effect */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsPanelOpen(false)}
            />

            {/* Sidebar Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 right-0 z-50 w-[85%] max-w-sm bg-gradient-to-b from-black/95 to-black/98 backdrop-blur-xl shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-white/10">
                <h2 className="text-xl font-bold text-white">Filters</h2>
                <button 
                  onClick={() => setIsPanelOpen(false)}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Filter Sections with smooth animations */}
              <div className="flex-1 overflow-y-auto py-4 space-y-4 custom-scrollbar">
                {/* Sort Section */}
                <div className="px-5">
                  <button
                    className="flex items-center justify-between w-full py-3 text-white group"
                    onClick={() => setOpenSection(openSection === 'sort' ? null : 'sort')}
                  >
                    <span className="flex items-center gap-3">
                      <ArrowUpDown className="w-5 h-5 text-neon-pink group-hover:scale-110 transition-transform" />
                      <span className="font-medium">Sort By</span>
                    </span>
                    <ChevronDown 
                      className={`w-5 h-5 transition-transform duration-300 ${
                        openSection === 'sort' ? 'rotate-180' : ''
                      }`} 
                    />
                  </button>
                  <AnimatePresence>
                    {openSection === 'sort' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-2 space-y-1">
                          {sortOptions.map(option => (
                            <button
                              key={option.value}
                              onClick={() => {
                                setLocalFilters(prev => ({ ...prev, sortBy: option.value }));
                                // Immediately apply sort changes
                                setFilters(prev => ({ ...prev, sortBy: option.value }));
                              }}
                              className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all ${
                                localFilters.sortBy === option.value
                                  ? 'bg-neon-pink text-black font-medium shadow-lg shadow-neon-pink/20'
                                  : 'text-white hover:bg-white/5'
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Categories Section */}
                <div className="px-5">
                  <button
                    className="flex items-center justify-between w-full py-3 text-white group"
                    onClick={() => setOpenSection(openSection === 'categories' ? null : 'categories')}
                  >
                    <span className="flex items-center gap-3">
                      <Package className="w-5 h-5 text-neon-pink group-hover:scale-110 transition-transform" />
                      <span className="font-medium">Categories</span>
                    </span>
                    <ChevronDown 
                      className={`w-5 h-5 transition-transform duration-300 ${
                        openSection === 'categories' ? 'rotate-180' : ''
                      }`} 
                    />
                  </button>
                  <AnimatePresence>
                    {openSection === 'categories' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-2 grid grid-cols-2 gap-2">
                          {categories.map(category => (
                            <button
                              key={category.id}
                              onClick={() => setLocalFilters(prev => ({
                                ...prev,
                                categories: prev.categories.includes(category.id)
                                  ? prev.categories.filter(id => id !== category.id)
                                  : [...prev.categories, category.id]
                              }))}
                              className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all ${
                                localFilters.categories.includes(category.id)
                                  ? 'bg-neon-pink text-black font-medium shadow-lg shadow-neon-pink/20'
                                  : 'bg-white/5 text-white hover:bg-white/10'
                              }`}
                            >
                              <span>{category.label}</span>
                              <span className="text-xs opacity-75">({category.count})</span>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Sizes Section */}
                <div className="px-5">
                  <button
                    className="flex items-center justify-between w-full py-3 text-white group"
                    onClick={() => setOpenSection(openSection === 'sizes' ? null : 'sizes')}
                  >
                    <span className="flex items-center gap-3">
                      <Ruler className="w-5 h-5 text-neon-pink group-hover:scale-110 transition-transform" />
                      <span className="font-medium">Size</span>
                    </span>
                    <ChevronDown 
                      className={`w-5 h-5 transition-transform duration-300 ${
                        openSection === 'sizes' ? 'rotate-180' : ''
                      }`} 
                    />
                  </button>
                  <AnimatePresence>
                    {openSection === 'sizes' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-2 flex flex-wrap gap-2">
                          {sizes.map(size => (
                            <button
                              key={size.value}
                              onClick={() => setLocalFilters(prev => ({
                                ...prev,
                                sizes: prev.sizes.includes(size.value)
                                  ? prev.sizes.filter(s => s !== size.value)
                                  : [...prev.sizes, size.value]
                              }))}
                              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                localFilters.sizes.includes(size.value)
                                  ? 'bg-neon-pink text-black shadow-lg shadow-neon-pink/20'
                                  : 'bg-white/5 text-white hover:bg-white/10'
                              }`}
                            >
                              {size.value}
                              <span className="ml-1 text-xs opacity-75">({size.count})</span>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Colors Section */}
                <div className="px-5">
                  <button
                    className="flex items-center justify-between w-full py-3 text-white group"
                    onClick={() => setOpenSection(openSection === 'colors' ? null : 'colors')}
                  >
                    <span className="flex items-center gap-3">
                      <Palette className="w-5 h-5 text-neon-pink group-hover:scale-110 transition-transform" />
                      <span className="font-medium">Colors</span>
                    </span>
                    <ChevronDown 
                      className={`w-5 h-5 transition-transform duration-300 ${
                        openSection === 'colors' ? 'rotate-180' : ''
                      }`} 
                    />
                  </button>
                  <AnimatePresence>
                    {openSection === 'colors' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-2 grid grid-cols-6 gap-3">
                          {availableColors.map(color => (
                            <button
                              key={color.hex}
                              onClick={() => handleColorChange(color.hex, !localFilters.colors.includes(color.hex))}
                              className={`relative w-10 h-10 rounded-full transition-all group ${
                                localFilters.colors.includes(color.hex)
                                  ? 'ring-2 ring-neon-pink ring-offset-2 ring-offset-black shadow-lg shadow-neon-pink/20'
                                  : 'ring-2 ring-white/20 hover:ring-white/40'
                              }`}
                              style={{ backgroundColor: color.hex }}
                              title={color.displayName}
                            >
                              <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/90 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                {color.displayName}
                              </span>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Price Section */}
                <div className="px-5">
                  <button
                    className="flex items-center justify-between w-full py-3 text-white group"
                    onClick={() => setOpenSection(openSection === 'price' ? null : 'price')}
                  >
                    <span className="flex items-center gap-3">
                      <DollarSign className="w-5 h-5 text-neon-pink group-hover:scale-110 transition-transform" />
                      <span className="font-medium">Price</span>
                    </span>
                    <ChevronDown 
                      className={`w-5 h-5 transition-transform duration-300 ${
                        openSection === 'price' ? 'rotate-180' : ''
                      }`} 
                    />
                  </button>
                  <AnimatePresence>
                    {openSection === 'price' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-2 space-y-2">
                          {priceRanges.map(range => (
                            <button
                              key={range.label}
                              onClick={() => setLocalFilters(prev => ({
                                ...prev,
                                priceRange: range.value as [number, number]
                              }))}
                              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all ${
                                localFilters.priceRange[0] === range.value[0] && localFilters.priceRange[1] === range.value[1]
                                  ? 'bg-neon-pink text-black font-medium shadow-lg shadow-neon-pink/20'
                                  : 'bg-white/5 text-white hover:bg-white/10'
                              }`}
                            >
                              {range.label}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Apply and Reset Buttons */}
              <div className="sticky bottom-0 p-4 bg-black/90 backdrop-blur border-t border-white/10 flex gap-3">
                <button
                  onClick={clearAllFilters}
                  className="flex-1 py-3 px-4 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"
                >
                  Reset
                </button>
                  <button
                    onClick={() => {
                      setFilters(localFilters);
                      setIsPanelOpen(false);
                    }}
                  className="flex-1 py-3 px-4 rounded-xl bg-neon-pink text-black font-medium hover:bg-neon-pink/90 transition-colors"
                  >
                    Apply Filters
                  </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default MobileFilterBar; 
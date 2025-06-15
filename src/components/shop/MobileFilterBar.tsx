import React, { useState } from 'react';
import { Filter, ChevronDown, Package, Ruler, Palette, DollarSign, ArrowUpDown } from 'lucide-react';
import { FilterState } from '@/pages/Shop';
import { useAvailableColorsFromVariants } from '@/hooks/useAvailableColorsFromVariants';

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

const FilterCheckbox = ({ label, checked, onChange, count }: { label: string; checked: boolean; onChange: () => void; count?: number }) => (
  <label className="flex items-center gap-2 px-2 py-1 rounded-md cursor-pointer text-white text-sm hover:bg-neon-pink/10 transition">
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="accent-neon-pink w-4 h-4 rounded border-gray-700 focus:ring-2 focus:ring-neon-pink"
    />
    <span className="flex-1">{label}</span>
    {count !== undefined && (
      <span className="text-gray-400 text-xs">({count})</span>
    )}
  </label>
);

const FilterRadio = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) => (
  <label className="flex items-center gap-2 px-2 py-1 rounded-md cursor-pointer text-white text-sm hover:bg-neon-pink/10 transition">
    <input
      type="radio"
      checked={checked}
      onChange={onChange}
      className="accent-neon-pink w-4 h-4 rounded-full border-gray-700 focus:ring-2 focus:ring-neon-pink"
    />
    <span>{label}</span>
  </label>
);

const MobileFilterBar: React.FC<MobileFilterBarProps> = ({ filters, setFilters }) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);

  const handleAccordion = (section: string) => {
    setOpenSection(prev => (prev === section ? null : section));
  };

  const clearAllFilters = () => {
    setFilters({
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

  const { colors: availableColors, loading: colorsLoading } = useAvailableColorsFromVariants();

  const handleColorChange = (color: string, add: boolean) => {
    setFilters(prev => ({
      ...prev,
      colors: add ? [...prev.colors, color] : prev.colors.filter(c => c !== color)
    }));
  };

  return (
    <div className="w-full max-w-sm mx-auto px-2">
      {/* Filter Button */}
      <button
        onClick={() => setIsFilterOpen(!isFilterOpen)}
        className="sticky top-4 z-10 w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-gray-900/90 border border-gray-800 text-white font-semibold text-base mb-4 focus:outline-none shadow-md hover:bg-gray-800/90 transition"
        style={{ boxShadow: '0 2px 8px 0 rgba(0,0,0,0.12)' }}
      >
        <span className="flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Filters
          {getActiveFilterCount() > 0 && (
            <span className="ml-2 bg-neon-pink text-black text-xs px-2 py-0.5 rounded-full font-bold">
              {getActiveFilterCount()}
            </span>
          )}
        </span>
        <ChevronDown className={`w-5 h-5 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
      </button>
      {/* Filter Card (inline, not popup) */}
      {isFilterOpen && (
        <div
          className="w-full rounded-2xl bg-white/10 backdrop-blur-md border-2 border-neon-pink/40 shadow-xl p-4 flex flex-col justify-between h-[440px] gap-3"
          style={{ minHeight: 340, maxHeight: 440, boxShadow: '0 8px 32px 0 rgba(255,0,204,0.10), 0 1.5px 8px 0 rgba(51,51,153,0.10)' }}
        >
          {/* Active Filters Row */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex flex-wrap gap-2">
              {Object.entries(filters).map(([key, value]) => {
                if (Array.isArray(value) && value.length > 0) {
                  return (
                    <span
                      key={key}
                      className="px-2 py-0.5 bg-neon-pink/20 text-neon-pink text-xs rounded-full font-medium"
                    >
                      {key}: {value.length}
                    </span>
                  );
                }
                return null;
              })}
            </div>
            <button
              onClick={clearAllFilters}
              className="text-xs text-gray-400 hover:text-neon-pink font-medium"
            >
              Clear All
            </button>
          </div>

          {/* Accordion Sections (inline, no popups) */}
          <div className="flex flex-col gap-3 w-full flex-1 min-h-0 overflow-y-auto">
            {/* Sort By */}
            <div className="w-full">
              <button
                onClick={() => handleAccordion('sort')}
                className={`w-full flex items-center justify-between px-4 h-12 rounded-full bg-white/20 border border-white/10 shadow text-white font-semibold text-base focus:outline-none transition-all duration-200 hover:bg-white/30 ${openSection === 'sort' ? 'ring-2 ring-neon-pink' : ''}`}
                style={{ minHeight: 48 }}
              >
                <span className="flex items-center gap-2"><ArrowUpDown className="w-5 h-5 text-gray-200" />Sort By</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${openSection === 'sort' ? 'rotate-180' : ''}`} />
              </button>
              {openSection === 'sort' && (
                <div className="w-full mt-2 rounded-xl bg-white/10 p-3">
                  <div className="space-y-1">
                    {sortOptions.map(option => (
                      <FilterRadio
                        key={option.value}
                        label={option.label}
                        checked={filters.sortBy === option.value}
                        onChange={() => setFilters(prev => ({ ...prev, sortBy: option.value }))}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
            {/* Categories */}
            <div className="w-full">
              <button
                onClick={() => handleAccordion('categories')}
                className={`w-full flex items-center justify-between px-4 h-12 rounded-full bg-white/20 border border-white/10 shadow text-white font-semibold text-base focus:outline-none transition-all duration-200 hover:bg-white/30 ${openSection === 'categories' ? 'ring-2 ring-neon-pink' : ''}`}
                style={{ minHeight: 48 }}
              >
                <span className="flex items-center gap-2"><Package className="w-5 h-5 text-gray-200" />Categories</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${openSection === 'categories' ? 'rotate-180' : ''}`} />
              </button>
              {openSection === 'categories' && (
                <div className="w-full mt-2 rounded-xl bg-white/10 p-3">
                  <div className="grid grid-cols-2 gap-1">
                    {categories.map(category => (
                      <FilterCheckbox
                        key={category.id}
                        label={category.label}
                        checked={filters.categories.includes(category.id)}
                        onChange={() => setFilters(prev => ({
                          ...prev,
                          categories: prev.categories.includes(category.id)
                            ? prev.categories.filter(id => id !== category.id)
                            : [...prev.categories, category.id]
                        }))}
                        count={category.count}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
            {/* Sizes */}
            <div className="w-full">
              <button
                onClick={() => handleAccordion('sizes')}
                className={`w-full flex items-center justify-between px-4 h-12 rounded-full bg-white/20 border border-white/10 shadow text-white font-semibold text-base focus:outline-none transition-all duration-200 hover:bg-white/30 ${openSection === 'sizes' ? 'ring-2 ring-neon-pink' : ''}`}
                style={{ minHeight: 48 }}
              >
                <span className="flex items-center gap-2"><Ruler className="w-5 h-5 text-gray-200" />Size</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${openSection === 'sizes' ? 'rotate-180' : ''}`} />
              </button>
              {openSection === 'sizes' && (
                <div className="w-full mt-2 rounded-xl bg-white/10 p-3">
                  <div className="flex flex-wrap gap-2">
                    {sizes.map(size => (
                      <button
                        key={size.value}
                        onClick={() => setFilters(prev => ({
                          ...prev,
                          sizes: prev.sizes.includes(size.value)
                            ? prev.sizes.filter(s => s !== size.value)
                            : [...prev.sizes, size.value]
                        }))}
                        className={`px-3 py-1 rounded-md text-xs font-bold border transition-all ${
                          filters.sizes.includes(size.value)
                            ? 'bg-neon-pink text-black border-neon-pink'
                            : 'bg-[#181824] text-white border-gray-700 hover:bg-neon-pink/10'
                        }`}
                      >
                        {size.value}
                        <span className="ml-1 text-gray-400 font-normal">({size.count})</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {/* Colors */}
            <div className="w-full">
              <button
                onClick={() => handleAccordion('colors')}
                className={`w-full flex items-center justify-between px-4 h-12 rounded-full bg-white/20 border border-white/10 shadow text-white font-semibold text-base focus:outline-none transition-all duration-200 hover:bg-white/30 ${openSection === 'colors' ? 'ring-2 ring-neon-pink' : ''}`}
                style={{ minHeight: 48 }}
              >
                <span className="flex items-center gap-2"><Palette className="w-5 h-5 text-gray-200" />Colours</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${openSection === 'colors' ? 'rotate-180' : ''}`} />
              </button>
              {openSection === 'colors' && (
                <div className="w-full mt-2 rounded-xl bg-white/10 p-3">
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
              )}
            </div>
            {/* Price */}
            <div className="w-full">
              <button
                onClick={() => handleAccordion('price')}
                className={`w-full flex items-center justify-between px-4 h-12 rounded-full bg-white/20 border border-white/10 shadow text-white font-semibold text-base focus:outline-none transition-all duration-200 hover:bg-white/30 ${openSection === 'price' ? 'ring-2 ring-neon-pink' : ''}`}
                style={{ minHeight: 48 }}
              >
                <span className="flex items-center gap-2"><DollarSign className="w-5 h-5 text-gray-200" />Price</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${openSection === 'price' ? 'rotate-180' : ''}`} />
              </button>
              {openSection === 'price' && (
                <div className="w-full mt-2 rounded-xl bg-white/10 p-3">
                  <div className="space-y-1">
                    {priceRanges.map(range => (
                      <FilterRadio
                        key={range.label}
                        label={range.label}
                        checked={filters.priceRange[0] === range.value[0] && filters.priceRange[1] === range.value[1]}
                        onChange={() => setFilters(prev => ({
                          ...prev,
                          priceRange: range.value as [number, number]
                        }))}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <input
                      type="number"
                      value={filters.priceRange[0]}
                      onChange={e => {
                        const value = Math.max(0, Math.min(filters.priceRange[1], Number(e.target.value)));
                        setFilters(prev => ({
                          ...prev,
                          priceRange: [value, prev.priceRange[1]]
                        }));
                      }}
                      className="w-1/2 px-2 py-1 rounded-md bg-[#181824] border border-gray-700 text-white text-xs focus:border-neon-pink outline-none"
                      placeholder="Min"
                    />
                    <input
                      type="number"
                      value={filters.priceRange[1]}
                      onChange={e => {
                        const value = Math.max(filters.priceRange[0], Math.min(10000, Number(e.target.value)));
                        setFilters(prev => ({
                          ...prev,
                          priceRange: [prev.priceRange[0], value]
                        }));
                      }}
                      className="w-1/2 px-2 py-1 rounded-md bg-[#181824] border border-gray-700 text-white text-xs focus:border-neon-pink outline-none"
                      placeholder="Max"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* Apply Button */}
          <div className="w-full flex-shrink-0">
            <button
              className="w-full py-3 rounded-xl bg-gray-900/90 text-white font-medium font-sans text-base hover:bg-gray-800/90 transition shadow"
              onClick={() => setIsFilterOpen(false)}
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileFilterBar; 
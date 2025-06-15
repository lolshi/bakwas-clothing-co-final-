import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, ChevronDown } from 'lucide-react';

// Mock data for testing
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

const colors = [
  { name: 'Black', value: '#000000', count: 45 },
  { name: 'White', value: '#FFFFFF', count: 38 },
  { name: 'Red', value: '#FF0000', count: 22 },
  { name: 'Blue', value: '#0000FF', count: 30 },
  { name: 'Green', value: '#00FF00', count: 15 },
  { name: 'Yellow', value: '#FFFF00', count: 12 },
  { name: 'Purple', value: '#800080', count: 18 },
  { name: 'Pink', value: '#FFC0CB', count: 20 },
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

// Shared toggle style for all accordion headers
const TOGGLE_CLASSES =
  'w-full flex items-center justify-between px-4 h-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 shadow-sm text-white font-semibold text-base focus:outline-none transition-all duration-200 hover:bg-white/20';

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

const ColorSwatch = ({ color, checked, onChange }: { color: typeof colors[0]; checked: boolean; onChange: () => void }) => (
  <button
    onClick={onChange}
    className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all shadow ${
      checked ? 'border-neon-pink scale-110 ring-2 ring-neon-pink' : 'border-gray-700'
    }`}
    style={{ backgroundColor: color.value }}
    title={color.name}
  />
);

const FILTER_BAR_HEIGHT = 360; // px, based on the Price option
const ACCORDION_CONTENT_HEIGHT = 200; // px, fixed height for all accordion sections

const FilterTest = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useState<{
    categories: string[];
    sizes: string[];
    colors: string[];
    priceRange: [number, number];
    sortBy: string;
  }>({
    categories: [],
    sizes: [],
    colors: [],
    priceRange: [0, 10000],
    sortBy: 'newest'
  });

  const handleAccordion = (section: string) => {
    setOpenSection(prev => (prev === section ? null : section));
  };

  const clearAllFilters = () => {
    setActiveFilters({
      categories: [],
      sizes: [],
      colors: [],
      priceRange: [0, 10000],
      sortBy: 'newest'
    });
  };

  const getActiveFilterCount = () => {
    return Object.values(activeFilters).reduce((acc, f) => 
      acc + (Array.isArray(f) ? f.length : f !== 'newest' ? 1 : 0), 0
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#181824] to-[#23233b] py-8 flex flex-col items-center">
      <div className="w-full max-w-sm mx-auto px-2">
        {/* Filter Button */}
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="sticky top-4 z-10 w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-gradient-to-r from-[#ff00cc] to-[#333399] shadow-lg text-white font-semibold text-base mb-4 border-2 border-neon-pink/60 focus:outline-none"
          style={{ boxShadow: '0 4px 24px 0 rgba(255,0,204,0.10), 0 1.5px 8px 0 rgba(51,51,153,0.10)' }}
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
            className="w-full rounded-2xl bg-white/10 backdrop-blur-md border-2 border-neon-pink/40 shadow-xl p-4 flex flex-col gap-3"
            style={{ minHeight: 340, maxHeight: 400, overflowY: 'auto', boxShadow: '0 8px 32px 0 rgba(255,0,204,0.10), 0 1.5px 8px 0 rgba(51,51,153,0.10)' }}
          >
            {/* Active Filters Row */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex flex-wrap gap-2">
                {Object.entries(activeFilters).map(([key, value]) => {
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
            <div className="flex flex-col gap-3 w-full flex-1 min-h-0">
              {/* Sort By */}
              <div className="w-full">
                <button
                  onClick={() => handleAccordion('sort')}
                  className={`w-full flex items-center justify-between px-4 h-12 rounded-full bg-white/20 border border-white/10 shadow text-white font-semibold text-base focus:outline-none transition-all duration-200 hover:bg-white/30 ${openSection === 'sort' ? 'ring-2 ring-neon-pink' : ''}`}
                  style={{ minHeight: 48 }}
                >
                  <span className="flex items-center gap-2">↕️ Sort By</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${openSection === 'sort' ? 'rotate-180' : ''}`} />
                </button>
                {openSection === 'sort' && (
                  <div className="w-full mt-2 rounded-xl bg-white/10 p-3">
                    <div className="space-y-1">
                      {sortOptions.map(option => (
                        <FilterRadio
                          key={option.value}
                          label={option.label}
                          checked={activeFilters.sortBy === option.value}
                          onChange={() => setActiveFilters(prev => ({ ...prev, sortBy: option.value }))}
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
                  <span className="flex items-center gap-2">📦 Categories</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${openSection === 'categories' ? 'rotate-180' : ''}`} />
                </button>
                {openSection === 'categories' && (
                  <div className="w-full mt-2 rounded-xl bg-white/10 p-3">
                    <div className="grid grid-cols-2 gap-1">
                      {categories.map(category => (
                        <FilterCheckbox
                          key={category.id}
                          label={category.label}
                          checked={activeFilters.categories.includes(category.id)}
                          onChange={() => setActiveFilters(prev => ({
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
                  <span className="flex items-center gap-2">👕 Size</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${openSection === 'sizes' ? 'rotate-180' : ''}`} />
                </button>
                {openSection === 'sizes' && (
                  <div className="w-full mt-2 rounded-xl bg-white/10 p-3">
                    <div className="flex flex-wrap gap-2">
                      {sizes.map(size => (
                        <button
                          key={size.value}
                          onClick={() => setActiveFilters(prev => ({
                            ...prev,
                            sizes: prev.sizes.includes(size.value)
                              ? prev.sizes.filter(s => s !== size.value)
                              : [...prev.sizes, size.value]
                          }))}
                          className={`px-3 py-1 rounded-md text-xs font-bold border transition-all ${
                            activeFilters.sizes.includes(size.value)
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
              {/* Colours */}
              <div className="w-full">
                <button
                  onClick={() => handleAccordion('colors')}
                  className={`w-full flex items-center justify-between px-4 h-12 rounded-full bg-white/20 border border-white/10 shadow text-white font-semibold text-base focus:outline-none transition-all duration-200 hover:bg-white/30 ${openSection === 'colors' ? 'ring-2 ring-neon-pink' : ''}`}
                  style={{ minHeight: 48 }}
                >
                  <span className="flex items-center gap-2">🎨 Colours</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${openSection === 'colors' ? 'rotate-180' : ''}`} />
                </button>
                {openSection === 'colors' && (
                  <div className="w-full mt-2 rounded-xl bg-white/10 p-3">
                    <div className="flex flex-wrap gap-2">
                      {colors.map(color => (
                        <div key={color.value} className="flex flex-col items-center gap-1">
                          <ColorSwatch
                            color={color}
                            checked={activeFilters.colors.includes(color.value)}
                            onChange={() => setActiveFilters(prev => ({
                              ...prev,
                              colors: prev.colors.includes(color.value)
                                ? prev.colors.filter(c => c !== color.value)
                                : [...prev.colors, color.value]
                            }))}
                          />
                          <span className="text-[10px] text-gray-400">{color.name}</span>
                        </div>
                      ))}
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
                  <span className="flex items-center gap-2">💰 Price</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${openSection === 'price' ? 'rotate-180' : ''}`} />
                </button>
                {openSection === 'price' && (
                  <div className="w-full mt-2 rounded-xl bg-white/10 p-3">
                    <div className="space-y-1">
                      {priceRanges.map(range => (
                        <FilterRadio
                          key={range.label}
                          label={range.label}
                          checked={activeFilters.priceRange[0] === range.value[0] && activeFilters.priceRange[1] === range.value[1]}
                          onChange={() => setActiveFilters(prev => ({
                            ...prev,
                            priceRange: range.value as [number, number]
                          }))}
                        />
                      ))}
                    </div>
                    <div className="flex gap-2 mt-2">
                      <input
                        type="number"
                        value={activeFilters.priceRange[0]}
                        onChange={e => {
                          const value = Math.max(0, Math.min(activeFilters.priceRange[1], Number(e.target.value)));
                          setActiveFilters(prev => ({
                            ...prev,
                            priceRange: [value, prev.priceRange[1]]
                          }));
                        }}
                        className="w-1/2 px-2 py-1 rounded-md bg-[#181824] border border-gray-700 text-white text-xs focus:border-neon-pink outline-none"
                        placeholder="Min"
                      />
                      <input
                        type="number"
                        value={activeFilters.priceRange[1]}
                        onChange={e => {
                          const value = Math.max(activeFilters.priceRange[0], Math.min(10000, Number(e.target.value)));
                          setActiveFilters(prev => ({
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
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterTest; 
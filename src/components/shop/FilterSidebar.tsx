
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { FilterState } from '@/pages/Shop';

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

const colors = [
  { id: 'black', name: 'Black', value: '#000000' },
  { id: 'white', name: 'White', value: '#ffffff' },
  { id: 'neon-cyan', name: 'Neon Cyan', value: '#00E1FF' },
  { id: 'neon-purple', name: 'Neon Purple', value: '#8B5CF6' },
  { id: 'neon-pink', name: 'Neon Pink', value: '#EC4899' },
  { id: 'neon-orange', name: 'Neon Orange', value: '#F97316' }
];

const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-low', label: 'Price: Low → High' },
  { value: 'price-high', label: 'Price: High → Low' },
  { value: 'best-selling', label: 'Best Selling' }
];

export const FilterSidebar: React.FC<FilterSidebarProps> = ({ filters, onFiltersChange }) => {
  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    const newCategories = checked
      ? [...filters.categories, categoryId]
      : filters.categories.filter(c => c !== categoryId);
    
    onFiltersChange({ ...filters, categories: newCategories });
  };

  const handleSizeChange = (size: string, checked: boolean) => {
    const newSizes = checked
      ? [...filters.sizes, size]
      : filters.sizes.filter(s => s !== size);
    
    onFiltersChange({ ...filters, sizes: newSizes });
  };

  const handleColorChange = (colorId: string, checked: boolean) => {
    const newColors = checked
      ? [...filters.colors, colorId]
      : filters.colors.filter(c => c !== colorId);
    
    onFiltersChange({ ...filters, colors: newColors });
  };

  const handlePriceChange = (value: number[]) => {
    onFiltersChange({ ...filters, priceRange: [value[0], value[1]] });
  };

  const handleSortChange = (value: string) => {
    onFiltersChange({ ...filters, sortBy: value });
  };

  return (
    <div className="space-y-6">
      {/* Sort */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="font-anton text-lg">Sort By</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={filters.sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Categories */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="font-anton text-lg">Categories</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {categories.map(category => (
            <div key={category.id} className="flex items-center space-x-2">
              <Checkbox
                id={category.id}
                checked={filters.categories.includes(category.id)}
                onCheckedChange={(checked) => handleCategoryChange(category.id, checked as boolean)}
              />
              <label htmlFor={category.id} className="text-sm font-space cursor-pointer">
                {category.label}
              </label>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Sizes */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="font-anton text-lg">Size</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {sizes.map(size => (
            <div key={size} className="flex items-center space-x-2">
              <Checkbox
                id={size}
                checked={filters.sizes.includes(size)}
                onCheckedChange={(checked) => handleSizeChange(size, checked as boolean)}
              />
              <label htmlFor={size} className="text-sm font-space cursor-pointer">
                {size}
              </label>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Price Range */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="font-anton text-lg">Price Range</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Slider
            value={filters.priceRange}
            onValueChange={handlePriceChange}
            max={1499}
            min={299}
            step={50}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>₹{filters.priceRange[0]}</span>
            <span>₹{filters.priceRange[1]}</span>
          </div>
        </CardContent>
      </Card>

      {/* Colors */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="font-anton text-lg">Colors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {colors.map(color => (
              <div key={color.id} className="flex flex-col items-center space-y-1">
                <div 
                  className={`w-8 h-8 rounded-full border-2 cursor-pointer transition-all hover:scale-110 ${
                    filters.colors.includes(color.id) 
                      ? 'border-primary shadow-lg' 
                      : 'border-border'
                  }`}
                  style={{ backgroundColor: color.value }}
                  onClick={() => handleColorChange(color.id, !filters.colors.includes(color.id))}
                  title={color.name}
                />
                <span className="text-xs text-muted-foreground">{color.name.split(' ')[1] || color.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

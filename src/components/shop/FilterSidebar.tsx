
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

const colours = [
  'Black', 'White', 'Navy Blue', 'Grey', 'Red', 'Royal Blue', 'Maroon', 
  'Olive Green', 'Mustard Yellow', 'Bottle Green', 'Sky Blue', 'Pink', 
  'Beige', 'Brown', 'Orange', 'Lavender', 'Turquoise', 'Peach', 'Charcoal', 'Mint Green'
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

      {/* Colours */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="font-anton text-lg">Colours</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 max-h-64 overflow-y-auto">
          {colours.map(colour => (
            <div key={colour} className="flex items-center space-x-2">
              <Checkbox
                id={colour}
                checked={filters.colors.includes(colour)}
                onCheckedChange={(checked) => handleColorChange(colour, checked as boolean)}
              />
              <label htmlFor={colour} className="text-sm font-space cursor-pointer">
                {colour}
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
    </div>
  );
};

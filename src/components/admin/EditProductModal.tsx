import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import AISuggestions from '@/components/admin/AISuggestions';
import {
  Upload,
  X,
  Loader2,
  Package,
  DollarSign,
  AlertCircle,
  Trash2
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock_quantity: number | null;
  is_featured: boolean | null;
  is_active: boolean | null;
  category_ids: string[] | null;
  created_at: string | null;
  images?: string[] | null;
  tags?: string[] | null;
  color?: string | null;
}

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (product: Product) => void;
  product: Product | null;
}

interface FormData {
  name: string;
  description: string;
  price: string;
  category: string;
  stock_quantity: string;
  color: string;
  is_featured: boolean;
  is_active: boolean;
}

interface FormErrors {
  [key: string]: string;
}

const CATEGORIES = [
  { value: 'tshirts', label: 'T-Shirts' },
  { value: 'hoodies', label: 'Hoodies' },
  { value: 'accessories', label: 'Accessories' },
  { value: 'shoes', label: 'Shoes' },
  { value: 'pants', label: 'Pants' },
  { value: 'jackets', label: 'Jackets' },
  { value: 'caps', label: 'Caps' },
  { value: 'bags', label: 'Bags' }
];

const COLORS = [
  // Reds
  { value: '#FF0000', label: 'Red', family: 'red' },
  { value: '#800000', label: 'Maroon', family: 'red' },
  
  // Blues
  { value: '#000080', label: 'Navy Blue', family: 'blue' },
  { value: '#4169E1', label: 'Royal Blue', family: 'blue' },
  { value: '#87CEEB', label: 'Sky Blue', family: 'blue' },
  
  // Greens
  { value: '#556B2F', label: 'Olive Green', family: 'green' },
  { value: '#006A4E', label: 'Bottle Green', family: 'green' },
  { value: '#98FF98', label: 'Mint Green', family: 'green' },
  
  // Yellows & Oranges
  { value: '#FFDB58', label: 'Mustard Yellow', family: 'yellow' },
  { value: '#FFA500', label: 'Orange', family: 'orange' },
  
  // Pinks & Purples
  { value: '#FFC0CB', label: 'Pink', family: 'pink' },
  { value: '#E6E6FA', label: 'Lavender', family: 'purple' },
  
  // Browns & Beiges
  { value: '#A52A2A', label: 'Brown', family: 'brown' },
  { value: '#F5F5DC', label: 'Beige', family: 'beige' },
  { value: '#FFDAB9', label: 'Peach', family: 'peach' },
  
  // Grays & Neutrals
  { value: '#000000', label: 'Black', family: 'gray' },
  { value: '#FFFFFF', label: 'White', family: 'gray' },
  { value: '#808080', label: 'Grey', family: 'gray' },
  { value: '#36454F', label: 'Charcoal', family: 'gray' },
  
  // Special Colors
  { value: '#40E0D0', label: 'Turquoise', family: 'special' }
];

const EditProductModal: React.FC<EditProductModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  product 
}) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    price: '',
    category: '',
    stock_quantity: '0',
    color: '',
    is_featured: false,
    is_active: true
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Populate form when product changes
  useEffect(() => {
    if (product && isOpen) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price.toString(),
        category: product.tags?.[0] || '',
        stock_quantity: product.stock_quantity?.toString() || '0',
        color: product.color || '',
        is_featured: product.is_featured || false,
        is_active: product.is_active ?? true
      });
      setExistingImages(product.images || []);
      setImages([]);
      setImagePreviews([]);
      setErrors({});
    }
  }, [product, isOpen]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: '',
        description: '',
        price: '',
        category: '',
        stock_quantity: '0',
        color: '',
        is_featured: false,
        is_active: true
      });
      setErrors({});
      setImages([]);
      setImagePreviews([]);
      setExistingImages([]);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Product name must be at least 3 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    if (!formData.price.trim()) {
      newErrors.price = 'Price is required';
    } else {
      const price = parseFloat(formData.price);
      if (isNaN(price) || price <= 0) {
        newErrors.price = 'Price must be a valid positive number';
      }
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    const stockQuantity = parseInt(formData.stock_quantity);
    if (isNaN(stockQuantity) || stockQuantity < 0) {
      newErrors.stock_quantity = 'Stock quantity must be a valid non-negative number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageUpload = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validFiles: File[] = [];

    fileArray.forEach((file) => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not a valid image file`);
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Maximum size is 5MB`);
        return;
      }

      validFiles.push(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (result) {
          setImagePreviews(prev => [...prev, result as string]);
        }
      };
      reader.readAsDataURL(file);
    });

    if (validFiles.length > 0) {
      setImages(prev => [...prev, ...validFiles]);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleImageUpload(e.dataTransfer.files);
    }
  }, [handleImageUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  const removeNewImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleAISuggestions = useCallback((suggestions: any) => {
    if (suggestions.name) {
      setFormData(prev => ({ ...prev, name: suggestions.name }));
    }
    if (suggestions.description) {
      setFormData(prev => ({ ...prev, description: suggestions.description }));
    }
    if (suggestions.category) {
      setFormData(prev => ({ ...prev, category: suggestions.category }));
    }
    if (suggestions.color) {
      setFormData(prev => ({ ...prev, color: suggestions.color }));
    }
    if (suggestions.price) {
      setFormData(prev => ({ ...prev, price: suggestions.price }));
    }
  }, []);

  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !product) {
      toast.error('Please fix the form errors before submitting');
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Updating product:', product.id);
      console.log('Form Data:', formData);
      console.log('New Image Files:', images);
      console.log('Existing Images:', existingImages);

      // Upload new images to Supabase storage if any
      const newImageUrls: string[] = [];
      
      if (images.length > 0) {
        console.log('Starting new image uploads...');
        
        for (let i = 0; i < images.length; i++) {
          const file = images[i];
          const fileExt = file.name.split('.').pop();
          const fileName = `${generateSlug(formData.name.trim())}-${Date.now()}-${i + 1}.${fileExt}`;
          const filePath = `products/${fileName}`;

          console.log(`Uploading new image ${i + 1}/${images.length}: ${fileName}`);

          // Upload to Supabase Storage
          const { error: uploadError } = await supabase.storage
            .from('products')
            .upload(filePath, file);

          if (uploadError) {
            console.error(`Upload error for ${fileName}:`, uploadError);
            throw new Error(`Failed to upload image ${i + 1}: ${uploadError.message}`);
          }

          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('products')
            .getPublicUrl(filePath);

          console.log(`New image ${i + 1} uploaded successfully: ${publicUrl}`);
          newImageUrls.push(publicUrl);
        }
      }

      // Combine existing and new images
      const allImages = [...existingImages, ...newImageUrls];

      // Update the product object for database
      const productData = {
        name: formData.name.trim(),
        slug: generateSlug(formData.name.trim()),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        stock_quantity: parseInt(formData.stock_quantity),
        category_ids: null,
        is_featured: formData.is_featured,
        is_active: formData.is_active,
        color: formData.color || null,
        images: allImages.length > 0 ? allImages : null,
        tags: [formData.category]
      };

      console.log('Product Data for Database:', productData);

      // Update product in database
      const { data: updatedProduct, error: productError } = await supabase
        .from('products')
        .update(productData)
        .eq('id', product.id)
        .select('*')
        .single();

      if (productError) {
        console.error('Product update error:', productError);
        throw new Error(productError.message);
      }

      console.log('Product updated successfully:', updatedProduct);

      toast.success(`Product "${updatedProduct.name}" updated successfully!`);
      onSuccess(updatedProduct);
      onClose();

    } catch (error) {
      console.error('Submit error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      // Provide helpful error messages for common issues
      if (errorMessage.includes('bucket') || errorMessage.includes('not found')) {
        toast.error('Storage bucket not found. Please create a "products" bucket in Supabase Dashboard → Storage.');
      } else if (errorMessage.includes('permission') || errorMessage.includes('unauthorized')) {
        toast.error('No permission to upload images. Check storage policies in Supabase Dashboard.');
      } else if (errorMessage.includes('quota') || errorMessage.includes('limit')) {
        toast.error('Storage quota exceeded. Please upgrade your Supabase plan or free up space.');
      } else {
        toast.error(`Failed to update product: ${errorMessage}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !product) return null;

  const totalImages = existingImages.length + imagePreviews.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-4xl max-h-[90vh] overflow-y-auto mx-4 w-full text-gray-900">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <Package className="h-6 w-6 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Edit Product</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 text-gray-900">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Basic Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-gray-900">Basic Information</h3>
              
              {/* Product Name */}
              <div>
                <Label htmlFor="name" className="text-gray-700">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter product name"
                  className={`mt-1 text-gray-900 placeholder-gray-500 ${errors.name ? 'border-red-500' : ''}`}
                />
                {errors.name && (
                  <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description" className="text-gray-700">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your product in detail"
                  rows={4}
                  className={`mt-1 text-gray-900 placeholder-gray-500 ${errors.description ? 'border-red-500' : ''}`}
                />
                {errors.description && (
                  <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.description}
                  </p>
                )}
              </div>

              {/* Price and Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price" className="text-gray-700">Price (₹) *</Label>
                  <div className="relative mt-1">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      placeholder="0.00"
                      className={`pl-10 text-gray-900 placeholder-gray-500 ${errors.price ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.price && (
                    <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.price}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="stock" className="text-gray-700">Stock Quantity</Label>
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    value={formData.stock_quantity}
                    onChange={(e) => handleInputChange('stock_quantity', e.target.value)}
                    placeholder="0"
                    className={`mt-1 text-gray-900 placeholder-gray-500 ${errors.stock_quantity ? 'border-red-500' : ''}`}
                  />
                  {errors.stock_quantity && (
                    <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.stock_quantity}
                    </p>
                  )}
                </div>
              </div>

              {/* Category */}
              <div>
                <Label htmlFor="category" className="text-gray-700">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger className={`mt-1 text-gray-900 ${errors.category ? 'border-red-500' : ''}`}>
                    <SelectValue placeholder="Select a category" className="text-gray-900" />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-gray-900">
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category.value} value={category.value} className="text-gray-900">
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.category}
                  </p>
                )}
              </div>

              {/* Color */}
              <div>
                <Label htmlFor="color" className="text-gray-700">Color</Label>
                <div className="mt-2 space-y-3">
                  {/* Selected Color Display */}
                  {formData.color && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                      <div 
                        className="w-8 h-8 rounded-full border-2 border-gray-300 shadow-sm"
                        style={{ backgroundColor: formData.color }}
                      />
                      <div>
                        <p className="font-medium text-gray-900">
                          {COLORS.find(c => c.value === formData.color)?.label || 'Selected Color'}
                        </p>
                        <p className="text-sm text-gray-600">{formData.color}</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleInputChange('color', '')}
                        className="ml-auto text-gray-500 hover:text-gray-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  
                  {/* Color Palette Grid */}
                  <div className="space-y-4 max-h-64 overflow-y-auto border rounded-lg p-4 bg-white">
                    {/* Manual Color Code Input */}
                    <div className="space-y-2 pb-4 border-b border-gray-200">
                      <h4 className="text-sm font-medium text-gray-700">Enter Custom Color Code</h4>
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <Input
                            placeholder="#FF5733 or FF5733"
                            value={formData.color.startsWith('#') ? formData.color : ''}
                            onChange={(e) => {
                              let value = e.target.value.trim();
                              if (value && !value.startsWith('#')) {
                                value = '#' + value;
                              }
                              // Validate hex color format
                              if (value === '' || /^#[0-9A-Fa-f]{0,6}$/.test(value)) {
                                handleInputChange('color', value);
                              }
                            }}
                            className="text-sm font-mono"
                            maxLength={7}
                          />
                        </div>
                        {formData.color && formData.color.startsWith('#') && formData.color.length === 7 && (
                          <div 
                            className="w-10 h-10 rounded-lg border-2 border-gray-300 shadow-sm"
                            style={{ backgroundColor: formData.color }}
                            title={formData.color}
                          />
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        Enter a hex color code (e.g., #FF5733 for orange-red)
                      </p>
                    </div>

                    {/* Color Families */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-gray-700">Or Choose from Palette</h4>
                      {['red', 'orange', 'green', 'blue', 'purple', 'brown', 'gray', 'neon'].map(family => (
                        <div key={family} className="space-y-2">
                          <h5 className="text-xs font-medium text-gray-600 capitalize">{family} Shades</h5>
                          <div className="grid grid-cols-8 gap-2">
                            {COLORS
                              .filter(color => color.family === family)
                              .map((color) => (
                                <button
                                  key={color.value}
                                  type="button"
                                  onClick={() => handleInputChange('color', color.value)}
                                  className={`w-8 h-8 rounded-lg border-2 hover:scale-110 transition-transform shadow-sm ${
                                    formData.color === color.value 
                                      ? 'border-blue-500 shadow-md' 
                                      : 'border-gray-300'
                                  }`}
                                  style={{ backgroundColor: color.value }}
                                  title={`${color.label} - ${color.value}`}
                                />
                              ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Clear Selection */}
                  {formData.color && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleInputChange('color', '')}
                      className="w-full text-gray-600"
                    >
                      Clear Color Selection
                    </Button>
                  )}
                </div>
                {errors.color && (
                  <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.color}
                  </p>
                )}
              </div>

              {/* Status Options */}
              <div className="space-y-3">
                <Label className="text-gray-700">Product Status</Label>
                <div className="flex flex-wrap gap-3">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => handleInputChange('is_active', e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700">Active Product</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_featured}
                      onChange={(e) => handleInputChange('is_featured', e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700">Featured Product</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column - Images */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-gray-900">Product Images</h3>

              {/* Existing Images */}
              {existingImages.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-gray-700">Current Images ({existingImages.length})</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {existingImages.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image}
                          alt={`Current ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                        <span className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                          Current {index + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Image Upload Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors relative ${
                  dragActive
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <div className="space-y-2">
                  <p className="text-lg font-medium text-gray-700">
                    {dragActive ? 'Drop new images here' : 'Add more images'}
                  </p>
                  <p className="text-sm text-gray-500">or click to browse files</p>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  PNG, JPG, GIF up to 5MB each
                </p>
              </div>

              {/* New Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-gray-700">New Images ({imagePreviews.length})</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`New ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border border-green-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeNewImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                        <span className="absolute bottom-1 left-1 bg-green-600 bg-opacity-80 text-white text-xs px-1 rounded">
                          New {index + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {totalImages > 0 && (
                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                  Total images after save: {totalImages} 
                  {existingImages.length > 0 && imagePreviews.length > 0 && 
                    ` (${existingImages.length} existing + ${imagePreviews.length} new)`
                  }
                </div>
              )}

              {/* AI Suggestions */}
              <AISuggestions 
                images={images}
                onApplySuggestions={handleAISuggestions}
                currentFormData={formData}
                isAnalyzing={isSubmitting}
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3 pt-6 mt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating Product...
                </>
              ) : (
                <>
                  <Package className="mr-2 h-4 w-4" />
                  Update Product
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductModal; 
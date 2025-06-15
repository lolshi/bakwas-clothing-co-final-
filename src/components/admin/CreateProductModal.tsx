import React, { useState, useCallback } from 'react';
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
  AlertCircle
} from 'lucide-react';

interface CreateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (product: any) => void;
}

interface Variant {
  color: string;
  size: string; // e.g. 'S', 'M', 'L', 'XL', 'All'
  stock: number;
  images: (File | string)[];
  imagePreviews: (string)[];
  imageLink?: string;
}

interface FormData {
  name: string;
  description: string;
  price: string;
  category: string;
  is_featured: boolean;
  is_active: boolean;
  variants: Variant[];
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

// 1. Define standard sizes
const STANDARD_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

const CreateProductModal: React.FC<CreateProductModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess 
}) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    price: '',
    category: '',
    is_featured: false,
    is_active: true,
    variants: [
      { color: '', size: '', stock: 0, images: [], imagePreviews: [], imageLink: '' }
    ]
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [colorImages, setColorImages] = useState<{ [color: string]: File[] }>({});
  const [colorImagePreviews, setColorImagePreviews] = useState<{ [color: string]: string[] }>({});

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: '',
        description: '',
        price: '',
        category: '',
        is_featured: false,
        is_active: true,
        variants: [
          { color: '', size: '', stock: 0, images: [], imagePreviews: [], imageLink: '' }
        ]
      });
      setErrors({});
      setIsSubmitting(false);
      setColorImages({});
      setColorImagePreviews({});
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

  const updateVariant = (idx: number, field: keyof Variant, value: string | number | (File | string)[] | string[]) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map((v, i) => i === idx ? { ...v, [field]: value } : v)
    }));
  };

  const addVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, { color: '', size: '', stock: 0, images: [], imagePreviews: [], imageLink: '' }]
    }));
  };

  const removeVariant = (idx: number) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== idx)
    }));
  };

  const handleVariantImageUpload = (idx: number, files: FileList | File[]) => {
    const fileArray = Array.from(files);
    // Generate previews
    fileArray.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (result) {
          setFormData(prev => ({
            ...prev,
            variants: prev.variants.map((v, i) =>
              i === idx ? { ...v, imagePreviews: [...v.imagePreviews.filter(x => typeof x === 'string'), result as string] } : v
            )
          }));
        }
      };
      reader.readAsDataURL(file);
    });
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map((v, i) =>
        i === idx ? { ...v, images: [...v.images, ...fileArray] } : v
      )
    }));
  };

  const removeVariantImage = (idx: number, imgIdx: number) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map((v, i) =>
        i === idx
          ? {
              ...v,
              images: v.images.filter((_, j) => j !== imgIdx),
              imagePreviews: v.imagePreviews.filter((_, j) => j !== imgIdx)
            }
          : v
      )
    }));
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
    // Validate variants
    if (!formData.variants.length) {
      newErrors.variants = 'At least one variant is required';
    } else {
      formData.variants.forEach((variant, idx) => {
        if (!variant.color) {
          newErrors[`variant_color_${idx}`] = 'Color is required';
        }
        if (!variant.size) {
          newErrors[`variant_size_${idx}`] = 'Size is required';
        }
        if (variant.stock === undefined || variant.stock === null || isNaN(Number(variant.stock)) || Number(variant.stock) < 0) {
          newErrors[`variant_stock_${idx}`] = 'Stock must be a non-negative number';
        }
        if (!variant.images || variant.images.length === 0) {
          newErrors[`variant_images_${idx}`] = 'At least one image is required for this variant';
        }
      });
      // Check for duplicate color/size combos
      const combos = formData.variants.map(v => `${v.color}|${v.size}`);
      const hasDuplicates = combos.length !== new Set(combos).size;
      if (hasDuplicates) {
        newErrors.variants = 'Duplicate color/size combinations are not allowed';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

  const handleColorImageUpload = (color: string, files: FileList | File[]) => {
    const fileArray = Array.from(files);
    setColorImages(prev => ({
      ...prev,
      [color]: [...(prev[color] || []), ...fileArray]
    }));
    // Generate previews
    fileArray.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (result) {
          setColorImagePreviews(prev => ({
            ...prev,
            [color]: [...(prev[color] || []), result as string]
          }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeColorImage = (color: string, idx: number) => {
    setColorImages(prev => ({
      ...prev,
      [color]: prev[color].filter((_, i) => i !== idx)
    }));
    setColorImagePreviews(prev => ({
      ...prev,
      [color]: prev[color].filter((_, i) => i !== idx)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form data being submitted:', formData);
    if (!validateForm()) {
      toast.error('Please fix the form errors before submitting');
      return;
    }
    setIsSubmitting(true);
    try {
      // Create the product object for database (without color/stock)
      const productData = {
        name: formData.name.trim(),
        slug: generateSlug(formData.name.trim()),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        category_ids: null, // Setting to null since we don't have proper category UUIDs yet
        is_featured: formData.is_featured,
        is_active: formData.is_active,
        images: null, // Will be updated after image upload
        tags: [formData.category] // Store category as a tag for now
      };
      // Insert product into database first
      const { data: product, error: productError } = await supabase
        .from('products')
        .insert(productData)
        .select('*')
        .single();
      if (productError) {
        throw new Error(productError.message);
      }
      // Expand variants with 'All Sizes'
      let expandedVariants: Variant[] = [];
      formData.variants.forEach(variant => {
        if (variant.size === 'All') {
          STANDARD_SIZES.forEach(size => {
            expandedVariants.push({ ...variant, size });
          });
        } else {
          expandedVariants.push(variant);
        }
      });
      // Upload images for each variant and collect all image URLs for the product gallery
      let allImages: string[] = [];
      for (const variant of expandedVariants) {
        let imageUrls: string[] = [];
        for (let i = 0; i < variant.images.length; i++) {
          const fileOrUrl = variant.images[i];
          if (typeof fileOrUrl === 'string') {
            // If it's a URL, use directly
            imageUrls.push(fileOrUrl);
            allImages.push(fileOrUrl);
          } else if (fileOrUrl instanceof File) {
            const fileExt = fileOrUrl.name.split('.').pop();
            const fileName = `${product.slug}-${variant.color.replace(/[^a-zA-Z0-9]/g, '')}-${variant.size}-${Date.now()}-${i + 1}.${fileExt}`;
            const filePath = `products/${fileName}`;
            const { error: uploadError } = await supabase.storage
              .from('products')
              .upload(filePath, fileOrUrl);
            if (uploadError) {
              throw new Error(`Failed to upload image for variant ${variant.color}/${variant.size}: ${uploadError.message}`);
            }
            const { data: { publicUrl } } = supabase.storage
              .from('products')
              .getPublicUrl(filePath);
            imageUrls.push(publicUrl);
            allImages.push(publicUrl);
          }
        }
        // EXTRA LOGGING: Log the data being inserted for each variant
        console.log('Inserting variant:', {
          product_id: product.id,
          color: variant.color,
          size: variant.size,
          stock_quantity: variant.stock,
          images: imageUrls
        });
        // Insert variant into product_variants
        const { error: variantError } = await supabase
          .from('product_variants')
          .insert({
            product_id: product.id,
            color: variant.color,
            size: variant.size,
            stock_quantity: variant.stock,
            images: imageUrls
          });
        // EXTRA LOGGING: Log the actual Supabase error if insertion fails
        if (variantError) {
          console.error('Supabase error:', variantError);
          throw new Error(`Failed to create variant: ${variant.color} / ${variant.size}`);
        }
      }
      // Update product with all images (for gallery)
      if (allImages.length > 0) {
        const { error: updateError } = await supabase
          .from('products')
          .update({ images: allImages })
          .eq('id', product.id);
        if (updateError) {
          toast.error('Product created but failed to save image URLs');
        }
      }
      toast.success(`Product "${product.name}" created successfully with ${expandedVariants.length} variants!`);
      onSuccess({ ...product, images: allImages });
      onClose();
    } catch (error) {
      console.error('Error creating product:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to create product: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

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
            <Package className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Create New Product</h2>
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

              {/* Price */}
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

              {/* Variants Section */}
              <div>
                <h3 className="font-semibold text-lg text-gray-900">Variants *</h3>
                {errors.variants && (
                  <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.variants}
                  </p>
                )}
                {formData.variants.map((variant, idx) => (
                  <div key={idx} className="flex gap-2 items-center mb-2 flex-wrap border-b pb-2">
                    {/* Color Input */}
                    <Input
                      type="text"
                      placeholder="Color (hex or name)"
                      value={variant.color}
                      onChange={e => updateVariant(idx, 'color', e.target.value)}
                      className={errors[`variant_color_${idx}`] ? 'border-red-500' : ''}
                    />
                    {/* Size Dropdown */}
                    <Select
                      value={variant.size}
                      onValueChange={value => updateVariant(idx, 'size', value)}
                    >
                      <SelectTrigger className={errors[`variant_size_${idx}`] ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Size" />
                      </SelectTrigger>
                      <SelectContent>
                        {STANDARD_SIZES.map(size => (
                          <SelectItem key={size} value={size}>{size}</SelectItem>
                        ))}
                        <SelectItem value="All">All Sizes</SelectItem>
                      </SelectContent>
                    </Select>
                    {/* Stock Input */}
                    <Input
                      type="number"
                      min={0}
                      placeholder="Stock"
                      value={variant.stock}
                      onChange={e => updateVariant(idx, 'stock', Number(e.target.value))}
                      className={errors[`variant_stock_${idx}`] ? 'border-red-500' : ''}
                    />
                    {/* Image Upload for this variant */}
                    <div className="flex flex-col items-center">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={e => e.target.files && handleVariantImageUpload(idx, e.target.files)}
                      />
                      {/* Image Link Input */}
                      <div className="flex gap-2 mt-1 items-center">
                        <Input
                          type="url"
                          placeholder="Paste image URL"
                          value={variant.imageLink || ''}
                          onChange={e => updateVariant(idx, 'imageLink', e.target.value)}
                          className="w-48"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            const url = variant.imageLink?.trim();
                            if (url && /^https?:\/\//.test(url) && !variant.images.includes(url)) {
                              updateVariant(idx, 'images', [...variant.images, url]);
                              updateVariant(idx, 'imagePreviews', [...variant.imagePreviews.filter(x => typeof x === 'string'), url]);
                              updateVariant(idx, 'imageLink', '');
                            }
                          }}
                          disabled={!variant.imageLink || !/^https?:\/\//.test(variant.imageLink) || variant.images.includes(variant.imageLink)}
                        >
                          Add Link
                        </Button>
                      </div>
                      <div className="flex gap-1 mt-1">
                        {variant.imagePreviews.filter(src => typeof src === 'string').map((src, imgIdx) => (
                          <div key={imgIdx} className="relative">
                            <img src={src} alt={`Preview ${imgIdx + 1}`} className="w-12 h-12 object-cover rounded" />
                            <button
                              type="button"
                              onClick={() => {
                                // Remove both from images and imagePreviews
                                updateVariant(idx, 'imagePreviews', variant.imagePreviews.filter((s, j) => j !== imgIdx && typeof s === 'string'));
                                updateVariant(idx, 'images', variant.images.filter((img, j) => j !== imgIdx));
                              }}
                              className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                            >
                              X
                            </button>
                          </div>
                        ))}
                      </div>
                      {errors[`variant_images_${idx}`] && <span className="text-xs text-red-500">{errors[`variant_images_${idx}`]}</span>}
                    </div>
                    <Button onClick={() => removeVariant(idx)} variant="ghost" type="button">Remove</Button>
                    {errors[`variant_color_${idx}`] && <span className="text-xs text-red-500">{errors[`variant_color_${idx}`]}</span>}
                    {errors[`variant_size_${idx}`] && <span className="text-xs text-red-500">{errors[`variant_size_${idx}`]}</span>}
                    {errors[`variant_stock_${idx}`] && <span className="text-xs text-red-500">{errors[`variant_stock_${idx}`]}</span>}
                  </div>
                ))}
                <Button onClick={addVariant} variant="outline" type="button">Add Variant</Button>
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

              {/* Color Image Uploaders */}
              {[...new Set(formData.variants.map(v => v.color).filter(Boolean))].map(color => (
                <div key={color} className="mb-4">
                  <h4 className="font-medium text-gray-800">Images for {color}</h4>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={e => e.target.files && handleColorImageUpload(color, e.target.files)}
                  />
                  <div className="flex gap-2 mt-2">
                    {colorImagePreviews[color]?.map((src, idx) => (
                      <div key={idx} className="relative">
                        <img src={src} alt={`Preview ${idx + 1}`} className="w-16 h-16 object-cover rounded" />
                        <button type="button" onClick={() => removeColorImage(color, idx)} className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1">X</button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Right Column - AI Suggestions */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-gray-900">AI Suggestions</h3>

              {/* AI Suggestions */}
              <AISuggestions 
                images={[]}
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
                  Creating Product...
                </>
              ) : (
                <>
                  <Package className="mr-2 h-4 w-4" />
                  Create Product
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProductModal; 
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import MultiImageUpload from './MultiImageUpload';
import { COLOR_FAMILIES, getHexFromColorValue } from '@/config/colors';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock_quantity: number;
  is_active: boolean;
  is_featured: boolean;
  color: string;
  tags: string[];
  images: string[];
  category_ids: string[];
  created_at: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingProduct: Product | null;
  onProductSaved: () => void;
  categories: Category[];
}

const ProductForm = ({ isOpen, onClose, editingProduct, onProductSaved, categories }: ProductFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock_quantity: '',
    color: '',
    tags: '',
    category_ids: [] as string[],
    images: [] as string[],
    is_active: true,
    is_featured: false
  });

  useEffect(() => {
    if (editingProduct) {
      setFormData({
        name: editingProduct.name,
        description: editingProduct.description || '',
        price: editingProduct.price.toString(),
        stock_quantity: editingProduct.stock_quantity.toString(),
        color: editingProduct.color || '',
        tags: editingProduct.tags?.join(', ') || '',
        category_ids: editingProduct.category_ids || [],
        images: editingProduct.images || [],
        is_active: editingProduct.is_active,
        is_featured: editingProduct.is_featured || false
      });
    } else {
      setFormData({
        name: '',
        description: '',
        price: '',
        stock_quantity: '',
        color: '',
        tags: '',
        category_ids: [],
        images: [],
        is_active: true,
        is_featured: false
      });
    }
  }, [editingProduct, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    console.log('📝 Form submission started');
    console.log('📋 Current formData:', formData);
    console.log('🖼️ Images in formData:', formData.images);
    console.log('📊 Total images count:', formData.images.length);

    try {
      // Generate unique slug with timestamp to avoid duplicates
      const baseSlug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const uniqueSlug = `${baseSlug}-${Date.now()}`;
      
      const productData = {
        name: formData.name,
        slug: uniqueSlug,
        description: formData.description,
        price: parseFloat(formData.price),
        stock_quantity: parseInt(formData.stock_quantity),
        color: formData.color,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        category_ids: formData.category_ids,
        images: formData.images,
        is_active: formData.is_active,
        is_featured: formData.is_featured
      };

      console.log('📦 Final productData being sent to database:', productData);
      console.log('🔗 Generated unique slug:', uniqueSlug);
      console.log('🖼️ Images being saved:', productData.images);

      let error;
      if (editingProduct) {
        console.log('🔄 Updating existing product:', editingProduct.id, 'with data:', productData);
        const { error: updateError } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);
        error = updateError;
      } else {
        console.log('🆕 Creating new product with data:', productData);
        const { data: insertData, error: insertError } = await supabase
          .from('products')
          .insert([productData])
          .select()
          .single();
        error = insertError;
        
        if (insertData) {
          console.log('✅ Product created successfully:', insertData);
          console.log('📸 Saved images:', insertData.images);
          
          // Verify the product was saved with images
          if (insertData.images && insertData.images.length > 0) {
            console.log('🔍 Verifying saved images are accessible:');
            insertData.images.forEach((url: string, index: number) => {
              console.log(`Image ${index + 1}:`, url);
              // Test image accessibility
              fetch(url, { method: 'HEAD' })
                .then(response => {
                  if (response.ok) {
                    console.log(`✅ Image ${index + 1} is accessible`);
                  } else {
                    console.warn(`❌ Image ${index + 1} is not accessible:`, response.status);
                  }
                })
                .catch(err => console.warn(`❌ Error checking image ${index + 1}:`, err));
            });
          } else {
            console.warn('⚠️ Product saved without images!');
          }
        }
      }

      if (error) throw error;

      toast({
        title: "Success",
        description: `Product ${editingProduct ? 'updated' : 'created'} successfully`,
      });

      onClose();
      onProductSaved();
    } catch (error: any) {
      console.error('Error saving product:', error);
      
      // Handle specific database errors
      let errorMessage = `Failed to ${editingProduct ? 'update' : 'create'} product`;
      
      if (error?.code === '23505') {
        if (error.message.includes('products_slug_key')) {
          errorMessage = "Product with this name already exists. Please use a different name or wait a moment and try again.";
        } else if (error.message.includes('products_name_key')) {
          errorMessage = "A product with this exact name already exists. Please choose a different name.";
        } else {
          errorMessage = "This product conflicts with an existing product. Please check your data.";
        }
      } else if (error?.code === '23503') {
        errorMessage = "Invalid category or reference data. Please check your selections.";
      } else if (error?.code === '42501') {
        errorMessage = "Permission denied. Please check if you're logged in as an admin.";
      } else if (error?.message) {
        errorMessage = `${errorMessage}: ${error.message}`;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* Custom backdrop overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm" />
      )}
      <DialogContent className="fixed left-1/2 top-1/2 z-50 w-full max-w-4xl max-h-[90vh] -translate-x-1/2 -translate-y-1/2 overflow-y-auto bg-white border border-slate-200 shadow-2xl rounded-lg">
        <DialogHeader className="border-b border-gray-200 pb-4">
          <DialogTitle className="text-2xl font-semibold text-gray-900">
            {editingProduct ? 'Edit Product' : 'Create New Product'}
          </DialogTitle>
          <DialogDescription className="text-gray-500">
            Fill in the product details below
          </DialogDescription>
        </DialogHeader>
        
        <div className="bg-white p-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-100 pb-2">
                Basic Information
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-slate-700">Product Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="border-slate-300 focus:border-neon-cyan focus:ring-neon-cyan/20 bg-white text-slate-900 placeholder:text-slate-400"
                    placeholder="Enter product name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-sm font-medium text-slate-700">Price (₹)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    className="border-slate-300 focus:border-neon-cyan focus:ring-neon-cyan/20 bg-white text-slate-900 placeholder:text-slate-400"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium text-slate-700">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="border-slate-300 focus:border-neon-cyan focus:ring-neon-cyan/20 bg-white text-slate-900 placeholder:text-slate-400"
                  placeholder="Describe your product features and benefits"
                />
              </div>
            </div>

            {/* Inventory & Details Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-100 pb-2">
                Inventory & Details
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="stock" className="text-sm font-medium text-slate-700">Stock Quantity</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                    required
                    className="border-slate-300 focus:border-neon-cyan focus:ring-neon-cyan/20 bg-white text-slate-900 placeholder:text-slate-400"
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="color" className="text-sm font-medium text-slate-700">Colour</Label>
                  <Select value={formData.color} onValueChange={(value) => setFormData({ ...formData, color: value })}>
                    <SelectTrigger className="border-slate-300 focus:border-neon-cyan focus:ring-neon-cyan/20 bg-white text-slate-900">
                      <SelectValue placeholder="Select a colour" className="text-slate-900" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-slate-200 shadow-lg z-[60]">
                      {COLOR_FAMILIES.map(family => (
                        <div key={family.name}>
                          <div className="px-2 py-1.5 text-sm font-semibold text-gray-500 bg-gray-50">
                            {family.name}
                          </div>
                          {family.shades.map(color => (
                            <SelectItem 
                              key={color.hex} 
                              value={color.hex}
                              className="hover:bg-slate-50 focus:bg-slate-50 bg-white text-slate-900"
                            >
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-4 h-4 rounded-full border border-gray-200"
                                  style={{ backgroundColor: color.hex }}
                                />
                                <span>{color.displayName}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </div>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags" className="text-sm font-medium text-slate-700">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="streetwear, graphic, limited"
                  className="border-slate-300 focus:border-neon-cyan focus:ring-neon-cyan/20 bg-white text-slate-900 placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Images Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-100 pb-2">
                Product Images
              </h3>
              <div className="space-y-2">
                <p className="text-sm text-slate-600">Current images in form: {formData.images.length}</p>
                {formData.images.length > 0 && (
                  <div className="text-xs text-slate-500">
                    {formData.images.map((url, index) => (
                      <div key={index}>Image {index + 1}: {url.substring(0, 50)}...</div>
                    ))}
                  </div>
                )}
              </div>
              <MultiImageUpload
                images={formData.images}
                onImagesChange={(images) => {
                  console.log('🔄 MultiImageUpload updating images:', images);
                  console.log('📊 New images count:', images.length);
                  setFormData({ ...formData, images });
                  console.log('✅ FormData updated with new images');
                }}
                productId={editingProduct?.id}
              />
            </div>

            {/* Image Warning */}
            {formData.images.length === 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-white text-xs font-bold">!</div>
                  <div>
                    <h4 className="text-red-800 font-medium">⚠️ No Images Uploaded</h4>
                    <p className="text-red-700 text-sm mt-1">
                      Please upload at least one product image before saving. 
                      <br />
                      <strong>Steps:</strong> 1) Select images → 2) Click "🚀 Upload X Image(s) Now" button → 3) Then save product
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Settings Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-100 pb-2">
                Product Settings
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <Switch
                    id="active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    className="data-[state=checked]:bg-neon-cyan"
                  />
                  <div>
                    <Label htmlFor="active" className="text-sm font-medium text-slate-900 cursor-pointer">
                      Active (visible on site)
                    </Label>
                    <p className="text-xs text-slate-500">Product will be visible to customers</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <Switch
                    id="featured"
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                    className="data-[state=checked]:bg-neon-purple"
                  />
                  <div>
                    <Label htmlFor="featured" className="text-sm font-medium text-slate-900 cursor-pointer">
                      Featured on Homepage
                    </Label>
                    <p className="text-xs text-slate-500">Display in featured products section</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6 border-t border-slate-200">
              <Button 
                type="submit" 
                disabled={loading || formData.images.length === 0}
                className={`${formData.images.length === 0 ? 'opacity-50 cursor-not-allowed' : 'bg-gradient-to-r from-neon-cyan to-neon-purple hover:from-neon-cyan/90 hover:to-neon-purple/90 text-white font-medium px-6 py-2 shadow-lg'}`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  editingProduct ? 'Update Product' : 'Create Product'
                )}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="border-slate-300 text-slate-700 hover:bg-slate-50 px-6 py-2 bg-white"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductForm;

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Edit, Eye, EyeOff, Star, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onUpdate: () => void;
  isSelected?: boolean;
  onSelectChange?: (isSelected: boolean) => void;
  showCheckbox?: boolean;
}

const ProductCard = ({ 
  product, 
  onEdit, 
  onUpdate, 
  isSelected = false, 
  onSelectChange, 
  showCheckbox = false 
}: ProductCardProps) => {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const toggleProductStatus = async (productId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: !isActive })
        .eq('id', productId);

      if (error) throw error;
      
      onUpdate();
      toast({
        title: "Success",
        description: `Product ${!isActive ? 'activated' : 'deactivated'}`,
      });
    } catch (error) {
      console.error('Error toggling product status:', error);
      toast({
        title: "Error",
        description: "Failed to update product status",
        variant: "destructive",
      });
    }
  };

  const toggleFeaturedStatus = async (productId: string, isFeatured: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_featured: !isFeatured })
        .eq('id', productId);

      if (error) throw error;
      
      onUpdate();
      toast({
        title: "Success",
        description: `Product ${!isFeatured ? 'added to' : 'removed from'} featured`,
      });
    } catch (error) {
      console.error('Error toggling featured status:', error);
      toast({
        title: "Error",
        description: "Failed to update featured status",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProduct = async () => {
    setIsDeleting(true);
    try {
      console.log('🗑️ Attempting to delete product:', product.id, product.name);
      
      // First delete related order items
      console.log('🗑️ Deleting related order items...');
      const { error: orderItemsError } = await supabase
        .from('order_items')
        .delete()
        .eq('product_id', product.id);

      if (orderItemsError) {
        console.error('❌ Error deleting order items:', orderItemsError);
        throw orderItemsError;
      }
      
      // Then delete the product
      console.log('🗑️ Deleting product...');
      const { error: productError } = await supabase
        .from('products')
        .delete()
        .eq('id', product.id);

      if (productError) {
        console.error('❌ Supabase delete error:', productError);
        throw productError;
      }
      
      console.log('✅ Product deleted successfully:', product.name);
      onUpdate();
      toast({
        title: "Success",
        description: `Product "${product.name}" has been permanently deleted`,
      });
    } catch (error) {
      console.error('❌ Error deleting product:', error);
      console.error('❌ Error details:', JSON.stringify(error, null, 2));
      
      toast({
        title: "Error",
        description: `Failed to delete product: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCheckboxChange = (checked: boolean) => {
    onSelectChange?.(checked);
  };

  return (
    <Card className={`hover:shadow-lg transition-shadow ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}>
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div className="flex items-start gap-3 flex-1">
            {/* Bulk Selection Checkbox */}
            {showCheckbox && (
              <div className="pt-1">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={handleCheckboxChange}
                  aria-label={`Select ${product.name}`}
                />
              </div>
            )}
            
            <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              {product.name}
              {!product.is_active && (
                <Badge variant="secondary">Inactive</Badge>
              )}
              {product.is_featured && (
                <Badge className="bg-neon-cyan text-black">
                  <Star className="h-3 w-3 mr-1" />
                  Featured
                </Badge>
              )}
              {product.stock_quantity === 0 && (
                <Badge variant="destructive">Out of Stock</Badge>
              )}
            </CardTitle>
            <p className="text-muted-foreground mt-1">{product.description}</p>
          </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => toggleFeaturedStatus(product.id, product.is_featured)}
              title={product.is_featured ? "Remove from featured" : "Add to featured"}
            >
              <Star className={`h-4 w-4 ${product.is_featured ? 'fill-current text-neon-cyan' : ''}`} />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => toggleProductStatus(product.id, product.is_active)}
              title={product.is_active ? "Deactivate product" : "Activate product"}
            >
              {product.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => onEdit(product)}
              title="Edit product"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  title="Delete product"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Product</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{product.name}"? This action cannot be undone and the product will be permanently deleted, even if it has order history.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteProduct}
                    disabled={isDeleting}
                    className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                  >
                    {isDeleting ? "Processing..." : "Delete Product"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
          <div>
            <span className="font-medium">Price:</span>
            <p>₹{product.price}</p>
          </div>
          <div>
            <span className="font-medium">Stock:</span>
            <p>{product.stock_quantity}</p>
          </div>
          <div>
            <span className="font-medium">Color:</span>
            <p>{product.color || 'N/A'}</p>
          </div>
          <div>
            <span className="font-medium">Tags:</span>
            <p>{product.tags?.join(', ') || 'None'}</p>
          </div>
          <div>
            <span className="font-medium">Featured:</span>
            <p>{product.is_featured ? 'Yes' : 'No'}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;

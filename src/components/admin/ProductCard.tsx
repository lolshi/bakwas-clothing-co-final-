
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Edit, Eye, EyeOff, Star } from 'lucide-react';

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
}

const ProductCard = ({ product, onEdit, onUpdate }: ProductCardProps) => {
  const { toast } = useToast();

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

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div>
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
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => toggleFeaturedStatus(product.id, product.is_featured)}
            >
              <Star className={`h-4 w-4 ${product.is_featured ? 'fill-current text-neon-cyan' : ''}`} />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => toggleProductStatus(product.id, product.is_active)}
            >
              {product.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            <Button size="sm" variant="outline" onClick={() => onEdit(product)}>
              <Edit className="h-4 w-4" />
            </Button>
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

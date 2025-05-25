
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Star, Trash2 } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[] | null;
  is_featured: boolean;
}

interface FeaturedProductsSectionProps {
  featuredProducts: Product[];
  onRemoveFeaturedProduct: (productId: string) => void;
}

const FeaturedProductsSection: React.FC<FeaturedProductsSectionProps> = ({
  featuredProducts,
  onRemoveFeaturedProduct
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Featured Products</CardTitle>
            <CardDescription>
              Products highlighted on your homepage (managed in Product Management)
            </CardDescription>
          </div>
          <Button variant="outline" asChild>
            <a href="/admin/products">
              <Star className="mr-2 h-4 w-4" />
              Manage Featured Products
            </a>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {featuredProducts.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Product Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {featuredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    {product.images && product.images[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                        <span className="text-xs text-gray-500">No image</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>₹{Number(product.price).toLocaleString()}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveFeaturedProduct(product.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No featured products yet</p>
            <Button variant="outline" asChild>
              <a href="/admin/products">
                <Star className="mr-2 h-4 w-4" />
                Feature Some Products
              </a>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FeaturedProductsSection;

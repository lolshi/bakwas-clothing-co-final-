
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Box, Plus } from 'lucide-react';

interface EmptyProductsStateProps {
  onAddProduct: () => void;
}

const EmptyProductsState = ({ onAddProduct }: EmptyProductsStateProps) => {
  return (
    <Card className="text-center py-12">
      <CardContent>
        <Box className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-medium mb-2">No products yet</h3>
        <p className="text-muted-foreground mb-4">Get started by adding your first product</p>
        <Button onClick={onAddProduct}>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </CardContent>
    </Card>
  );
};

export default EmptyProductsState;


import React from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
}

interface ItemSelectorProps {
  orderItems: OrderItem[];
  selectedItems: string[];
  onItemToggle: (itemId: string) => void;
  selectedOrder: string;
}

const ItemSelector: React.FC<ItemSelectorProps> = ({ 
  orderItems, 
  selectedItems, 
  onItemToggle, 
  selectedOrder 
}) => {
  if (!selectedOrder || orderItems.length === 0) {
    return null;
  }

  return (
    <div>
      <Label className="text-white">Select Items</Label>
      <div className="mt-2 space-y-2 border border-gray-600 rounded-md p-4 bg-gray-700">
        {orderItems.map((item) => (
          <div key={item.id} className="flex items-center space-x-2">
            <Checkbox
              id={item.id}
              checked={selectedItems.includes(item.id)}
              onCheckedChange={() => onItemToggle(item.id)}
            />
            <Label htmlFor={item.id} className="flex-1 cursor-pointer text-white">
              {item.product_name} - Qty: {item.quantity} - ${item.unit_price}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ItemSelector;

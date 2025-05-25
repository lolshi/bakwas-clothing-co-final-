
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Order {
  id: string;
  order_number: string;
  created_at: string;
}

interface OrderSelectorProps {
  orders: Order[];
  selectedOrder: string;
  onOrderChange: (value: string) => void;
}

const OrderSelector: React.FC<OrderSelectorProps> = ({ orders, selectedOrder, onOrderChange }) => {
  return (
    <div>
      <Label htmlFor="order" className="text-white">Select Order</Label>
      <Select value={selectedOrder} onValueChange={onOrderChange}>
        <SelectTrigger className="bg-gray-700 text-white border-gray-600">
          <SelectValue placeholder="Choose an order" />
        </SelectTrigger>
        <SelectContent>
          {orders.map((order) => (
            <SelectItem key={order.id} value={order.id}>
              {order.order_number} - {new Date(order.created_at).toLocaleDateString()}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default OrderSelector;

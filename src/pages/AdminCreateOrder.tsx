import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Package, Save, Plus, Minus, Trash2 } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  stock_quantity: number | null;
  is_active: boolean | null;
}

interface OrderProduct {
  product_id: string;
  quantity: number;
  price: number;
  name: string;
}

interface OrderFormData {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  total_amount: string;
  status: string;
  products: OrderProduct[];
}

const AdminCreateOrder = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);
  const [formData, setFormData] = useState<OrderFormData>({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    shipping_address: '',
    total_amount: '0',
    status: 'pending',
    products: []
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, stock_quantity, is_active')
        .eq('is_active', true);

      if (error) throw error;
      if (data) setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleInputChange = (field: keyof OrderFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addProduct = () => {
    if (!selectedProduct || selectedQuantity <= 0) return;

    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;

    setFormData(prev => {
      const existingProductIndex = prev.products.findIndex(p => p.product_id === selectedProduct);
      let newProducts;

      if (existingProductIndex >= 0) {
        // Update quantity if product already exists
        newProducts = [...prev.products];
        newProducts[existingProductIndex].quantity += selectedQuantity;
      } else {
        // Add new product
        newProducts = [...prev.products, {
          product_id: product.id,
          quantity: selectedQuantity,
          price: product.price,
          name: product.name
        }];
      }

      // Calculate new total
      const newTotal = newProducts.reduce((sum, p) => sum + (p.price * p.quantity), 0);

      return {
        ...prev,
        products: newProducts,
        total_amount: newTotal.toFixed(2)
      };
    });

    // Reset selection
    setSelectedProduct('');
    setSelectedQuantity(1);
  };

  const removeProduct = (productId: string) => {
    setFormData(prev => {
      const newProducts = prev.products.filter(p => p.product_id !== productId);
      const newTotal = newProducts.reduce((sum, p) => sum + (p.price * p.quantity), 0);

      return {
        ...prev,
        products: newProducts,
        total_amount: newTotal.toFixed(2)
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.products.length === 0) {
      alert('Please add at least one product to the order');
      return;
    }
    
    setLoading(true);

    try {
      // Generate a unique order number
      const orderNumber = `ORD-${Date.now()}`;
      const totalAmount = parseFloat(formData.total_amount);

      // First create the order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          customer_name: formData.customer_name,
          customer_email: formData.customer_email,
          customer_phone: formData.customer_phone,
          shipping_address: formData.shipping_address,
          total_amount: totalAmount,
          subtotal: totalAmount,
          tax_amount: 0,
          discount_amount: 0,
          status: formData.status,
          payment_status: 'pending'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Then create order items
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(
          formData.products.map(product => ({
            order_id: orderData.id,
            product_id: product.product_id,
            product_name: product.name,
            quantity: product.quantity,
            unit_price: product.price,
            total_price: product.price * product.quantity
          }))
        );

      if (itemsError) throw itemsError;

      // Navigate back to orders list
      navigate('/admin/orders');
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Error creating order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Create New Order</h1>
            <p className="text-gray-600">Enter the order details below</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/admin/orders')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Orders
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Add Products
            </CardTitle>
            <CardDescription>
              Select products and quantities for this order
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <Label htmlFor="product">Product</Label>
                <Select
                  value={selectedProduct}
                  onValueChange={setSelectedProduct}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map(product => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} - ₹{product.price} ({product.stock_quantity} in stock)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-32">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={selectedQuantity}
                  onChange={(e) => setSelectedQuantity(parseInt(e.target.value) || 1)}
                />
              </div>
              <div className="flex items-end">
                <Button 
                  type="button"
                  onClick={addProduct}
                  disabled={!selectedProduct}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {formData.products.map((product) => (
                  <TableRow key={product.product_id}>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.quantity}</TableCell>
                    <TableCell>₹{product.price}</TableCell>
                    <TableCell>₹{(product.price * product.quantity).toFixed(2)}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeProduct(product.product_id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {formData.products.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-gray-500">
                      No products added yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {formData.products.length > 0 && (
              <div className="mt-4 text-right">
                <p className="text-lg font-semibold">
                  Total Amount: ₹{formData.total_amount}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="customer_name">Customer Name</Label>
                  <Input
                    id="customer_name"
                    value={formData.customer_name}
                    onChange={(e) => handleInputChange('customer_name', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customer_email">Email</Label>
                  <Input
                    id="customer_email"
                    type="email"
                    value={formData.customer_email}
                    onChange={(e) => handleInputChange('customer_email', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customer_phone">Phone</Label>
                  <Input
                    id="customer_phone"
                    value={formData.customer_phone}
                    onChange={(e) => handleInputChange('customer_phone', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleInputChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="shipping_address">Shipping Address</Label>
                  <Textarea
                    id="shipping_address"
                    value={formData.shipping_address}
                    onChange={(e) => handleInputChange('shipping_address', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/admin/orders')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading || formData.products.length === 0}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? 'Creating...' : 'Create Order'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminCreateOrder; 
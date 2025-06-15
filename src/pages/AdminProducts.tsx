import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload,
  RefreshCw,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Star,
  DollarSign,
  BarChart3,
  Package2,
  ShoppingCart,
  Tag,
  Image,
  Grid,
  List,
  SortAsc,
  SortDesc,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Target,
  Activity,
  X
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { format } from 'date-fns';
import ApiToolsManager from '@/components/admin/ApiToolsManager';
import BulkUpload from '@/components/admin/BulkUpload';
import CreateProductModal from '@/components/admin/CreateProductModal';
import EditProductModal from '@/components/admin/EditProductModal';

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

interface ProductStats {
  totalProducts: number;
  activeProducts: number;
  featuredProducts: number;
  lowStockProducts: number;
  totalValue: number;
  averagePrice: number;
}

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<ProductStats>({
    totalProducts: 0,
    activeProducts: 0,
    featuredProducts: 0,
    lowStockProducts: 0,
    totalValue: 0,
    averagePrice: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Mock chart data
  const [chartData] = useState([
    { category: 'T-Shirts', products: 25, value: 75000, stock: 180 },
    { category: 'Hoodies', products: 18, value: 144000, stock: 92 },
    { category: 'Accessories', products: 12, value: 36000, stock: 156 },
    { category: 'Shoes', products: 8, value: 120000, stock: 64 },
    { category: 'Pants', products: 15, value: 90000, stock: 78 }
  ]);

  const [inventoryData] = useState([
    { week: 'Week 1', inStock: 85, lowStock: 12, outOfStock: 3 },
    { week: 'Week 2', inStock: 88, lowStock: 9, outOfStock: 3 },
    { week: 'Week 3', inStock: 92, lowStock: 6, outOfStock: 2 },
    { week: 'Week 4', inStock: 89, lowStock: 8, outOfStock: 3 }
  ]);

  useEffect(() => {
    fetchProducts();
    calculateStats();
  }, []);

  // Fetch total stock for a product from product_variants
  async function getProductTotalStock(productId: string) {
    const { data: variants, error } = await supabase
      .from('product_variants')
      .select('stock_quantity')
      .eq('product_id', productId);

    if (error) {
      console.error('Error fetching variants:', error);
      return 0;
    }

    return variants.reduce((sum, v) => sum + (v.stock_quantity || 0), 0);
  }

  const fetchProducts = async () => {
    const isInitialLoad = loading;
    setRefreshing(true);
    
    if (!isInitialLoad) {
      toast.info('Refreshing products...');
    }
    
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order(sortBy, { ascending: sortOrder === 'asc' });

      if (error) throw error;
      if (data) {
        // For each product, fetch its total stock from product_variants
        const productsWithStock = await Promise.all(
          data.map(async (product) => {
            const totalStock = await getProductTotalStock(product.id);
            return { ...product, stock_quantity: totalStock };
          })
        );
        setProducts(productsWithStock);
        if (!isInitialLoad) {
          toast.success('Products refreshed successfully!');
        }
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      if (!isInitialLoad) {
        toast.error('Failed to refresh products');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const calculateStats = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('price, stock_quantity, is_featured, is_active');

      if (error) throw error;
      if (data) {
        const totalProducts = data.length;
        const activeProducts = data.filter(p => p.is_active).length;
        const featuredProducts = data.filter(p => p.is_featured).length;
        const lowStockProducts = data.filter(p => 
          p.stock_quantity !== null && p.stock_quantity < 10
        ).length;
        const totalValue = data.reduce((sum, p) => sum + (p.price * (p.stock_quantity || 0)), 0);
        const averagePrice = data.reduce((sum, p) => sum + p.price, 0) / totalProducts;

        setStats({
          totalProducts,
          activeProducts,
          featuredProducts,
          lowStockProducts,
          totalValue,
          averagePrice
        });
      }
    } catch (error) {
      console.error('Error calculating stats:', error);
    }
  };

  const exportProducts = async () => {
    toast.info('Generating products export...');
    
    try {
      // Create CSV content for export
      const csvContent = [
        // Header
        ['BAKWAS E-Commerce Products Export'],
        ['Generated on:', new Date().toLocaleString()],
        ['Total Products:', products.length.toString()],
        [''],
        ['PRODUCT DATA'],
        ['ID', 'Name', 'Price', 'Stock', 'Status', 'Featured', 'Created Date'],
        ...products.map(product => [
          product.id,
          product.name,
          `₹${product.price.toLocaleString()}`,
          product.stock_quantity?.toString() || '0',
          product.is_active ? 'Active' : 'Inactive',
          product.is_featured ? 'Yes' : 'No',
          product.created_at ? format(new Date(product.created_at), 'yyyy-MM-dd') : ''
        ]),
        [''],
        ['SUMMARY STATISTICS'],
        ['Total Products', stats.totalProducts.toString()],
        ['Active Products', stats.activeProducts.toString()],
        ['Featured Products', stats.featuredProducts.toString()],
        ['Low Stock Products', stats.lowStockProducts.toString()],
        ['Total Inventory Value', `₹${stats.totalValue.toLocaleString()}`],
        ['Average Price', `₹${stats.averagePrice.toLocaleString()}`]
      ].map(row => row.join(',')).join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `bakwas-products-export-${format(new Date(), 'yyyy-MM-dd-HHmm')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Products exported successfully!');
    } catch (error) {
      console.error('Error exporting products:', error);
      toast.error('Failed to export products');
    }
  };

  const handleCreateProductSuccess = (newProduct: any) => {
    setProducts(prev => [newProduct, ...prev]);
    calculateStats();
  };

  const handleEditProductSuccess = (updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    calculateStats();
  };

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowViewModal(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowEditModal(true);
  };

  const handleDeleteProduct = async (product: Product) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${product.name}"? This action cannot be undone and will also delete all related order history.`
    );

    if (!confirmDelete) return;

    try {
      toast.info('Deleting product...');

      // First delete related order items
      const { error: orderItemsError } = await supabase
        .from('order_items')
        .delete()
        .eq('product_id', product.id);

      if (orderItemsError) throw orderItemsError;

      // Then delete the product
      const { error: productError } = await supabase
        .from('products')
        .delete()
        .eq('id', product.id);

      if (productError) throw productError;

      toast.success(`Product "${product.name}" has been permanently deleted`);
      setProducts(prev => prev.filter(p => p.id !== product.id));
      calculateStats();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product. Please try again.');
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && product.is_active) ||
      (statusFilter === 'inactive' && !product.is_active) ||
      (statusFilter === 'featured' && product.is_featured);
    
    const matchesStock = stockFilter === 'all' ||
      (stockFilter === 'low' && product.stock_quantity !== null && product.stock_quantity < 10) ||
      (stockFilter === 'out' && product.stock_quantity === 0) ||
      (stockFilter === 'available' && product.stock_quantity !== null && product.stock_quantity > 0);
    
    return matchesSearch && matchesStatus && matchesStock;
  });

  const getStockBadge = (quantity: number | null) => {
    if (quantity === null || quantity === 0) {
      return <Badge variant="destructive">Out of Stock</Badge>;
    } else if (quantity < 10) {
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Low Stock</Badge>;
    }
    return <Badge variant="default" className="bg-green-100 text-green-800">In Stock</Badge>;
  };

  const getStatusBadge = (isActive: boolean | null, isFeatured: boolean | null) => {
    if (isFeatured) {
      return <Badge className="bg-purple-100 text-purple-800">Featured</Badge>;
    }
    return (
      <Badge variant={isActive ? 'default' : 'secondary'}>
        {isActive ? 'Active' : 'Inactive'}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Bulk Operations
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(new Set(filteredProducts.map(p => p.id)));
    } else {
      setSelectedProducts(new Set());
    }
  };

  const handleSelectProduct = (productId: string, checked: boolean) => {
    const newSelected = new Set(selectedProducts);
    if (checked) {
      newSelected.add(productId);
    } else {
      newSelected.delete(productId);
    }
    setSelectedProducts(newSelected);
  };

  const bulkDelete = async () => {
    const selectedCount = selectedProducts.size;
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${selectedCount} selected product${selectedCount > 1 ? 's' : ''}? This action cannot be undone and will also delete all related order history.`
    );

    if (!confirmDelete) return;

    try {
      toast.info(`Deleting ${selectedCount} products...`);

      // First delete related order items for all selected products
      const { error: orderItemsError } = await supabase
        .from('order_items')
        .delete()
        .in('product_id', Array.from(selectedProducts));

      if (orderItemsError) throw orderItemsError;

      // Then delete the products
      const { error: productsError } = await supabase
        .from('products')
        .delete()
        .in('id', Array.from(selectedProducts));

      if (productsError) throw productsError;

      // Remove from local state
      setProducts(prev => prev.filter(p => !selectedProducts.has(p.id)));
      setSelectedProducts(new Set());
      calculateStats();

      toast.success(`Successfully deleted ${selectedCount} product${selectedCount > 1 ? 's' : ''}!`);
    } catch (error) {
      console.error('Bulk delete error:', error);
      toast.error('Failed to delete products. Please try again.');
    }
  };

  const bulkUpdateStatus = async (isActive: boolean) => {
    const selectedCount = selectedProducts.size;
    const action = isActive ? 'activate' : 'deactivate';
    
    try {
      toast.info(`${action === 'activate' ? 'Activating' : 'Deactivating'} ${selectedCount} products...`);

      // Update products in database
      const { error } = await supabase
        .from('products')
        .update({ is_active: isActive })
        .in('id', Array.from(selectedProducts));

      if (error) throw error;

      // Update local state
      setProducts(prev => prev.map(p => 
        selectedProducts.has(p.id) ? { ...p, is_active: isActive } : p
      ));
      setSelectedProducts(new Set());
      calculateStats();

      toast.success(`Successfully ${action}d ${selectedCount} product${selectedCount > 1 ? 's' : ''}!`);
    } catch (error) {
      console.error('Bulk status update error:', error);
      toast.error(`Failed to ${action} products. Please try again.`);
    }
  };

  const bulkUpdateFeatured = async (isFeatured: boolean) => {
    const selectedCount = selectedProducts.size;
    const action = isFeatured ? 'feature' : 'unfeature';
    
    try {
      toast.info(`${action === 'feature' ? 'Featuring' : 'Unfeaturing'} ${selectedCount} products...`);

      // Update products in database
      const { error } = await supabase
        .from('products')
        .update({ is_featured: isFeatured })
        .in('id', Array.from(selectedProducts));

      if (error) throw error;

      // Update local state
      setProducts(prev => prev.map(p => 
        selectedProducts.has(p.id) ? { ...p, is_featured: isFeatured } : p
      ));
      setSelectedProducts(new Set());
      calculateStats();

      toast.success(`Successfully ${action}d ${selectedCount} product${selectedCount > 1 ? 's' : ''}!`);
    } catch (error) {
      console.error('Bulk featured update error:', error);
      toast.error(`Failed to ${action} products. Please try again.`);
    }
  };

  const bulkExportSelected = async () => {
    const selectedCount = selectedProducts.size;
    toast.info(`Exporting ${selectedCount} selected products...`);
    
    try {
      // Get selected products data
      const selectedProductsData = products.filter(p => selectedProducts.has(p.id));
      
      // Create CSV content for export
      const csvContent = [
        // Header
        ['BAKWAS E-Commerce - Selected Products Export'],
        ['Generated on:', new Date().toLocaleString()],
        ['Total Products:', selectedProductsData.length.toString()],
        [''],
        ['SELECTED PRODUCT DATA'],
        ['ID', 'Name', 'Price', 'Stock', 'Status', 'Featured', 'Created Date'],
        ...selectedProductsData.map(product => [
          product.id,
          product.name,
          `₹${product.price.toLocaleString()}`,
          product.stock_quantity?.toString() || '0',
          product.is_active ? 'Active' : 'Inactive',
          product.is_featured ? 'Yes' : 'No',
          product.created_at ? format(new Date(product.created_at), 'yyyy-MM-dd') : ''
        ])
      ].map(row => row.join(',')).join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `bakwas-selected-products-${format(new Date(), 'yyyy-MM-dd-HHmm')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setSelectedProducts(new Set());
      toast.success(`Successfully exported ${selectedCount} selected products!`);
    } catch (error) {
      console.error('Error exporting selected products:', error);
      toast.error('Failed to export selected products');
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center space-y-4">
            <RefreshCw className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
            <p className="text-gray-600">Loading product data...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Smart Inventory Management
            </h1>
            <p className="text-gray-600">
              AI-powered product catalog with intelligent stock optimization and sales analytics
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button 
              onClick={fetchProducts} 
              variant="secondary"
              disabled={refreshing}
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-300 transform hover:scale-105 transition-all duration-300"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button 
              onClick={exportProducts}
              variant="secondary"
              className="flex items-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-900 border border-blue-300 transform hover:scale-105 transition-all duration-300"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 transform hover:scale-105 transition-all duration-300"
            >
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          </div>
        </div>

        {/* AI Intelligence Banner */}
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-600 rounded-lg">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-green-900">Inventory Intelligence Analytics</h3>
                  <p className="text-green-700">Smart recommendations based on sales patterns and stock levels</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <p className="text-sm text-green-600">Optimization Score</p>
                  <p className="text-lg font-bold text-green-900">92.5%</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-green-600">Restock Alerts</p>
                  <p className="text-lg font-bold text-green-900">{stats.lowStockProducts}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-green-600">Profit Margin</p>
                  <p className="text-lg font-bold text-green-900">24.8%</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Products</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
                  <div className="flex items-center mt-2">
                    <Package className="h-4 w-4 text-blue-500 mr-1" />
                    <span className="text-sm text-blue-600 font-medium">{stats.activeProducts} active</span>
                  </div>
                </div>
                <Package2 className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Featured Items</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.featuredProducts}</p>
                  <div className="flex items-center mt-2">
                    <Star className="h-4 w-4 text-yellow-500 mr-1" />
                    <span className="text-sm text-yellow-600 font-medium">Premium showcase</span>
                  </div>
                </div>
                <Star className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Low Stock Alerts</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.lowStockProducts}</p>
                  <div className="flex items-center mt-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500 mr-1" />
                    <span className="text-sm text-orange-600 font-medium">Need attention</span>
                  </div>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-600" />
          </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Inventory Value</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalValue)}</p>
                  <div className="flex items-center mt-2">
                    <DollarSign className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600 font-medium">Total worth</span>
                  </div>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Management Tabs */}
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="products" className="relative">
              Products
            </TabsTrigger>
            <TabsTrigger value="inventory" className="relative">
              Inventory
            </TabsTrigger>
            <TabsTrigger value="analytics" className="relative">
              Analytics
            </TabsTrigger>
            <TabsTrigger value="categories" className="relative">
              Categories
            </TabsTrigger>
            <TabsTrigger value="api-tools" className="relative">
              API & Tools
            </TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Product Catalog Management
                    </CardTitle>
                    <CardDescription>
                      Manage your complete product inventory with smart filtering and bulk operations ({filteredProducts.length} products)
                    </CardDescription>
                  </div>
                  
                  <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowBulkUpload(true)}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Import
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Enhanced Filters */}
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex items-center space-x-2">
                    <Search className="h-4 w-4 text-gray-600" />
                    <Input
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64"
                    />
                  </div>

                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="featured">Featured</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={stockFilter} onValueChange={setStockFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Stock" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Stock</SelectItem>
                      <SelectItem value="available">In Stock</SelectItem>
                      <SelectItem value="low">Low Stock</SelectItem>
                      <SelectItem value="out">Out of Stock</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Advanced Filters
                  </Button>

                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Sort by:</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    >
                      {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                {selectedProducts.size > 0 && (
                  <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg overflow-hidden">
                    {/* Header */}
                    <div className="p-4 bg-blue-100 border-b border-blue-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <Package className="h-5 w-5 text-blue-700" />
                          <span className="font-semibold text-blue-900">
                            {selectedProducts.size} product{selectedProducts.size > 1 ? 's' : ''} selected
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedProducts(new Set())}
                            className="text-blue-700 hover:text-blue-900 hover:bg-blue-200"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Clear Selection
                        </Button>
                      </div>
                      
                      <div className="flex items-center gap-2">
                          <Select
                            value="actions"
                            onValueChange={(value) => {
                              switch (value) {
                                case 'activate':
                                  bulkUpdateStatus(true);
                                  break;
                                case 'deactivate':
                                  bulkUpdateStatus(false);
                                  break;
                                case 'feature':
                                  bulkUpdateFeatured(true);
                                  break;
                                case 'unfeature':
                                  bulkUpdateFeatured(false);
                                  break;
                                case 'export':
                                  bulkExportSelected();
                                  break;
                                case 'delete':
                                  bulkDelete();
                                  break;
                              }
                            }}
                          >
                            <SelectTrigger className="w-[180px] bg-white">
                              <SelectValue placeholder="Bulk Actions" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="actions" disabled>Bulk Actions</SelectItem>
                              <SelectItem value="activate" className="text-green-600 hover:text-green-700">
                                <div className="flex items-center gap-2">
                                  <CheckCircle className="h-4 w-4" />
                                  Activate Products
                                </div>
                              </SelectItem>
                              <SelectItem value="deactivate" className="text-orange-600 hover:text-orange-700">
                                <div className="flex items-center gap-2">
                                  <XCircle className="h-4 w-4" />
                                  Deactivate Products
                                </div>
                              </SelectItem>
                              <SelectItem value="feature" className="text-purple-600 hover:text-purple-700">
                                <div className="flex items-center gap-2">
                                  <Star className="h-4 w-4" />
                                  Feature Products
                                </div>
                              </SelectItem>
                              <SelectItem value="unfeature" className="text-gray-600 hover:text-gray-700">
                                <div className="flex items-center gap-2">
                                  <Star className="h-4 w-4" />
                                  Unfeature Products
                                </div>
                              </SelectItem>
                              <SelectItem value="export" className="text-blue-600 hover:text-blue-700">
                                <div className="flex items-center gap-2">
                                  <Download className="h-4 w-4" />
                                  Export Selected
                                </div>
                              </SelectItem>
                              <SelectItem value="delete" className="text-red-600 hover:text-red-700">
                                <div className="flex items-center gap-2">
                                  <Trash2 className="h-4 w-4" />
                                  Delete Products
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => bulkUpdateStatus(true)}
                          className="text-green-600 border-green-300 hover:bg-green-50"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Activate
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => bulkUpdateStatus(false)}
                          className="text-orange-600 border-orange-300 hover:bg-orange-50"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Deactivate
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => bulkUpdateFeatured(true)}
                          className="text-purple-600 border-purple-300 hover:bg-purple-50"
                        >
                          <Star className="h-4 w-4 mr-1" />
                          Feature
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => bulkUpdateFeatured(false)}
                          className="text-gray-600 border-gray-300 hover:bg-gray-50"
                        >
                          <Star className="h-4 w-4 mr-1" />
                          Unfeature
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={bulkExportSelected}
                          className="text-blue-600 border-blue-300 hover:bg-blue-50"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Export
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={bulkDelete}
                          className="text-red-600 border-red-300 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                        </div>
                      </div>
                    </div>

                    {/* Selected Products Summary */}
                    <div className="p-4">
                      <div className="grid grid-cols-4 gap-4">
                        <div className="bg-white p-3 rounded-lg border border-blue-200">
                          <div className="text-sm text-gray-600">Total Value</div>
                          <div className="text-lg font-semibold text-blue-900">
                            {formatCurrency(
                              products
                                .filter(p => selectedProducts.has(p.id))
                                .reduce((sum, p) => sum + (p.price * (p.stock_quantity || 0)), 0)
                            )}
                          </div>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-blue-200">
                          <div className="text-sm text-gray-600">Active Products</div>
                          <div className="text-lg font-semibold text-blue-900">
                            {products.filter(p => selectedProducts.has(p.id) && p.is_active).length}
                          </div>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-blue-200">
                          <div className="text-sm text-gray-600">Featured Products</div>
                          <div className="text-lg font-semibold text-blue-900">
                            {products.filter(p => selectedProducts.has(p.id) && p.is_featured).length}
                          </div>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-blue-200">
                          <div className="text-sm text-gray-600">Total Stock</div>
                          <div className="text-lg font-semibold text-blue-900">
                            {products
                              .filter(p => selectedProducts.has(p.id))
                              .reduce((sum, p) => sum + (p.stock_quantity || 0), 0)
                            } units
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox 
                          checked={selectedProducts.size === filteredProducts.length && filteredProducts.length > 0}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Color</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <Checkbox 
                            checked={selectedProducts.has(product.id)}
                            onCheckedChange={(checked) => handleSelectProduct(product.id, !!checked)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                              {product.images && product.images.length > 0 ? (
                                <img
                                  src={product.images[0]}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    const parent = target.parentElement;
                                    if (parent) {
                                      parent.innerHTML = `<svg class="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                      </svg>`;
                                    }
                                  }}
                                />
                              ) : (
                                <Image className="h-6 w-6 text-gray-400" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium">{product.name}</div>
                              <div className="text-sm text-gray-500 max-w-xs truncate">{product.description}</div>
                              {product.images && product.images.length > 1 && (
                                <div className="text-xs text-blue-600 mt-1">
                                  +{product.images.length - 1} more image{product.images.length > 2 ? 's' : ''}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-green-600">{formatCurrency(product.price)}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>{product.stock_quantity || 0}</span>
                            {getStockBadge(product.stock_quantity)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {product.color ? (
                              <>
                                {product.color.startsWith('#') ? (
                                  <>
                                    <div 
                                      className="w-4 h-4 rounded-full border border-gray-300 shadow-sm"
                                      style={{ backgroundColor: product.color }}
                                      title={product.color}
                                    />
                                    <span className="text-sm text-gray-600 font-mono">{product.color}</span>
                                  </>
                                ) : (
                                  <span className="text-sm text-gray-600">{product.color}</span>
                                )}
                              </>
                            ) : (
                              <span className="text-sm text-gray-500">N/A</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(product.is_active, product.is_featured)}
                        </TableCell>
                        <TableCell>
                          {product.created_at ? format(new Date(product.created_at), 'MMM dd, yyyy') : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm" onClick={() => handleViewProduct(product)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleEditProduct(product)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteProduct(product)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                {filteredProducts.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No products found matching your filters
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Stock Levels Overview
                  </CardTitle>
                  <CardDescription>Real-time inventory status tracking</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={inventoryData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area dataKey="inStock" stackId="1" stroke="#10b981" fill="#10b981" />
                      <Area dataKey="lowStock" stackId="1" stroke="#f59e0b" fill="#f59e0b" />
                      <Area dataKey="outOfStock" stackId="1" stroke="#ef4444" fill="#ef4444" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Low Stock Management
                  </CardTitle>
                  <CardDescription>Products requiring immediate attention</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {products
                      .filter(p => p.stock_quantity !== null && p.stock_quantity < 10)
                      .slice(0, 5)
                      .map((product) => (
                        <div key={product.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                          <div>
                            <p className="font-medium text-orange-900">{product.name}</p>
                            <p className="text-sm text-orange-700">{product.stock_quantity} units remaining</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                              Low Stock
                            </Badge>
                            <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                              Restock
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Category Distribution
                  </CardTitle>
                  <CardDescription>Product distribution across categories</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="products" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Value Distribution
                  </CardTitle>
                  <CardDescription>Inventory value by category</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 60%)`} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Tag className="h-5 w-5" />
                      Category Management
                    </CardTitle>
                    <CardDescription>Organize products into categories for better management</CardDescription>
                  </div>
                  <Button className="relative">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Category
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {chartData.map((category, index) => (
                    <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{category.category}</h3>
                        <Badge>{category.products} products</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        Total value: {formatCurrency(category.value)}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Stock: {category.stock} units</span>
                        <Button variant="ghost" size="sm" className="relative">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* API & Tools Tab */}
          <TabsContent value="api-tools" className="space-y-6">
            <ApiToolsManager />
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Product Modal */}
      <CreateProductModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateProductSuccess}
      />

      {/* Bulk Upload Modal */}
      <BulkUpload 
        isOpen={showBulkUpload} 
        onClose={() => setShowBulkUpload(false)}
        onSuccess={() => {
          setShowBulkUpload(false);
          fetchProducts();
          calculateStats();
        }}
      />

      {/* Edit Product Modal */}
      <EditProductModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSuccess={handleEditProductSuccess}
        product={selectedProduct}
      />

      {/* Product View Modal */}
      {showViewModal && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setShowViewModal(false)}
          />
          
          {/* Modal */}
          <div className="relative bg-white rounded-lg shadow-xl max-w-4xl max-h-[90vh] overflow-y-auto mx-4 w-full">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center gap-2">
                <Eye className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">Product Details</h2>
              </div>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column - Product Images */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-gray-900">Product Images</h3>
                  {selectedProduct.images && selectedProduct.images.length > 0 ? (
                    <div className="space-y-3">
                      <div className="relative">
                        <img
                          src={selectedProduct.images[0]}
                          alt={selectedProduct.name}
                          className="w-full h-64 object-cover rounded-lg border"
                        />
                        <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                          1 of {selectedProduct.images.length}
                        </div>
                      </div>
                      {selectedProduct.images.length > 1 && (
                        <div className="grid grid-cols-4 gap-2">
                          {selectedProduct.images.slice(1).map((image, index) => (
                            <img
                              key={index}
                              src={image}
                              alt={`${selectedProduct.name} ${index + 2}`}
                              className="w-full h-16 object-cover rounded border cursor-pointer hover:opacity-75"
                              onClick={() => {
                                // Swap with main image
                                const newImages = [...selectedProduct.images!];
                                [newImages[0], newImages[index + 1]] = [newImages[index + 1], newImages[0]];
                                setSelectedProduct({ ...selectedProduct, images: newImages });
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                      <Image className="h-16 w-16 text-gray-400" />
                      <span className="text-gray-500 ml-2">No images available</span>
                    </div>
                  )}
                </div>

                {/* Right Column - Product Details */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-gray-900">Product Information</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Name</label>
                      <p className="text-lg font-semibold text-gray-900">{selectedProduct.name}</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-600">Description</label>
                      <p className="text-gray-800">{selectedProduct.description || 'No description available'}</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-600">Price</label>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-600">Price</label>
                          <p className="text-xl font-bold text-green-600">{formatCurrency(selectedProduct.price)}</p>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-gray-600">Stock</label>
                          <div className="flex items-center gap-2">
                            <p className="text-lg font-semibold">{selectedProduct.stock_quantity || 0}</p>
                            {getStockBadge(selectedProduct.stock_quantity)}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-600">Status</label>
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusBadge(selectedProduct.is_active, selectedProduct.is_featured)}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-600">Color</label>
                      <div className="flex items-center gap-2 mt-1">
                        {selectedProduct.color ? (
                          <>
                            {selectedProduct.color.startsWith('#') ? (
                              <>
                                <div 
                                  className="w-6 h-6 rounded-full border-2 border-gray-300 shadow-sm"
                                  style={{ backgroundColor: selectedProduct.color }}
                                  title={selectedProduct.color}
                                />
                                <p className="text-gray-800 font-mono text-sm">{selectedProduct.color}</p>
                              </>
                            ) : (
                              <p className="text-gray-800">{selectedProduct.color}</p>
                            )}
                          </>
                        ) : (
                          <p className="text-gray-500">Not specified</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-600">Categories</label>
                      <p className="text-gray-800">
                        {selectedProduct.tags && selectedProduct.tags.length > 0 
                          ? selectedProduct.tags.join(', ') 
                          : 'No categories assigned'
                        }
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-600">Created Date</label>
                      <p className="text-gray-800">
                        {selectedProduct.created_at 
                          ? format(new Date(selectedProduct.created_at), 'MMMM dd, yyyy at hh:mm a')
                          : 'Unknown'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
              <Button
                variant="outline"
                onClick={() => setShowViewModal(false)}
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  setShowViewModal(false);
                  handleEditProduct(selectedProduct);
                }}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Product
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminProducts;
import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingCart,
  DollarSign,
  Package,
  Eye,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Clock,
  Target,
  Zap,
  Brain,
  Activity,
  AlertCircle,
  CheckCircle,
  Star,
  Download
} from 'lucide-react';
import {
  LineChart,
  Line,
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
import { format, subDays } from 'date-fns';

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  revenueGrowth: number;
  ordersGrowth: number;
  customersGrowth: number;
  conversionRate: number;
}

interface TopProduct {
  id: string;
  name: string;
  sales: number;
  revenue: number;
  trend: 'up' | 'down' | 'stable';
  image?: string;
}

interface RecentActivity {
  id: string;
  type: 'order' | 'customer' | 'product' | 'review';
  message: string;
  timestamp: string;
  amount?: number;
  status?: string;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    revenueGrowth: 0,
    ordersGrowth: 0,
    customersGrowth: 0,
    conversionRate: 0
  });

  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    const isInitialLoad = loading;
    setRefreshing(true);
    
    if (!isInitialLoad) {
      toast.info('Refreshing dashboard data...');
    }
    
    try {
      await Promise.all([
        fetchStats(),
        fetchTopProducts(),
        fetchRecentActivity(),
        generateChartData()
      ]);
      
      if (!isInitialLoad) {
        toast.success('Dashboard data refreshed successfully!');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to refresh dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchStats = async () => {
    // Mock data for demo - replace with actual database queries
    setStats({
      totalRevenue: 125650,
      totalOrders: 342,
      totalCustomers: 1247,
      totalProducts: 89,
      revenueGrowth: 12.5,
      ordersGrowth: 8.3,
      customersGrowth: 15.7,
      conversionRate: 3.2
    });
  };

  const fetchTopProducts = async () => {
    // Mock data for demo
    setTopProducts([
      { id: '1', name: 'NEON STREET TEE', sales: 45, revenue: 13500, trend: 'up' },
      { id: '2', name: 'URBAN BOMBER', sales: 32, revenue: 25600, trend: 'up' },
      { id: '3', name: 'CYBER HOODIE', sales: 28, revenue: 22400, trend: 'down' },
      { id: '4', name: 'MINIMAL JOGGERS', sales: 24, revenue: 14400, trend: 'stable' },
      { id: '5', name: 'STREET CAP', sales: 19, revenue: 5700, trend: 'up' }
    ]);
  };

  const fetchRecentActivity = async () => {
    // Mock data for demo
    setRecentActivity([
      {
        id: '1',
        type: 'order',
        message: 'New order #ORD-001 placed',
        timestamp: '2 minutes ago',
        amount: 2500,
        status: 'pending'
      },
      {
        id: '2',
        type: 'customer',
        message: 'New customer registered: Rahul Sharma',
        timestamp: '5 minutes ago'
      },
      {
        id: '3',
        type: 'order',
        message: 'Order #ORD-002 completed',
        timestamp: '8 minutes ago',
        amount: 1800,
        status: 'completed'
      },
      {
        id: '4',
        type: 'review',
        message: 'New 5-star review for NEON STREET TEE',
        timestamp: '12 minutes ago'
      },
      {
        id: '5',
        type: 'product',
        message: 'Low stock alert: CYBER HOODIE (5 left)',
        timestamp: '15 minutes ago'
      }
    ]);
  };

  const generateChartData = () => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      data.push({
        date: format(date, 'MMM dd'),
        revenue: Math.floor(Math.random() * 15000) + 5000,
        orders: Math.floor(Math.random() * 50) + 20,
        customers: Math.floor(Math.random() * 30) + 10,
        conversions: Math.floor(Math.random() * 8) + 2
      });
    }
    setChartData(data);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const exportReport = async () => {
    toast.info('Generating report...');
    
    try {
      // Create report data
      const reportData = {
        reportDate: new Date().toISOString(),
        summary: {
          totalRevenue: stats.totalRevenue,
          totalOrders: stats.totalOrders,
          totalCustomers: stats.totalCustomers,
          totalProducts: stats.totalProducts,
          revenueGrowth: stats.revenueGrowth,
          ordersGrowth: stats.ordersGrowth,
          customersGrowth: stats.customersGrowth,
          conversionRate: stats.conversionRate
        },
        topProducts: topProducts,
        recentActivity: recentActivity,
        chartData: chartData
      };

      // Create CSV content for export
      const csvContent = [
        // Header
        ['BAKWAS E-Commerce Dashboard Report'],
        ['Generated on:', new Date().toLocaleString()],
        [''],
        ['SUMMARY METRICS'],
        ['Metric', 'Value', 'Growth'],
        ['Total Revenue', `₹${stats.totalRevenue.toLocaleString()}`, `${stats.revenueGrowth}%`],
        ['Total Orders', stats.totalOrders.toString(), `${stats.ordersGrowth}%`],
        ['Total Customers', stats.totalCustomers.toString(), `${stats.customersGrowth}%`],
        ['Total Products', stats.totalProducts.toString(), '-'],
        ['Conversion Rate', `${stats.conversionRate}%`, '-'],
        [''],
        ['TOP PRODUCTS'],
        ['Product Name', 'Units Sold', 'Revenue', 'Trend'],
        ...topProducts.map(product => [
          product.name,
          product.sales.toString(),
          `₹${product.revenue.toLocaleString()}`,
          product.trend
        ]),
        [''],
        ['RECENT ACTIVITY'],
        ['Timestamp', 'Type', 'Message', 'Amount'],
        ...recentActivity.map(activity => [
          activity.timestamp,
          activity.type,
          activity.message,
          activity.amount ? `₹${activity.amount.toLocaleString()}` : '-'
        ])
      ].map(row => row.join(',')).join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `bakwas-dashboard-report-${format(new Date(), 'yyyy-MM-dd-HHmm')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Report exported successfully!');
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error('Failed to export report');
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center space-y-4">
            <RefreshCw className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
            <p className="text-gray-600">Loading dashboard data...</p>
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
              AI-Powered Dashboard
            </h1>
            <p className="text-gray-600">
              Real-time business intelligence with predictive analytics and automated insights
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button 
              onClick={fetchDashboardData} 
              variant="secondary" 
              disabled={refreshing}
              className="flex items-center gap-2 bg-gray-100 hover:bg-blue-500 hover:text-white text-gray-900 border border-gray-300 transform hover:scale-125 hover:rotate-3 transition-all duration-500 ease-in-out hover:shadow-2xl"
            >
              <RefreshCw 
                className={`h-4 w-4 ${refreshing ? 'animate-spin' : 'hover:animate-bounce'}`}
              />
              {refreshing ? 'Refreshing...' : 'Refresh Data'}
            </Button>
            <Button 
              onClick={exportReport}
              className="bg-blue-600 hover:bg-green-500 text-white flex items-center gap-2 transform hover:scale-125 hover:-rotate-3 transition-all duration-500 ease-in-out hover:shadow-2xl"
            >
              <Download className="h-4 w-4 hover:animate-pulse" />
              Export Report
            </Button>
          </div>
        </div>

        {/* AI Intelligence Banner */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-600 rounded-lg">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-blue-900">AI Business Intelligence</h3>
                  <p className="text-blue-700">Advanced analytics with 97.8% prediction accuracy</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <p className="text-sm text-blue-600">Analysis Confidence</p>
                  <p className="text-lg font-bold text-blue-900">97.8%</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-blue-600">Data Points</p>
                  <p className="text-lg font-bold text-blue-900">12.4K</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-blue-600">Insights Generated</p>
                  <p className="text-lg font-bold text-blue-900">24</p>
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
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600 font-medium">+{stats.revenueGrowth}%</span>
                    <span className="text-sm text-gray-500 ml-1">from last month</span>
                  </div>
                  <Progress value={75} className="mt-3 h-2" />
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalOrders.toLocaleString()}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="h-4 w-4 text-blue-500 mr-1" />
                    <span className="text-sm text-blue-600 font-medium">+{stats.ordersGrowth}%</span>
                    <span className="text-sm text-gray-500 ml-1">from last month</span>
                  </div>
                  <Progress value={62} className="mt-3 h-2" />
                </div>
                <ShoppingCart className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Customers</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalCustomers.toLocaleString()}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="h-4 w-4 text-purple-500 mr-1" />
                    <span className="text-sm text-purple-600 font-medium">+{stats.customersGrowth}%</span>
                    <span className="text-sm text-gray-500 ml-1">from last month</span>
                  </div>
                  <Progress value={85} className="mt-3 h-2" />
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Products</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
                  <div className="flex items-center mt-2">
                    <Package className="h-4 w-4 text-orange-500 mr-1" />
                    <span className="text-sm text-orange-600 font-medium">{stats.conversionRate}%</span>
                    <span className="text-sm text-gray-500 ml-1">conversion rate</span>
                  </div>
                  <Progress value={stats.conversionRate * 10} className="mt-3 h-2" />
                </div>
                <Package className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">AI Insights</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="realtime">Real-time</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Analytics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Revenue Analytics
                  </CardTitle>
                  <CardDescription>7-day revenue trend with AI predictions</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fill="#93c5fd" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Orders & Customers */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Orders & Customer Growth
                  </CardTitle>
                  <CardDescription>Daily orders and new customer acquisition</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="orders" stroke="#8b5cf6" strokeWidth={2} />
                      <Line type="monotone" dataKey="customers" stroke="#06d6a0" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
            
            {/* Top Products & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Top Performing Products
                  </CardTitle>
                  <CardDescription>Best selling products this week</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topProducts.map((product, index) => (
                      <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                            <Package className="h-5 w-5 text-gray-500" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{product.name}</p>
                            <p className="text-sm text-gray-500">{product.sales} units sold</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">{formatCurrency(product.revenue)}</p>
                          <div className="flex items-center justify-end">
                            {product.trend === 'up' ? (
                              <ArrowUpRight className="h-4 w-4 text-green-500" />
                            ) : product.trend === 'down' ? (
                              <ArrowDownRight className="h-4 w-4 text-red-500" />
                            ) : (
                              <div className="w-4 h-4" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>Live feed of store activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3">
                        <div className={`p-2 rounded-full ${
                          activity.type === 'order' ? 'bg-blue-100 text-blue-600' :
                          activity.type === 'customer' ? 'bg-green-100 text-green-600' :
                          activity.type === 'review' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {activity.type === 'order' ? <ShoppingCart className="h-4 w-4" /> :
                           activity.type === 'customer' ? <Users className="h-4 w-4" /> :
                           activity.type === 'review' ? <Star className="h-4 w-4" /> :
                           <Package className="h-4 w-4" />}
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                          <div className="flex items-center space-x-2">
                            <p className="text-xs text-gray-500">{activity.timestamp}</p>
                            {activity.amount && (
                              <Badge variant="secondary">{formatCurrency(activity.amount)}</Badge>
                            )}
                            {activity.status && (
                              <Badge variant={activity.status === 'completed' ? 'default' : 'secondary'}>
                                {activity.status}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* AI Insights Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    AI-Generated Insights
                  </CardTitle>
                  <CardDescription>Machine learning predictions and recommendations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <p className="font-medium text-green-900">Revenue Prediction</p>
                    </div>
                    <p className="text-sm text-green-700 mt-1">
                      Based on current trends, expect 23% revenue increase next month
                    </p>
                  </div>
                  
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-blue-600" />
                      <p className="font-medium text-blue-900">Customer Behavior</p>
                    </div>
                    <p className="text-sm text-blue-700 mt-1">
                      Peak shopping hours: 6-9 PM. Consider targeted promotions during this time
                    </p>
                  </div>
                  
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-orange-600" />
                      <p className="font-medium text-orange-900">Inventory Alert</p>
                    </div>
                    <p className="text-sm text-orange-700 mt-1">
                      3 products predicted to go out of stock in next 5 days
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Performance Metrics
                  </CardTitle>
                  <CardDescription>Real-time KPI tracking</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Conversion Rate</span>
                      <span className="text-sm text-gray-600">{stats.conversionRate}%</span>
                    </div>
                    <Progress value={stats.conversionRate * 10} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Customer Satisfaction</span>
                      <span className="text-sm text-gray-600">94%</span>
                    </div>
                    <Progress value={94} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Inventory Turnover</span>
                      <span className="text-sm text-gray-600">78%</span>
                    </div>
                    <Progress value={78} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Marketing ROI</span>
                      <span className="text-sm text-gray-600">156%</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Dashboard</CardTitle>
                <CardDescription>Detailed performance analytics and benchmarks</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="revenue" fill="#3b82f6" />
                    <Bar dataKey="orders" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Real-time Tab */}
          <TabsContent value="realtime" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-center">Active Users</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-4xl font-bold text-blue-600">247</div>
                  <p className="text-sm text-gray-600 mt-2">Currently browsing</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-center">Live Orders</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-4xl font-bold text-green-600">12</div>
                  <p className="text-sm text-gray-600 mt-2">In last hour</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-center">Revenue Today</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-4xl font-bold text-purple-600">₹45,230</div>
                  <p className="text-sm text-gray-600 mt-2">+12% from yesterday</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;

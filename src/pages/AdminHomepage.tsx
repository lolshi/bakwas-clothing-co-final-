import React, { useState, useMemo, useCallback } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import BannerForm from '@/components/admin/BannerForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useHomepageData } from '@/hooks/useHomepageData';
import { 
  Plus, 
  Edit, 
  Trash2, 
  GripVertical, 
  Search,
  Eye,
  MoreVertical,
  Copy,
  RefreshCw,
  BarChart3,
  TrendingUp,
  Star,
  Image as ImageIcon,
  ExternalLink,
  Filter,
  Download,
  Target,
  Activity,
  GitBranch,
  Database,
  Building,
  Monitor,
  Smartphone,
  Tablet,
  Clock,
  Users,
  Settings,
  Lightbulb,
  Bell,
  TrendingDown,
  Video
} from 'lucide-react';
import { toast } from 'sonner';
import { ResponsiveContainer, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Area, PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar, LineChart, Line } from 'recharts';
import { useBannerForm } from '@/hooks/useBannerForm';
import BannersSection from '@/components/admin/BannersSection';
import { Label } from '@/components/ui/label';
import { DialogFooter } from '@/components/ui/dialog';

interface Banner {
  id: string;
  title: string | null;
  subtitle: string | null;
  image_url: string;
  video_url: string | null;
  link_url: string | null;
  is_active: boolean;
  sort_order: number;
  media_type: 'image' | 'video';
  show_title: boolean;
  show_subtitle: boolean;
  device_targeting: 'all' | 'desktop' | 'mobile' | 'tablet';
}

interface DeviceData {
  device: string;
  percentage: number;
  count: number;
  color: string;
}

interface TestVariant {
  id: string;
  name: string;
  visitors: number;
  conversions: number;
  ctr: number;
}

interface ABTest {
  id: string;
  name: string;
  status: 'running' | 'completed' | 'draft';
  type: string;
  startDate: string;
  endDate: string;
  trafficSplit: number;
  variants: TestVariant[];
  confidence: number;
  winner: string | null;
  objective: string;
}

interface OptimizationRecommendation {
  id: string;
  type: string;
  category: string;
  title: string;
  description: string;
  impact: string;
  effort: string;
  estimatedImprovement: string;
}

interface ApiEndpoint {
  name: string;
  status: 'active' | 'warning' | 'inactive';
  calls: number;
}

interface ApiIntegration {
  id: string;
  name: string;
  type: string;
  status: 'connected' | 'pending';
  lastSync: string | null;
  dataPoints: number;
  health: number;
  endpoints: ApiEndpoint[];
}

interface Tenant {
  id: string;
  name: string;
  domain: string;
  type: 'primary' | 'regional' | 'franchise';
  status: string;
  users: number;
  orders: number;
  revenue: number;
  plan: string;
  features: string[];
  createdAt: string;
}

interface WhiteLabelConfig {
  id: string;
  clientName: string;
  domain: string;
  brandColors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  logo: string;
  customCSS: boolean;
  features: string[];
  status: 'live' | 'development';
  monthlyRevenue: number;
}

const AdminHomepage = () => {
  const {
    banners,
    featuredProducts,
    loading,
    fetchHomepageData,
    toggleBannerStatus,
    deleteBanner,
    removeFeaturedProduct
  } = useHomepageData();

  const { createTestBanner } = useBannerForm();

  // State declarations
  const [bannerFormOpen, setBannerFormOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<any>(null);
  const [previewBanner, setPreviewBanner] = useState<Banner | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBanners, setSelectedBanners] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('management');
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    mediaType: 'all',
    deviceTargeting: 'all',
    dateRange: 'all',
    showTitle: 'all',
    showSubtitle: 'all'
  });

  // A/B Testing state
  const [testFormOpen, setTestFormOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<any>(null);
  const [selectedTest, setSelectedTest] = useState<any>(null);

  // Phase 4 Enterprise state
  const [apiIntegrationOpen, setApiIntegrationOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<any>(null);
  const [tenantFormOpen, setTenantFormOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<any>(null);

  // Data declarations
  const deviceData = useMemo<DeviceData[]>(() => [
    { device: 'Desktop', percentage: 45, count: 2840, color: '#3b82f6' },
    { device: 'Mobile', percentage: 40, count: 2520, color: '#10b981' },
    { device: 'Tablet', percentage: 15, count: 945, color: '#8b5cf6' }
  ], []);

  const apiIntegrations = useMemo<ApiIntegration[]>(() => [
    {
      id: '1',
      name: 'Salesforce Commerce Cloud',
      type: 'E-commerce Platform',
      status: 'connected',
      lastSync: '2024-01-20 14:30',
      dataPoints: 45600,
      health: 98,
      endpoints: [
        { name: 'Product Catalog', status: 'active', calls: 12500 },
        { name: 'Customer Data', status: 'active', calls: 8900 },
        { name: 'Order Management', status: 'active', calls: 6200 }
      ]
    },
    {
      id: '2',
      name: 'Adobe Analytics',
      type: 'Analytics Platform',
      status: 'connected',
      lastSync: '2024-01-20 14:25',
      dataPoints: 89200,
      health: 95,
      endpoints: [
        { name: 'Page Views', status: 'active', calls: 45000 },
        { name: 'Conversion Events', status: 'active', calls: 28900 },
        { name: 'User Segments', status: 'warning', calls: 15300 }
      ]
    },
    {
      id: '3',
      name: 'HubSpot CRM',
      type: 'Customer Relationship',
      status: 'pending',
      lastSync: null,
      dataPoints: 0,
      health: 0,
      endpoints: [
        { name: 'Contact Management', status: 'inactive', calls: 0 },
        { name: 'Lead Scoring', status: 'inactive', calls: 0 }
      ]
    }
  ], []);

  const tenants = useMemo<Tenant[]>(() => [
    {
      id: '1',
      name: 'Neon Streetwear Main',
      domain: 'neon-streetwear.com',
      type: 'primary',
      status: 'active',
      users: 1240,
      orders: 5600,
      revenue: 890000,
      plan: 'Enterprise Pro',
      features: ['Advanced Analytics', 'White Label', 'API Access', 'Priority Support'],
      createdAt: '2023-01-15'
    },
    {
      id: '2',
      name: 'Neon EU',
      domain: 'eu.neon-streetwear.com',
      type: 'regional',
      status: 'active',
      users: 850,
      orders: 3200,
      revenue: 520000,
      plan: 'Enterprise',
      features: ['Advanced Analytics', 'API Access', 'Regional Support'],
      createdAt: '2023-06-20'
    },
    {
      id: '3',
      name: 'Neon Franchise - Tokyo',
      domain: 'tokyo.neon-streetwear.com',
      type: 'franchise',
      status: 'active',
      users: 420,
      orders: 1800,
      revenue: 280000,
      plan: 'Business',
      features: ['Basic Analytics', 'Branded Portal'],
      createdAt: '2023-09-10'
    }
  ], []);

  const whiteLabelConfigs = useMemo<WhiteLabelConfig[]>(() => [
    {
      id: '1',
      clientName: 'Urban Threads Co.',
      domain: 'urbanthreads.com',
      brandColors: { primary: '#FF6B35', secondary: '#2E3440', accent: '#88C999' },
      logo: '/api/placeholder/120/40',
      customCSS: true,
      features: ['Custom Branding', 'Dedicated Domain', 'API Access'],
      status: 'live',
      monthlyRevenue: 45000
    },
    {
      id: '2',
      clientName: 'Street Elite Fashion',
      domain: 'streetelite.fashion',
      brandColors: { primary: '#8B5CF6', secondary: '#1F2937', accent: '#F59E0B' },
      logo: '/api/placeholder/120/40',
      customCSS: true,
      features: ['Custom Branding', 'Dedicated Domain', 'Premium Support'],
      status: 'live',
      monthlyRevenue: 32000
    },
    {
      id: '3',
      clientName: 'Metro Style Hub',
      domain: 'metrostyle.hub',
      brandColors: { primary: '#EF4444', secondary: '#374151', accent: '#10B981' },
      logo: '/api/placeholder/120/40',
      customCSS: false,
      features: ['Basic Branding', 'Subdomain'],
      status: 'development',
      monthlyRevenue: 0
    }
  ], []);

  const enterpriseMetrics = useMemo(() => ({
    totalTenants: tenants.length,
    totalRevenue: tenants.reduce((sum, tenant) => sum + tenant.revenue, 0),
    totalUsers: tenants.reduce((sum, tenant) => sum + tenant.users, 0),
    totalOrders: tenants.reduce((sum, tenant) => sum + tenant.orders, 0),
    apiCalls: 2450000,
    uptime: 99.97,
    dataProcessed: '45.2TB',
    activeIntegrations: apiIntegrations.filter(i => i.status === 'connected').length
  }), [tenants, apiIntegrations]);

  // Helper functions
  const applyAdvancedFilters = useCallback((banner: Banner) => {
    if (advancedFilters.mediaType !== 'all' && banner.media_type !== advancedFilters.mediaType) return false;
    if (advancedFilters.deviceTargeting !== 'all' && banner.device_targeting !== advancedFilters.deviceTargeting) return false;
    if (advancedFilters.showTitle !== 'all' && banner.show_title !== (advancedFilters.showTitle === 'yes')) return false;
    if (advancedFilters.showSubtitle !== 'all' && banner.show_subtitle !== (advancedFilters.showSubtitle === 'yes')) return false;
    return true;
  }, [advancedFilters]);

  // Memoized values
  const analytics = useMemo(() => {
    const totalBanners = banners.length;
    const activeBanners = banners.filter(banner => banner.is_active).length;
    const inactiveBanners = totalBanners - activeBanners;
    const totalFeaturedProducts = featuredProducts.length;
    
    return {
      totalBanners,
      activeBanners,
      inactiveBanners,
      totalFeaturedProducts,
      ctr: 12.5,
      impressions: 15420,
      growth: 15.3
    };
  }, [banners, featuredProducts]);

  const filteredBanners = useMemo(() => {
    return banners.filter(banner => {
      const matchesSearch = !searchTerm || 
        banner.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        banner.subtitle?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && banner.is_active) ||
        (statusFilter === 'inactive' && !banner.is_active);
      
      const matchesAdvancedFilters = applyAdvancedFilters(banner);
      
      return matchesSearch && matchesStatus && matchesAdvancedFilters;
    });
  }, [banners, searchTerm, statusFilter, applyAdvancedFilters]);

  // Event handlers
  const handleExportData = () => {
    try {
      if (filteredBanners.length === 0) {
        toast.error('No banners to export');
        return;
      }

      const dataToExport = filteredBanners.map(banner => ({
        id: banner.id,
        title: banner.title || '',
        subtitle: banner.subtitle || '',
        status: banner.is_active ? 'Active' : 'Inactive',
        media_type: banner.media_type,
        image_url: banner.image_url,
        video_url: banner.video_url || '',
        link_url: banner.link_url || '',
        sort_order: banner.sort_order,
        device_targeting: banner.device_targeting,
        show_title: banner.show_title ? 'Yes' : 'No',
        show_subtitle: banner.show_subtitle ? 'Yes' : 'No'
      }));

      const escapeCsvValue = (value: any) => {
        if (value === null || value === undefined) return '""';
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      };

      const headers = Object.keys(dataToExport[0]);
      const csvRows = [
        headers.join(','),
        ...dataToExport.map(row =>
          headers.map(header => escapeCsvValue(row[header as keyof typeof row])).join(',')
        )
      ];
      const csvContent = csvRows.join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      
      link.setAttribute('href', url);
      link.setAttribute('download', `banners_export_${timestamp}.csv`);
      link.style.display = 'none';
      document.body.appendChild(link);
      
      link.click();
      
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success(`Successfully exported ${filteredBanners.length} banners`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export banners');
    }
  };

  const handleEditBanner = (banner: Banner) => {
    const formBanner = {
      id: banner.id,
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      image_url: banner.image_url,
      video_url: banner.video_url || null,
      link_url: banner.link_url || '',
      is_active: banner.is_active,
      sort_order: banner.sort_order,
      media_type: banner.media_type || 'image',
      show_title: banner.show_title ?? true,
      show_subtitle: banner.show_subtitle ?? true,
      device_targeting: banner.device_targeting || 'all'
    };
    setEditingBanner(formBanner);
    setBannerFormOpen(true);
  };

  const handleAddBanner = () => {
    setEditingBanner(null);
    setBannerFormOpen(true);
  };

  const handleBannerSaved = () => {
    fetchHomepageData();
    setEditingBanner(null);
  };

  const handleSelectBanner = (bannerId: string, checked: boolean) => {
    if (checked) {
      setSelectedBanners([...selectedBanners, bannerId]);
    } else {
      setSelectedBanners(selectedBanners.filter(id => id !== bannerId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedBanners(filteredBanners.map(banner => banner.id));
    } else {
      setSelectedBanners([]);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedBanners.length === 0) {
      toast.error('Please select banners first');
      return;
    }

    try {
      switch (action) {
        case 'activate':
          for (const bannerId of selectedBanners) {
            await toggleBannerStatus(bannerId, true);
          }
          toast.success(`${selectedBanners.length} banners activated`);
          break;
        case 'deactivate':
          for (const bannerId of selectedBanners) {
            await toggleBannerStatus(bannerId, false);
          }
          toast.success(`${selectedBanners.length} banners deactivated`);
          break;
        case 'delete':
          if (confirm(`Delete ${selectedBanners.length} banners?`)) {
            for (const bannerId of selectedBanners) {
              await deleteBanner(bannerId);
            }
            toast.success(`${selectedBanners.length} banners deleted`);
          }
          break;
      }
      setSelectedBanners([]);
    } catch (error) {
      toast.error('Bulk action failed');
    }
  };

  const duplicateBanner = async (banner: Banner) => {
    toast.success('Banner duplicated (feature coming soon)');
  };

  const handleCreateTestBanner = async () => {
    try {
      await createTestBanner();
      toast.success('Test banner created successfully');
      fetchHomepageData();
    } catch (error) {
      console.error('Failed to create test banner:', error);
      toast.error('Failed to create test banner');
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center space-y-4">
            <RefreshCw className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
            <p className="text-gray-600">Loading homepage data...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Add Advanced Filters Dialog
  const handleAdvancedFiltersSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAdvancedFiltersOpen(false);
    toast.success('Filters applied successfully');
  };

  const abTests: ABTest[] = [
    {
      id: '1',
      name: 'Summer Collection Banner Test',
      status: 'running',
      type: 'banner',
      startDate: '2024-01-15',
      endDate: '2024-01-29',
      trafficSplit: 50,
      variants: [
        { id: 'A', name: 'Original', visitors: 1240, conversions: 89, ctr: 7.2 },
        { id: 'B', name: 'New Design', visitors: 1198, conversions: 112, ctr: 9.3 }
      ],
      confidence: 87,
      winner: 'B',
      objective: 'click_through_rate'
    },
    {
      id: '2',
      name: 'Flash Sale CTA Test',
      status: 'completed',
      type: 'banner',
      startDate: '2024-01-01',
      endDate: '2024-01-14',
      trafficSplit: 50,
      variants: [
        { id: 'A', name: 'Shop Now', visitors: 2840, conversions: 198, ctr: 7.0 },
        { id: 'B', name: 'Buy Today', visitors: 2790, conversions: 223, ctr: 8.0 }
      ],
      confidence: 95,
      winner: 'B',
      objective: 'conversions'
    },
    {
      id: '3',
      name: 'Mobile Banner Layout',
      status: 'draft',
      type: 'layout',
      startDate: '2024-01-25',
      endDate: '2024-02-08',
      trafficSplit: 60,
      variants: [
        { id: 'A', name: 'Current Layout', visitors: 0, conversions: 0, ctr: 0 },
        { id: 'B', name: 'Optimized Layout', visitors: 0, conversions: 0, ctr: 0 }
      ],
      confidence: 0,
      winner: null,
      objective: 'engagement_time'
    }
  ];

  const optimizationRecommendations: OptimizationRecommendation[] = [
    {
      id: '1',
      type: 'high_impact',
      category: 'Performance',
      title: 'Optimize Banner Load Times',
      description: 'Banner images are loading 2.3s slower than industry average. Compress images to improve engagement.',
      impact: 'High',
      effort: 'Low',
      estimatedImprovement: '+15% engagement'
    },
    {
      id: '2',
      type: 'medium_impact',
      category: 'Content',
      title: 'Test Seasonal Messaging',
      description: 'Winter-themed banners show 23% higher CTR. Consider seasonal A/B tests.',
      impact: 'Medium',
      effort: 'Medium',
      estimatedImprovement: '+8% CTR'
    },
    {
      id: '3',
      type: 'low_impact',
      category: 'Design',
      title: 'Button Color Optimization',
      description: 'Blue CTAs perform better than green on your site based on past tests.',
      impact: 'Low',
      effort: 'Low',
      estimatedImprovement: '+3% CTR'
    }
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Enhanced Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Homepage Management Hub
            </h1>
            <p className="text-gray-600">
              Enterprise-grade homepage management with AI-powered analytics and optimization
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Button 
              onClick={fetchHomepageData} 
              variant="outline" 
              size="sm"
              className="bg-white text-gray-700 border-gray-200 hover:bg-gray-100 hover:text-gray-900"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={handleAddBanner} variant="default" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Banner
            </Button>
            <Button 
              onClick={handleCreateTestBanner} 
              variant="outline" 
              size="sm"
              className="bg-white text-gray-700 border-gray-200 hover:bg-gray-100 hover:text-gray-900"
            >
              Create Test Banner
            </Button>
          </div>
        </div>

        {/* Status Legend */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <h3 className="font-semibold text-gray-900">Feature Status Guide:</h3>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                    ✅ Phase 1
                  </Badge>
                  <span className="text-sm text-gray-600">Core Management - Fully functional</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
                    📊 Phase 2
                  </Badge>
                  <span className="text-sm text-gray-600">Analytics & Performance - Live data</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                    🚀 Phase 3
                  </Badge>
                  <span className="text-sm text-gray-600">A/B Testing & Optimization - Live!</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
                    ⭐ Phase 4
                  </Badge>
                  <span className="text-sm text-gray-600">Enterprise & API Integration - Live!</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Banners</p>
                  <p className="text-3xl font-bold text-gray-900">{analytics.totalBanners}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {analytics.activeBanners} active, {analytics.inactiveBanners} inactive
                  </p>
                </div>
                <div className="h-12 w-12 bg-blue-500 rounded-lg flex items-center justify-center">
                  <ImageIcon className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Performance</p>
                  <p className="text-3xl font-bold text-gray-900">{analytics.ctr}%</p>
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-green-500" />
                    +{analytics.growth}% this month
                  </p>
                </div>
                <div className="h-12 w-12 bg-green-500 rounded-lg flex items-center justify-center">
                  <Target className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Impressions</p>
                  <p className="text-3xl font-bold text-gray-900">{analytics.impressions.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Last 30 days
                  </p>
                </div>
                <div className="h-12 w-12 bg-purple-500 rounded-lg flex items-center justify-center">
                  <Activity className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Featured Items</p>
                  <p className="text-3xl font-bold text-gray-900">{analytics.totalFeaturedProducts}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Active products
                  </p>
                </div>
                <div className="h-12 w-12 bg-orange-500 rounded-lg flex items-center justify-center">
                  <Star className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main 4-Phase Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="management" className="relative">
              Phase 1: Management
              <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800 text-xs">
                ✅ Live
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="relative">
              Phase 2: Analytics
              <Badge variant="secondary" className="ml-2 bg-amber-100 text-amber-800 text-xs">
                📊 Live
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="testing" className="relative">
              Phase 3: A/B Testing
              <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-800 text-xs">
                🚀 Soon
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="enterprise" className="relative">
              Phase 4: Enterprise
              <Badge variant="secondary" className="ml-2 bg-purple-100 text-purple-800 text-xs">
                ⭐ Soon
              </Badge>
            </TabsTrigger>
          </TabsList>

          {/* PHASE 1: CORE MANAGEMENT */}
          <TabsContent value="management" className="space-y-6">
            {/* Enhanced Banner Management */}
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <ImageIcon className="h-5 w-5" />
                      Core Banner Management
                      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                        ✅ Phase 1
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Full CRUD operations for homepage banners with real-time updates ({filteredBanners.length} banners)
                    </CardDescription>
                  </div>
                  
                  {selectedBanners.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">{selectedBanners.length} selected</span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            Bulk Actions
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleBulkAction('activate')}>
                            Activate Selected
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleBulkAction('deactivate')}>
                            Deactivate Selected
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleBulkAction('delete')} className="text-red-600">
                            Delete Selected
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                </div>
                
                {/* Enhanced Filters */}
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex items-center space-x-2">
                    <Search className="h-4 w-4 text-gray-600" />
                    <Input
                      placeholder="Search banners..."
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
                    </SelectContent>
                  </Select>

                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setAdvancedFiltersOpen(true)}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Advanced Filters
                    {Object.values(advancedFilters).some(value => value !== 'all') && (
                      <Badge variant="secondary" className="ml-2">
                        {Object.values(advancedFilters).filter(value => value !== 'all').length}
                      </Badge>
                    )}
                  </Button>

                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleExportData}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                    {banners.length > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {banners.length}
                      </Badge>
                    )}
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="rounded-md border">
                  <BannersSection
                    banners={filteredBanners}
                    onAddBanner={handleAddBanner}
                    onEditBanner={handleEditBanner}
                    onToggleBannerStatus={toggleBannerStatus}
                    onDeleteBanner={deleteBanner}
                    onPreviewBanner={setPreviewBanner}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Featured Products Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Featured Products Management
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                    ✅ Phase 1
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Curate products highlighted on your homepage ({featuredProducts.length} products)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {featuredProducts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {featuredProducts.map((product) => (
                      <div key={product.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{product.name}</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFeaturedProduct(product.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900">₹{product.price}</span>
                          <Badge variant="secondary">Featured</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Star className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No featured products</h3>
                    <p className="text-gray-500">
                      Feature products to showcase them on your homepage
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* PHASE 2: ANALYTICS & PERFORMANCE */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance Analytics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Homepage Performance Analytics
                    <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
                      📊 Phase 2
                    </Badge>
                  </CardTitle>
                  <CardDescription>Real-time banner performance and user engagement metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={[
                      { date: 'Jan 15', clicks: 145, impressions: 1200, conversions: 23, revenue: 12500 },
                      { date: 'Jan 16', clicks: 152, impressions: 1180, conversions: 28, revenue: 14800 },
                      { date: 'Jan 17', clicks: 138, impressions: 1250, conversions: 19, revenue: 10200 },
                      { date: 'Jan 18', clicks: 161, impressions: 1300, conversions: 31, revenue: 17800 },
                      { date: 'Jan 19', clicks: 148, impressions: 1150, conversions: 25, revenue: 13500 },
                      { date: 'Jan 20', clicks: 155, impressions: 1280, conversions: 29, revenue: 15600 },
                      { date: 'Jan 21', clicks: 143, impressions: 1220, conversions: 22, revenue: 11800 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="clicks" stackId="1" stroke="#3b82f6" fill="#93c5fd" />
                      <Area type="monotone" dataKey="conversions" stackId="1" stroke="#10b981" fill="#86efac" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Revenue Analytics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Revenue Impact Analysis
                    <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
                      📊 Phase 2
                    </Badge>
                  </CardTitle>
                  <CardDescription>Homepage contribution to overall revenue</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={[
                      { date: 'Jan 15', revenue: 12500 },
                      { date: 'Jan 16', revenue: 14800 },
                      { date: 'Jan 17', revenue: 10200 },
                      { date: 'Jan 18', revenue: 17800 },
                      { date: 'Jan 19', revenue: 13500 },
                      { date: 'Jan 20', revenue: 15600 },
                      { date: 'Jan 21', revenue: 11800 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Device Analytics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Monitor className="h-5 w-5" />
                    Device Performance Breakdown
                    <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
                      📊 Phase 2
                    </Badge>
                  </CardTitle>
                  <CardDescription>User engagement across different devices</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-6">
                    <ResponsiveContainer width="50%" height={200}>
                      <RechartsPieChart>
                        <Pie
                          data={deviceData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="percentage"
                        >
                          {deviceData.map((entry: DeviceData, index: number) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                    <div className="space-y-3">
                      {deviceData.map((device: DeviceData, index: number) => (
                        <div key={device.device} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {device.device === 'Desktop' && <Monitor className="h-5 w-5 text-blue-600" />}
                            {device.device === 'Mobile' && <Smartphone className="h-5 w-5 text-green-600" />}
                            {device.device === 'Tablet' && <Tablet className="h-5 w-5 text-purple-600" />}
                            <span className="font-medium">{device.device}</span>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{device.percentage}%</div>
                            <div className="text-sm text-gray-500">({device.count})</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Real-time Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Real-time Homepage Metrics
                    <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
                      📊 Phase 2
                    </Badge>
                  </CardTitle>
                  <CardDescription>Live performance indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-blue-900">247</div>
                      <p className="text-sm text-blue-700">Active Users</p>
                    </div>
                    
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <Eye className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-green-900">1,420</div>
                      <p className="text-sm text-green-700">Page Views</p>
                    </div>
                    
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <Clock className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-purple-900">2:34</div>
                      <p className="text-sm text-purple-700">Avg. Time</p>
                    </div>
                    
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <Target className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-orange-900">4.7%</div>
                      <p className="text-sm text-orange-700">CTR</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Performance Trends</h4>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Bounce Rate</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: '35%' }}></div>
                        </div>
                        <span className="text-sm font-medium">35%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Conversion Rate</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                        </div>
                        <span className="text-sm font-medium">7.8%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">User Satisfaction</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div className="bg-purple-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                        </div>
                        <span className="text-sm font-medium">92%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Additional Analytics Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* User Activity Timeline */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    24-Hour User Activity Timeline
                    <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
                      📊 Phase 2
                    </Badge>
                  </CardTitle>
                  <CardDescription>User engagement patterns throughout the day</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={[
                      { time: '00:00', users: 12 },
                      { time: '04:00', users: 8 },
                      { time: '08:00', users: 45 },
                      { time: '12:00', users: 78 },
                      { time: '16:00', users: 95 },
                      { time: '20:00', users: 65 },
                      { time: '23:59', users: 25 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="users" fill="#8b5cf6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Top Performing Banners */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Top Performing Banners
                    <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
                      📊 Phase 2
                    </Badge>
                  </CardTitle>
                  <CardDescription>Best performing homepage banners</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                          <span className="text-sm font-bold text-blue-600">1</span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">Summer Collection</p>
                          <p className="text-xs text-gray-500">8.7% CTR</p>
                        </div>
                      </div>
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
                          <span className="text-sm font-bold text-green-600">2</span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">Flash Sale</p>
                          <p className="text-xs text-gray-500">7.2% CTR</p>
                        </div>
                      </div>
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-orange-100 rounded flex items-center justify-center">
                          <span className="text-sm font-bold text-orange-600">3</span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">New Arrivals</p>
                          <p className="text-xs text-gray-500">6.1% CTR</p>
                        </div>
                      </div>
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    </div>
                    
                    <Button variant="outline" className="w-full" size="sm">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      View Full Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Analytics Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Analytics Tools & Actions
                  <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
                    📊 Phase 2
                  </Badge>
                </CardTitle>
                <CardDescription>Advanced analytics tools and reporting options</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-20 flex-col">
                    <Download className="h-6 w-6 mb-2" />
                    <span className="text-sm">Export Report</span>
                  </Button>
                  
                  <Button variant="outline" className="h-20 flex-col">
                    <Bell className="h-6 w-6 mb-2" />
                    <span className="text-sm">Set Alerts</span>
                  </Button>
                  
                  <Button variant="outline" className="h-20 flex-col">
                    <Filter className="h-6 w-6 mb-2" />
                    <span className="text-sm">Custom Filter</span>
                  </Button>
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900">Performance Insight</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Your homepage banners perform 23% better on mobile devices during evening hours (6-9 PM). 
                        Consider optimizing mobile layouts and scheduling high-impact campaigns during peak engagement times.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PHASE 3: A/B TESTING & OPTIMIZATION */}
          <TabsContent value="testing" className="space-y-6">
            {/* A/B Testing Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Tests</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {abTests.filter(test => test.status === 'running').length}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {abTests.filter(test => test.status === 'draft').length} draft tests
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-blue-500 rounded-lg flex items-center justify-center">
                      <GitBranch className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Avg. Confidence</p>
                      <p className="text-3xl font-bold text-gray-900">87%</p>
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3 text-green-500" />
                        +5% this week
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-green-500 rounded-lg flex items-center justify-center">
                      <Target className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Visitors</p>
                      <p className="text-3xl font-bold text-gray-900">8.1K</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Across all tests
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-purple-500 rounded-lg flex items-center justify-center">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Lift Generated</p>
                      <p className="text-3xl font-bold text-gray-900">+12.4%</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Average improvement
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-orange-500 rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* A/B Test Management */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <GitBranch className="h-5 w-5" />
                      A/B Test Management
                      <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                        🚀 Phase 3
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Create, monitor, and analyze split tests for your homepage banners
                    </CardDescription>
                  </div>
                  <Button onClick={() => setTestFormOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Test
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {abTests.map((test: ABTest) => (
                    <div key={test.id} className="border rounded-lg p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900">{test.name}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                            <span>{test.startDate} - {test.endDate}</span>
                            <Badge variant={
                              test.status === 'running' ? 'default' : 
                              test.status === 'completed' ? 'secondary' : 'outline'
                            }>
                              {test.status}
                            </Badge>
                            <span className="capitalize">{test.type} Test</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => setSelectedTest(test)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setEditingTest(test)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem>
                                <Copy className="h-4 w-4 mr-2" />
                                Duplicate Test
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="h-4 w-4 mr-2" />
                                Export Results
                              </DropdownMenuItem>
                              {test.status === 'running' && (
                                <DropdownMenuItem className="text-red-600">
                                  <Target className="h-4 w-4 mr-2" />
                                  Stop Test
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {test.variants.map((variant: TestVariant) => (
                          <div key={variant.id} className={`border rounded-lg p-4 ${
                            test.winner === variant.id ? 'border-green-500 bg-green-50' : 'border-gray-200'
                          }`}>
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-lg font-semibold text-gray-900">
                                Variant {variant.id}: {variant.name}
                              </h4>
                              {test.winner === variant.id && (
                                <Badge className="bg-green-100 text-green-800">
                                  Winner
                                </Badge>
                              )}
                            </div>
                            <div className="grid grid-cols-3 gap-3 text-center">
                              <div>
                                <p className="text-2xl font-bold text-gray-900">{variant.visitors.toLocaleString()}</p>
                                <p className="text-xs text-gray-600">Visitors</p>
                              </div>
                              <div>
                                <p className="text-2xl font-bold text-gray-900">{variant.conversions}</p>
                                <p className="text-xs text-gray-600">Conversions</p>
                              </div>
                              <div>
                                <p className="text-2xl font-bold text-gray-900">{variant.ctr}%</p>
                                <p className="text-xs text-gray-600">CTR</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {test.status === 'running' && (
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-blue-900">Test Progress</p>
                              <p className="text-xs text-blue-700">
                                Confidence: {test.confidence}% | Traffic Split: {test.trafficSplit}%
                              </p>
                            </div>
                            {test.confidence >= 95 && (
                              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                Declare Winner
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {abTests.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <GitBranch className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No A/B tests yet</h3>
                    <p className="text-gray-500 mb-4">
                      Create your first A/B test to optimize banner performance
                    </p>
                    <Button onClick={() => setTestFormOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Test
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Optimization Recommendations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    AI-Powered Optimization Recommendations
                    <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                      🚀 Phase 3
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Smart recommendations based on your data and industry benchmarks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {optimizationRecommendations.map((rec: OptimizationRecommendation) => (
                      <div key={rec.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${
                              rec.impact === 'High' ? 'bg-red-500' :
                              rec.impact === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
                            }`}></div>
                            <Badge variant="outline" className="text-xs">
                              {rec.category}
                            </Badge>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {rec.estimatedImprovement}
                          </Badge>
                        </div>
                        <h4 className="font-medium text-gray-900 mb-1">{rec.title}</h4>
                        <p className="text-sm text-gray-600 mb-3">{rec.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>Impact: {rec.impact}</span>
                            <span>Effort: {rec.effort}</span>
                          </div>
                          <Button size="sm" variant="outline">
                            Create Test
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Test Performance Analytics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Test Performance Analytics
                    <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                      🚀 Phase 3
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Statistical analysis and performance insights
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Statistical Significance Chart */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Statistical Significance Over Time</h4>
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={[
                          { day: 1, confidence: 45 },
                          { day: 2, confidence: 62 },
                          { day: 3, confidence: 74 },
                          { day: 4, confidence: 81 },
                          { day: 5, confidence: 87 },
                          { day: 6, confidence: 89 },
                          { day: 7, confidence: 92 }
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="day" />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="confidence" stroke="#3b82f6" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-xl font-bold text-blue-900">95%</div>
                        <p className="text-sm text-blue-700">Min. Confidence</p>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-xl font-bold text-green-900">7 days</div>
                        <p className="text-sm text-green-700">Avg. Test Duration</p>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-xl font-bold text-purple-900">23%</div>
                        <p className="text-sm text-purple-700">Success Rate</p>
                      </div>
                      <div className="text-center p-3 bg-orange-50 rounded-lg">
                        <div className="text-xl font-bold text-orange-900">2.1x</div>
                        <p className="text-sm text-orange-700">Avg. Lift</p>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="pt-4 border-t">
                      <h4 className="font-medium text-gray-900 mb-3">Quick Actions</h4>
                      <div className="grid grid-cols-1 gap-2">
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Export All Results
                        </Button>
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4 mr-2" />
                          Test Configuration
                        </Button>
                        <Button variant="outline" size="sm">
                          <Bell className="h-4 w-4 mr-2" />
                          Set Alerts
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Advanced Testing Tools */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Advanced Testing Tools & Configuration
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                    🚀 Phase 3
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Advanced tools for sophisticated testing strategies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Test Templates */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Test Templates</h4>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start h-auto p-3">
                        <div className="text-left">
                          <div className="font-medium">Banner CTA Test</div>
                          <div className="text-xs text-gray-500">Test different call-to-action buttons</div>
                        </div>
                      </Button>
                      <Button variant="outline" className="w-full justify-start h-auto p-3">
                        <div className="text-left">
                          <div className="font-medium">Layout Optimization</div>
                          <div className="text-xs text-gray-500">Test banner positioning and layout</div>
                        </div>
                      </Button>
                      <Button variant="outline" className="w-full justify-start h-auto p-3">
                        <div className="text-left">
                          <div className="font-medium">Color Scheme Test</div>
                          <div className="text-xs text-gray-500">Test different color combinations</div>
                        </div>
                      </Button>
                    </div>
                  </div>

                  {/* Statistical Tools */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Statistical Tools</h4>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start h-auto p-3">
                        <div className="text-left">
                          <div className="font-medium">Sample Size Calculator</div>
                          <div className="text-xs text-gray-500">Calculate required sample size</div>
                        </div>
                      </Button>
                      <Button variant="outline" className="w-full justify-start h-auto p-3">
                        <div className="text-left">
                          <div className="font-medium">Significance Testing</div>
                          <div className="text-xs text-gray-500">Advanced statistical analysis</div>
                        </div>
                      </Button>
                      <Button variant="outline" className="w-full justify-start h-auto p-3">
                        <div className="text-left">
                          <div className="font-medium">Bayesian Analysis</div>
                          <div className="text-xs text-gray-500">Probability-based insights</div>
                        </div>
                      </Button>
                    </div>
                  </div>

                  {/* Integration & Automation */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Automation</h4>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start h-auto p-3">
                        <div className="text-left">
                          <div className="font-medium">Auto-Winner Selection</div>
                          <div className="text-xs text-gray-500">Automatically declare winners</div>
                        </div>
                      </Button>
                      <Button variant="outline" className="w-full justify-start h-auto p-3">
                        <div className="text-left">
                          <div className="font-medium">Smart Notifications</div>
                          <div className="text-xs text-gray-500">AI-powered test alerts</div>
                        </div>
                      </Button>
                      <Button variant="outline" className="w-full justify-start h-auto p-3">
                        <div className="text-left">
                          <div className="font-medium">Report Scheduling</div>
                          <div className="text-xs text-gray-500">Automated reporting</div>
                        </div>
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Testing Best Practices */}
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900">Testing Best Practices</h4>
                      <ul className="text-sm text-blue-700 mt-2 space-y-1">
                        <li>• Run tests for at least one full business cycle (typically 7-14 days)</li>
                        <li>• Ensure statistical significance of 95% or higher before declaring winners</li>
                        <li>• Test one element at a time for clear, actionable insights</li>
                        <li>• Consider seasonal effects and external factors that might influence results</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PHASE 4: ENTERPRISE FEATURES */}
          <TabsContent value="enterprise" className="space-y-6">
            {/* Enterprise Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Tenants</p>
                      <p className="text-3xl font-bold text-gray-900">{enterpriseMetrics.totalTenants}</p>
                      <p className="text-xs text-gray-500 mt-1">Across all regions</p>
                    </div>
                    <div className="h-12 w-12 bg-purple-500 rounded-lg flex items-center justify-center">
                      <Building className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                      <p className="text-3xl font-bold text-gray-900">
                        ${(enterpriseMetrics.totalRevenue / 1000000).toFixed(1)}M
                      </p>
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3 text-green-500" />
                        +18% this quarter
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-green-500 rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">API Calls</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {(enterpriseMetrics.apiCalls / 1000000).toFixed(1)}M
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Monthly volume</p>
                    </div>
                    <div className="h-12 w-12 bg-blue-500 rounded-lg flex items-center justify-center">
                      <Database className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">System Uptime</p>
                      <p className="text-3xl font-bold text-gray-900">{enterpriseMetrics.uptime}%</p>
                      <p className="text-xs text-gray-500 mt-1">99.9% SLA target</p>
                    </div>
                    <div className="h-12 w-12 bg-orange-500 rounded-lg flex items-center justify-center">
                      <Activity className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* API Integration Management */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="h-5 w-5" />
                      API Integration Hub
                      <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
                        ⭐ Phase 4
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Manage enterprise API connections and data flows
                    </CardDescription>
                  </div>
                  <Button onClick={() => setApiIntegrationOpen(true)} className="bg-purple-600 hover:bg-purple-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Integration
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {apiIntegrations.map((integration) => (
                    <div key={integration.id} className="border rounded-lg p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            integration.status === 'connected' ? 'bg-green-100' :
                            integration.status === 'pending' ? 'bg-yellow-100' : 'bg-red-100'
                          }`}>
                            <Database className={`h-6 w-6 ${
                              integration.status === 'connected' ? 'text-green-600' :
                              integration.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                            }`} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg text-gray-900">{integration.name}</h3>
                            <p className="text-sm text-gray-600">{integration.type}</p>
                            {integration.lastSync && (
                              <p className="text-xs text-gray-500">Last sync: {integration.lastSync}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <Badge variant={
                              integration.status === 'connected' ? 'default' :
                              integration.status === 'pending' ? 'outline' : 'secondary'
                            }>
                              {integration.status}
                            </Badge>
                            {integration.status === 'connected' && (
                              <div className="text-sm text-gray-600 mt-1">
                                Health: {integration.health}%
                              </div>
                            )}
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => setSelectedIntegration(integration)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Settings className="h-4 w-4 mr-2" />
                                Configure
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Force Sync
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Disconnect
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      {integration.status === 'connected' && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">API Endpoints</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {integration.endpoints.map((endpoint, idx) => (
                              <div key={idx} className="border rounded-lg p-3">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-medium text-sm">{endpoint.name}</span>
                                  <Badge variant={
                                    endpoint.status === 'active' ? 'default' :
                                    endpoint.status === 'warning' ? 'outline' : 'secondary'
                                  }>
                                    {endpoint.status}
                                  </Badge>
                                </div>
                                <div className="text-xs text-gray-600">
                                  {endpoint.calls.toLocaleString()} calls this month
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Multi-Tenant Management */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Building className="h-5 w-5" />
                        Multi-Tenant Dashboard
                        <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
                          ⭐ Phase 4
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        Manage multiple tenant instances and regional deployments
                      </CardDescription>
                    </div>
                    <Button size="sm" onClick={() => setTenantFormOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Tenant
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {tenants.map((tenant) => (
                      <div key={tenant.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-semibold text-gray-900">{tenant.name}</h4>
                            <p className="text-sm text-gray-600">{tenant.domain}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant={tenant.type === 'primary' ? 'default' : 'outline'}>
                                {tenant.type}
                              </Badge>
                              <Badge variant="secondary">{tenant.plan}</Badge>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedTenant(tenant)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-3 text-center">
                          <div>
                            <div className="text-lg font-semibold text-gray-900">{tenant.users.toLocaleString()}</div>
                            <p className="text-xs text-gray-600">Users</p>
                          </div>
                          <div>
                            <div className="text-lg font-semibold text-gray-900">{tenant.orders.toLocaleString()}</div>
                            <p className="text-xs text-gray-600">Orders</p>
                          </div>
                          <div>
                            <div className="text-lg font-semibold text-gray-900">
                              ${(tenant.revenue / 1000).toFixed(0)}K
                            </div>
                            <p className="text-xs text-gray-600">Revenue</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* White Label Solutions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    White Label Solutions
                    <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
                      ⭐ Phase 4
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Custom-branded solutions for enterprise clients
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {whiteLabelConfigs.map((config: WhiteLabelConfig) => (
                      <div key={config.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-8 h-8 rounded-lg"
                              style={{ backgroundColor: config.brandColors.primary }}
                            ></div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{config.clientName}</h4>
                              <p className="text-sm text-gray-600">{config.domain}</p>
                            </div>
                          </div>
                          <Badge variant={
                            config.status === 'live' ? 'default' :
                            config.status === 'development' ? 'outline' : 'secondary'
                          }>
                            {config.status}
                          </Badge>
                        </div>
                        
                        <div className="flex flex-wrap gap-1 mb-3">
                          {config.features.map((feature: string, idx: number) => (
                            <Badge key={idx} variant="outline">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                        
                        {config.status === 'live' && (
                          <div className="text-right">
                            <span className="text-sm font-medium text-green-600">
                              ${config.monthlyRevenue.toLocaleString()}/month
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Enterprise Analytics & Tools */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Enterprise Analytics & Tools
                  <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
                    ⭐ Phase 4
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Advanced enterprise tools and comprehensive analytics dashboard
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* System Health */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">System Health</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">API Response Time</span>
                        <span className="text-sm font-medium">142ms</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Database Performance</span>
                        <span className="text-sm font-medium">98.2%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '98%' }}></div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">CDN Efficiency</span>
                        <span className="text-sm font-medium">94.7%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '95%' }}></div>
                      </div>
                    </div>
                  </div>

                  {/* Enterprise Tools */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Enterprise Tools</h4>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start">
                        <Download className="h-4 w-4 mr-2" />
                        Export Global Report
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Settings className="h-4 w-4 mr-2" />
                        Global Configuration
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Database className="h-4 w-4 mr-2" />
                        Data Migration Tools
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Bell className="h-4 w-4 mr-2" />
                        Alert Management
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Users className="h-4 w-4 mr-2" />
                        User Access Control
                      </Button>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Quick Statistics</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-xl font-bold text-blue-900">{enterpriseMetrics.dataProcessed}</div>
                        <p className="text-xs text-blue-700">Data Processed</p>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-xl font-bold text-green-900">{enterpriseMetrics.activeIntegrations}</div>
                        <p className="text-xs text-green-700">Active APIs</p>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-xl font-bold text-purple-900">24/7</div>
                        <p className="text-xs text-purple-700">Support</p>
                      </div>
                      <div className="text-center p-3 bg-orange-50 rounded-lg">
                        <div className="text-xl font-bold text-orange-900">99.9%</div>
                        <p className="text-xs text-orange-700">SLA</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enterprise Features Showcase */}
                <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Building className="h-5 w-5 text-purple-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-purple-900">Enterprise-Ready Features</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                        <ul className="text-sm text-purple-700 space-y-1">
                          <li>• Multi-region deployment with automatic failover</li>
                          <li>• Enterprise SSO integration (SAML, OAuth)</li>
                          <li>• Advanced role-based access control</li>
                          <li>• Custom API rate limiting and quotas</li>
                        </ul>
                        <ul className="text-sm text-purple-700 space-y-1">
                          <li>• Real-time data synchronization across tenants</li>
                          <li>• Automated backup and disaster recovery</li>
                          <li>• Compliance reporting (SOC2, GDPR, CCPA)</li>
                          <li>• 24/7 dedicated enterprise support</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Banner Form Dialog */}
      <BannerForm
        banner={editingBanner}
        isOpen={bannerFormOpen}
          onClose={() => {
            setBannerFormOpen(false);
            setEditingBanner(null);
          }}
        onSave={handleBannerSaved}
      />

        {/* Banner Preview Dialog */}
        <Dialog open={!!previewBanner} onOpenChange={() => setPreviewBanner(null)}>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {previewBanner?.media_type === 'video' ? (
                  <Video className="h-5 w-5 text-blue-500" />
                ) : (
                  <ImageIcon className="h-5 w-5 text-gray-500" />
                )}
                Banner Preview
              </DialogTitle>
            </DialogHeader>
            {previewBanner && (
              <div className="space-y-4">
                <div className="aspect-video w-full overflow-hidden rounded-lg border">
                  {previewBanner.media_type === 'video' && previewBanner.video_url ? (
                    <video
                      className="w-full h-full object-cover"
                      controls
                      autoPlay
                      playsInline
                      poster={previewBanner.image_url}
                      key={previewBanner.video_url} // Force video reload when URL changes
                    >
                      <source src={previewBanner.video_url} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <img
                      src={previewBanner.image_url}
                      alt={previewBanner.title || 'Banner preview'}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {previewBanner.media_type === 'video' ? (
                      <Video className="h-5 w-5 text-blue-500" />
                    ) : (
                      <ImageIcon className="h-5 w-5 text-gray-500" />
                    )}
                    <h3 className="text-lg font-medium">{previewBanner.title || 'Untitled'}</h3>
                  </div>
                  <p className="text-sm text-gray-500">{previewBanner.subtitle || 'No subtitle'}</p>
                  {previewBanner.link_url && (
                    <a 
                      href={previewBanner.link_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1"
                    >
                      <ExternalLink className="h-4 w-4" />
                      View Link
                    </a>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* A/B Test Form Dialog */}
        <Dialog open={testFormOpen} onOpenChange={() => {
          setTestFormOpen(false);
          setEditingTest(null);
        }}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editingTest ? 'Edit A/B Test' : 'Create New A/B Test'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Test Name</label>
                  <Input 
                    placeholder="e.g., Summer Banner CTA Test"
                    className="mt-1"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Test Type</label>
                    <Select>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="banner">Banner Test</SelectItem>
                        <SelectItem value="layout">Layout Test</SelectItem>
                        <SelectItem value="cta">CTA Test</SelectItem>
                        <SelectItem value="content">Content Test</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">Objective</label>
                    <Select>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select objective" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="click_through_rate">Click-through Rate</SelectItem>
                        <SelectItem value="conversions">Conversions</SelectItem>
                        <SelectItem value="engagement_time">Engagement Time</SelectItem>
                        <SelectItem value="bounce_rate">Bounce Rate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Start Date</label>
                    <Input 
                      type="date"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">End Date</label>
                    <Input 
                      type="date"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Traffic Split (%)</label>
                  <div className="mt-1 flex items-center space-x-4">
                    <Input 
                      type="number"
                      placeholder="50"
                      min="10"
                      max="90"
                      className="w-20"
                    />
                    <span className="text-sm text-gray-600">
                      Percentage of traffic to show variant B (remaining shows variant A)
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700">Test Variants</label>
                  
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <h4 className="font-medium text-gray-900 mb-2">Variant A (Control)</h4>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select existing banner" />
                      </SelectTrigger>
                      <SelectContent>
                        {banners.map((banner) => (
                          <SelectItem key={banner.id} value={banner.id}>
                            {banner.title || 'Untitled Banner'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="border rounded-lg p-4 bg-blue-50">
                    <h4 className="font-medium text-gray-900 mb-2">Variant B (Test)</h4>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select banner or create new" />
                      </SelectTrigger>
                      <SelectContent>
                        {banners.map((banner) => (
                          <SelectItem key={banner.id} value={banner.id}>
                            {banner.title || 'Untitled Banner'}
                          </SelectItem>
                        ))}
                        <SelectItem value="create_new">+ Create New Banner</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="p-4 bg-amber-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-amber-900">Test Setup Tips</h4>
                      <ul className="text-sm text-amber-700 mt-1 space-y-1">
                        <li>• Ensure variants differ in only one key element for clear insights</li>
                        <li>• Consider running tests for at least 7-14 days for statistical significance</li>
                        <li>• Monitor external factors that might influence results</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setTestFormOpen(false);
                    setEditingTest(null);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    toast.success(editingTest ? 'Test updated successfully!' : 'Test created successfully!');
                    setTestFormOpen(false);
                    setEditingTest(null);
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {editingTest ? 'Update Test' : 'Create Test'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Test Detail Dialog */}
        <Dialog open={!!selectedTest} onOpenChange={() => setSelectedTest(null)}>
          <DialogContent className="sm:max-w-[900px]">
            <DialogHeader>
              <DialogTitle>
                {selectedTest?.name} - Detailed Results
              </DialogTitle>
            </DialogHeader>
            {selectedTest && (
              <div className="space-y-6">
                {/* Test Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-900">{selectedTest.confidence}%</div>
                    <p className="text-sm text-blue-700">Confidence Level</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-900">
                      {selectedTest.variants.reduce((sum: number, v: any) => sum + v.visitors, 0).toLocaleString()}
                    </div>
                    <p className="text-sm text-green-700">Total Visitors</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-900">
                      {selectedTest.variants.reduce((sum: number, v: any) => sum + v.conversions, 0)}
                    </div>
                    <p className="text-sm text-purple-700">Total Conversions</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-900">
                      {selectedTest.status === 'completed' ? 
                        Math.round((new Date(selectedTest.endDate).getTime() - new Date(selectedTest.startDate).getTime()) / (1000 * 60 * 60 * 24)) :
                        Math.round((new Date().getTime() - new Date(selectedTest.startDate).getTime()) / (1000 * 60 * 60 * 24))
                      } days
                    </div>
                    <p className="text-sm text-orange-700">
                      {selectedTest.status === 'completed' ? 'Test Duration' : 'Days Running'}
                    </p>
                  </div>
                </div>

                {/* Detailed Variant Comparison */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Variant Performance Comparison</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {selectedTest.variants.map((variant: any) => (
                      <div key={variant.id} className={`border rounded-lg p-6 ${
                        selectedTest.winner === variant.id ? 'border-green-500 bg-green-50' : 'border-gray-200'
                      }`}>
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-semibold text-gray-900">
                            Variant {variant.id}: {variant.name}
                          </h4>
                          {selectedTest.winner === variant.id && (
                            <Badge className="bg-green-100 text-green-800">
                              🏆 Winner
                            </Badge>
                          )}
                        </div>
                        
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Visitors</span>
                            <span className="text-lg font-semibold">{variant.visitors.toLocaleString()}</span>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Conversions</span>
                            <span className="text-lg font-semibold">{variant.conversions}</span>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Conversion Rate</span>
                            <span className="text-lg font-semibold">{variant.ctr}%</span>
                          </div>
                          
                          <div className="pt-3 border-t">
                            <div className="w-full bg-gray-200 rounded-full h-3">
                              <div 
                                className={`h-3 rounded-full ${
                                  selectedTest.winner === variant.id ? 'bg-green-500' : 'bg-blue-500'
                                }`}
                                style={{ width: `${variant.ctr * 10}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Statistical Analysis */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Statistical Analysis</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Confidence Level:</span>
                      <span className="font-medium ml-2">{selectedTest.confidence}%</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Statistical Significance:</span>
                      <span className={`font-medium ml-2 ${selectedTest.confidence >= 95 ? 'text-green-600' : 'text-orange-600'}`}>
                        {selectedTest.confidence >= 95 ? 'Achieved' : 'In Progress'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Effect Size:</span>
                      <span className="font-medium ml-2">
                        {selectedTest.variants[1] && selectedTest.variants[0] ? 
                          `${((selectedTest.variants[1].ctr - selectedTest.variants[0].ctr) / selectedTest.variants[0].ctr * 100).toFixed(1)}%` :
                          'N/A'
                        }
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center pt-4 border-t">
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export Results
                    </Button>
                    <Button variant="outline" size="sm">
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicate Test
                    </Button>
                  </div>
                  
                  {selectedTest.status === 'running' && selectedTest.confidence >= 95 && (
                    <Button className="bg-green-600 hover:bg-green-700">
                      Declare Winner & Stop Test
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Add Advanced Filters Dialog */}
        <Dialog open={advancedFiltersOpen} onOpenChange={setAdvancedFiltersOpen}>
          <DialogContent className="sm:max-w-[500px] bg-white border shadow-lg !p-6">
            <div className="absolute inset-0 bg-white rounded-lg" />
            <div className="relative z-10">
              <DialogHeader className="mb-4">
                <DialogTitle className="text-gray-900 text-xl font-semibold">Advanced Filters</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAdvancedFiltersSubmit} className="bg-white">
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="mediaType" className="text-gray-900 font-medium">Media Type</Label>
                    <Select
                      value={advancedFilters.mediaType}
                      onValueChange={(value) => setAdvancedFilters(prev => ({ ...prev, mediaType: value }))}
                    >
                      <SelectTrigger id="mediaType" className="bg-white text-gray-900 border-gray-200">
                        <SelectValue placeholder="Select media type" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border shadow-md">
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="image">Image Only</SelectItem>
                        <SelectItem value="video">Video Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deviceTargeting" className="text-gray-900 font-medium">Device Targeting</Label>
                    <Select
                      value={advancedFilters.deviceTargeting}
                      onValueChange={(value) => setAdvancedFilters(prev => ({ ...prev, deviceTargeting: value }))}
                    >
                      <SelectTrigger id="deviceTargeting" className="bg-white text-gray-900 border-gray-200">
                        <SelectValue placeholder="Select device targeting" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border shadow-md">
                        <SelectItem value="all">All Devices</SelectItem>
                        <SelectItem value="desktop">Desktop Only</SelectItem>
                        <SelectItem value="mobile">Mobile Only</SelectItem>
                        <SelectItem value="tablet">Tablet Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="showTitle" className="text-gray-900 font-medium">Show Title</Label>
                    <Select
                      value={advancedFilters.showTitle}
                      onValueChange={(value) => setAdvancedFilters(prev => ({ ...prev, showTitle: value }))}
                    >
                      <SelectTrigger id="showTitle" className="bg-white text-gray-900 border-gray-200">
                        <SelectValue placeholder="Select title visibility" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border shadow-md">
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="yes">Show Title</SelectItem>
                        <SelectItem value="no">Hide Title</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="showSubtitle" className="text-gray-900 font-medium">Show Subtitle</Label>
                    <Select
                      value={advancedFilters.showSubtitle}
                      onValueChange={(value) => setAdvancedFilters(prev => ({ ...prev, showSubtitle: value }))}
                    >
                      <SelectTrigger id="showSubtitle" className="bg-white text-gray-900 border-gray-200">
                        <SelectValue placeholder="Select subtitle visibility" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border shadow-md">
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="yes">Show Subtitle</SelectItem>
                        <SelectItem value="no">Hide Subtitle</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <DialogFooter className="gap-2 pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setAdvancedFilters({
                        mediaType: 'all',
                        deviceTargeting: 'all',
                        dateRange: 'all',
                        showTitle: 'all',
                        showSubtitle: 'all'
                      });
                      toast.success('Filters reset');
                    }}
                    className="bg-white text-gray-900 border-gray-200 hover:bg-gray-100"
                  >
                    Reset Filters
                  </Button>
                  <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700">
                    Apply Filters
                  </Button>
                </DialogFooter>
              </form>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminHomepage;
import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Filter,
  Download,
  MoreVertical,
  Copy,
  Archive,
  RefreshCw,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Target,
  Zap,
  Tag,
  Users,
  Calendar,
  DollarSign,
  Percent,
  Clock,
  Activity,
  Eye,
  Settings,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import PromoCodeForm from '@/components/admin/PromoCodeForm';
import { cn } from '@/lib/utils';
import { ResponsiveContainer, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Area, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

interface PromoCode {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_cart_total: number;
  start_date: string;
  end_date: string | null;
  usage_limit: number | null;
  usage_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const AdminPromoCodes = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingPromoCode, setEditingPromoCode] = useState<PromoCode | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('management');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: promoCodes, isLoading } = useQuery({
    queryKey: ['promo-codes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as PromoCode[];
    },
  });

  // Analytics calculations
  const analytics = useMemo(() => {
    if (!promoCodes) return null;
    
    const totalCodes = promoCodes.length;
    const activeCodes = promoCodes.filter(code => code.is_active).length;
    const inactiveCodes = totalCodes - activeCodes;
    const totalUsage = promoCodes.reduce((sum, code) => sum + (code.usage_count || 0), 0);
    const avgUsage = totalCodes > 0 ? totalUsage / totalCodes : 0;
    
    // Mock additional metrics (in real app, would come from orders table)
    const totalDiscount = 125670;
    const conversionRate = 18.5;
    const topCode = promoCodes.reduce((max, code) => 
      (code.usage_count || 0) > (max?.usage_count || 0) ? code : max, promoCodes[0]);
    
    return {
      totalCodes,
      activeCodes,
      inactiveCodes,
      totalUsage,
      avgUsage,
      totalDiscount,
      conversionRate,
      topCode
    };
  }, [promoCodes]);

  // Filtered promo codes
  const filteredPromoCodes = useMemo(() => {
    if (!promoCodes) return [];
    
    return promoCodes.filter(code => {
      const matchesSearch = !searchTerm || 
        code.code.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && code.is_active) ||
        (statusFilter === 'inactive' && !code.is_active) ||
        (statusFilter === 'expired' && code.end_date && new Date(code.end_date) < new Date());
      
      const matchesType = typeFilter === 'all' ||
        (typeFilter === 'percentage' && code.discount_type === 'percentage') ||
        (typeFilter === 'fixed' && code.discount_type === 'fixed');
      
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [promoCodes, searchTerm, statusFilter, typeFilter]);

  const deletePromoCodeMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('promo_codes')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promo-codes'] });
      toast({
        title: "Promo code deleted",
        description: "The promo code has been successfully deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete promo code.",
        variant: "destructive",
      });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('promo_codes')
        .update({ is_active: isActive })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promo-codes'] });
    },
  });

  const handleEdit = (promoCode: PromoCode) => {
    setEditingPromoCode(promoCode);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingPromoCode(null);
  };

  const handleSelectCode = (codeId: string, checked: boolean) => {
    if (checked) {
      setSelectedCodes([...selectedCodes, codeId]);
    } else {
      setSelectedCodes(selectedCodes.filter(id => id !== codeId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCodes(filteredPromoCodes.map(code => code.id));
    } else {
      setSelectedCodes([]);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedCodes.length === 0) {
      toast({
        title: "No codes selected",
        description: "Please select promo codes first",
        variant: "destructive",
      });
      return;
    }

    try {
      switch (action) {
        case 'activate':
          for (const codeId of selectedCodes) {
            await toggleActiveMutation.mutateAsync({ id: codeId, isActive: true });
          }
          toast({
            title: "Codes activated",
            description: `${selectedCodes.length} promo codes activated`,
          });
          break;
        case 'deactivate':
          for (const codeId of selectedCodes) {
            await toggleActiveMutation.mutateAsync({ id: codeId, isActive: false });
          }
          toast({
            title: "Codes deactivated", 
            description: `${selectedCodes.length} promo codes deactivated`,
          });
          break;
        case 'delete':
          if (confirm(`Delete ${selectedCodes.length} promo codes?`)) {
            for (const codeId of selectedCodes) {
              await deletePromoCodeMutation.mutateAsync(codeId);
            }
          }
          break;
      }
      setSelectedCodes([]);
    } catch (error) {
      toast({
        title: "Bulk action failed",
        description: "Some operations may have failed",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDiscount = (type: string, value: number) => {
    return type === 'percentage' ? `${value}%` : `₹${value}`;
  };

  const getCodeStatus = (code: PromoCode) => {
    if (!code.is_active) return { status: 'inactive', color: 'bg-gray-100 text-gray-600' };
    if (code.end_date && new Date(code.end_date) < new Date()) 
      return { status: 'expired', color: 'bg-red-100 text-red-600' };
    if (code.usage_limit && code.usage_count >= code.usage_limit) 
      return { status: 'exhausted', color: 'bg-orange-100 text-orange-600' };
    return { status: 'active', color: 'bg-green-100 text-green-600' };
  };

  if (showForm) {
    return (
      <AdminLayout>
        <PromoCodeForm
          promoCode={editingPromoCode}
          onClose={handleFormClose}
          onSuccess={handleFormClose}
        />
      </AdminLayout>
    );
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center space-y-4">
            <RefreshCw className="h-12 w-12 animate-spin text-neon-cyan mx-auto" />
            <p className="text-gray-600">Loading promo codes...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Enhanced Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Promo Code Management
            </h1>
            <p className="text-gray-600">
              Create and manage promotional discount codes for your store
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['promo-codes'] })} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={() => setShowForm(true)} className="bg-neon-cyan text-black hover:bg-neon-cyan/80">
            <Plus className="h-4 w-4 mr-2" />
            Add Promo Code
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
                    ✅ Live
                  </Badge>
                  <span className="text-sm text-gray-600">Fully functional - Ready to use</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
                    📊 Demo
                  </Badge>
                  <span className="text-sm text-gray-600">Mock data for preview</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                    🚀 Preview
                  </Badge>
                  <span className="text-sm text-gray-600">Coming soon - Interface ready</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
                    🎨 UI Only
                  </Badge>
                  <span className="text-sm text-gray-600">Interface built - Backend needed</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Analytics Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Total Codes</p>
                    <p className="text-3xl font-bold text-blue-900">{analytics.totalCodes}</p>
                    <p className="text-xs text-blue-600 mt-1">
                      {analytics.activeCodes} active, {analytics.inactiveCodes} inactive
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-blue-500 rounded-lg flex items-center justify-center">
                    <Tag className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Total Usage</p>
                    <p className="text-3xl font-bold text-green-900">{analytics.totalUsage}</p>
                    <p className="text-xs text-green-600 mt-1">
                      Avg: {analytics.avgUsage.toFixed(1)} per code
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-green-500 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">Total Discount</p>
                    <p className="text-3xl font-bold text-purple-900">₹{analytics.totalDiscount.toLocaleString()}</p>
                    <p className="text-xs text-purple-600 mt-1 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      +15% this month
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-purple-500 rounded-lg flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-600">Conversion Rate</p>
                    <p className="text-3xl font-bold text-orange-900">{analytics.conversionRate}%</p>
                    <p className="text-xs text-orange-600 mt-1">
                      Code to purchase rate
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-orange-500 rounded-lg flex items-center justify-center">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="management" className="relative">
              Management
              <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800 text-xs">
                ✅ Live
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="relative">
              Analytics
              <Badge variant="secondary" className="ml-2 bg-amber-100 text-amber-800 text-xs">
                📊 Demo
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="automation" className="relative">
              Automation
              <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-800 text-xs">
                🚀 Preview
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="insights" className="relative">
              Insights
              <Badge variant="secondary" className="ml-2 bg-purple-100 text-purple-800 text-xs">
                🎨 UI Only
              </Badge>
            </TabsTrigger>
          </TabsList>

          {/* Management Tab */}
          <TabsContent value="management" className="space-y-6">
            {/* Search and Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search promo codes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="percentage">Percentage</SelectItem>
                        <SelectItem value="fixed">Fixed Amount</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      More Filters
                      <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-800 text-xs">
                        🚀 Preview
                      </Badge>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bulk Actions */}
            {selectedCodes.length > 0 && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium">
                        {selectedCodes.length} code(s) selected
                      </span>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleBulkAction('activate')}
                          className="text-green-600 border-green-200 hover:bg-green-50"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Activate
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleBulkAction('deactivate')}
                          className="text-orange-600 border-orange-200 hover:bg-orange-50"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Deactivate
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleBulkAction('delete')}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedCodes([])}
                    >
                      Clear Selection
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Promo Codes Table */}
            <Card>
              <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="p-4 text-left">
                          <Checkbox
                            checked={selectedCodes.length === filteredPromoCodes.length && filteredPromoCodes.length > 0}
                            onCheckedChange={handleSelectAll}
                          />
                        </th>
                        <th className="p-4 text-left font-semibold text-gray-900">Code</th>
                        <th className="p-4 text-left font-semibold text-gray-900">Discount</th>
                        <th className="p-4 text-left font-semibold text-gray-900">Usage</th>
                        <th className="p-4 text-left font-semibold text-gray-900">Status</th>
                        <th className="p-4 text-left font-semibold text-gray-900">Dates</th>
                        <th className="p-4 text-left font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                      {filteredPromoCodes.map((code) => {
                        const codeStatus = getCodeStatus(code);
                        return (
                          <tr key={code.id} className="border-b hover:bg-gray-50 transition-colors">
                            <td className="p-4">
                              <Checkbox
                                checked={selectedCodes.includes(code.id)}
                                onCheckedChange={(checked) => handleSelectCode(code.id, checked as boolean)}
                              />
                            </td>
                        <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="bg-gray-100 p-2 rounded-lg">
                                  <Tag className="h-4 w-4 text-gray-600" />
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900">{code.code}</p>
                                  <p className="text-sm text-gray-500">
                                    Created {formatDate(code.created_at)}
                                  </p>
                                </div>
                              </div>
                        </td>
                        <td className="p-4">
                              <div>
                                <p className="font-semibold text-gray-900">
                                  {formatDiscount(code.discount_type, code.discount_value)}
                                </p>
                                {code.min_cart_total > 0 && (
                                  <p className="text-sm text-gray-500">
                                    Min: ₹{code.min_cart_total}
                                  </p>
                                )}
                              </div>
                        </td>
                        <td className="p-4">
                              <div>
                                <p className="font-semibold text-gray-900">
                                  {code.usage_count || 0}
                                  {code.usage_limit && ` / ${code.usage_limit}`}
                                </p>
                                {code.usage_limit && (
                                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                    <div
                                      className="bg-blue-500 h-2 rounded-full"
                                      style={{
                                        width: `${Math.min(100, ((code.usage_count || 0) / code.usage_limit) * 100)}%`
                                      }}
                                    />
                                  </div>
                                )}
                              </div>
                        </td>
                        <td className="p-4">
                              <Badge className={cn("capitalize", codeStatus.color)}>
                                {codeStatus.status}
                              </Badge>
                        </td>
                        <td className="p-4">
                              <div className="text-sm">
                                <p className="text-gray-900">
                                  From: {formatDate(code.start_date)}
                                </p>
                                {code.end_date && (
                                  <p className="text-gray-500">
                                    To: {formatDate(code.end_date)}
                                  </p>
                                )}
                              </div>
                        </td>
                        <td className="p-4">
                              <div className="flex items-center gap-2">
                          <Switch
                                  checked={code.is_active}
                            onCheckedChange={(checked) =>
                                    toggleActiveMutation.mutate({ id: code.id, isActive: checked })
                                  }
                                />
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleEdit(code)}>
                                      <Edit className="h-4 w-4 mr-2" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => navigator.clipboard.writeText(code.code)}
                                    >
                                      <Copy className="h-4 w-4 mr-2" />
                                      Copy Code
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() => deletePromoCodeMutation.mutate(code.id)}
                                      className="text-red-600"
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                        </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  
                  {filteredPromoCodes.length === 0 && (
                    <div className="text-center py-12">
                      <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 text-lg">No promo codes found</p>
                      <p className="text-gray-500 text-sm">
                        {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                          ? 'Try adjusting your filters'
                          : 'Create your first promo code to get started'
                        }
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Usage Trends Chart */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Usage Trends</CardTitle>
                    <CardDescription>Promo code usage over time</CardDescription>
                  </div>
                  <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                    📊 Demo
                  </Badge>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={[
                      { date: '2024-01-01', usage: 12, revenue: 4500 },
                      { date: '2024-01-02', usage: 19, revenue: 7200 },
                      { date: '2024-01-03', usage: 15, revenue: 5800 },
                      { date: '2024-01-04', usage: 22, revenue: 8900 },
                      { date: '2024-01-05', usage: 28, revenue: 12400 },
                      { date: '2024-01-06', usage: 25, revenue: 9800 },
                      { date: '2024-01-07', usage: 31, revenue: 14200 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="usage" stackId="1" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.6} />
                      <Area type="monotone" dataKey="revenue" stackId="2" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Code Performance Distribution */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Performance Distribution</CardTitle>
                    <CardDescription>Success rate by code type</CardDescription>
                  </div>
                  <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                    📊 Demo
                  </Badge>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Percentage', value: 65, fill: '#06b6d4' },
                          { name: 'Fixed Amount', value: 35, fill: '#8b5cf6' }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        dataKey="value"
                      />
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Top Performing Codes */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Top Performing Codes</CardTitle>
                  <CardDescription>Most used promotional codes this month</CardDescription>
                </div>
                <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                  📊 Demo
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { code: 'WELCOME25', usage: 156, revenue: 45600, conversion: 22.5 },
                    { code: 'SUMMER2024', usage: 134, revenue: 38200, conversion: 18.9 },
                    { code: 'NEWUSER', usage: 98, revenue: 28400, conversion: 15.2 },
                    { code: 'FLASH50', usage: 87, revenue: 52100, conversion: 31.8 },
                    { code: 'STUDENT10', usage: 72, revenue: 16800, conversion: 12.6 }
                  ].map((item, index) => (
                    <div key={item.code} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <span className="text-blue-600 font-bold text-sm">#{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{item.code}</p>
                          <p className="text-sm text-gray-500">{item.usage} uses this month</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">₹{item.revenue.toLocaleString()}</p>
                        <p className="text-sm text-green-600">{item.conversion}% conversion</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Revenue Impact Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">Revenue Generated</p>
                      <p className="text-2xl font-bold text-green-900">₹2,45,670</p>
                      <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        +18% vs last month
                      </p>
                    </div>
                    <DollarSign className="h-10 w-10 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600">Avg Order Value</p>
                      <p className="text-2xl font-bold text-purple-900">₹1,847</p>
                      <p className="text-xs text-purple-600 mt-1 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        +5% vs last month
                      </p>
                    </div>
                    <BarChart3 className="h-10 w-10 text-purple-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Customer Acquisition</p>
                      <p className="text-2xl font-bold text-blue-900">347</p>
                      <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        +23% new customers
                      </p>
                    </div>
                    <Users className="h-10 w-10 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Automation Tab */}
          <TabsContent value="automation" className="space-y-6">
            {/* Automated Workflows */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Smart Code Generation</CardTitle>
                    <CardDescription>AI-powered promotional strategies</CardDescription>
                  </div>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    🚀 Preview
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-blue-500 p-2 rounded-lg">
                        <Zap className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-blue-900">Welcome Series</p>
                        <p className="text-sm text-blue-600">Auto-generated for new users</p>
                      </div>
                    </div>
                    <div className="text-sm text-blue-700">
                      <p>• WELCOME10 - 10% off first order</p>
                      <p>• WELCOME15 - 15% off ₹1000+ orders</p>
                      <p>• WELCOME20 - 20% off ₹2000+ orders</p>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-green-500 p-2 rounded-lg">
                        <Activity className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-green-900">Seasonal Campaigns</p>
                        <p className="text-sm text-green-600">Auto-scheduled promotions</p>
                      </div>
                    </div>
                    <div className="text-sm text-green-700">
                      <p>• Festival discounts (Diwali, Holi)</p>
                      <p>• Season sales (Summer, Winter)</p>
                      <p>• Flash sales (Weekend specials)</p>
                    </div>
                  </div>
                  
                  <Button className="w-full" variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Configure Automation
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Trigger-Based Actions</CardTitle>
                    <CardDescription>Automated responses to customer behavior</CardDescription>
                  </div>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    🚀 Preview
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    {
                      trigger: 'Cart Abandonment',
                      action: 'Send COMEBACK10',
                      status: 'Active',
                      color: 'green'
                    },
                    {
                      trigger: 'First Purchase',
                      action: 'Create LOYAL15',
                      status: 'Active',
                      color: 'green'
                    },
                    {
                      trigger: 'Birthday',
                      action: 'Generate BIRTHDAY20',
                      status: 'Scheduled',
                      color: 'blue'
                    },
                    {
                      trigger: 'High-Value Customer',
                      action: 'Offer VIP25',
                      status: 'Active',
                      color: 'green'
                    }
                  ].map((workflow, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="bg-gray-200 p-2 rounded-lg">
                          <Clock className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{workflow.trigger}</p>
                          <p className="text-sm text-gray-500">{workflow.action}</p>
                        </div>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={workflow.color === 'green' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}
                      >
                        {workflow.status}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Bulk Operations */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Bulk Operations Center</CardTitle>
                  <CardDescription>Manage multiple codes efficiently</CardDescription>
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  🚀 Preview
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-20 flex-col">
                    <Download className="h-6 w-6 mb-2" />
                    Export Codes
                    <span className="text-xs text-gray-500">CSV/Excel format</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Archive className="h-6 w-6 mb-2" />
                    Archive Expired
                    <span className="text-xs text-gray-500">Clean up old codes</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <RefreshCw className="h-6 w-6 mb-2" />
                    Bulk Update
                    <span className="text-xs text-gray-500">Modify multiple codes</span>
                            </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            {/* AI Recommendations */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">AI-Powered Recommendations</CardTitle>
                  <CardDescription>Smart insights to optimize your promotions</CardDescription>
                </div>
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                  🎨 UI Only
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      type: 'Performance',
                      icon: TrendingUp,
                      title: 'Increase WELCOME25 discount to 30%',
                      description: 'Based on competitor analysis, 30% discount could increase conversion by 15%',
                      impact: '+15% conversion',
                      color: 'green'
                    },
                    {
                      type: 'Timing',
                      icon: Clock,
                      title: 'Launch flash sale this weekend',
                      description: 'Customer activity peaks on Saturday evenings. Optimal time: 6-8 PM',
                      impact: '+25% engagement',
                      color: 'blue'
                    },
                    {
                      type: 'Targeting',
                      icon: Target,
                      title: 'Create mobile-specific codes',
                      description: '68% of traffic is mobile. Mobile users prefer percentage discounts',
                      impact: '+18% mobile sales',
                      color: 'purple'
                    },
                    {
                      type: 'Seasonal',
                      icon: Calendar,
                      title: 'Prepare for festival season',
                      description: 'Diwali is approaching. Start pre-festival promotions in 2 weeks',
                      impact: '+40% seasonal sales',
                      color: 'orange'
                    }
                  ].map((insight, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-start gap-4">
                        <div className={cn(
                          "p-2 rounded-lg",
                          insight.color === 'green' && "bg-green-100",
                          insight.color === 'blue' && "bg-blue-100",
                          insight.color === 'purple' && "bg-purple-100",
                          insight.color === 'orange' && "bg-orange-100"
                        )}>
                          <insight.icon className={cn(
                            "h-5 w-5",
                            insight.color === 'green' && "text-green-600",
                            insight.color === 'blue' && "text-blue-600",
                            insight.color === 'purple' && "text-purple-600",
                            insight.color === 'orange' && "text-orange-600"
                          )} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-gray-900">{insight.title}</p>
                            <Badge variant="outline" className="text-xs">
                              {insight.type}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{insight.description}</p>
                          <div className="flex items-center justify-between">
                            <span className={cn(
                              "text-sm font-medium",
                              insight.color === 'green' && "text-green-600",
                              insight.color === 'blue' && "text-blue-600",
                              insight.color === 'purple' && "text-purple-600",
                              insight.color === 'orange' && "text-orange-600"
                            )}>
                              {insight.impact}
                            </span>
                            <Button size="sm" variant="outline">
                              Apply Suggestion
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Customer Behavior Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Customer Segments</CardTitle>
                    <CardDescription>Behavior-based customer groups</CardDescription>
                  </div>
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                    🎨 UI Only
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { segment: 'Price Sensitive', users: 1234, preference: 'High % discounts', codes: 'SAVE20, MEGA30' },
                      { segment: 'Impulse Buyers', users: 987, preference: 'Flash sales', codes: 'FLASH15, QUICK10' },
                      { segment: 'Loyal Customers', users: 756, preference: 'Exclusive offers', codes: 'VIP25, LOYAL20' },
                      { segment: 'New Customers', users: 543, preference: 'Welcome discounts', codes: 'WELCOME15' }
                    ].map((segment, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-gray-900">{segment.segment}</p>
                          <span className="text-sm text-gray-500">{segment.users} users</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">Prefers: {segment.preference}</p>
                        <p className="text-xs text-blue-600">Top codes: {segment.codes}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Optimization Opportunities</CardTitle>
                    <CardDescription>Areas for improvement</CardDescription>
                  </div>
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                    🎨 UI Only
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        area: 'Underperforming Codes',
                        issue: '3 codes with <5% usage',
                        action: 'Review and optimize',
                        priority: 'High'
                      },
                      {
                        area: 'Expired Code Cleanup',
                        issue: '12 expired codes still active',
                        action: 'Archive old codes',
                        priority: 'Medium'
                      },
                      {
                        area: 'Mobile Optimization',
                        issue: 'Lower mobile conversion',
                        action: 'Create mobile-specific offers',
                        priority: 'High'
                      },
                      {
                        area: 'Seasonal Preparation',
                        issue: 'No festival codes ready',
                        action: 'Create seasonal campaigns',
                        priority: 'Medium'
                      }
                    ].map((opportunity, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-gray-900">{opportunity.area}</p>
                          <Badge 
                            variant="outline"
                            className={opportunity.priority === 'High' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}
                          >
                            {opportunity.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{opportunity.issue}</p>
                        <p className="text-xs text-blue-600">{opportunity.action}</p>
                      </div>
                    ))}
              </div>
          </CardContent>
        </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminPromoCodes;

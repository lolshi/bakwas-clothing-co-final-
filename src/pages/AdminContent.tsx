import React, { useState, useEffect, useMemo } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Edit, 
  Trash2, 
  Plus, 
  Search,
  Filter,
  Download,
  Upload,
  Eye,
  EyeOff,
  MoreVertical,
  Copy,
  Archive,
  RefreshCw,
  FileText,
  Image as ImageIcon,
  Video,
  Link,
  Globe,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Clock,
  Users,
  Target,
  Zap,
  Settings,
  Calendar,
  Star,
  Activity,
  AlertCircle,
  CheckCircle,
  XCircle,
  BookOpen,
  Palette,
  Code,
  Smartphone
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ResponsiveContainer, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Area, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  sort_order: number | null;
  is_active: boolean | null;
}

interface SitePage {
  id: string;
  page_key: string;
  title: string;
  content: string;
}

interface Subscriber {
  id: string;
  email: string;
  name: string | null;
  subscribed_at: string | null;
  is_active: boolean | null;
  unsubscribed_at?: string | null;
}

const AdminContent = () => {
  const { toast } = useToast();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [pages, setPages] = useState<SitePage[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);
  const [editingPage, setEditingPage] = useState<SitePage | null>(null);
  const [editingSubscriber, setEditingSubscriber] = useState<Subscriber | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('content');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, []);

  // Analytics calculations
  const analytics = useMemo(() => {
    if (!faqs || !pages || !subscribers) return null;
    
    const totalContent = faqs.length + pages.length;
    const activeContent = faqs.filter(faq => faq.is_active).length + pages.length;
    const totalSubscribers = subscribers.length;
    const activeSubscribers = subscribers.filter(sub => sub.is_active).length;
    
    // Mock additional metrics
    const pageViews = 45230;
    const engagementRate = 67.8;
    const avgTimeOnPage = '2m 15s';
    
    return {
      totalContent,
      activeContent,
      totalSubscribers,
      activeSubscribers,
      pageViews,
      engagementRate,
      avgTimeOnPage
    };
  }, [faqs, pages, subscribers]);

  const fetchAllData = async () => {
    try {
      const [faqsResult, pagesResult, subscribersResult] = await Promise.all([
        supabase.from('faqs').select('*').order('sort_order'),
        supabase.from('site_pages').select('*').order('page_key'),
        supabase.from('subscribers').select('*').order('subscribed_at', { ascending: false })
      ]);

      if (faqsResult.error) throw faqsResult.error;
      if (pagesResult.error) throw pagesResult.error;
      if (subscribersResult.error) throw subscribersResult.error;

      setFaqs(faqsResult.data || []);
      setPages(pagesResult.data || []);
      setSubscribers(subscribersResult.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch content data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveFAQ = async (faq: FAQ) => {
    try {
      const faqData = {
        question: faq.question || '',
        answer: faq.answer || '',
        sort_order: faq.sort_order || 0,
        is_active: faq.is_active ?? true
      };

      if (editingFAQ?.id) {
        const { error } = await supabase
          .from('faqs')
          .update(faqData)
          .eq('id', editingFAQ.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('faqs')
          .insert(faqData);
        if (error) throw error;
      }

      toast({
        title: "Success",
        description: editingFAQ ? "FAQ updated" : "FAQ created",
      });

      fetchAllData();
      setEditingFAQ(null);
    } catch (error) {
      console.error('Error saving FAQ:', error);
      toast({
        title: "Error",
        description: "Failed to save FAQ",
        variant: "destructive",
      });
    }
  };

  const deleteFAQ = async (id: string) => {
    try {
      const { error } = await supabase
        .from('faqs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "FAQ deleted",
      });

      fetchAllData();
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      toast({
        title: "Error",
        description: "Failed to delete FAQ",
        variant: "destructive",
      });
    }
  };

  const savePage = async (page: SitePage) => {
    try {
      const { error } = await supabase
        .from('site_pages')
        .update({ title: page.title, content: page.content })
        .eq('id', page.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Page updated",
      });

      fetchAllData();
      setEditingPage(null);
    } catch (error) {
      console.error('Error saving page:', error);
      toast({
        title: "Error",
        description: "Failed to save page",
        variant: "destructive",
      });
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedItems.length === 0) {
      toast({
        title: "No items selected",
        description: "Please select items first",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Bulk action simulated",
      description: `${action} would be applied to ${selectedItems.length} items`,
    });
    setSelectedItems([]);
  };

  const handleEditSubscriber = async (subscriber: Subscriber) => {
    setEditingSubscriber(subscriber);
    setIsEditDialogOpen(true);
  };

  const handleSaveSubscriber = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubscriber) return;

    try {
      const { error } = await supabase
        .from('subscribers')
        .update({
          email: editingSubscriber.email,
          name: editingSubscriber.name,
          is_active: editingSubscriber.is_active
        })
        .eq('id', editingSubscriber.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Subscriber updated successfully",
      });

      setIsEditDialogOpen(false);
      setEditingSubscriber(null);
      fetchAllData();
    } catch (error) {
      console.error('Error updating subscriber:', error);
      toast({
        title: "Error",
        description: "Failed to update subscriber",
        variant: "destructive",
      });
    }
  };

  const handleUnsubscribe = async (subscriberId: string) => {
    try {
      console.log('Starting unsubscribe process for ID:', subscriberId);

      // Only update is_active status
      const { data, error } = await supabase
        .from('subscribers')
        .update({ is_active: false })
        .eq('id', subscriberId);

      console.log('Update response:', { data, error });

      if (error) {
        console.error('Supabase error details:', error);
        throw error;
      }

      toast({
        title: "Success",
        description: "Subscriber has been unsubscribed",
      });

      await fetchAllData();
    } catch (error) {
      console.error('Detailed unsubscribe error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to unsubscribe",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center space-y-4">
            <RefreshCw className="h-12 w-12 animate-spin text-neon-cyan mx-auto" />
            <p className="text-gray-600">Loading content management...</p>
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
              Content Management System
            </h1>
            <p className="text-gray-600">
              Create, manage, and optimize your website content for maximum impact
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button onClick={fetchAllData} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={() => setEditingFAQ({ id: '', question: '', answer: '', sort_order: 0, is_active: true })} className="bg-neon-cyan text-black hover:bg-neon-cyan/80">
              <Plus className="h-4 w-4 mr-2" />
              Create Content
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
                    <p className="text-sm font-medium text-blue-600">Total Content</p>
                    <p className="text-3xl font-bold text-blue-900">{analytics.totalContent}</p>
                    <p className="text-xs text-blue-600 mt-1">
                      {analytics.activeContent} active items
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-blue-500 rounded-lg flex items-center justify-center">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Page Views</p>
                    <p className="text-3xl font-bold text-green-900">{analytics.pageViews.toLocaleString()}</p>
                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      +12% this month
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-green-500 rounded-lg flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">Engagement Rate</p>
                    <p className="text-3xl font-bold text-purple-900">{analytics.engagementRate}%</p>
                    <p className="text-xs text-purple-600 mt-1">
                      Avg time: {analytics.avgTimeOnPage}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-purple-500 rounded-lg flex items-center justify-center">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-600">Subscribers</p>
                    <p className="text-3xl font-bold text-orange-900">{analytics.totalSubscribers}</p>
                    <p className="text-xs text-orange-600 mt-1">
                      {analytics.activeSubscribers} active
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-orange-500 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Enhanced Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="content" className="relative">
              Content
              <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800 text-xs">
                ✅ Live
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="media" className="relative">
              Media
              <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-800 text-xs">
                🚀 Preview
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="seo" className="relative">
              SEO
              <Badge variant="secondary" className="ml-2 bg-purple-100 text-purple-800 text-xs">
                🎨 UI Only
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="relative">
              Analytics
              <Badge variant="secondary" className="ml-2 bg-amber-100 text-amber-800 text-xs">
                📊 Demo
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="workflow" className="relative">
              Workflow
              <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-800 text-xs">
                🚀 Preview
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="subscribers" className="relative">
              Subscribers
              <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800 text-xs">
                ✅ Live
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-6">
            {/* Search and Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search content..."
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
            {selectedItems.length > 0 && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium">
                        {selectedItems.length} item(s) selected
                      </span>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleBulkAction('publish')}
                          className="text-green-600 border-green-200 hover:bg-green-50"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Publish
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleBulkAction('draft')}
                          className="text-orange-600 border-orange-200 hover:bg-orange-50"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Draft
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
                      onClick={() => setSelectedItems([])}
                    >
                      Clear Selection
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* FAQs Section */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Frequently Asked Questions
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        ✅ Live
                      </Badge>
                    </CardTitle>
                    <CardDescription>Manage customer support content</CardDescription>
                  </div>
                  <Button onClick={() => setEditingFAQ({ id: '', question: '', answer: '', sort_order: 0, is_active: true })}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add FAQ
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <Checkbox />
                      </TableHead>
                      <TableHead>Question</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Order</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {faqs.map((faq) => (
                      <TableRow key={faq.id}>
                        <TableCell>
                          <Checkbox />
                        </TableCell>
                        <TableCell className="max-w-md">
                          <div>
                            <p className="font-medium text-gray-900 truncate">{faq.question}</p>
                            <p className="text-sm text-gray-500 truncate">{faq.answer}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={faq.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}>
                            {faq.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>{faq.sort_order || 0}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setEditingFAQ(faq)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Copy className="h-4 w-4 mr-2" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => deleteFAQ(faq.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Site Pages Section */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      Site Pages
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        ✅ Live
                      </Badge>
                    </CardTitle>
                    <CardDescription>Manage static website pages</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Page</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pages.map((page) => (
                      <TableRow key={page.id}>
                        <TableCell className="font-medium">{page.page_key}</TableCell>
                        <TableCell>{page.title}</TableCell>
                        <TableCell className="text-sm text-gray-500">Recently</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => setEditingPage(page)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* FAQ Form */}
            {editingFAQ && (
              <Card>
                <CardHeader>
                  <CardTitle>{editingFAQ.id ? 'Edit FAQ' : 'Add FAQ'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="question">Question</Label>
                      <Input
                        id="question"
                        value={editingFAQ.question}
                        onChange={(e) => setEditingFAQ({ ...editingFAQ, question: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="answer">Answer</Label>
                      <Textarea
                        id="answer"
                        rows={4}
                        value={editingFAQ.answer}
                        onChange={(e) => setEditingFAQ({ ...editingFAQ, answer: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="sort_order">Sort Order</Label>
                      <Input
                        id="sort_order"
                        type="number"
                        value={editingFAQ.sort_order || 0}
                        onChange={(e) => setEditingFAQ({ ...editingFAQ, sort_order: parseInt(e.target.value) })}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_active"
                        checked={editingFAQ.is_active || false}
                        onCheckedChange={(checked) => setEditingFAQ({ ...editingFAQ, is_active: checked })}
                      />
                      <Label htmlFor="is_active">Active</Label>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => saveFAQ(editingFAQ)}>Save</Button>
                      <Button variant="outline" onClick={() => setEditingFAQ(null)}>Cancel</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Page Form */}
            {editingPage && (
              <Card>
                <CardHeader>
                  <CardTitle>Edit Page: {editingPage.page_key}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={editingPage.title}
                        onChange={(e) => setEditingPage({ ...editingPage, title: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="content">Content (HTML)</Label>
                      <Textarea
                        id="content"
                        rows={10}
                        value={editingPage.content}
                        onChange={(e) => setEditingPage({ ...editingPage, content: e.target.value })}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => savePage(editingPage)}>Save</Button>
                      <Button variant="outline" onClick={() => setEditingPage(null)}>Cancel</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Media Tab */}
          <TabsContent value="media" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Media Library</CardTitle>
                    <CardDescription>Upload and manage images, videos, and documents</CardDescription>
                  </div>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    🚀 Preview
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">Drag & drop files here</p>
                    <Button variant="outline">Choose Files</Button>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    {[1,2,3,4,5,6].map((item) => (
                      <div key={item} className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-gray-400" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">CDN & Optimization</CardTitle>
                    <CardDescription>Image compression and delivery</CardDescription>
                  </div>
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                    🎨 UI Only
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">Auto Image Compression</p>
                        <p className="text-sm text-gray-500">Reduce file sizes by 60%</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">WebP Conversion</p>
                        <p className="text-sm text-gray-500">Modern image format</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">Lazy Loading</p>
                        <p className="text-sm text-gray-500">Improve page speed</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* SEO Tab */}
          <TabsContent value="seo" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">SEO Management</CardTitle>
                  <CardDescription>Optimize content for search engines</CardDescription>
                </div>
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                  🎨 UI Only
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Meta Information</h4>
                    {[
                      { page: 'Homepage', title: 'BAKWAS - Premium Streetwear Collection', status: 'good' },
                      { page: 'About', title: 'About BAKWAS - Our Story', status: 'warning' },
                      { page: 'Products', title: 'Shop Premium Streetwear', status: 'good' },
                      { page: 'Contact', title: 'Contact Us - BAKWAS', status: 'error' }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{item.page}</p>
                          <p className="text-sm text-gray-500 truncate">{item.title}</p>
                        </div>
                        <Badge className={
                          item.status === 'good' ? 'bg-green-100 text-green-800' :
                          item.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }>
                          {item.status === 'good' ? 'Good' : item.status === 'warning' ? 'Warning' : 'Error'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold">SEO Score</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Meta Titles</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{width: '85%'}}></div>
                          </div>
                          <span className="text-sm text-green-600">85%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Meta Descriptions</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div className="bg-yellow-500 h-2 rounded-full" style={{width: '60%'}}></div>
                          </div>
                          <span className="text-sm text-yellow-600">60%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Image Alt Tags</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div className="bg-red-500 h-2 rounded-full" style={{width: '35%'}}></div>
                          </div>
                          <span className="text-sm text-red-600">35%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Content Performance</CardTitle>
                    <CardDescription>Page views and engagement metrics</CardDescription>
                  </div>
                  <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                    📊 Demo
                  </Badge>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={[
                      { date: '2024-01-01', views: 1200, engagement: 65 },
                      { date: '2024-01-02', views: 1890, engagement: 72 },
                      { date: '2024-01-03', views: 1580, engagement: 69 },
                      { date: '2024-01-04', views: 2200, engagement: 78 },
                      { date: '2024-01-05', views: 2840, engagement: 81 },
                      { date: '2024-01-06', views: 2500, engagement: 76 },
                      { date: '2024-01-07', views: 3100, engagement: 85 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="views" stackId="1" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.6} />
                      <Area type="monotone" dataKey="engagement" stackId="2" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Top Performing Content</CardTitle>
                    <CardDescription>Most viewed pages this month</CardDescription>
                  </div>
                  <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                    📊 Demo
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { title: 'About Us', views: 12450, engagement: '3m 45s' },
                      { title: 'Return Policy', views: 8970, engagement: '2m 30s' },
                      { title: 'Size Guide', views: 7890, engagement: '4m 15s' },
                      { title: 'FAQ', views: 6540, engagement: '2m 45s' },
                      { title: 'Contact', views: 4320, engagement: '1m 30s' }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{item.title}</p>
                          <p className="text-sm text-gray-500">{item.views.toLocaleString()} views</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{item.engagement}</p>
                          <p className="text-xs text-gray-500">avg. time</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Workflow Tab */}
          <TabsContent value="workflow" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Content Workflow</CardTitle>
                    <CardDescription>Approval and publishing pipeline</CardDescription>
                  </div>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    🚀 Preview
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { stage: 'Draft', count: 3, color: 'bg-gray-100 text-gray-800' },
                    { stage: 'Review', count: 2, color: 'bg-yellow-100 text-yellow-800' },
                    { stage: 'Approved', count: 1, color: 'bg-green-100 text-green-800' },
                    { stage: 'Published', count: 15, color: 'bg-blue-100 text-blue-800' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span className="font-medium">{item.stage}</span>
                      </div>
                      <Badge className={item.color}>
                        {item.count} items
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Content Calendar</CardTitle>
                    <CardDescription>Scheduled content releases</CardDescription>
                  </div>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    🚀 Preview
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { title: 'Holiday Sale FAQ', date: 'Dec 15, 2024', type: 'FAQ' },
                      { title: 'New Year Policy Update', date: 'Dec 31, 2024', type: 'Page' },
                      { title: 'Size Guide Update', date: 'Jan 5, 2025', type: 'Page' }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{item.title}</p>
                          <p className="text-sm text-gray-500">{item.date}</p>
                        </div>
                        <Badge variant="outline">{item.type}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Subscribers Tab */}
          <TabsContent value="subscribers" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Email Subscribers
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        ✅ Live
                      </Badge>
                    </CardTitle>
                    <CardDescription>Manage newsletter subscribers and email campaigns</CardDescription>
                  </div>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Subscribed</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscribers.map((subscriber) => (
                      <TableRow key={subscriber.id}>
                        <TableCell className="font-medium">{subscriber.email}</TableCell>
                        <TableCell>{subscriber.name || '-'}</TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {subscriber.subscribed_at ? new Date(subscriber.subscribed_at).toLocaleDateString() : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge className={subscriber.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}>
                            {subscriber.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditSubscriber(subscriber)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUnsubscribe(subscriber.id)}
                              className={subscriber.is_active ? 'text-red-600 hover:text-red-700' : 'text-gray-400'}
                              disabled={!subscriber.is_active}
                            >
                              <Archive className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Subscriber Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="bg-gray-900 border border-gray-800 shadow-2xl max-w-md w-full rounded-xl !block">
            <div className="absolute inset-0 bg-gray-900/95 backdrop-blur-none rounded-xl -z-10" />
            <DialogHeader className="border-b border-gray-800 pb-4">
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink bg-clip-text text-transparent">
                Edit Subscriber
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSaveSubscriber} className="bg-gray-900">
              <div className="space-y-6 py-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-200 font-semibold">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    value={editingSubscriber?.email || ''}
                    onChange={(e) => setEditingSubscriber(prev => prev ? {...prev, email: e.target.value} : null)}
                    placeholder="Email address"
                    className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-200 font-semibold">
                    Subscriber Name
                  </Label>
                  <Input
                    id="name"
                    value={editingSubscriber?.name || ''}
                    onChange={(e) => setEditingSubscriber(prev => prev ? {...prev, name: e.target.value} : null)}
                    placeholder="Enter name"
                    className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan"
                  />
                </div>
                <div className="flex items-center space-x-3 bg-gray-800 p-4 rounded-lg">
                  <Checkbox
                    id="is_active"
                    checked={editingSubscriber?.is_active || false}
                    onCheckedChange={(checked) => {
                      if (typeof checked === 'boolean') {
                        setEditingSubscriber(prev => 
                          prev ? {...prev, is_active: checked} : null
                        );
                      }
                    }}
                    className="border-gray-600 data-[state=checked]:bg-neon-cyan data-[state=checked]:border-neon-cyan"
                  />
                  <Label htmlFor="is_active" className="text-gray-200 font-medium">
                    Active Subscription
                  </Label>
                </div>
              </div>
              <DialogFooter className="border-t border-gray-800 pt-4 bg-gray-900">
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={() => setIsEditDialogOpen(false)}
                  className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="bg-gradient-to-r from-neon-cyan to-neon-purple text-black font-semibold hover:opacity-90"
                >
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminContent;

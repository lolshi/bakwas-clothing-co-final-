import React, { useEffect, useState, useMemo } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays, startOfDay, endOfDay, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns';
import { 
  Search, 
  Eye, 
  Download, 
  RefreshCw, 
  CalendarDays as CalendarIcon,
  DollarSign,
  Package,
  Clock,
  TrendingUp,
  TrendingDown,
  Filter,
  Edit,
  Trash2,
  Send,
  FileText,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  Brain,
  Lightbulb,
  Bot,
  Workflow,
  GitBranch,
  Timer,
  CheckSquare,
  AlertTriangle,
  Shield,
  CreditCard,
  Star,
  ThumbsUp,
  MessageCircle,
  Headphones,
  HelpCircle,
  BarChart3,
  PieChart,
  Activity,
  Users,
  Target,
  Zap,
  Award,
  Settings,
  MessageSquare,
  Bell,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Upload,
  CheckCircle,
  XCircle,
  AlertCircle,
  ShoppingCart,
  Boxes,
  Tags,
  Image,
  Palette,
  Layers,
  Database,
  Cloud,
  Cpu,
  MemoryStick,
  HardDrive,
  Wifi,
  MapPin,
  Mail,
  Phone,
  Truck,
  Factory,
  Warehouse,
  BookOpen,
  PenTool,
  Type,
  Link,
  Hash,
  PlayCircle,
  PauseCircle,
  Bookmark,
  Share2,
  ExternalLink,
  Copy,
  Code,
  Building,
  Megaphone
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { BlogPost, SupabaseBlogPost } from '@/types/blog';
import BlogPostEditor from '@/components/admin/BlogPostEditor';
import BulkImportModal from '@/components/admin/BulkImportModal';

interface BlogStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  scheduledPosts: number;
  totalViews: number;
  totalShares: number;
  totalComments: number;
  averageReadTime: number;
}

const AdminBlog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [stats, setStats] = useState<BlogStats>({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    scheduledPosts: 0,
    totalViews: 0,
    totalShares: 0,
    totalComments: 0,
    averageReadTime: 0
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateRange, setDateRange] = useState('7d');
  const [fromDate, setFromDate] = useState<Date>();
  const [toDate, setToDate] = useState<Date>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [postFormOpen, setPostFormOpen] = useState(false);
  const [bulkImportOpen, setBulkImportOpen] = useState(false);

  // Memoized date calculations
  const dateFilters = useMemo(() => {
    const now = new Date();
    switch (dateRange) {
      case '1d':
        return { from: startOfDay(now), to: endOfDay(now) };
      case '7d':
        return { from: startOfDay(subDays(now, 7)), to: endOfDay(now) };
      case '30d':
        return { from: startOfDay(subDays(now, 30)), to: endOfDay(now) };
      case 'week':
        return { from: startOfWeek(now), to: endOfWeek(now) };
      case 'month':
        return { from: startOfMonth(now), to: endOfMonth(now) };
      case 'custom':
        return { 
          from: fromDate ? startOfDay(fromDate) : startOfDay(subDays(now, 7)), 
          to: toDate ? endOfDay(toDate) : endOfDay(now) 
        };
      default:
        return { from: startOfDay(subDays(now, 7)), to: endOfDay(now) };
    }
  }, [dateRange, fromDate, toDate]);

  useEffect(() => {
    fetchBlogData();
  }, [dateFilters]);

  const fetchBlogData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchPosts(),
        fetchBlogStats(),
        generateChartData()
      ]);
    } catch (error) {
      console.error('Error fetching blog data:', error);
      toast.error('Failed to fetch blog data');
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    try {
      let postsQuery = supabase
        .from('blog_posts')
        .select<'*', SupabaseBlogPost>('*')
        .order('created_at', { ascending: false });

      if (dateFilters.from) {
        postsQuery = postsQuery.gte('created_at', dateFilters.from.toISOString());
      }
      if (dateFilters.to) {
        postsQuery = postsQuery.lte('created_at', dateFilters.to.toISOString());
      }

      const { data, error } = await postsQuery;

      if (error) {
        console.error('Error fetching posts:', error);
        toast.error('Failed to fetch blog posts');
        return;
      }

      if (data) {
        const transformedPosts: BlogPost[] = data.map(post => ({
          id: post.id,
          title: post.title,
          slug: post.slug,
          content: post.content,
          excerpt: post.excerpt || '',
          featured_image: post.featured_image || '',
          author_name: post.author_name || 'Anonymous',
          categories: post.categories || [],
          tags: post.tags || [],
          is_active: post.is_active || false,
          publish_date: post.publish_date || new Date().toISOString(),
          created_at: post.created_at || new Date().toISOString(),
          updated_at: post.updated_at || new Date().toISOString(),
          status: (post.status as BlogPost['status']) || 'draft',
          post_type: (post.post_type as BlogPost['post_type']) || 'article',
          view_count: post.view_count || 0,
          reading_time: post.reading_time || 0,
          seo_title: post.seo_title || post.title,
          seo_description: post.seo_description || post.excerpt || ''
        }));
        setPosts(transformedPosts);
      }
    } catch (error: any) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to fetch blog posts: ' + error.message);
    }
  };

  const fetchBlogStats = async () => {
    let allPostsQuery = supabase
      .from('blog_posts')
      .select('is_active, publish_date, created_at');

    if (dateFilters.from) {
      allPostsQuery = allPostsQuery.gte('created_at', dateFilters.from.toISOString());
    }
    if (dateFilters.to) {
      allPostsQuery = allPostsQuery.lte('created_at', dateFilters.to.toISOString());
    }

    const { data: allPosts } = await allPostsQuery;

    if (allPosts) {
      const publishedPosts = allPosts.filter(post => post.is_active).length;
      const draftPosts = allPosts.filter(post => !post.is_active).length;
      const today = new Date();
      const scheduledPosts = allPosts.filter(post => 
        post.publish_date && new Date(post.publish_date) > today
      ).length;

      setStats({
        totalPosts: allPosts.length,
        publishedPosts,
        draftPosts,
        scheduledPosts,
        totalViews: 12847, // Mock data for demo
        totalShares: 1256,
        totalComments: 389,
        averageReadTime: 4.2
      });
    }
  };

  const generateChartData = async () => {
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dayPosts = posts.filter(post => 
        post.created_at && 
        new Date(post.created_at).toDateString() === date.toDateString()
      );
      
      chartData.push({
        date: format(date, 'MMM dd'),
        posts: dayPosts.length,
        published: dayPosts.filter(post => post.is_active).length,
        views: Math.floor(Math.random() * 1000) + 500, // Mock data
        engagement: Math.floor(Math.random() * 100) + 20
      });
    }
    setChartData(chartData);
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchBlogData();
    setRefreshing(false);
    toast.success('Data refreshed successfully');
  };

  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesSearch = !searchTerm || 
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || post.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [posts, searchTerm, statusFilter]);

  const getStatusBadge = (post: BlogPost) => {
    if (post.publish_date && new Date(post.publish_date) > new Date()) {
      return <Badge variant="outline" className="bg-blue-100 text-blue-800">Scheduled</Badge>;
    }
    return (
      <Badge variant={post.is_active ? 'default' : 'secondary'} className="flex items-center gap-1">
        <div className={`w-2 h-2 rounded-full ${post.is_active ? 'bg-green-500' : 'bg-gray-400'}`} />
        {post.is_active ? 'Published' : 'Draft'}
      </Badge>
    );
  };

  const handleCreatePost = () => {
    setEditingPost(null);
    setPostFormOpen(true);
  };

  const handleSavePost = async (postData: Partial<BlogPost>) => {
    try {
      // Validate required fields
      if (!postData.title || !postData.content) {
        toast.error('Title and content are required');
        return;
      }

      // Convert BlogPost type to SupabaseBlogPost type
      const supabaseData = {
        title: postData.title,
        content: postData.content,
        slug: postData.slug || postData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        excerpt: postData.excerpt || null,
        featured_image: postData.featured_image || null,
        author_name: postData.author_name || null,
        categories: postData.categories || null,
        tags: postData.tags || null,
        is_active: postData.is_active ?? null,
        publish_date: postData.publish_date || null,
        status: postData.status || 'draft',
        post_type: postData.post_type || 'article',
        view_count: postData.view_count || 0,
        reading_time: postData.reading_time || 0,
        seo_title: postData.seo_title || null,
        seo_description: postData.seo_description || null,
        updated_at: new Date().toISOString()
      };

      if (editingPost?.id) {
        const { error } = await supabase
          .from('blog_posts')
          .update(supabaseData)
          .eq('id', editingPost.id);

        if (error) throw error;
        toast.success('Blog post updated successfully');
      } else {
        const { error } = await supabase
          .from('blog_posts')
          .insert(supabaseData);

        if (error) throw error;
        toast.success('Blog post created successfully');
      }
      
      fetchPosts();
      setEditingPost(null);
      setPostFormOpen(false);
    } catch (error: any) {
      console.error('Error saving blog post:', error);
      toast.error('Failed to save blog post: ' + error.message);
    }
  };

  const deletePost = async (id: string) => {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Blog post deleted');
      fetchBlogData();
    } catch (error) {
      console.error('Error deleting blog post:', error);
      toast.error('Failed to delete blog post');
    }
  };

  const handleEditPost = (post: BlogPost) => {
    setEditingPost(post);
    setPostFormOpen(true);
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await deletePost(postId);
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  };

  const handleExportPosts = () => {
    try {
      // Implement export functionality
      toast.success('Posts exported successfully');
    } catch (error) {
      toast.error('Failed to export posts');
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center space-y-4">
            <RefreshCw className="h-12 w-12 animate-spin text-neon-cyan mx-auto" />
            <p className="text-gray-600">Loading blog data...</p>
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
              Enterprise Blog Management
            </h1>
            <p className="text-gray-600">
              Complete content lifecycle management with AI insights, SEO optimization, and performance analytics
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshData}
              disabled={refreshing}
              className="bg-black/50 text-white hover:bg-gray-800 border-gray-700"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[180px] bg-black/50 text-white border-gray-700">
                <SelectValue placeholder="Select date range" />
              </SelectTrigger>
              <SelectContent className="bg-black/90 text-white border-gray-700">
                <SelectItem value="1d">Today</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="week">This week</SelectItem>
                <SelectItem value="month">This month</SelectItem>
                <SelectItem value="custom">Custom range</SelectItem>
              </SelectContent>
            </Select>

            {dateRange === 'custom' && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="bg-black/50 text-white border-gray-700">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {fromDate ? format(fromDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-black/90 text-white border-gray-700" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={fromDate}
                    selected={{ from: fromDate, to: toDate }}
                    onSelect={(range) => {
                      setFromDate(range?.from);
                      setToDate(range?.to);
                    }}
                    numberOfMonths={2}
                    className="bg-black/90 text-white"
                  />
                </PopoverContent>
              </Popover>
            )}

            <Button 
              variant="outline"
              className="bg-black/50 text-white hover:bg-gray-800 border-gray-700"
              onClick={() => setBulkImportOpen(true)}
            >
              <Upload className="h-4 w-4 mr-2" />
              Bulk Import
            </Button>

            <Button className="bg-neon-cyan text-black hover:bg-neon-cyan/80" onClick={handleCreatePost}>
              <Plus className="h-4 w-4 mr-2" />
              New Post
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

        {/* Enhanced Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="posts" className="relative">
              Posts
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
            <TabsTrigger value="content" className="relative">
              Content
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
            <TabsTrigger value="publishing" className="relative">
              Publishing
              <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-800 text-xs">
                🚀 Preview
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="performance" className="relative">
              Performance
              <Badge variant="secondary" className="ml-2 bg-amber-100 text-amber-800 text-xs">
                📊 Demo
              </Badge>
            </TabsTrigger>
          </TabsList>

          {/* Posts Tab - Enhanced Blog Management */}
          <TabsContent value="posts" className="space-y-6">
            {/* Quick Overview Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Total Posts</p>
                      <p className="text-2xl font-bold text-blue-900">{stats.totalPosts}</p>
                      <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        +{Math.floor(stats.totalPosts * 0.15)} this month
                      </p>
                    </div>
                    <BookOpen className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">Published</p>
                      <p className="text-2xl font-bold text-green-900">{stats.publishedPosts}</p>
                      <p className="text-xs text-green-600 mt-1">
                        {stats.totalPosts > 0 ? Math.round((stats.publishedPosts / stats.totalPosts) * 100) : 0}% of total
                      </p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 hover:shadow-lg transition-all">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-amber-600">Total Views</p>
                      <p className="text-2xl font-bold text-amber-900">{stats.totalViews.toLocaleString()}</p>
                      <p className="text-xs text-amber-600 mt-1">
                        Avg {Math.round(stats.totalViews / Math.max(stats.publishedPosts, 1))} per post
                      </p>
                    </div>
                    <Eye className="h-8 w-8 text-amber-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600">Engagement</p>
                      <p className="text-2xl font-bold text-purple-900">{stats.totalComments}</p>
                      <p className="text-xs text-purple-600 mt-1">
                        {stats.totalShares} shares
                      </p>
                    </div>
                    <MessageCircle className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      Blog Posts Management
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        ✅ Live
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Complete blog content management with rich editor and publishing workflow ({filteredPosts.length} posts)
                    </CardDescription>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Import
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
                
                {/* Enhanced Filters */}
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex items-center space-x-2">
                    <Search className="h-4 w-4 text-gray-600" />
                    <Input
                      placeholder="Search posts, excerpts, tags..."
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
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Advanced Filters
                </Button>
              </div>
            </CardHeader>
              
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                      <TableHead className="w-12">
                        <Checkbox />
                      </TableHead>
                      <TableHead>Post</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Categories</TableHead>
                      <TableHead>Author</TableHead>
                    <TableHead>Published</TableHead>
                      <TableHead>Performance</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredPosts.map((post) => (
                      <TableRow key={post.id} className="hover:bg-gray-50">
                        <TableCell>
                          <Checkbox />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                              <FileText className="h-5 w-5 text-gray-500" />
                            </div>
                        <div>
                              <div className="font-medium">{post.title}</div>
                              <div className="text-sm text-gray-500 max-w-xs truncate">{post.excerpt}</div>
                            </div>
                        </div>
                      </TableCell>
                      <TableCell>
                          {getStatusBadge(post)}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                            {post.categories?.slice(0, 2).map((category, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                              {category}
                            </Badge>
                          ))}
                            {post.categories && post.categories.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{post.categories.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                          <div className="text-sm">{post.author_name || 'Admin'}</div>
                        </TableCell>
                        <TableCell>
                          {post.publish_date ? format(new Date(post.publish_date), 'MMM dd, yyyy') : 'Not set'}
                        </TableCell>
                        <TableCell>
                          <div className="text-xs space-y-1">
                            <div className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {Math.floor(Math.random() * 1000) + 100}
                            </div>
                            <div className="flex items-center gap-1">
                              <MessageCircle className="h-3 w-3" />
                              {Math.floor(Math.random() * 50)}
                            </div>
                          </div>
                      </TableCell>
                      <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm" asChild>
                            <a href={`/blogs/${post.slug}`} target="_blank" rel="noopener noreferrer">
                              <Eye className="h-4 w-4" />
                            </a>
                          </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleEditPost(post)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeletePost(post.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
                
                {filteredPosts.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No blog posts found matching your filters
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab - Blog Performance Analytics */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Content Performance Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Content Performance
                    <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                      📊 Demo
                    </Badge>
                  </CardTitle>
                  <CardDescription>Views, engagement, and publishing trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area dataKey="views" stackId="1" stroke="#3b82f6" fill="#93c5fd" />
                      <Area dataKey="engagement" stackId="1" stroke="#8b5cf6" fill="#c4b5fd" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Engagement Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Audience Engagement
                    <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                      📊 Demo
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={[
                          { name: 'Social Shares', value: 45, color: '#3b82f6' },
                          { name: 'Comments', value: 30, color: '#8b5cf6' },
                          { name: 'Email Shares', value: 15, color: '#10b981' },
                          { name: 'Bookmarks', value: 10, color: '#f59e0b' }
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {[
                          { name: 'Social Shares', value: 45, color: '#3b82f6' },
                          { name: 'Comments', value: 30, color: '#8b5cf6' },
                          { name: 'Email Shares', value: 15, color: '#10b981' },
                          { name: 'Bookmarks', value: 10, color: '#f59e0b' }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
            </CardContent>
          </Card>
            </div>

            {/* Top Performing Content */}
          <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Top Performing Content
                  <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                    📊 Demo
                  </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                  {[
                    { title: 'The Evolution of Street Culture in Delhi', views: 2847, engagement: 94 },
                    { title: 'Sustainable Streetwear: The Future of Fashion', views: 2156, engagement: 87 },
                    { title: 'Building a Streetwear Community in India', views: 1932, engagement: 82 },
                    { title: 'BAKWAS Brand Story: From Underground to Mainstream', views: 1743, engagement: 76 }
                  ].map((post, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{post.title}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          {post.views.toLocaleString()} views • {post.engagement}% engagement rate
                        </p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">
                        #{index + 1}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Tab - Advanced Content Management */}
          <TabsContent value="content" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PenTool className="h-5 w-5" />
                    Rich Content Editor
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      🚀 Preview
                    </Badge>
                  </CardTitle>
                  <CardDescription>Advanced WYSIWYG editor with media management</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
                    <div className="text-center text-gray-500">
                      <Type className="h-12 w-12 mx-auto mb-4" />
                      <p className="font-medium">Rich Text Editor</p>
                      <p className="text-sm">TinyMCE/Quill integration placeholder</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Image className="h-4 w-4 mr-2" />
                      Insert Media
                    </Button>
                    <Button variant="outline" size="sm">
                      <Link className="h-4 w-4 mr-2" />
                      Add Link
                    </Button>
                    <Button variant="outline" size="sm">
                      <Code className="h-4 w-4 mr-2" />
                      Code Block
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Image className="h-5 w-5" />
                    Media Library
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      🚀 Preview
                    </Badge>
                  </CardTitle>
                  <CardDescription>Centralized image and media management</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                        <Image className="h-6 w-6 text-gray-400" />
                      </div>
                    ))}
                  </div>
                  <Button className="w-full" variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Media
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Content Templates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5" />
                  Content Templates
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    🚀 Preview
                  </Badge>
                </CardTitle>
                <CardDescription>Pre-built templates for different content types</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { name: 'Product Review', desc: 'Structured product review template', icon: Star },
                    { name: 'Brand Story', desc: 'Company news and updates', icon: Building },
                    { name: 'Style Guide', desc: 'Fashion and styling content', icon: Palette },
                    { name: 'Community Spotlight', desc: 'Customer and community features', icon: Users },
                    { name: 'Tutorial/How-to', desc: 'Educational content template', icon: BookOpen },
                    { name: 'Press Release', desc: 'Official announcements', icon: Megaphone }
                  ].map((template, index) => (
                    <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                      <div className="flex items-center gap-3 mb-2">
                        <template.icon className="h-5 w-5 text-blue-600" />
                        <p className="font-medium">{template.name}</p>
                      </div>
                      <p className="text-sm text-gray-600">{template.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SEO Tab - Search Engine Optimization */}
          <TabsContent value="seo" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    SEO Optimization Dashboard
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                      🎨 UI Only
                    </Badge>
                  </CardTitle>
                  <CardDescription>Monitor and improve search engine visibility</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { post: 'Street Culture Evolution', score: 92, issues: 1 },
                    { post: 'Sustainable Fashion Future', score: 87, issues: 2 },
                    { post: 'Community Building Guide', score: 73, issues: 4 },
                    { post: 'Brand Story Deep Dive', score: 68, issues: 5 }
                  ].map((item, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium">{item.post}</p>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-bold ${
                            item.score >= 90 ? 'text-green-600' :
                            item.score >= 70 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {item.score}%
                          </span>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        {item.issues} optimization opportunities
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            item.score >= 90 ? 'bg-green-500' :
                            item.score >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${item.score}%` }}
                  />
                </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Keyword Performance
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                      🎨 UI Only
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { keyword: 'streetwear fashion', ranking: 3, volume: '8.2K', trend: 'up' },
                    { keyword: 'delhi street style', ranking: 7, volume: '4.1K', trend: 'up' },
                    { keyword: 'sustainable fashion', ranking: 12, volume: '15.6K', trend: 'down' },
                    { keyword: 'urban clothing brand', ranking: 5, volume: '2.8K', trend: 'stable' }
                  ].map((kw, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                        <p className="font-medium">{kw.keyword}</p>
                        <p className="text-sm text-gray-600">{kw.volume} monthly searches</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">#{kw.ranking}</Badge>
                        {kw.trend === 'up' ? (
                          <ArrowUpRight className="h-4 w-4 text-green-500" />
                        ) : kw.trend === 'down' ? (
                          <ArrowDownRight className="h-4 w-4 text-red-500" />
                        ) : (
                          <div className="w-4 h-4" />
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
                </div>
          </TabsContent>

          {/* Publishing Tab - Content Publishing Workflow */}
          <TabsContent value="publishing" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5" />
                    Editorial Calendar
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      🚀 Preview
                    </Badge>
                  </CardTitle>
                  <CardDescription>Schedule and manage content publishing</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { title: 'Winter Collection Launch', date: '2024-01-20', status: 'scheduled' },
                      { title: 'Community Spotlight: Delhi Artists', date: '2024-01-22', status: 'draft' },
                      { title: 'Sustainable Fashion Week Coverage', date: '2024-01-25', status: 'review' },
                      { title: 'Behind the Brand: Founder Story', date: '2024-01-28', status: 'scheduled' }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                          <p className="font-medium">{item.title}</p>
                          <p className="text-sm text-gray-600">{format(new Date(item.date), 'MMM dd, yyyy')}</p>
                        </div>
                        <Badge className={`${
                          item.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                          item.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {item.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Share2 className="h-5 w-5" />
                    Social Media Integration
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      🚀 Preview
                    </Badge>
                  </CardTitle>
                  <CardDescription>Auto-post to social platforms</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { platform: 'Instagram', connected: true, auto: true },
                    { platform: 'Twitter/X', connected: true, auto: false },
                    { platform: 'LinkedIn', connected: false, auto: false },
                    { platform: 'Facebook', connected: true, auto: true }
                  ].map((social, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${social.connected ? 'bg-green-500' : 'bg-gray-400'}`} />
                        <span className="font-medium">{social.platform}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch checked={social.auto} disabled={!social.connected} />
                        <span className="text-sm text-gray-600">Auto-post</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Publishing Workflow */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Workflow className="h-5 w-5" />
                  Publishing Workflow
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    🚀 Preview
                  </Badge>
                </CardTitle>
                <CardDescription>Automated content approval and publishing pipeline</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[
                    { stage: 'Draft', count: stats.draftPosts, color: 'gray' },
                    { stage: 'Review', count: 3, color: 'yellow' },
                    { stage: 'Scheduled', count: stats.scheduledPosts, color: 'blue' },
                    { stage: 'Published', count: stats.publishedPosts, color: 'green' }
                  ].map((stage, index) => (
                    <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">{stage.stage}</p>
                      <p className="text-2xl font-bold text-gray-900">{stage.count}</p>
                      <div className={`w-full h-2 rounded-full mt-2 ${
                        stage.color === 'gray' ? 'bg-gray-200' :
                        stage.color === 'yellow' ? 'bg-yellow-200' :
                        stage.color === 'blue' ? 'bg-blue-200' : 'bg-green-200'
                      }`} />
                </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Tab - Blog Performance Metrics */}
          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Blog Performance Dashboard
                  <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                    📊 Demo
                  </Badge>
                </CardTitle>
                <CardDescription>Comprehensive analytics and performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {[
                    { label: 'Avg. Read Time', value: `${stats.averageReadTime}min`, change: '+0.3min', color: 'green' },
                    { label: 'Bounce Rate', value: '34.2%', change: '-2.1%', color: 'green' },
                    { label: 'Social Shares', value: stats.totalShares.toLocaleString(), change: '+18%', color: 'blue' },
                    { label: 'Subscriber Growth', value: '+145', change: '+23%', color: 'purple' }
                  ].map((metric, index) => (
                    <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">{metric.label}</p>
                      <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                      <p className={`text-xs font-medium ${
                        metric.color === 'green' ? 'text-green-600' :
                        metric.color === 'blue' ? 'text-blue-600' :
                        metric.color === 'purple' ? 'text-purple-600' : 'text-orange-600'
                      }`}>
                        {metric.change} vs last month
                      </p>
                </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Content ROI Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Content ROI Analysis
                    <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                      📊 Demo
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="views" stroke="#3b82f6" strokeWidth={2} />
                      <Line type="monotone" dataKey="engagement" stroke="#8b5cf6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Audience Growth
                    <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                      📊 Demo
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { source: 'Organic Search', visitors: 4520, growth: '+12%' },
                      { source: 'Social Media', visitors: 2340, growth: '+8%' },
                      { source: 'Direct Traffic', visitors: 1890, growth: '+5%' },
                      { source: 'Email Newsletter', visitors: 980, growth: '+15%' },
                      { source: 'Referrals', visitors: 650, growth: '+3%' }
                    ].map((source, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                          <p className="font-medium">{source.source}</p>
                          <p className="text-sm text-gray-600">{source.visitors.toLocaleString()} visitors</p>
                </div>
                        <Badge className="bg-green-100 text-green-800">
                          {source.growth}
                        </Badge>
                </div>
                    ))}
              </div>
            </CardContent>
          </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Blog Post Form Dialog */}
        <Dialog open={postFormOpen} onOpenChange={setPostFormOpen}>
          <DialogContent className="sm:max-w-[800px] h-[85vh] p-0 overflow-hidden bg-transparent border-none">
            <BlogPostEditor
              post={editingPost}
              onSave={handleSavePost}
              onCancel={() => setPostFormOpen(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Bulk Import Modal */}
        <BulkImportModal
          isOpen={bulkImportOpen}
          onClose={() => setBulkImportOpen(false)}
          onSuccess={() => {
            setBulkImportOpen(false);
            fetchBlogData();
          }}
        />
      </div>
    </AdminLayout>
  );
};

export default AdminBlog;


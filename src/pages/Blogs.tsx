import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Calendar, 
  User, 
  ChevronRight, 
  BookOpen, 
  Tag, 
  Clock, 
  ArrowRight, 
  Eye, 
  Filter,
  TrendingUp,
  Star,
  MessageCircle,
  Share2,
  ChevronLeft,
  Mail,
  Bell,
  Rss,
  Heart,
  Bookmark,
  ArrowUpRight
} from 'lucide-react';
import { format } from 'date-fns';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image: string | null;
  categories: string[] | null;
  author_name: string | null;
  publish_date: string | null;
  is_featured?: boolean;
  view_count?: number;
  read_time?: number;
}

interface BlogStats {
  totalPosts: number;
  totalViews: number;
  totalAuthors: number;
  avgReadTime: number;
}

const Blogs = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [featuredPosts, setFeaturedPosts] = useState<BlogPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(9);
  const [emailSubscription, setEmailSubscription] = useState('');
  const [stats, setStats] = useState<BlogStats>({
    totalPosts: 0,
    totalViews: 0,
    totalAuthors: 0,
    avgReadTime: 0
  });

  useEffect(() => {
    fetchPosts();
    fetchBlogStats();
  }, []);

  useEffect(() => {
    filterPosts();
  }, [posts, searchTerm, selectedCategory, sortBy]);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('is_active', true)
        .order('publish_date', { ascending: false });

      if (error) throw error;
      
      // Filter and map data to ensure proper typing
      const postsData: BlogPost[] = (data || [])
        .filter((post) => 
          post.title && 
          post.slug && 
          post.publish_date
        )
        .map(post => ({
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          featured_image: post.featured_image,
          categories: post.categories,
          author_name: post.author_name,
          publish_date: post.publish_date,
          is_featured: Math.random() > 0.7, // Mock featured status
          view_count: Math.floor(Math.random() * 2000) + 100,
          read_time: Math.floor(Math.random() * 8) + 2
        }));
      
      setPosts(postsData);
      setFeaturedPosts(postsData.filter(post => post.is_featured).slice(0, 3));
      
      // Extract unique categories
      const allCategories = postsData.flatMap(post => post.categories || []);
      const uniqueCategories = Array.from(new Set(allCategories));
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBlogStats = async () => {
    // Mock stats for demo - in real app, these would come from analytics
    setStats({
      totalPosts: 24,
      totalViews: 45820,
      totalAuthors: 8,
      avgReadTime: 4.2
    });
  };

  const filterPosts = () => {
    let filtered = posts;

    if (searchTerm) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.categories?.some(cat => cat.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(post =>
        post.categories?.includes(selectedCategory)
      );
    }

    // Sort posts
    switch (sortBy) {
      case 'popular':
        filtered = filtered.sort((a, b) => (b.view_count || 0) - (a.view_count || 0));
        break;
      case 'trending':
        filtered = filtered.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
        break;
      case 'oldest':
        filtered = filtered.sort((a, b) => 
          new Date(a.publish_date || 0).getTime() - new Date(b.publish_date || 0).getTime()
        );
        break;
      default: // latest
        filtered = filtered.sort((a, b) => 
          new Date(b.publish_date || 0).getTime() - new Date(a.publish_date || 0).getTime()
      );
    }

    setFilteredPosts(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleSubscription = async () => {
    if (emailSubscription) {
      // Mock subscription logic
      alert(`Thank you for subscribing with ${emailSubscription}!`);
      setEmailSubscription('');
    }
  };

  // Mock blog posts for demo if no data
  const mockPosts: BlogPost[] = [
    {
      id: '1',
      title: 'The Evolution of Street Culture in Delhi',
      slug: 'evolution-street-culture-delhi',
      excerpt: 'Exploring how Delhi\'s vibrant street culture has influenced modern fashion and given birth to authentic brands like BAKWAS.',
      featured_image: '/api/placeholder/400/250',
      categories: ['Culture', 'Fashion'],
      author_name: 'Shivam Khandelwal',
      publish_date: '2024-01-15',
      is_featured: true,
      view_count: 2847,
      read_time: 5
    },
    {
      id: '2',
      title: 'Sustainable Streetwear: The Future of Fashion',
      slug: 'sustainable-streetwear-future-fashion',
      excerpt: 'How eco-conscious design and sustainable practices are reshaping the streetwear industry without compromising on style.',
      featured_image: '/api/placeholder/400/250',
      categories: ['Sustainability', 'Innovation'],
      author_name: 'Ashutosh Sharma',
      publish_date: '2024-01-10',
      view_count: 1924,
      read_time: 4
    },
    {
      id: '3',
      title: 'Building a Streetwear Community in India',
      slug: 'building-streetwear-community-india',
      excerpt: 'The journey of creating an authentic community of streetwear enthusiasts and what it means for Indian fashion.',
      featured_image: '/api/placeholder/400/250',
      categories: ['Community', 'Business'],
      author_name: 'Saurabh Choudhary',
      publish_date: '2024-01-05',
      view_count: 1658,
      read_time: 6
    }
  ];

  const displayPosts = filteredPosts.length > 0 ? filteredPosts : (posts.length === 0 ? mockPosts : []);
  const displayFeatured = featuredPosts.length > 0 ? featuredPosts : mockPosts.slice(0, 3);

  // Pagination
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = displayPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(displayPosts.length / postsPerPage);

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-black flex items-center justify-center">
        <motion.div 
          className="bg-black/40 backdrop-blur-xl border-2 border-neon-cyan/30 rounded-2xl p-12 shadow-2xl shadow-neon-cyan/20"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-4">
            <motion.div
              className="w-8 h-8 border-3 border-neon-cyan border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <span className="text-2xl font-anton bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">
              LOADING BLOGS...
            </span>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Multiple animated gradient layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/15 via-black to-neon-cyan/15 animate-gradient-shift"></div>
        <div className="absolute inset-0 bg-gradient-to-tl from-neon-pink/8 via-transparent to-neon-orange/8 animate-pulse"></div>
        
        {/* Floating particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1.5 h-1.5 bg-neon-cyan/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -25, 0],
                opacity: [0.2, 0.8, 0.2],
                scale: [1, 1.3, 1],
              }}
              transition={{
                duration: 4 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 3,
              }}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 p-4 md:p-8">
        {/* Hero Section */}
        <motion.div 
          className="max-w-7xl mx-auto mb-16"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-center mb-12">
            <motion.img 
              src="/lovable-uploads/97535d1c-cb3e-4d54-ab8b-54078a7ca53c.png" 
              alt="Bakwas Clothing Co." 
              className="w-40 h-auto mx-auto mb-8 drop-shadow-2xl"
              animate={{ 
                filter: [
                  'drop-shadow(0 0 15px rgba(0, 225, 255, 0.4))',
                  'drop-shadow(0 0 25px rgba(139, 92, 246, 0.4))',
                  'drop-shadow(0 0 15px rgba(0, 225, 255, 0.4))'
                ]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            
            <motion.h1 
              className="text-6xl md:text-8xl font-anton bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink bg-clip-text text-transparent mb-6"
              animate={{ 
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{ duration: 6, repeat: Infinity }}
              style={{ backgroundSize: '200% 100%' }}
            >
              BAKWAS BLOG
            </motion.h1>
            
            <motion.p 
              className="text-xl md:text-2xl text-white/70 font-space max-w-4xl mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              Dive deep into the world of streetwear culture, fashion insights, and the stories behind 
              <span className="text-neon-cyan font-bold"> BAKWAS</span> movement.
            </motion.p>
          </div>

          {/* Breadcrumbs */}
          <motion.nav 
            className="flex items-center justify-center space-x-2 text-white/60 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            <Link to="/" className="hover:text-neon-cyan transition-colors font-space">
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-neon-cyan font-space">Blogs</span>
          </motion.nav>
        </motion.div>

        <div className="max-w-7xl mx-auto space-y-12">
          {/* Blog Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="bg-black/40 backdrop-blur-xl border-2 border-neon-cyan/30 shadow-2xl shadow-neon-cyan/20 rounded-2xl">
                <CardContent className="p-6 text-center">
                  <BookOpen className="h-8 w-8 text-neon-cyan mx-auto mb-3" />
                  <p className="text-3xl font-anton text-neon-cyan mb-1">{stats.totalPosts}</p>
                  <p className="text-white/70 font-space text-sm">Total Posts</p>
                </CardContent>
              </Card>
              
              <Card className="bg-black/40 backdrop-blur-xl border-2 border-neon-purple/30 shadow-2xl shadow-neon-purple/20 rounded-2xl">
                <CardContent className="p-6 text-center">
                  <Eye className="h-8 w-8 text-neon-purple mx-auto mb-3" />
                  <p className="text-3xl font-anton text-neon-purple mb-1">{stats.totalViews.toLocaleString()}</p>
                  <p className="text-white/70 font-space text-sm">Total Views</p>
                </CardContent>
              </Card>

              <Card className="bg-black/40 backdrop-blur-xl border-2 border-neon-pink/30 shadow-2xl shadow-neon-pink/20 rounded-2xl">
                <CardContent className="p-6 text-center">
                  <User className="h-8 w-8 text-neon-pink mx-auto mb-3" />
                  <p className="text-3xl font-anton text-neon-pink mb-1">{stats.totalAuthors}</p>
                  <p className="text-white/70 font-space text-sm">Authors</p>
                </CardContent>
              </Card>

              <Card className="bg-black/40 backdrop-blur-xl border-2 border-neon-orange/30 shadow-2xl shadow-neon-orange/20 rounded-2xl">
                <CardContent className="p-6 text-center">
                  <Clock className="h-8 w-8 text-neon-orange mx-auto mb-3" />
                  <p className="text-3xl font-anton text-neon-orange mb-1">{stats.avgReadTime}min</p>
                  <p className="text-white/70 font-space text-sm">Avg Read</p>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Featured Posts Section */}
          {displayFeatured.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <div className="mb-8">
                <h2 className="text-4xl font-anton bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent mb-4">
                  FEATURED STORIES
                </h2>
                <p className="text-white/70 font-space text-lg">
                  Our most popular and trending content from the streetwear world
                </p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                {displayFeatured.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1, duration: 0.6 }}
                    whileHover={{ scale: 1.02, y: -5 }}
                  >
                    <Card className="group bg-black/40 backdrop-blur-xl border-2 border-neon-cyan/30 hover:border-neon-purple/50 shadow-2xl shadow-neon-cyan/20 hover:shadow-neon-purple/30 transition-all duration-500 rounded-2xl h-full overflow-hidden">
                      {/* Featured Badge */}
                      <div className="absolute top-4 left-4 z-10">
                        <Badge className="bg-gradient-to-r from-neon-orange to-neon-pink text-black font-anton">
                          <Star className="h-3 w-3 mr-1" />
                          FEATURED
                        </Badge>
                      </div>

                      {/* Featured Image */}
                      {post.featured_image && (
                        <div className="aspect-video overflow-hidden relative">
                          <img
                            src={post.featured_image}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                          <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm rounded-full p-2">
                            <div className="flex items-center gap-2 text-white text-xs">
                              <Eye className="h-3 w-3" />
                              <span>{post.view_count?.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <CardHeader className="pb-3">
                        {/* Categories */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          {post.categories?.map((category, catIndex) => (
                            <Badge 
                              key={category} 
                              className={`text-xs font-space font-semibold ${
                                catIndex % 4 === 0 ? 'bg-neon-cyan/20 text-neon-cyan border-neon-cyan/30' :
                                catIndex % 4 === 1 ? 'bg-neon-purple/20 text-neon-purple border-neon-purple/30' :
                                catIndex % 4 === 2 ? 'bg-neon-pink/20 text-neon-pink border-neon-pink/30' :
                                'bg-neon-orange/20 text-neon-orange border-neon-orange/30'
                              }`}
                            >
                              <Tag className="h-3 w-3 mr-1" />
                              {category}
                            </Badge>
                          ))}
                        </div>

                        {/* Title */}
                        <CardTitle className="text-2xl font-anton text-white group-hover:text-neon-cyan transition-colors duration-300">
                          <Link 
                            to={`/blogs/${post.slug}`}
                            className="line-clamp-2 leading-tight"
                          >
                            {post.title}
                          </Link>
                        </CardTitle>
                      </CardHeader>
                      
                      <CardContent className="pt-0">
                        {/* Excerpt */}
                        {post.excerpt && (
                          <p className="text-white/70 font-space text-sm mb-4 line-clamp-3 leading-relaxed">
                            {post.excerpt}
                          </p>
                        )}

                        {/* Meta Info */}
                        <div className="flex items-center justify-between text-xs text-white/50 mb-4">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              <span className="font-space">{post.author_name}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span className="font-space">{post.read_time}min read</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span className="font-space">{format(new Date(post.publish_date || ''), 'MMM dd')}</span>
                          </div>
                        </div>

                        {/* Read More */}
                        <Link 
                          to={`/blogs/${post.slug}`}
                          className="group/link inline-flex items-center gap-2 text-neon-cyan hover:text-neon-purple transition-colors duration-300 font-space font-semibold text-sm"
                        >
                          <span>READ STORY</span>
                          <ArrowRight className="h-4 w-4 group-hover/link:translate-x-1 transition-transform duration-300" />
                        </Link>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <Card className="bg-black/40 backdrop-blur-xl border-2 border-neon-cyan/30 shadow-2xl shadow-neon-cyan/20 rounded-2xl">
              <CardContent className="p-6">
                <div className="flex flex-col gap-6">
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-neon-cyan" />
                    <Input
                      placeholder="Search blog posts, topics, or authors..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-14 bg-gray-900/60 border-2 border-gray-600 focus:border-neon-cyan text-white placeholder:text-gray-400 h-14 text-lg rounded-xl backdrop-blur-sm"
                    />
                  </div>

                  {/* Filters */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Filter className="h-5 w-5 text-neon-purple" />
                      <span className="text-neon-purple font-anton text-lg">FILTERS:</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-3">
                      {/* Category Filter */}
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        variant={selectedCategory === '' ? 'default' : 'outline'}
                        onClick={() => setSelectedCategory('')}
                        className={`${
                          selectedCategory === '' 
                            ? 'bg-neon-cyan/20 border-neon-cyan/50 text-neon-cyan' 
                            : 'bg-gray-900/40 border-gray-600/30 text-gray-400 hover:border-neon-cyan/50 hover:text-neon-cyan'
                        } font-space font-semibold transition-all duration-300`}
                      >
                        All Posts
                      </Button>
                        {categories.map((category) => (
                        <Button
                          key={category}
                          variant={selectedCategory === category ? 'default' : 'outline'}
                          onClick={() => setSelectedCategory(category)}
                          className={`${
                            selectedCategory === category 
                              ? 'bg-neon-purple/20 border-neon-purple/50 text-neon-purple' 
                              : 'bg-gray-900/40 border-gray-600/30 text-gray-400 hover:border-neon-purple/50 hover:text-neon-purple'
                          } font-space font-semibold transition-all duration-300`}
                        >
                          {category}
                        </Button>
                      ))}
                    </div>

                      {/* Sort Filter */}
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-[140px] bg-gray-900/40 border-gray-600/30 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="latest">Latest</SelectItem>
                          <SelectItem value="popular">Most Popular</SelectItem>
                          <SelectItem value="trending">Trending</SelectItem>
                          <SelectItem value="oldest">Oldest</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Results count */}
                  <div className="text-white/60 font-space text-sm">
                    Showing {currentPosts.length} of {displayPosts.length} posts
                    {searchTerm && (
                      <span className="text-neon-cyan"> matching "{searchTerm}"</span>
                    )}
                    {selectedCategory && (
                      <span className="text-neon-purple"> in {selectedCategory}</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Blog Posts Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            {currentPosts.length === 0 ? (
              <motion.div 
                className="text-center py-16"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
              >
                <Card className="bg-black/40 backdrop-blur-xl border-2 border-neon-orange/30 shadow-2xl shadow-neon-orange/20 rounded-2xl max-w-2xl mx-auto">
                  <CardContent className="p-12">
                    <div className="w-24 h-24 bg-gradient-to-r from-neon-orange/20 to-neon-pink/20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <BookOpen className="h-12 w-12 text-neon-orange" />
                    </div>
                    <h3 className="text-2xl font-anton text-neon-orange mb-4">NO POSTS FOUND</h3>
                    <p className="text-white/60 font-space text-lg mb-6">
                      Try adjusting your search terms or browse different categories.
                    </p>
                    <Button 
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedCategory('');
                        setSortBy('latest');
                      }}
                      className="bg-gradient-to-r from-neon-orange to-neon-pink text-black font-anton"
                    >
                      RESET FILTERS
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {currentPosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1, duration: 0.6 }}
                    whileHover={{ scale: 1.02, y: -5 }}
                  >
                    <Card className="group bg-black/40 backdrop-blur-xl border-2 border-neon-purple/20 hover:border-neon-cyan/50 shadow-2xl shadow-neon-purple/10 hover:shadow-neon-cyan/30 transition-all duration-500 rounded-2xl h-full overflow-hidden">
                      {/* Featured Image */}
                      {post.featured_image && (
                        <div className="aspect-video overflow-hidden relative">
                          <img
                            src={post.featured_image}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                          <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm rounded-full p-2">
                            <div className="flex items-center gap-2 text-white text-xs">
                              <Eye className="h-3 w-3" />
                              <span>{post.view_count?.toLocaleString()}</span>
                            </div>
                          </div>
                          {post.is_featured && (
                            <div className="absolute top-4 left-4">
                              <Badge className="bg-gradient-to-r from-neon-orange to-neon-pink text-black font-anton text-xs">
                                <TrendingUp className="h-3 w-3 mr-1" />
                                TRENDING
                              </Badge>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <CardHeader className="pb-3">
                        {/* Categories */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          {post.categories?.map((category, catIndex) => (
                            <Badge 
                              key={category} 
                              className={`text-xs font-space font-semibold ${
                                catIndex % 4 === 0 ? 'bg-neon-cyan/20 text-neon-cyan border-neon-cyan/30' :
                                catIndex % 4 === 1 ? 'bg-neon-purple/20 text-neon-purple border-neon-purple/30' :
                                catIndex % 4 === 2 ? 'bg-neon-pink/20 text-neon-pink border-neon-pink/30' :
                                'bg-neon-orange/20 text-neon-orange border-neon-orange/30'
                              }`}
                            >
                              <Tag className="h-3 w-3 mr-1" />
                              {category}
                            </Badge>
                          ))}
                        </div>

                        {/* Title */}
                        <CardTitle className="text-xl font-anton text-white group-hover:text-neon-cyan transition-colors duration-300">
                          <Link 
                            to={`/blogs/${post.slug}`}
                            className="line-clamp-2 leading-tight"
                          >
                            {post.title}
                          </Link>
                        </CardTitle>
                      </CardHeader>
                      
                      <CardContent className="pt-0">
                        {/* Excerpt */}
                        {post.excerpt && (
                          <p className="text-white/70 font-space text-sm mb-4 line-clamp-3 leading-relaxed">
                            {post.excerpt}
                          </p>
                        )}

                        {/* Meta Info */}
                        <div className="flex items-center justify-between text-xs text-white/50 mb-4">
                          <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span className="font-space">{post.author_name}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span className="font-space">{post.read_time}min</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span className="font-space">{format(new Date(post.publish_date || ''), 'MMM dd')}</span>
                          </div>
                        </div>

                        {/* Engagement Stats */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3 text-xs text-white/40">
                            <div className="flex items-center gap-1">
                              <MessageCircle className="h-3 w-3" />
                              <span>{Math.floor(Math.random() * 25) + 5}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Share2 className="h-3 w-3" />
                              <span>{Math.floor(Math.random() * 15) + 3}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" className="p-1 h-auto">
                              <Heart className="h-4 w-4 text-white/40 hover:text-neon-pink transition-colors" />
                            </Button>
                            <Button variant="ghost" size="sm" className="p-1 h-auto">
                              <Bookmark className="h-4 w-4 text-white/40 hover:text-neon-cyan transition-colors" />
                            </Button>
                          </div>
                        </div>

                        {/* Read More */}
                        <Link 
                          to={`/blogs/${post.slug}`}
                          className="group/link inline-flex items-center gap-2 text-neon-cyan hover:text-neon-purple transition-colors duration-300 font-space font-semibold text-sm"
                        >
                          <span>READ MORE</span>
                          <ArrowRight className="h-4 w-4 group-hover/link:translate-x-1 transition-transform duration-300" />
                        </Link>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Pagination */}
          {totalPages > 1 && (
            <motion.div
              className="flex justify-center items-center gap-4 mt-12"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
            >
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="bg-gray-900/40 border-gray-600/30 text-white hover:border-neon-cyan/50 hover:text-neon-cyan disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              <div className="flex items-center gap-2">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? 'default' : 'outline'}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-10 h-10 ${
                        currentPage === pageNum
                          ? 'bg-neon-cyan/20 border-neon-cyan/50 text-neon-cyan'
                          : 'bg-gray-900/40 border-gray-600/30 text-white hover:border-neon-cyan/50 hover:text-neon-cyan'
                      }`}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                {totalPages > 5 && (
                  <>
                    <span className="text-white/40 px-2">...</span>
                    <Button
                      variant={currentPage === totalPages ? 'default' : 'outline'}
                      onClick={() => setCurrentPage(totalPages)}
                      className={`w-10 h-10 ${
                        currentPage === totalPages
                          ? 'bg-neon-cyan/20 border-neon-cyan/50 text-neon-cyan'
                          : 'bg-gray-900/40 border-gray-600/30 text-white hover:border-neon-cyan/50 hover:text-neon-cyan'
                      }`}
                    >
                      {totalPages}
                    </Button>
                  </>
                )}
              </div>

              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="bg-gray-900/40 border-gray-600/30 text-white hover:border-neon-cyan/50 hover:text-neon-cyan disabled:opacity-50"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </motion.div>
          )}

          {/* Newsletter Signup */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            <Card className="bg-black/40 backdrop-blur-xl border-2 border-neon-orange/30 shadow-2xl shadow-neon-orange/20 rounded-2xl">
              <CardContent className="p-12">
                <div className="max-w-2xl mx-auto">
                  <div className="flex items-center justify-center gap-3 mb-6">
                    <Mail className="h-8 w-8 text-neon-orange" />
                    <h3 className="text-4xl font-anton text-neon-orange">STAY IN THE LOOP</h3>
                  </div>
                  
                  <p className="text-white/70 font-space text-xl mb-8 leading-relaxed">
                    Get the latest streetwear insights, culture stories, and 
                    <span className="text-neon-cyan font-bold"> BAKWAS</span> updates delivered straight to your inbox.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto mb-8">
                    <Input
                      type="email"
                      placeholder="Enter your email..."
                      value={emailSubscription}
                      onChange={(e) => setEmailSubscription(e.target.value)}
                      className="flex-1 bg-gray-900/60 border-2 border-gray-600 focus:border-neon-orange text-white placeholder:text-gray-400 h-12 rounded-xl"
                    />
                    <Button 
                      onClick={handleSubscription}
                      className="bg-gradient-to-r from-neon-orange to-neon-pink text-black font-anton h-12 px-8 hover:shadow-lg hover:shadow-neon-orange/30"
                    >
                      <Bell className="h-4 w-4 mr-2" />
                      SUBSCRIBE
                    </Button>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                    <div className="flex items-center gap-2 text-white/60 text-sm">
                      <Rss className="h-4 w-4 text-neon-cyan" />
                      <span className="font-space">Weekly updates</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/60 text-sm">
                      <Star className="h-4 w-4 text-neon-purple" />
                      <span className="font-space">Exclusive content</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/60 text-sm">
                      <ArrowUpRight className="h-4 w-4 text-neon-pink" />
                      <span className="font-space">Early access</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Call to Action */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
          >
            <Card className="bg-black/40 backdrop-blur-xl border-2 border-neon-purple/30 shadow-2xl shadow-neon-purple/20 rounded-2xl">
              <CardContent className="p-12">
                <h3 className="text-4xl font-anton text-neon-purple mb-6">EXPLORE MORE</h3>
                <p className="text-white/70 font-space text-xl mb-8 max-w-3xl mx-auto leading-relaxed">
                  Ready to dive deeper into the 
                  <span className="text-neon-cyan font-bold"> BAKWAS</span> universe? Check out our latest collections and join the movement.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      className="group relative h-16 text-xl font-anton overflow-hidden rounded-2xl border-0 bg-transparent p-0 transition-all duration-500 hover:scale-[1.02]"
                      onClick={() => window.location.href = '/shop'}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 via-black/90 to-gray-900/80 backdrop-blur-xl transition-all duration-500 group-hover:from-gray-800/90 group-hover:via-gray-900/95 group-hover:to-gray-800/90"></div>
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink p-[2px] transition-all duration-500">
                        <div className="w-full h-full rounded-2xl bg-gradient-to-r from-gray-900/95 via-black to-gray-900/95"></div>
                      </div>
                      <div className="relative z-10 flex items-center justify-center gap-4 h-full px-10">
                        <ArrowRight className="h-7 w-7 text-neon-cyan group-hover:text-neon-purple transition-colors duration-300" />
                        <span className="text-xl font-bold bg-gradient-to-r from-neon-cyan via-white to-neon-purple bg-clip-text text-transparent">
                          SHOP COLLECTION
                        </span>
                      </div>
                    </Button>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      className="group relative h-16 text-xl font-anton overflow-hidden rounded-2xl border-0 bg-transparent p-0 transition-all duration-500 hover:scale-[1.02]"
                      onClick={() => window.location.href = '/contact'}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 via-black/90 to-gray-900/80 backdrop-blur-xl transition-all duration-500 group-hover:from-gray-800/90 group-hover:via-gray-900/95 group-hover:to-gray-800/90"></div>
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-neon-orange via-neon-pink to-neon-cyan p-[2px] transition-all duration-500">
                        <div className="w-full h-full rounded-2xl bg-gradient-to-r from-gray-900/95 via-black to-gray-900/95"></div>
                      </div>
                      <div className="relative z-10 flex items-center justify-center gap-4 h-full px-10">
                        <MessageCircle className="h-7 w-7 text-neon-orange group-hover:text-neon-cyan transition-colors duration-300" />
                        <span className="text-xl font-bold bg-gradient-to-r from-neon-orange via-white to-neon-pink bg-clip-text text-transparent">
                          GET IN TOUCH
                        </span>
                      </div>
                    </Button>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Blogs;

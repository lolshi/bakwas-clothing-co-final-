import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Calendar, User, Share2, ChevronRight, Clock, Tag, ExternalLink, Heart, MessageSquare, Eye, BookOpen } from 'lucide-react';
import { format } from 'date-fns';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  featured_image: string | null;
  categories: string[] | null;
  tags: string[] | null;
  author_name: string | null;
  publish_date: string;
}

const BlogDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchPost();
    }
  }, [slug]);

  const fetchPost = async () => {
    if (!slug) return;
    
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      
      // Transform data to match BlogPost interface
      if (data) {
        const transformedPost: BlogPost = {
          id: data.id,
          title: data.title || '',
          slug: data.slug || '',
          content: data.content || '',
          excerpt: data.excerpt,
          featured_image: data.featured_image,
          categories: data.categories,
          tags: data.tags,
          author_name: data.author_name,
          publish_date: data.publish_date || new Date().toISOString()
        };
        setPost(transformedPost);
        
        if (data.categories) {
          fetchRelatedPosts(data.categories);
        }
      }
    } catch (error) {
      console.error('Error fetching blog post:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedPosts = async (categories: string[]) => {
    if (!slug) return;
    
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('is_active', true)
        .neq('slug', slug)
        .limit(3);

      if (error) throw error;
      
      // Transform data array to match BlogPost interface
      const transformedPosts: BlogPost[] = (data || []).map(item => ({
        id: item.id,
        title: item.title || '',
        slug: item.slug || '',
        content: item.content || '',
        excerpt: item.excerpt,
        featured_image: item.featured_image,
        categories: item.categories,
        tags: item.tags,
        author_name: item.author_name,
        publish_date: item.publish_date || new Date().toISOString()
      }));
      
      setRelatedPosts(transformedPosts);
    } catch (error) {
      console.error('Error fetching related posts:', error);
    }
  };

  const handleShare = () => {
    if (navigator.share && post) {
      navigator.share({
        title: post.title,
        text: post.excerpt || 'Check out this blog post!',
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  // Mock content for demo if no database content
  const mockPost: BlogPost = {
    id: '1',
    title: 'The Evolution of Street Culture in Delhi',
    slug: 'evolution-street-culture-delhi',
    content: `
      <div class="space-y-6">
        <p class="text-lg leading-relaxed">
          Delhi's streetwear scene has undergone a massive transformation over the past decade. From underground movements to mainstream acceptance, the journey has been nothing short of extraordinary.
        </p>
        
        <h2 class="text-2xl font-anton text-neon-cyan mt-8 mb-4">The Underground Beginnings</h2>
        <p class="leading-relaxed">
          It all started in the narrow lanes of Hauz Khas and Connaught Place, where young creators began expressing themselves through unique fashion statements. The movement wasn't just about clothes—it was about identity, rebellion, and authenticity.
        </p>
        
        <h2 class="text-2xl font-anton text-neon-purple mt-8 mb-4">Breaking Into Mainstream</h2>
        <p class="leading-relaxed">
          What began as a underground movement slowly started gaining recognition. Brands like BAKWAS emerged, bringing authentic street culture to the forefront while maintaining the raw, unfiltered essence that made it special.
        </p>
        
        <h2 class="text-2xl font-anton text-neon-pink mt-8 mb-4">The Digital Revolution</h2>
        <p class="leading-relaxed">
          Social media transformed everything. Instagram and TikTok became the new runways, where anyone could showcase their style. This democratization of fashion opened doors for countless young designers and fashion enthusiasts.
        </p>
        
        <h2 class="text-2xl font-anton text-neon-orange mt-8 mb-4">BAKWAS: Leading the Charge</h2>
        <p class="leading-relaxed">
          At BAKWAS, we've been at the forefront of this revolution. Our designs capture the essence of Delhi's street culture while pushing boundaries and setting new trends. We're not just selling clothes; we're selling a lifestyle, an attitude, a statement.
        </p>
        
        <p class="text-lg leading-relaxed mt-8">
          The future of streetwear in Delhi looks brighter than ever. With emerging designers, sustainable practices, and a growing appreciation for authentic expression, we're witnessing the birth of a new era in fashion.
        </p>
      </div>
    `,
    excerpt: 'Exploring how Delhi\'s vibrant street culture has influenced modern fashion and given birth to authentic brands like BAKWAS.',
    featured_image: '/api/placeholder/800/400',
    categories: ['Culture', 'Fashion'],
    tags: ['streetwear', 'delhi', 'culture', 'fashion', 'underground'],
    author_name: 'Shivam Khandelwal',
    publish_date: '2024-01-15'
  };

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
              LOADING POST...
            </span>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-black">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-neon-orange/15 via-black to-neon-pink/15 animate-gradient-shift"></div>
          <div className="absolute inset-0 bg-gradient-to-tl from-neon-cyan/8 via-transparent to-neon-purple/8 animate-pulse"></div>
        </div>
        
        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Card className="bg-black/40 backdrop-blur-xl border-2 border-neon-orange/30 shadow-2xl shadow-neon-orange/20 rounded-2xl">
              <CardContent className="p-12">
                <div className="w-24 h-24 bg-gradient-to-r from-neon-orange/20 to-neon-pink/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="h-12 w-12 text-neon-orange" />
                </div>
                <h1 className="text-3xl font-anton text-neon-orange mb-4">POST NOT FOUND</h1>
                <p className="text-white/70 font-space text-lg mb-6">
                  The blog post you're looking for doesn't exist or has been removed.
                </p>
                <Link to="/blogs">
                  <Button className="bg-gradient-to-r from-neon-orange to-neon-pink text-black font-anton text-lg px-8 py-3 rounded-xl hover:scale-105 transition-transform duration-300">
                    BACK TO BLOG
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  const displayPost = post || mockPost;

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Multiple animated gradient layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/15 via-black to-neon-purple/15 animate-gradient-shift"></div>
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
          className="max-w-6xl mx-auto mb-12"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-center mb-8">
            <motion.img 
              src="/lovable-uploads/97535d1c-cb3e-4d54-ab8b-54078a7ca53c.png" 
              alt="Bakwas Clothing Co." 
              className="w-32 h-auto mx-auto mb-6 drop-shadow-2xl"
              animate={{ 
                filter: [
                  'drop-shadow(0 0 15px rgba(0, 225, 255, 0.4))',
                  'drop-shadow(0 0 25px rgba(139, 92, 246, 0.4))',
                  'drop-shadow(0 0 15px rgba(0, 225, 255, 0.4))'
                ]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </div>

          {/* Breadcrumbs */}
          <motion.nav 
            className="flex items-center justify-center space-x-2 text-white/60 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <Link to="/" className="hover:text-neon-cyan transition-colors font-space">
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link to="/blogs" className="hover:text-neon-cyan transition-colors font-space">
              Blogs
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-neon-cyan font-space truncate max-w-xs">{displayPost.title}</span>
          </motion.nav>

          {/* Back Button */}
          <motion.div 
            className="flex justify-center mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <Link to="/blogs" className="group inline-flex items-center gap-3 text-neon-purple hover:text-neon-cyan transition-colors font-space font-semibold">
              <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform duration-300" />
              <span>BACK TO BLOG</span>
            </Link>
          </motion.div>
        </motion.div>

        <div className="max-w-5xl mx-auto space-y-8">
          {/* Article Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <Card className="bg-black/40 backdrop-blur-xl border-2 border-neon-cyan/30 shadow-2xl shadow-neon-cyan/20 rounded-2xl overflow-hidden">
              {/* Featured Image */}
              {displayPost.featured_image && (
                <div className="aspect-video overflow-hidden relative">
                  <img
                    src={displayPost.featured_image}
                    alt={displayPost.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                </div>
              )}
              
              <CardContent className="p-8">
                {/* Categories */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {displayPost.categories?.map((category, index) => (
                    <Badge 
                      key={category} 
                      className={`text-xs font-space font-semibold ${
                        index % 4 === 0 ? 'bg-neon-cyan/20 text-neon-cyan border-neon-cyan/30' :
                        index % 4 === 1 ? 'bg-neon-purple/20 text-neon-purple border-neon-purple/30' :
                        index % 4 === 2 ? 'bg-neon-pink/20 text-neon-pink border-neon-pink/30' :
                        'bg-neon-orange/20 text-neon-orange border-neon-orange/30'
                      }`}
                    >
                      <Tag className="h-3 w-3 mr-1" />
                      {category}
                    </Badge>
                  ))}
                </div>

                {/* Title */}
                <h1 className="text-4xl md:text-5xl font-anton bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink bg-clip-text text-transparent mb-6 leading-tight">
                  {displayPost.title}
                </h1>

                {/* Excerpt */}
                <p className="text-xl text-white/80 font-space leading-relaxed mb-8">
                  {displayPost.excerpt || 'No excerpt available.'}
                </p>

                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-6 text-white/60 font-space">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-neon-cyan" />
                    <span className="font-semibold text-neon-cyan">{displayPost.author_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-neon-purple" />
                    <span>{format(new Date(displayPost.publish_date), 'MMMM dd, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-neon-pink" />
                    <span>5 min read</span>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      onClick={handleShare}
                      className="bg-gradient-to-r from-neon-orange/20 to-neon-pink/20 border-2 border-neon-orange/30 text-neon-orange hover:border-neon-orange/50 hover:bg-neon-orange/10 font-space font-semibold"
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Article Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <Card className="bg-black/40 backdrop-blur-xl border-2 border-neon-purple/30 shadow-2xl shadow-neon-purple/20 rounded-2xl">
              <CardContent className="p-8 md:p-12">
                <div 
                  className="prose prose-invert prose-lg max-w-none prose-headings:font-anton prose-headings:bg-gradient-to-r prose-headings:from-neon-cyan prose-headings:to-neon-purple prose-headings:bg-clip-text prose-headings:text-transparent prose-p:text-white/80 prose-p:font-space prose-p:leading-relaxed prose-strong:text-neon-cyan prose-em:text-neon-pink prose-a:text-neon-purple prose-a:no-underline hover:prose-a:text-neon-cyan prose-ul:text-white/70 prose-li:marker:text-neon-cyan"
                  dangerouslySetInnerHTML={{ __html: displayPost.content }}
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* Tags */}
          {displayPost.tags && displayPost.tags.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
            >
              <Card className="bg-black/40 backdrop-blur-xl border-2 border-neon-pink/30 shadow-2xl shadow-neon-pink/20 rounded-2xl">
                <CardContent className="p-6">
                  <h3 className="text-xl font-anton text-neon-pink mb-4 flex items-center gap-2">
                    <Tag className="h-5 w-5" />
                    TAGS
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {displayPost.tags.map((tag) => (
                      <Badge 
                        key={tag} 
                        className="bg-neon-pink/20 text-neon-pink border-neon-pink/30 font-space font-semibold hover:bg-neon-pink/30 transition-colors cursor-pointer"
                      >
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.8 }}
            >
              <Card className="bg-black/40 backdrop-blur-xl border-2 border-neon-orange/30 shadow-2xl shadow-neon-orange/20 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-3xl font-anton text-neon-orange flex items-center gap-3">
                    <BookOpen className="h-8 w-8" />
                    RELATED POSTS
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-3 gap-6">
                    {relatedPosts.map((relatedPost, index) => (
                      <motion.div
                        key={relatedPost.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1 + index * 0.1, duration: 0.6 }}
                        whileHover={{ scale: 1.02, y: -5 }}
                      >
                        <Card className="bg-black/60 backdrop-blur-sm border-2 border-neon-cyan/20 hover:border-neon-cyan/50 shadow-xl shadow-neon-cyan/10 hover:shadow-neon-cyan/30 transition-all duration-500 rounded-xl h-full overflow-hidden">
                          {relatedPost.featured_image && (
                            <div className="aspect-video overflow-hidden relative">
                              <img
                                src={relatedPost.featured_image}
                                alt={relatedPost.title}
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                            </div>
                          )}
                          <CardContent className="p-4">
                            <h3 className="font-anton text-lg text-white mb-2 line-clamp-2 leading-tight">
                              <Link 
                                to={`/blogs/${relatedPost.slug}`}
                                className="hover:text-neon-cyan transition-colors"
                              >
                                {relatedPost.title}
                              </Link>
                            </h3>
                            <p className="text-sm text-white/70 font-space line-clamp-2 leading-relaxed mb-3">
                              {relatedPost.excerpt || 'No excerpt available.'}
                            </p>
                            <div className="flex items-center justify-between text-xs text-white/50">
                              <span className="font-space">{relatedPost.author_name}</span>
                              <span className="font-space">{format(new Date(relatedPost.publish_date), 'MMM dd')}</span>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Call to Action */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.8 }}
          >
            <Card className="bg-black/40 backdrop-blur-xl border-2 border-neon-cyan/30 shadow-2xl shadow-neon-cyan/20 rounded-2xl">
              <CardContent className="p-12">
                <h3 className="text-4xl font-anton text-neon-cyan mb-6">ENJOYED THIS POST?</h3>
                <p className="text-white/70 font-space text-xl mb-8 max-w-3xl mx-auto leading-relaxed">
                  Discover more insights, trends, and stories from the world of streetwear culture at 
                  <span className="text-neon-cyan font-bold"> BAKWAS</span>.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link to="/blogs">
                      <Button className="group relative h-16 text-xl font-anton overflow-hidden rounded-2xl border-0 bg-transparent p-0 transition-all duration-500 hover:scale-[1.02]">
                        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 via-black/90 to-gray-900/80 backdrop-blur-xl transition-all duration-500 group-hover:from-gray-800/90 group-hover:via-gray-900/95 group-hover:to-gray-800/90"></div>
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink p-[2px] transition-all duration-500">
                          <div className="w-full h-full rounded-2xl bg-gradient-to-r from-gray-900/95 via-black to-gray-900/95"></div>
                        </div>
                        <div className="relative z-10 flex items-center justify-center gap-4 h-full px-10">
                          <BookOpen className="h-7 w-7 text-neon-cyan group-hover:text-neon-purple transition-colors duration-300" />
                          <span className="text-xl font-bold bg-gradient-to-r from-neon-cyan via-white to-neon-purple bg-clip-text text-transparent">
                            MORE POSTS
                          </span>
                        </div>
                      </Button>
                    </Link>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link to="/products">
                      <Button className="group relative h-16 text-xl font-anton overflow-hidden rounded-2xl border-0 bg-transparent p-0 transition-all duration-500 hover:scale-[1.02]">
                        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 via-black/90 to-gray-900/80 backdrop-blur-xl transition-all duration-500 group-hover:from-gray-800/90 group-hover:via-gray-900/95 group-hover:to-gray-800/90"></div>
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-neon-orange via-neon-pink to-neon-cyan p-[2px] transition-all duration-500">
                          <div className="w-full h-full rounded-2xl bg-gradient-to-r from-gray-900/95 via-black to-gray-900/95"></div>
                        </div>
                        <div className="relative z-10 flex items-center justify-center gap-4 h-full px-10">
                          <ExternalLink className="h-7 w-7 text-neon-orange group-hover:text-neon-cyan transition-colors duration-300" />
                          <span className="text-xl font-bold bg-gradient-to-r from-neon-orange via-white to-neon-cyan bg-clip-text text-transparent">
                            SHOP COLLECTION
                          </span>
                        </div>
                      </Button>
                    </Link>
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

export default BlogDetail;

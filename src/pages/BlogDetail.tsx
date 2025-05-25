
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Calendar, User, Share2, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image: string;
  categories: string[];
  tags: string[];
  author_name: string;
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
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      setPost(data);
      
      if (data) {
        fetchRelatedPosts(data.categories);
      }
    } catch (error) {
      console.error('Error fetching blog post:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedPosts = async (categories: string[]) => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('is_active', true)
        .neq('slug', slug)
        .limit(3);

      if (error) throw error;
      setRelatedPosts(data || []);
    } catch (error) {
      console.error('Error fetching related posts:', error);
    }
  };

  const handleShare = () => {
    if (navigator.share && post) {
      navigator.share({
        title: post.title,
        text: post.excerpt,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto text-center py-12">
          <h1 className="text-2xl font-bold mb-4 text-white">Post not found</h1>
          <Link to="/blogs">
            <Button className="bg-blue-400 hover:bg-blue-500 text-black">Back to Blog</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Logo */}
      <div className="text-center py-8 bg-black/90">
        <img 
          src="/lovable-uploads/97535d1c-cb3e-4d54-ab8b-54078a7ca53c.png" 
          alt="Bakwas Clothing Co." 
          className="w-48 h-auto mx-auto"
        />
      </div>

      <div className="p-4">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumbs */}
          <nav className="flex items-center space-x-2 text-gray-300 mb-6">
            <Link to="/" className="hover:text-blue-400 transition-colors">
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link to="/blogs" className="hover:text-blue-400 transition-colors">
              Blogs
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-blue-400 truncate">{post.title}</span>
          </nav>

          <div className="mb-6">
            <Link to="/blogs" className="inline-flex items-center gap-2 text-blue-400 hover:underline mb-4">
              <ArrowLeft className="h-4 w-4" />
              Back to Blog
            </Link>
          </div>

          <article>
            {/* Featured Image */}
            {post.featured_image && (
              <div className="aspect-video overflow-hidden rounded-lg mb-8">
                <img
                  src={post.featured_image}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Article Header */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-2 mb-4">
                {post.categories?.map((category) => (
                  <Badge key={category} variant="outline" className="border-blue-400 text-blue-400">
                    {category}
                  </Badge>
                ))}
              </div>
              
              <h1 className="text-3xl md:text-4xl font-anton mb-4 text-white">{post.title}</h1>
              
              <div className="flex items-center gap-6 text-gray-400 mb-6">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{post.author_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{format(new Date(post.publish_date), 'MMMM dd, yyyy')}</span>
                </div>
                <Button variant="outline" size="sm" onClick={handleShare} className="border-gray-600 text-gray-300">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>

            {/* Article Content */}
            <Card className="bg-white">
              <CardContent className="p-8">
                <div 
                  className="prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
              </CardContent>
            </Card>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3 text-white">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="bg-gray-700 text-gray-300">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </article>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-6 text-white">Related Posts</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {relatedPosts.map((relatedPost) => (
                  <Card key={relatedPost.id} className="bg-black/70 backdrop-blur-sm border-gray-600">
                    {relatedPost.featured_image && (
                      <div className="aspect-video overflow-hidden rounded-t-lg">
                        <img
                          src={relatedPost.featured_image}
                          alt={relatedPost.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2 line-clamp-2 text-white">
                        <Link 
                          to={`/blogs/${relatedPost.slug}`}
                          className="hover:text-blue-400 transition-colors"
                        >
                          {relatedPost.title}
                        </Link>
                      </h3>
                      <p className="text-sm text-gray-300 line-clamp-2">
                        {relatedPost.excerpt}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogDetail;

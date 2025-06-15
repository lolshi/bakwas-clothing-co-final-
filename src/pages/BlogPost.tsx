import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import BlogContent from '@/components/blog/BlogContent';
import { CalendarDays, User, Eye, MessageCircle, Share2 } from 'lucide-react';
import { format } from 'date-fns';
import { BlogPost } from '@/types/blog';

interface BlogPostPageProps {
  post: BlogPost;
}

const BlogPostPage: React.FC<BlogPostPageProps> = ({ post }) => {
  return (
    <div className="container mx-auto py-8 px-4">
      {/* Hero Section */}
      <div className="relative h-[400px] rounded-2xl overflow-hidden mb-8">
        {post.featured_image && (
          <img
            src={post.featured_image}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <h1 className="text-4xl md:text-5xl font-anton text-white mb-4">
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-gray-300">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{post.author_name}</span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              <span>{format(new Date(post.publish_date), 'MMMM dd, yyyy')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <span>{post.view_count} views</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <Card className="bg-black/40 backdrop-blur-xl border-2 border-neon-cyan/30">
            <CardContent className="p-8">
              {/* Excerpt */}
              {post.excerpt && (
                <div className="mb-8">
                  <p className="text-xl text-gray-300 italic">
                    {post.excerpt}
                  </p>
                </div>
              )}

              {/* Main Content */}
              <BlogContent 
                content={post.content} 
                className="[&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
              />

              {/* Tags and Categories */}
              <div className="mt-8 pt-8 border-t border-gray-800">
                <div className="flex flex-wrap gap-4">
                  {post.categories?.map((category, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-neon-cyan/10 text-neon-cyan rounded-full text-sm"
                    >
                      {category}
                    </span>
                  ))}
                  {post.tags?.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-neon-purple/10 text-neon-purple rounded-full text-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {/* Author Card */}
          <Card className="bg-black/40 backdrop-blur-xl border-2 border-neon-cyan/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-neon-cyan to-neon-purple flex items-center justify-center">
                  <User className="h-8 w-8 text-black" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{post.author_name}</h3>
                  <p className="text-gray-400">Content Creator</p>
                </div>
              </div>
              <p className="text-gray-300">
                Expert in streetwear fashion and urban culture. Passionate about bringing the latest trends and stories to our community.
              </p>
            </CardContent>
          </Card>

          {/* Share Card */}
          <Card className="bg-black/40 backdrop-blur-xl border-2 border-neon-cyan/30">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-white mb-4">Share this post</h3>
              <div className="flex gap-4">
                <button className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2">
                  <Share2 className="h-4 w-4" />
                  Share
                </button>
                <button className="flex-1 py-2 px-4 bg-neon-purple hover:bg-neon-purple/80 text-white rounded-lg flex items-center justify-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Comment
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BlogPostPage; 
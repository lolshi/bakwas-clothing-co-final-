import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { BlogPost } from '@/types/blog';
import { Edit, Eye, Globe } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import RichTextEditor from './RichTextEditor';

interface BlogPostEditorProps {
  post: BlogPost | null;
  onSave: (post: Partial<BlogPost>) => void;
  onCancel: () => void;
}

const BlogPostEditor: React.FC<BlogPostEditorProps> = ({ post, onSave, onCancel }) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const postData: Partial<BlogPost> = {
      title: formData.get('title') as string,
      content: formData.get('content') as string,
      excerpt: formData.get('excerpt') as string,
      featured_image: formData.get('featured_image') as string,
      post_type: formData.get('postType') as BlogPost['post_type'],
      status: formData.get('status') as BlogPost['status'],
      is_active: formData.get('isActive') === 'true',
      publish_date: formData.get('publishDate') as string,
      author_name: formData.get('authorName') as string || 'Admin',
      categories: (formData.get('categories') as string).split(',').map(c => c.trim()).filter(Boolean),
      tags: (formData.get('tags') as string).split(',').map(t => t.trim()).filter(Boolean),
      seo_title: formData.get('seoTitle') as string,
      seo_description: formData.get('seoDescription') as string,
    };

    // Generate slug from title if this is a new post
    if (!post?.id) {
      postData.slug = postData.title?.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    onSave(postData);
  };

  return (
    <Card className="bg-black/40 backdrop-blur-xl border-2 border-neon-cyan/30 shadow-2xl shadow-neon-cyan/20 hover:shadow-neon-purple/30 transition-all duration-500 rounded-2xl max-h-[90vh] flex flex-col">
      <CardHeader className="pb-6 flex-shrink-0">
        <CardTitle className="text-neon-cyan text-3xl font-anton flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-r from-neon-cyan to-neon-purple rounded-full flex items-center justify-center">
            {post ? <Edit className="h-6 w-6 text-black" /> : <Globe className="h-6 w-6 text-black" />}
          </div>
          {post ? 'EDIT BLOG POST' : 'CREATE NEW POST'}
        </CardTitle>
        <div className="h-1 w-full bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink rounded-full"></div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden">
        <ScrollArea className="h-full pr-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              {/* Title */}
              <div>
                <Label htmlFor="title" className="text-gray-200">Post Title</Label>
                <Input
                  id="title"
                  name="title"
                  defaultValue={post?.title}
                  placeholder="Enter post title"
                  className="mt-1 bg-black/50 border-gray-700 text-white"
                  required
                />
              </div>

              {/* Featured Image URL - Prominently displayed */}
              <div>
                <Label htmlFor="featured_image" className="text-gray-200 flex items-center">
                  Featured Image URL
                  <span className="ml-2 text-xs text-neon-cyan">(Required)</span>
                </Label>
                <Input
                  id="featured_image"
                  name="featured_image"
                  type="url"
                  defaultValue={post?.featured_image}
                  placeholder="https://example.com/image.jpg"
                  className="mt-1 bg-black/50 border-gray-700 text-white border-2 border-neon-cyan/50"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">Enter the URL of your featured image</p>
              </div>

              {/* Content */}
              <div>
                <Label htmlFor="content" className="text-gray-200">Content</Label>
                <input type="hidden" name="content" id="content" value={post?.content || ''} />
                <RichTextEditor
                  content={post?.content || ''}
                  onChange={(html) => {
                    const input = document.getElementById('content') as HTMLInputElement;
                    if (input) input.value = html;
                  }}
                  className="mt-1"
                />
              </div>

              {/* Post Type and Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="postType" className="text-gray-200">Post Type</Label>
                  <Select name="postType" defaultValue={post?.post_type || 'article'}>
                    <SelectTrigger id="postType" className="mt-1 bg-black/50 border-gray-700 text-white">
                      <SelectValue placeholder="Select post type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="article">Article</SelectItem>
                      <SelectItem value="news">News</SelectItem>
                      <SelectItem value="case_study">Case Study</SelectItem>
                      <SelectItem value="tutorial">Tutorial</SelectItem>
                      <SelectItem value="opinion">Opinion</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status" className="text-gray-200">Status</Label>
                  <Select name="status" defaultValue={post?.status || 'draft'}>
                    <SelectTrigger id="status" className="mt-1 bg-black/50 border-gray-700 text-white">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="review">In Review</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Excerpt */}
              <div>
                <Label htmlFor="excerpt" className="text-gray-200">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  name="excerpt"
                  defaultValue={post?.excerpt}
                  placeholder="Write a brief excerpt..."
                  className="mt-1 bg-black/50 border-gray-700 text-white"
                />
              </div>

              {/* Author and Publish Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="authorName" className="text-gray-200">Author Name</Label>
                  <Input
                    id="authorName"
                    name="authorName"
                    defaultValue={post?.author_name}
                    placeholder="Author name"
                    className="mt-1 bg-black/50 border-gray-700 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="publishDate" className="text-gray-200">Publish Date</Label>
                  <Input
                    id="publishDate"
                    name="publishDate"
                    type="date"
                    defaultValue={post?.publish_date?.split('T')[0] || new Date().toISOString().split('T')[0]}
                    className="mt-1 bg-black/50 border-gray-700 text-white"
                  />
                </div>
              </div>

              {/* Categories and Tags */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="categories" className="text-gray-200">Categories</Label>
                  <Input
                    id="categories"
                    name="categories"
                    defaultValue={post?.categories?.join(', ')}
                    placeholder="Enter categories (comma-separated)"
                    className="mt-1 bg-black/50 border-gray-700 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="tags" className="text-gray-200">Tags</Label>
                  <Input
                    id="tags"
                    name="tags"
                    defaultValue={post?.tags?.join(', ')}
                    placeholder="Enter tags (comma-separated)"
                    className="mt-1 bg-black/50 border-gray-700 text-white"
                  />
                </div>
              </div>

              {/* SEO Fields */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="seoTitle" className="text-gray-200">SEO Title</Label>
                  <Input
                    id="seoTitle"
                    name="seoTitle"
                    defaultValue={post?.seo_title}
                    placeholder="SEO optimized title"
                    className="mt-1 bg-black/50 border-gray-700 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="seoDescription" className="text-gray-200">SEO Description</Label>
                  <Textarea
                    id="seoDescription"
                    name="seoDescription"
                    defaultValue={post?.seo_description}
                    placeholder="SEO meta description"
                    className="mt-1 bg-black/50 border-gray-700 text-white"
                  />
                </div>
              </div>

              {/* Active Status */}
              <div className="flex items-center space-x-2">
                <Switch 
                  id="isActive"
                  name="isActive"
                  defaultChecked={post?.is_active}
                  onCheckedChange={(checked) => {
                    const input = document.createElement('input');
                    input.type = 'hidden';
                    input.name = 'isActive';
                    input.value = checked.toString();
                    const form = document.querySelector('form');
                    if (form) {
                      const existing = form.querySelector('input[name="isActive"]');
                      if (existing) {
                        existing.remove();
                      }
                      form.appendChild(input);
                    }
                  }}
                />
                <Label htmlFor="isActive" className="text-gray-200">Active</Label>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-4 pt-6 sticky bottom-0 bg-black/40 backdrop-blur-xl p-4 -mx-4 mt-8 border-t border-gray-700">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="bg-black/50 border-gray-700 text-white hover:bg-gray-800"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-neon-cyan text-black hover:bg-neon-cyan/80"
              >
                {post ? 'Update Post' : 'Create Post'}
              </Button>
            </div>
          </form>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default BlogPostEditor; 
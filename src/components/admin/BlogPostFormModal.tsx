import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface BlogPostFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const BlogPostFormModal: React.FC<BlogPostFormModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    featured_image: '',
    content: '',
    excerpt: '',
    author_name: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('blog_posts')
        .insert([{
          ...formData,
          status: 'draft',
          is_active: true,
          publish_date: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          slug: formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
        }]);

      if (error) throw error;

      toast.success('Blog post created successfully');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error('Failed to create post: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-gray-900 border border-gray-700 text-white">
        <DialogHeader className="border-b border-gray-800 pb-4">
          <DialogTitle className="text-xl font-semibold text-white">
            Create New Blog Post
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-gray-300">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="bg-gray-800/30 border-gray-700 text-white"
              placeholder="Enter post title"
              required
            />
          </div>

          {/* Featured Image URL - Prominently displayed */}
          <div className="space-y-2">
            <Label htmlFor="featured_image" className="text-gray-300 flex items-center">
              Featured Image URL
              <span className="ml-2 text-xs text-neon-cyan">(Required)</span>
            </Label>
            <Input
              id="featured_image"
              type="url"
              value={formData.featured_image}
              onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })}
              className="bg-gray-800/30 border-gray-700 text-white border-2 border-neon-cyan/50"
              placeholder="https://example.com/image.jpg"
              required
            />
            <p className="text-xs text-gray-400">Enter the URL of your featured image</p>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content" className="text-gray-300">Content</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="bg-gray-800/30 border-gray-700 text-white min-h-[200px]"
              placeholder="Write your post content"
              required
            />
          </div>

          {/* Excerpt */}
          <div className="space-y-2">
            <Label htmlFor="excerpt" className="text-gray-300">Short Description</Label>
            <Textarea
              id="excerpt"
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              className="bg-gray-800/30 border-gray-700 text-white"
              placeholder="Brief description of the post"
            />
          </div>

          {/* Author */}
          <div className="space-y-2">
            <Label htmlFor="author" className="text-gray-300">Author</Label>
            <Input
              id="author"
              value={formData.author_name}
              onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
              className="bg-gray-800/30 border-gray-700 text-white"
              placeholder="Author name"
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-neon-cyan hover:bg-neon-cyan/90 text-black font-semibold"
            >
              {loading ? 'Creating...' : 'Create Post'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BlogPostFormModal; 
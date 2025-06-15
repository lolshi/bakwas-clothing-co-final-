import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface BlogPostListItemProps {
  post: {
    id: string;
    title: string;
    status: string;
    is_active: boolean;
    author_name: string;
    created_at: string;
    publish_date: string;
  };
  onUpdate: () => void;
}

const BlogPostListItem: React.FC<BlogPostListItemProps> = ({ post, onUpdate }) => {
  const handleStatusChange = async (newStatus: string) => {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .update({ status: newStatus })
        .eq('id', post.id);

      if (error) throw error;
      
      toast.success(`Status updated to ${newStatus}`);
      onUpdate();
    } catch (error: any) {
      toast.error('Failed to update status: ' + error.message);
    }
  };

  const handleActiveChange = async (isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .update({ is_active: isActive })
        .eq('id', post.id);

      if (error) throw error;
      
      toast.success(`Post ${isActive ? 'activated' : 'deactivated'}`);
      onUpdate();
    } catch (error: any) {
      toast.error('Failed to update status: ' + error.message);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-neon-cyan/30 transition-all duration-200">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-white truncate">{post.title}</h3>
          <span className={`px-2 py-1 text-xs rounded-full ${
            post.status === 'published' 
              ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
              : post.status === 'draft'
              ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
              : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
          }`}>
            {post.status}
          </span>
        </div>
        <div className="mt-1 flex items-center gap-4 text-sm text-gray-400">
          <span className="flex items-center gap-1">
            <span className="font-medium text-gray-300">By:</span> {post.author_name}
          </span>
          <span className="flex items-center gap-1">
            <span className="font-medium text-gray-300">Created:</span> 
            {format(new Date(post.created_at), 'MMM d, yyyy')}
          </span>
          <span className="flex items-center gap-1">
            <span className="font-medium text-gray-300">Publish Date:</span>
            {format(new Date(post.publish_date), 'MMM d, yyyy')}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-6 ml-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Active</span>
          <Switch
            checked={post.is_active}
            onCheckedChange={handleActiveChange}
            className="data-[state=checked]:bg-neon-cyan"
          />
        </div>

        <Select
          value={post.status}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger className="w-[130px] bg-gray-900/50 border-gray-700 text-gray-300 hover:border-neon-cyan/30 focus:ring-neon-cyan/20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-gray-900 border-gray-700">
            <SelectItem value="draft" className="text-gray-300 focus:bg-gray-800 focus:text-white">
              Draft
            </SelectItem>
            <SelectItem value="published" className="text-gray-300 focus:bg-gray-800 focus:text-white">
              Published
            </SelectItem>
            <SelectItem value="archived" className="text-gray-300 focus:bg-gray-800 focus:text-white">
              Archived
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default BlogPostListItem; 
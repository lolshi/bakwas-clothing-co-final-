
import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Edit, Trash2, Plus, Eye } from 'lucide-react';
import { format } from 'date-fns';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string;
  categories: string[];
  tags: string[];
  author_name: string;
  publish_date: string;
  is_active: boolean;
  created_at: string;
}

const AdminBlog = () => {
  const { toast } = useToast();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      toast({
        title: "Error",
        description: "Failed to fetch blog posts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const savePost = async (post: Partial<BlogPost>) => {
    try {
      // Generate slug from title if creating new post
      if (!editingPost?.id && post.title) {
        post.slug = post.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      }

      if (editingPost?.id) {
        const { error } = await supabase
          .from('blog_posts')
          .update(post)
          .eq('id', editingPost.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('blog_posts')
          .insert(post);
        if (error) throw error;
      }

      toast({
        title: "Success",
        description: editingPost ? "Blog post updated" : "Blog post created",
      });

      fetchPosts();
      setEditingPost(null);
    } catch (error) {
      console.error('Error saving blog post:', error);
      toast({
        title: "Error",
        description: "Failed to save blog post",
        variant: "destructive",
      });
    }
  };

  const deletePost = async (id: string) => {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Blog post deleted",
      });

      fetchPosts();
    } catch (error) {
      console.error('Error deleting blog post:', error);
      toast({
        title: "Error",
        description: "Failed to delete blog post",
        variant: "destructive",
      });
    }
  };

  const createNewPost = () => {
    setEditingPost({
      id: '',
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      featured_image: '',
      categories: [],
      tags: [],
      author_name: 'Admin',
      publish_date: new Date().toISOString(),
      is_active: true,
      created_at: new Date().toISOString()
    });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">Loading...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Blog Management</h1>
          <p className="text-muted-foreground">
            Create and manage blog posts
          </p>
        </div>

        {!editingPost ? (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Blog Posts</CardTitle>
                <Button onClick={createNewPost}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Post
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Categories</TableHead>
                    <TableHead>Published</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {posts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell className="max-w-md">
                        <div>
                          <div className="font-medium truncate">{post.title}</div>
                          <div className="text-sm text-muted-foreground truncate">{post.excerpt}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={post.is_active ? "default" : "secondary"}>
                          {post.is_active ? "Active" : "Draft"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {post.categories?.slice(0, 2).map((category) => (
                            <Badge key={category} variant="outline" className="text-xs">
                              {category}
                            </Badge>
                          ))}
                          {post.categories?.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{post.categories.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(post.publish_date), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <a href={`/blogs/${post.slug}`} target="_blank" rel="noopener noreferrer">
                              <Eye className="h-4 w-4" />
                            </a>
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => setEditingPost(post)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => deletePost(post.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>{editingPost.id ? 'Edit Blog Post' : 'Create Blog Post'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={editingPost.title}
                    onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={editingPost.slug}
                    onChange={(e) => setEditingPost({ ...editingPost, slug: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="excerpt">Excerpt</Label>
                  <Textarea
                    id="excerpt"
                    rows={3}
                    value={editingPost.excerpt}
                    onChange={(e) => setEditingPost({ ...editingPost, excerpt: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="content">Content (HTML)</Label>
                  <Textarea
                    id="content"
                    rows={10}
                    value={editingPost.content}
                    onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="featured_image">Featured Image URL</Label>
                  <Input
                    id="featured_image"
                    value={editingPost.featured_image}
                    onChange={(e) => setEditingPost({ ...editingPost, featured_image: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="categories">Categories (comma-separated)</Label>
                  <Input
                    id="categories"
                    value={editingPost.categories?.join(', ') || ''}
                    onChange={(e) => setEditingPost({ 
                      ...editingPost, 
                      categories: e.target.value.split(',').map(cat => cat.trim()).filter(Boolean)
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    value={editingPost.tags?.join(', ') || ''}
                    onChange={(e) => setEditingPost({ 
                      ...editingPost, 
                      tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="author_name">Author Name</Label>
                  <Input
                    id="author_name"
                    value={editingPost.author_name}
                    onChange={(e) => setEditingPost({ ...editingPost, author_name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="publish_date">Publish Date</Label>
                  <Input
                    id="publish_date"
                    type="datetime-local"
                    value={editingPost.publish_date ? new Date(editingPost.publish_date).toISOString().slice(0, 16) : ''}
                    onChange={(e) => setEditingPost({ ...editingPost, publish_date: new Date(e.target.value).toISOString() })}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={editingPost.is_active}
                    onCheckedChange={(checked) => setEditingPost({ ...editingPost, is_active: checked })}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => savePost(editingPost)}>Save</Button>
                  <Button variant="outline" onClick={() => setEditingPost(null)}>Cancel</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminBlog;

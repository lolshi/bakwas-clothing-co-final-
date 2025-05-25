
import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Edit, Trash2, Plus } from 'lucide-react';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
  is_active: boolean;
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
  name: string;
  subscribed_at: string;
  is_active: boolean;
}

const AdminContent = () => {
  const { toast } = useToast();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [pages, setPages] = useState<SitePage[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);
  const [editingPage, setEditingPage] = useState<SitePage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

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

  const saveFAQ = async (faq: Partial<FAQ>) => {
    try {
      if (editingFAQ?.id) {
        const { error } = await supabase
          .from('faqs')
          .update(faq)
          .eq('id', editingFAQ.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('faqs')
          .insert(faq);
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

  const savePage = async (page: Partial<SitePage>) => {
    try {
      const { error } = await supabase
        .from('site_pages')
        .update({ title: page.title, content: page.content })
        .eq('id', editingPage!.id);

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
          <h1 className="text-3xl font-bold tracking-tight">Content Management</h1>
          <p className="text-muted-foreground">
            Manage FAQs, site pages, and subscribers
          </p>
        </div>

        <Tabs defaultValue="faqs" className="w-full">
          <TabsList>
            <TabsTrigger value="faqs">FAQs</TabsTrigger>
            <TabsTrigger value="pages">Site Pages</TabsTrigger>
            <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
          </TabsList>

          <TabsContent value="faqs" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Frequently Asked Questions</CardTitle>
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
                      <TableHead>Question</TableHead>
                      <TableHead>Active</TableHead>
                      <TableHead>Order</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {faqs.map((faq) => (
                      <TableRow key={faq.id}>
                        <TableCell className="max-w-md truncate">{faq.question}</TableCell>
                        <TableCell>
                          <Switch checked={faq.is_active} disabled />
                        </TableCell>
                        <TableCell>{faq.sort_order}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => setEditingFAQ(faq)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => deleteFAQ(faq.id)}>
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
                        value={editingFAQ.sort_order}
                        onChange={(e) => setEditingFAQ({ ...editingFAQ, sort_order: parseInt(e.target.value) })}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_active"
                        checked={editingFAQ.is_active}
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
          </TabsContent>

          <TabsContent value="pages" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Site Pages</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Page</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pages.map((page) => (
                      <TableRow key={page.id}>
                        <TableCell className="font-medium">{page.page_key}</TableCell>
                        <TableCell>{page.title}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" onClick={() => setEditingPage(page)}>
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

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

          <TabsContent value="subscribers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Email Subscribers</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Subscribed</TableHead>
                      <TableHead>Active</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscribers.map((subscriber) => (
                      <TableRow key={subscriber.id}>
                        <TableCell>{subscriber.email}</TableCell>
                        <TableCell>{subscriber.name || '-'}</TableCell>
                        <TableCell>{new Date(subscriber.subscribed_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Switch checked={subscriber.is_active} disabled />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminContent;


import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

const Privacy = () => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPageContent();
  }, []);

  const fetchPageContent = async () => {
    try {
      const { data, error } = await supabase
        .from('site_pages')
        .select('content')
        .eq('page_key', 'privacy')
        .single();

      if (error) throw error;
      setContent(data?.content || '');
    } catch (error) {
      console.error('Error fetching privacy page:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-background p-4 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-anton mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground">How we handle your data</p>
        </div>

        <Card>
          <CardContent className="p-6">
            <div 
              className="prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Privacy;

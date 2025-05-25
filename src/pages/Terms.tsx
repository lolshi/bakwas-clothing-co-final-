
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

const Terms = () => {
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
        .eq('page_key', 'terms')
        .single();

      if (error) throw error;
      setContent(data?.content || '');
    } catch (error) {
      console.error('Error fetching terms page:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <div className="bg-black/60 backdrop-blur-md rounded-lg p-8">
          <div className="text-white">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 relative">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="bg-black/60 backdrop-blur-md rounded-lg p-6 mb-6">
            <h1 className="text-3xl font-anton mb-2 text-white">Terms & Conditions</h1>
            <p className="text-gray-300">Our terms of service</p>
          </div>
        </div>

        <Card className="bg-black/60 backdrop-blur-md border-white/20">
          <CardContent className="p-6">
            <div 
              className="prose prose-invert max-w-none text-gray-200"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Terms;

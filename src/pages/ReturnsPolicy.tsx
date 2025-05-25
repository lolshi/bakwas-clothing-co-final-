
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { supabase } from '@/integrations/supabase/client';

const ReturnsPolicy = () => {
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
        .eq('page_key', 'returns-policy')
        .single();

      if (error) throw error;
      setContent(data?.content || '');
    } catch (error) {
      console.error('Error fetching returns policy:', error);
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
            <h1 className="text-3xl font-anton mb-2 text-white">Returns & Refunds Policy</h1>
            <p className="text-gray-300">Learn about our return process and policy</p>
          </div>
        </div>

        <Card className="bg-black/60 backdrop-blur-md border-white/20 mb-8">
          <CardContent className="p-6">
            <div 
              className="prose prose-invert max-w-none text-gray-200"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </CardContent>
        </Card>

        <div className="mt-8">
          <div className="bg-black/60 backdrop-blur-md rounded-lg p-6 mb-4">
            <h2 className="text-2xl font-bold mb-4 text-white">Frequently Asked Questions</h2>
          </div>
          
          <Card className="bg-black/60 backdrop-blur-md border-white/20">
            <CardContent className="p-6">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1" className="border-white/20">
                  <AccordionTrigger className="text-white hover:text-neon-cyan">How long do I have to return an item?</AccordionTrigger>
                  <AccordionContent className="text-gray-200">
                    You have 7 days from the date of delivery to initiate a return. The item must be in original condition with all tags attached.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2" className="border-white/20">
                  <AccordionTrigger className="text-white hover:text-neon-cyan">Who pays for return shipping?</AccordionTrigger>
                  <AccordionContent className="text-gray-200">
                    For defective or incorrect items, we provide a prepaid return label. For other returns, return shipping costs are the customer's responsibility.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3" className="border-white/20">
                  <AccordionTrigger className="text-white hover:text-neon-cyan">How long does it take to process a refund?</AccordionTrigger>
                  <AccordionContent className="text-gray-200">
                    Once we receive your returned item, we'll process your refund within 3-5 business days. The refund will appear in your original payment method within 7-10 business days.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4" className="border-white/20">
                  <AccordionTrigger className="text-white hover:text-neon-cyan">Can I exchange an item instead of returning it?</AccordionTrigger>
                  <AccordionContent className="text-gray-200">
                    Yes! You can request an exchange for a different size or color. Contact our customer service team to arrange an exchange.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ReturnsPolicy;

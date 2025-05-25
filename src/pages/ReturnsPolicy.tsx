
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
    return <div className="min-h-screen bg-background p-4 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-anton mb-2">Returns & Refunds Policy</h1>
          <p className="text-muted-foreground">Learn about our return process and policy</p>
        </div>

        <Card>
          <CardContent className="p-6">
            <div 
              className="prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </CardContent>
        </Card>

        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>How long do I have to return an item?</AccordionTrigger>
              <AccordionContent>
                You have 7 days from the date of delivery to initiate a return. The item must be in original condition with all tags attached.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Who pays for return shipping?</AccordionTrigger>
              <AccordionContent>
                For defective or incorrect items, we provide a prepaid return label. For other returns, return shipping costs are the customer's responsibility.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>How long does it take to process a refund?</AccordionTrigger>
              <AccordionContent>
                Once we receive your returned item, we'll process your refund within 3-5 business days. The refund will appear in your original payment method within 7-10 business days.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>Can I exchange an item instead of returning it?</AccordionTrigger>
              <AccordionContent>
                Yes! You can request an exchange for a different size or color. Contact our customer service team to arrange an exchange.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
};

export default ReturnsPolicy;

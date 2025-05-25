
import React, { useState, useEffect } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { Search } from 'lucide-react';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
}

const FAQs = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;
      setFaqs(data || []);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredFAQs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <h1 className="text-3xl font-anton mb-2 text-white">Frequently Asked Questions</h1>
            <p className="text-gray-300">Find answers to common questions</p>
          </div>
        </div>

        <Card className="mb-6 bg-black/60 backdrop-blur-md border-white/20">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search FAQs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-black/40 border-white/20 text-white placeholder:text-gray-400"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/60 backdrop-blur-md border-white/20">
          <CardContent className="p-6">
            {filteredFAQs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-300">No FAQs found matching your search.</p>
              </div>
            ) : (
              <Accordion type="single" collapsible className="w-full">
                {filteredFAQs.map((faq, index) => (
                  <AccordionItem key={faq.id} value={`item-${index}`} className="border-white/20">
                    <AccordionTrigger className="text-left text-white hover:text-neon-cyan">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div 
                        className="prose prose-invert max-w-none text-gray-200"
                        dangerouslySetInnerHTML={{ __html: faq.answer }}
                      />
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FAQs;

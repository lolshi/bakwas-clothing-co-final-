import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Search, HelpCircle, Package, CreditCard, Truck, MessageCircle, ShoppingBag, Users, Star, ArrowRight } from 'lucide-react';

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
  const [selectedCategory, setSelectedCategory] = useState('all');

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
      
      // Filter and map data to ensure proper typing
      const validFAQs: FAQ[] = (data || [])
        .filter((faq) => 
          faq.sort_order !== null && 
          typeof faq.question === 'string' && 
          typeof faq.answer === 'string'
        )
        .map(faq => ({
          id: faq.id,
          question: faq.question,
          answer: faq.answer,
          sort_order: faq.sort_order as number
        }));
      
      setFaqs(validFAQs);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'all', name: 'All Questions', icon: HelpCircle, color: 'neon-cyan' },
    { id: 'orders', name: 'Orders & Shipping', icon: Package, color: 'neon-purple' },
    { id: 'payments', name: 'Payments & Pricing', icon: CreditCard, color: 'neon-pink' },
    { id: 'returns', name: 'Returns & Exchanges', icon: Truck, color: 'neon-orange' },
    { id: 'products', name: 'Products & Sizing', icon: ShoppingBag, color: 'neon-cyan' },
    { id: 'account', name: 'Account & Support', icon: Users, color: 'neon-purple' }
  ];

  // Mock FAQ data if none from database
  const mockFAQs: FAQ[] = [
    {
      id: '1',
      question: 'How long does shipping take?',
      answer: 'We offer fast shipping across India! Standard delivery takes 3-5 business days, while express delivery takes 1-2 business days. Free shipping is available on orders over ₹2,999.',
      sort_order: 1
    },
    {
      id: '2',
      question: 'What sizes do you offer?',
      answer: 'BAKWAS streetwear is available in sizes XS to 3XL. We provide detailed size charts for each product to ensure the perfect fit for your style.',
      sort_order: 2
    },
    {
      id: '3',
      question: 'Can I return or exchange items?',
      answer: 'Yes! We offer easy returns and exchanges within 7 days of delivery. Items must be in original condition with tags attached. Check our Returns Policy for full details.',
      sort_order: 3
    },
    {
      id: '4',
      question: 'What payment methods do you accept?',
      answer: 'We accept all major payment methods including Credit/Debit cards, UPI, Net Banking, Wallets, and Cash on Delivery for eligible orders.',
      sort_order: 4
    },
    {
      id: '5',
      question: 'How do I track my order?',
      answer: 'Once your order ships, you\'ll receive a tracking number via email and SMS. You can also track your order in the "My Orders" section of your account.',
      sort_order: 5
    },
    {
      id: '6',
      question: 'Do you have a loyalty program?',
      answer: 'Yes! Join BAKWAS Club to earn points on every purchase, get exclusive access to new drops, and enjoy member-only discounts and early access.',
      sort_order: 6
    }
  ];

  const displayFAQs = faqs.length > 0 ? faqs : mockFAQs;

  const filteredFAQs = displayFAQs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedCategory === 'all') return matchesSearch;
    
    // Simple category matching based on keywords
    const question = faq.question.toLowerCase();
    const answer = faq.answer.toLowerCase();
    
    switch (selectedCategory) {
      case 'orders':
        return matchesSearch && (question.includes('shipping') || question.includes('delivery') || question.includes('order') || answer.includes('shipping'));
      case 'payments':
        return matchesSearch && (question.includes('payment') || question.includes('price') || question.includes('cost') || answer.includes('payment'));
      case 'returns':
        return matchesSearch && (question.includes('return') || question.includes('exchange') || question.includes('refund') || answer.includes('return'));
      case 'products':
        return matchesSearch && (question.includes('size') || question.includes('product') || question.includes('quality') || answer.includes('size'));
      case 'account':
        return matchesSearch && (question.includes('account') || question.includes('support') || question.includes('loyalty') || answer.includes('account'));
      default:
        return matchesSearch;
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-black flex items-center justify-center">
        <motion.div 
          className="bg-black/40 backdrop-blur-xl border-2 border-neon-cyan/30 rounded-2xl p-12 shadow-2xl shadow-neon-cyan/20"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-4">
            <motion.div
              className="w-8 h-8 border-3 border-neon-cyan border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <span className="text-2xl font-anton bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">
              LOADING FAQs...
            </span>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Multiple animated gradient layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/15 via-black to-neon-cyan/15 animate-gradient-shift"></div>
        <div className="absolute inset-0 bg-gradient-to-tl from-neon-pink/8 via-transparent to-neon-orange/8 animate-pulse"></div>
        
        {/* Floating particles */}
        <div className="absolute inset-0">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1.5 h-1.5 bg-neon-cyan/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -25, 0],
                opacity: [0.2, 0.8, 0.2],
                scale: [1, 1.3, 1],
              }}
              transition={{
                duration: 4 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 3,
              }}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 p-4 md:p-8">
        {/* Hero Section */}
        <motion.div 
          className="max-w-7xl mx-auto mb-12"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-center mb-8">
            <motion.img 
              src="/lovable-uploads/97535d1c-cb3e-4d54-ab8b-54078a7ca53c.png" 
              alt="Bakwas Clothing Co." 
              className="w-32 h-auto mx-auto mb-6 drop-shadow-2xl"
              animate={{ 
                filter: [
                  'drop-shadow(0 0 15px rgba(0, 225, 255, 0.4))',
                  'drop-shadow(0 0 25px rgba(139, 92, 246, 0.4))',
                  'drop-shadow(0 0 15px rgba(0, 225, 255, 0.4))'
                ]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            
            <motion.h1 
              className="text-5xl md:text-7xl font-anton bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink bg-clip-text text-transparent mb-4"
              animate={{ 
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{ duration: 6, repeat: Infinity }}
              style={{ backgroundSize: '200% 100%' }}
            >
              FREQUENTLY ASKED
            </motion.h1>
            
            <motion.h2
              className="text-4xl md:text-6xl font-anton bg-gradient-to-r from-neon-pink via-neon-orange to-neon-cyan bg-clip-text text-transparent mb-6"
              animate={{ 
                backgroundPosition: ['100% 50%', '0% 50%', '100% 50%'],
              }}
              transition={{ duration: 6, repeat: Infinity, delay: 1 }}
              style={{ backgroundSize: '200% 100%' }}
            >
              QUESTIONS
            </motion.h2>
            
            <motion.p 
              className="text-lg md:text-xl text-white/70 font-space max-w-3xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              Got questions about your <span className="text-neon-cyan font-bold">BAKWAS</span> streetwear experience? 
              Find answers to everything from sizing to shipping and beyond.
            </motion.p>
          </div>
        </motion.div>

        <div className="max-w-6xl mx-auto">
          {/* Search Bar */}
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <Card className="bg-black/40 backdrop-blur-xl border-2 border-neon-cyan/30 shadow-2xl shadow-neon-cyan/20 rounded-2xl">
              <CardContent className="p-6">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-neon-cyan" />
                  <Input
                    placeholder="Search your questions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-14 bg-gray-900/60 border-2 border-gray-600 focus:border-neon-cyan text-white placeholder:text-gray-400 h-14 text-lg rounded-xl backdrop-blur-sm"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Categories */}
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-neon-purple to-neon-pink rounded-full flex items-center justify-center">
                <HelpCircle className="h-5 w-5 text-black" />
              </div>
              <h2 className="text-2xl font-anton text-neon-purple">BROWSE BY CATEGORY</h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1, duration: 0.6 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full h-auto p-4 rounded-xl border-2 transition-all duration-300 ${
                      selectedCategory === category.id
                        ? `bg-${category.color}/20 border-${category.color}/50 text-${category.color}`
                        : 'bg-gray-900/40 border-gray-600/30 text-gray-400 hover:border-neon-cyan/50 hover:text-neon-cyan'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <category.icon className="h-6 w-6" />
                      <span className="text-xs font-space font-semibold text-center">
                        {category.name}
                      </span>
                    </div>
                  </Button>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* FAQ List */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <Card className="bg-black/40 backdrop-blur-xl border-2 border-neon-purple/30 shadow-2xl shadow-neon-purple/20 hover:shadow-neon-cyan/30 transition-all duration-500 rounded-2xl">
              <CardHeader className="pb-6">
                <CardTitle className="text-neon-purple text-3xl font-anton flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-neon-purple to-neon-pink rounded-full flex items-center justify-center">
                    <MessageCircle className="h-6 w-6 text-black" />
                  </div>
                  YOUR QUESTIONS ANSWERED
                </CardTitle>
                <div className="h-1 w-full bg-gradient-to-r from-neon-purple via-neon-pink to-neon-orange rounded-full"></div>
              </CardHeader>
              <CardContent>
                {filteredFAQs.length === 0 ? (
                  <motion.div 
                    className="text-center py-12"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                  >
                    <div className="w-24 h-24 bg-gradient-to-r from-neon-orange/20 to-neon-pink/20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Search className="h-12 w-12 text-neon-orange" />
                    </div>
                    <h3 className="text-2xl font-anton text-neon-orange mb-4">NO QUESTIONS FOUND</h3>
                    <p className="text-white/60 font-space text-lg mb-6">
                      Try adjusting your search or browse different categories.
                    </p>
                    <Button 
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedCategory('all');
                      }}
                      className="bg-gradient-to-r from-neon-orange to-neon-pink text-black font-anton"
                    >
                      RESET SEARCH
                    </Button>
                  </motion.div>
                ) : (
                  <Accordion type="single" collapsible className="w-full space-y-4">
                    {filteredFAQs.map((faq, index) => (
                      <motion.div
                        key={faq.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 + index * 0.1, duration: 0.6 }}
                      >
                        <AccordionItem 
                          value={`item-${index}`} 
                          className="border-2 border-neon-cyan/20 rounded-xl bg-gray-900/20 overflow-hidden"
                        >
                          <AccordionTrigger className="text-left text-neon-cyan hover:text-neon-purple font-space font-semibold text-lg px-6 py-4 transition-colors duration-300">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-r from-neon-cyan to-neon-purple rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-black font-anton text-sm">{index + 1}</span>
                              </div>
                              <span className="text-left">{faq.question}</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="text-white/80 font-space px-6 pb-6">
                            <div className="ml-11 prose prose-invert max-w-none">
                              <div dangerouslySetInnerHTML={{ __html: faq.answer }} />
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </motion.div>
                    ))}
                  </Accordion>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact Support Section */}
          <motion.div
            className="mt-12 text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            <Card className="bg-black/40 backdrop-blur-xl border-2 border-neon-orange/30 shadow-2xl shadow-neon-orange/20 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-3xl font-anton text-neon-orange mb-4">STILL HAVE QUESTIONS?</h3>
                <p className="text-white/70 font-space text-lg mb-6 max-w-2xl mx-auto">
                  Can't find what you're looking for? Our support team is ready to help you with any questions 
                  about your <span className="text-neon-cyan font-bold">BAKWAS</span> experience.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      className="group relative h-14 text-lg font-anton overflow-hidden rounded-2xl border-0 bg-transparent p-0 transition-all duration-500 hover:scale-[1.02]"
                      onClick={() => window.location.href = '/contact'}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 via-black/90 to-gray-900/80 backdrop-blur-xl transition-all duration-500 group-hover:from-gray-800/90 group-hover:via-gray-900/95 group-hover:to-gray-800/90"></div>
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-neon-orange via-neon-pink to-neon-cyan p-[2px] transition-all duration-500">
                        <div className="w-full h-full rounded-2xl bg-gradient-to-r from-gray-900/95 via-black to-gray-900/95"></div>
                      </div>
                      <div className="relative z-10 flex items-center justify-center gap-3 h-full px-8">
                        <MessageCircle className="h-6 w-6 text-neon-orange group-hover:text-neon-cyan transition-colors duration-300" />
                        <span className="text-lg font-bold bg-gradient-to-r from-neon-orange via-white to-neon-pink bg-clip-text text-transparent">
                          CONTACT SUPPORT
                        </span>
                      </div>
                    </Button>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      className="group relative h-14 text-lg font-anton overflow-hidden rounded-2xl border-0 bg-transparent p-0 transition-all duration-500 hover:scale-[1.02]"
                      onClick={() => window.location.href = '/help'}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 via-black/90 to-gray-900/80 backdrop-blur-xl transition-all duration-500 group-hover:from-gray-800/90 group-hover:via-gray-900/95 group-hover:to-gray-800/90"></div>
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink p-[2px] transition-all duration-500">
                        <div className="w-full h-full rounded-2xl bg-gradient-to-r from-gray-900/95 via-black to-gray-900/95"></div>
                      </div>
                      <div className="relative z-10 flex items-center justify-center gap-3 h-full px-8">
                        <span className="text-2xl">🤖</span>
                        <span className="text-lg font-bold bg-gradient-to-r from-neon-cyan via-white to-neon-purple bg-clip-text text-transparent">
                          CHAT WITH bakwAIs
                        </span>
                      </div>
                    </Button>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default FAQs;

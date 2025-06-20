import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { RefreshCw, Clock, Shield, Package, ArrowLeft, CheckCircle, XCircle, AlertCircle, MessageCircle, Truck, CreditCard } from 'lucide-react';

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
              LOADING POLICY...
            </span>
          </div>
        </motion.div>
      </div>
    );
  }

  const policyHighlights = [
    {
      icon: Clock,
      color: 'neon-cyan',
      title: '7 DAY RETURNS',
      description: 'Easy returns within 7 days of delivery'
    },
    {
      icon: Shield,
      color: 'neon-purple',
      title: 'QUALITY GUARANTEE',
      description: 'We stand behind every piece we sell'
    },
    {
      icon: Package,
      color: 'neon-pink',
      title: 'FREE EXCHANGES',
      description: 'Size or color exchanges at no cost'
    },
    {
      icon: CreditCard,
      color: 'neon-orange',
      title: 'FAST REFUNDS',
      description: 'Refunds processed within 3-5 business days'
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Multiple animated gradient layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/15 via-black to-neon-cyan/15 animate-gradient-shift"></div>
        <div className="absolute inset-0 bg-gradient-to-tl from-neon-pink/8 via-transparent to-neon-orange/8 animate-pulse"></div>
        
        {/* Floating particles */}
        <div className="absolute inset-0">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1.5 h-1.5 bg-neon-cyan/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.2, 0.8, 0.2],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
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
              RETURNS & REFUNDS
            </motion.h1>
            
            <motion.p 
              className="text-lg md:text-xl text-white/70 font-space max-w-3xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              Your satisfaction is our priority. Learn about our hassle-free return process and 
              get your <span className="text-neon-cyan font-bold">BAKWAS</span> streetwear experience right.
            </motion.p>
          </div>
        </motion.div>

        <div className="max-w-7xl mx-auto">
          {/* Policy Highlights */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            {policyHighlights.map((highlight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1, duration: 0.6 }}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <Card className={`bg-black/40 backdrop-blur-xl border-2 border-${highlight.color}/30 shadow-2xl shadow-${highlight.color}/20 hover:shadow-${highlight.color}/40 transition-all duration-500 rounded-2xl h-full`}>
                  <CardContent className="p-6 text-center">
                    <div className={`w-16 h-16 bg-gradient-to-r from-${highlight.color} to-${highlight.color}/60 rounded-full flex items-center justify-center mx-auto mb-4`}>
                      <highlight.icon className="h-8 w-8 text-black" />
                    </div>
                    <h3 className={`text-xl font-anton text-${highlight.color} mb-2`}>
                      {highlight.title}
                    </h3>
                    <p className="text-white/70 font-space">
                      {highlight.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Main Policy Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mb-12"
          >
            <Card className="bg-black/40 backdrop-blur-xl border-2 border-neon-cyan/30 shadow-2xl shadow-neon-cyan/20 hover:shadow-neon-purple/30 transition-all duration-500 rounded-2xl">
              <CardHeader className="pb-6">
                <CardTitle className="text-neon-cyan text-3xl font-anton flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-neon-cyan to-neon-purple rounded-full flex items-center justify-center">
                    <Shield className="h-6 w-6 text-black" />
                  </div>
                  COMPLETE RETURNS POLICY
                </CardTitle>
                <div className="h-1 w-full bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink rounded-full"></div>
              </CardHeader>
              <CardContent>
                {content ? (
                  <div 
                    className="prose prose-invert prose-lg max-w-none text-white/80 font-space [&_a]:break-all [&_a]:overflow-wrap-anywhere"
                    dangerouslySetInnerHTML={{ __html: content }}
                  />
                ) : (
                  <div className="space-y-6 text-white/80 font-space">
                    <div className="space-y-4">
                      <h3 className="text-2xl font-anton text-neon-purple">RETURN ELIGIBILITY</h3>
                      <ul className="list-disc list-inside space-y-2">
                        <li>Items must be returned within 7 days of delivery</li>
                        <li>Items must be in original condition with all tags attached</li>
                        <li>Items must be unworn, unwashed, and in original packaging</li>
                        <li>Customized or personalized items cannot be returned</li>
                      </ul>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-2xl font-anton text-neon-pink">RETURN PROCESS</h3>
                      <ol className="list-decimal list-inside space-y-2">
                        <li>Contact our customer service team to initiate return</li>
                        <li>Receive return authorization and prepaid shipping label (if applicable)</li>
                        <li>Package items securely with original packaging</li>
                        <li>Drop off at designated shipping location</li>
                        <li>Receive confirmation once return is processed</li>
                      </ol>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-2xl font-anton text-neon-orange">REFUND TIMELINE</h3>
                      <p>Once we receive your returned item(s), we will inspect them and process your refund within 3-5 business days. The refund will be credited to your original payment method within 7-10 business days, depending on your bank or payment provider.</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            <Card className="bg-black/40 backdrop-blur-xl border-2 border-neon-purple/30 shadow-2xl shadow-neon-purple/20 hover:shadow-neon-cyan/30 transition-all duration-500 rounded-2xl">
              <CardHeader className="pb-6">
                <CardTitle className="text-neon-purple text-3xl font-anton flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-neon-purple to-neon-pink rounded-full flex items-center justify-center">
                    <MessageCircle className="h-6 w-6 text-black" />
                  </div>
                  FREQUENTLY ASKED QUESTIONS
                </CardTitle>
                <div className="h-1 w-full bg-gradient-to-r from-neon-purple via-neon-pink to-neon-orange rounded-full"></div>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full space-y-4">
                  <AccordionItem value="item-1" className="border-2 border-neon-cyan/20 rounded-xl bg-gray-900/20 overflow-hidden">
                    <AccordionTrigger className="text-neon-cyan hover:text-neon-purple font-space font-semibold text-lg px-6 py-4 transition-colors duration-300">
                      <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5" />
                        How long do I have to return an item?
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-white/80 font-space px-6 pb-4">
                      You have <span className="text-neon-cyan font-bold">7 days</span> from the date of delivery to initiate a return. The item must be in original condition with all tags attached. This gives you enough time to try on your streetwear and ensure it's the perfect fit for your style.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-2" className="border-2 border-neon-purple/20 rounded-xl bg-gray-900/20 overflow-hidden">
                    <AccordionTrigger className="text-neon-purple hover:text-neon-pink font-space font-semibold text-lg px-6 py-4 transition-colors duration-300">
                      <div className="flex items-center gap-3">
                        <Truck className="h-5 w-5" />
                        Who pays for return shipping?
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-white/80 font-space px-6 pb-4">
                      For defective or incorrect items, we provide a <span className="text-neon-purple font-bold">prepaid return label</span>. For other returns (like size or style changes), return shipping costs are the customer's responsibility. We believe in making things right when it's our mistake!
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-3" className="border-2 border-neon-pink/20 rounded-xl bg-gray-900/20 overflow-hidden">
                    <AccordionTrigger className="text-neon-pink hover:text-neon-orange font-space font-semibold text-lg px-6 py-4 transition-colors duration-300">
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-5 w-5" />
                        How long does it take to process a refund?
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-white/80 font-space px-6 pb-4">
                      Once we receive your returned item, we'll process your refund within <span className="text-neon-pink font-bold">3-5 business days</span>. The refund will appear in your original payment method within 7-10 business days. We'll keep you updated throughout the process!
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-4" className="border-2 border-neon-orange/20 rounded-xl bg-gray-900/20 overflow-hidden">
                    <AccordionTrigger className="text-neon-orange hover:text-neon-cyan font-space font-semibold text-lg px-6 py-4 transition-colors duration-300">
                      <div className="flex items-center gap-3">
                        <RefreshCw className="h-5 w-5" />
                        Can I exchange an item instead of returning it?
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-white/80 font-space px-6 pb-4">
                      Absolutely! You can request an <span className="text-neon-orange font-bold">exchange for a different size or color</span>. Contact our customer service team to arrange an exchange. This is often faster than a return and re-order, especially for size adjustments.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-5" className="border-2 border-neon-cyan/20 rounded-xl bg-gray-900/20 overflow-hidden">
                    <AccordionTrigger className="text-neon-cyan hover:text-neon-purple font-space font-semibold text-lg px-6 py-4 transition-colors duration-300">
                      <div className="flex items-center gap-3">
                        <AlertCircle className="h-5 w-5" />
                        What if my item arrives damaged or defective?
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-white/80 font-space px-6 pb-4">
                      If your item arrives damaged or defective, <span className="text-neon-cyan font-bold">contact us immediately</span>. We'll provide a prepaid return label and either send a replacement or process a full refund. Your satisfaction with BAKWAS quality is our top priority.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact Support Section */}
          <motion.div
            className="mt-12 text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
          >
            <Card className="bg-black/40 backdrop-blur-xl border-2 border-neon-orange/30 shadow-2xl shadow-neon-orange/20 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-3xl font-anton text-neon-orange mb-4">NEED HELP WITH A RETURN?</h3>
                <p className="text-white/70 font-space text-lg mb-6 max-w-2xl mx-auto">
                  Our customer service team is here to help you with any questions about returns, exchanges, or our policies.
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

export default ReturnsPolicy;

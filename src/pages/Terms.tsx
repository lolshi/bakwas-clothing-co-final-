import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { ChevronRight, FileText, Scale, Shield, AlertTriangle, Calendar, ArrowRight, BookOpen, Phone } from 'lucide-react';

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

  // Default terms content if no database content
  const defaultTermsContent = `
    <div class="space-y-8">
      <section>
        <h2 class="text-2xl font-anton text-neon-cyan mb-4">1. ACCEPTANCE OF TERMS</h2>
        <p class="text-white/80 leading-relaxed mb-4">
          By accessing and using the BAKWAS website and services, you accept and agree to be bound by the terms and provision of this agreement. 
          If you do not agree to abide by the above, please do not use this service.
        </p>
      </section>

      <section>
        <h2 class="text-2xl font-anton text-neon-purple mb-4">2. PRODUCTS AND SERVICES</h2>
        <p class="text-white/80 leading-relaxed mb-4">
          BAKWAS offers premium streetwear clothing and accessories. All products are subject to availability. 
          We reserve the right to limit the quantities of any products or services that we offer.
        </p>
        <ul class="list-disc list-inside text-white/70 space-y-2 ml-4">
          <li>Product descriptions and images are for informational purposes</li>
          <li>Colors may vary slightly due to monitor settings</li>
          <li>We reserve the right to discontinue products at any time</li>
        </ul>
      </section>

      <section>
        <h2 class="text-2xl font-anton text-neon-pink mb-4">3. PRICING AND PAYMENT</h2>
        <p class="text-white/80 leading-relaxed mb-4">
          All prices are in Indian Rupees (INR) and are subject to change without notice. 
          Payment must be made in full before shipment of products.
        </p>
        <ul class="list-disc list-inside text-white/70 space-y-2 ml-4">
          <li>Prices include applicable taxes</li>
          <li>We accept major credit cards, debit cards, and digital wallets</li>
          <li>Payment processing is secure and encrypted</li>
        </ul>
      </section>

      <section>
        <h2 class="text-2xl font-anton text-neon-orange mb-4">4. SHIPPING AND DELIVERY</h2>
        <p class="text-white/80 leading-relaxed mb-4">
          We ship within India and select international locations. Delivery times may vary based on location and product availability.
        </p>
        <ul class="list-disc list-inside text-white/70 space-y-2 ml-4">
          <li>Standard shipping: 5-7 business days</li>
          <li>Express shipping: 2-3 business days</li>
          <li>International shipping: 7-14 business days</li>
        </ul>
      </section>

      <section>
        <h2 class="text-2xl font-anton text-neon-cyan mb-4">5. RETURNS AND EXCHANGES</h2>
        <p class="text-white/80 leading-relaxed mb-4">
          We want you to be completely satisfied with your purchase. Returns and exchanges are accepted within 30 days of delivery.
        </p>
        <ul class="list-disc list-inside text-white/70 space-y-2 ml-4">
          <li>Items must be in original condition with tags attached</li>
          <li>Return shipping costs may apply</li>
          <li>Refunds will be processed within 5-7 business days</li>
        </ul>
      </section>

      <section>
        <h2 class="text-2xl font-anton text-neon-purple mb-4">6. INTELLECTUAL PROPERTY</h2>
        <p class="text-white/80 leading-relaxed mb-4">
          All content on this website, including but not limited to text, graphics, logos, images, and software, 
          is the property of BAKWAS and is protected by copyright and trademark laws.
        </p>
      </section>

      <section>
        <h2 class="text-2xl font-anton text-neon-pink mb-4">7. USER CONDUCT</h2>
        <p class="text-white/80 leading-relaxed mb-4">
          You agree not to use our website for any unlawful purpose or in any way that could damage, disable, 
          or impair the website or interfere with any other party's use of the website.
        </p>
      </section>

      <section>
        <h2 class="text-2xl font-anton text-neon-orange mb-4">8. LIMITATION OF LIABILITY</h2>
        <p class="text-white/80 leading-relaxed mb-4">
          BAKWAS shall not be liable for any direct, indirect, incidental, consequential, or punitive damages 
          arising out of your use of the website or products.
        </p>
      </section>

      <section>
        <h2 class="text-2xl font-anton text-neon-cyan mb-4">9. MODIFICATIONS</h2>
        <p class="text-white/80 leading-relaxed mb-4">
          We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting. 
          Your continued use of the website constitutes acceptance of any changes.
        </p>
      </section>

      <section>
        <h2 class="text-2xl font-anton text-neon-purple mb-4">10. CONTACT INFORMATION</h2>
        <p class="text-white/80 leading-relaxed mb-4">
          If you have any questions about these Terms & Conditions, please contact us at legal@bakwas.co.in
        </p>
      </section>
    </div>
  `;

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
              LOADING TERMS...
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
        <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/15 via-black to-neon-purple/15 animate-gradient-shift"></div>
        <div className="absolute inset-0 bg-gradient-to-tl from-neon-orange/8 via-transparent to-neon-pink/8 animate-pulse"></div>
        
        {/* Floating particles */}
        <div className="absolute inset-0">
          {[...Array(25)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1.5 h-1.5 bg-neon-cyan/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.2, 0.8, 0.2],
                scale: [1, 1.4, 1],
              }}
              transition={{
                duration: 5 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 4,
              }}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 p-4 md:p-8">
        {/* Hero Section */}
        <motion.div 
          className="max-w-6xl mx-auto mb-16"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-center mb-12">
            <motion.img 
              src="/lovable-uploads/97535d1c-cb3e-4d54-ab8b-54078a7ca53c.png" 
              alt="Bakwas Clothing Co." 
              className="w-40 h-auto mx-auto mb-8 drop-shadow-2xl"
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
              className="text-6xl md:text-8xl font-anton bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink bg-clip-text text-transparent mb-6"
              animate={{ 
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{ duration: 6, repeat: Infinity }}
              style={{ backgroundSize: '200% 100%' }}
            >
              TERMS & CONDITIONS
            </motion.h1>
            
            <motion.p 
              className="text-xl md:text-2xl text-white/70 font-space max-w-4xl mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              Our legal framework that governs your relationship with 
              <span className="text-neon-cyan font-bold"> BAKWAS</span> streetwear platform.
            </motion.p>
          </div>

          {/* Breadcrumbs */}
          <motion.nav 
            className="flex items-center justify-center space-x-2 text-white/60 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            <Link to="/" className="hover:text-neon-cyan transition-colors font-space">
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-neon-cyan font-space">Terms & Conditions</span>
          </motion.nav>
        </motion.div>

        <div className="max-w-6xl mx-auto space-y-12">
          {/* Key Information Cards */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            {[
              { icon: FileText, title: "LEGAL AGREEMENT", desc: "Binding terms for all users", color: "neon-cyan" },
              { icon: Scale, title: "USER RIGHTS", desc: "Your rights and responsibilities", color: "neon-purple" },
              { icon: Shield, title: "PROTECTION", desc: "Data and privacy safeguards", color: "neon-pink" },
              { icon: AlertTriangle, title: "COMPLIANCE", desc: "Legal compliance requirements", color: "neon-orange" }
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1, duration: 0.6 }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <Card className={`bg-black/40 backdrop-blur-xl border-2 border-${item.color}/30 hover:border-${item.color}/50 shadow-2xl shadow-${item.color}/20 transition-all duration-500 rounded-2xl h-full`}>
                  <CardContent className="p-6 text-center">
                    <div className={`w-16 h-16 bg-gradient-to-r from-${item.color}/20 to-${item.color}/10 rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                      <item.icon className={`h-8 w-8 text-${item.color}`} />
                    </div>
                    <h3 className={`text-lg font-anton text-${item.color} mb-2`}>{item.title}</h3>
                    <p className="text-white/60 font-space text-sm leading-relaxed">{item.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Last Updated Notice */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <Card className="bg-black/40 backdrop-blur-xl border-2 border-neon-orange/30 shadow-2xl shadow-neon-orange/20 rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Calendar className="h-6 w-6 text-neon-orange" />
                  <div>
                    <h3 className="text-lg font-anton text-neon-orange">LAST UPDATED</h3>
                    <p className="text-white/70 font-space">January 1, 2024 - Terms effective immediately</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Terms Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <Card className="bg-black/40 backdrop-blur-xl border-2 border-neon-cyan/30 shadow-2xl shadow-neon-cyan/20 rounded-2xl">
              <CardHeader className="pb-6">
                <CardTitle className="text-3xl font-anton text-neon-cyan flex items-center gap-3">
                  <FileText className="h-8 w-8" />
                  TERMS OF SERVICE
                </CardTitle>
                <p className="text-white/70 font-space text-lg">
                  Please read these terms carefully before using our services.
                </p>
              </CardHeader>
              <CardContent className="p-8">
                <div 
                  className="prose prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ 
                    __html: content || defaultTermsContent 
                  }}
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact and Help Section */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            <Card className="bg-black/40 backdrop-blur-xl border-2 border-neon-purple/30 shadow-2xl shadow-neon-purple/20 rounded-2xl">
              <CardContent className="p-12">
                <h3 className="text-4xl font-anton text-neon-purple mb-6">NEED HELP?</h3>
                <p className="text-white/70 font-space text-xl mb-8 max-w-3xl mx-auto leading-relaxed">
                  Have questions about our terms? Our legal team is here to help clarify any concerns you might have.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      className="group relative h-16 text-xl font-anton overflow-hidden rounded-2xl border-0 bg-transparent p-0 transition-all duration-500 hover:scale-[1.02]"
                      onClick={() => window.location.href = '/contact'}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 via-black/90 to-gray-900/80 backdrop-blur-xl transition-all duration-500 group-hover:from-gray-800/90 group-hover:via-gray-900/95 group-hover:to-gray-800/90"></div>
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-neon-purple via-neon-cyan to-neon-pink p-[2px] transition-all duration-500">
                        <div className="w-full h-full rounded-2xl bg-gradient-to-r from-gray-900/95 via-black to-gray-900/95"></div>
                      </div>
                      <div className="relative z-10 flex items-center justify-center gap-4 h-full px-10">
                        <Phone className="h-7 w-7 text-neon-purple group-hover:text-neon-cyan transition-colors duration-300" />
                        <span className="text-xl font-bold bg-gradient-to-r from-neon-purple via-white to-neon-cyan bg-clip-text text-transparent">
                          CONTACT LEGAL
                        </span>
                      </div>
                    </Button>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      className="group relative h-16 text-xl font-anton overflow-hidden rounded-2xl border-0 bg-transparent p-0 transition-all duration-500 hover:scale-[1.02]"
                      onClick={() => window.location.href = '/privacy'}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 via-black/90 to-gray-900/80 backdrop-blur-xl transition-all duration-500 group-hover:from-gray-800/90 group-hover:via-gray-900/95 group-hover:to-gray-800/90"></div>
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-neon-cyan via-neon-orange to-neon-pink p-[2px] transition-all duration-500">
                        <div className="w-full h-full rounded-2xl bg-gradient-to-r from-gray-900/95 via-black to-gray-900/95"></div>
                      </div>
                      <div className="relative z-10 flex items-center justify-center gap-4 h-full px-10">
                        <Shield className="h-7 w-7 text-neon-cyan group-hover:text-neon-orange transition-colors duration-300" />
                        <span className="text-xl font-bold bg-gradient-to-r from-neon-cyan via-white to-neon-orange bg-clip-text text-transparent">
                          PRIVACY POLICY
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

export default Terms;

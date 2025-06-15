import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { ChevronRight, Shield, Lock, Eye, Database, Calendar, ArrowRight, BookOpen, Phone, FileText, UserCheck, Fingerprint, Bell } from 'lucide-react';

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

  // Default privacy policy content if no database content
  const defaultPrivacyContent = `
    <div class="space-y-8">
      <section>
        <h2 class="text-2xl font-anton text-neon-cyan mb-4">1. INFORMATION WE COLLECT</h2>
        <p class="text-white/80 leading-relaxed mb-4">
          We collect information you provide directly to us, such as when you create an account, make a purchase, 
          or contact us for support.
        </p>
        <ul class="list-disc list-inside text-white/70 space-y-2 ml-4">
          <li>Personal information (name, email, phone number, address)</li>
          <li>Payment information (processed securely through our payment partners)</li>
          <li>Account preferences and communication settings</li>
          <li>Customer service communications and feedback</li>
        </ul>
      </section>

      <section>
        <h2 class="text-2xl font-anton text-neon-purple mb-4">2. HOW WE USE YOUR INFORMATION</h2>
        <p class="text-white/80 leading-relaxed mb-4">
          We use the information we collect to provide, maintain, and improve our services, 
          process transactions, and communicate with you.
        </p>
        <ul class="list-disc list-inside text-white/70 space-y-2 ml-4">
          <li>Process and fulfill your orders</li>
          <li>Send order confirmations and shipping updates</li>
          <li>Provide customer support and respond to inquiries</li>
          <li>Send marketing communications (with your consent)</li>
          <li>Improve our products and services</li>
          <li>Detect and prevent fraud or security issues</li>
        </ul>
      </section>

      <section>
        <h2 class="text-2xl font-anton text-neon-pink mb-4">3. INFORMATION SHARING</h2>
        <p class="text-white/80 leading-relaxed mb-4">
          We do not sell, trade, or otherwise transfer your personal information to third parties, 
          except as described in this policy.
        </p>
        <ul class="list-disc list-inside text-white/70 space-y-2 ml-4">
          <li>Service providers who assist in our operations</li>
          <li>Payment processors for transaction processing</li>
          <li>Shipping companies for order delivery</li>
          <li>Legal authorities when required by law</li>
        </ul>
      </section>

      <section>
        <h2 class="text-2xl font-anton text-neon-orange mb-4">4. DATA SECURITY</h2>
        <p class="text-white/80 leading-relaxed mb-4">
          We implement appropriate security measures to protect your personal information 
          against unauthorized access, alteration, disclosure, or destruction.
        </p>
        <ul class="list-disc list-inside text-white/70 space-y-2 ml-4">
          <li>SSL encryption for data transmission</li>
          <li>Secure data storage with encryption at rest</li>
          <li>Regular security audits and monitoring</li>
          <li>Limited access to personal information on a need-to-know basis</li>
        </ul>
      </section>

      <section>
        <h2 class="text-2xl font-anton text-neon-cyan mb-4">5. COOKIES AND TRACKING</h2>
        <p class="text-white/80 leading-relaxed mb-4">
          We use cookies and similar technologies to enhance your browsing experience, 
          analyze site traffic, and understand user preferences.
        </p>
        <ul class="list-disc list-inside text-white/70 space-y-2 ml-4">
          <li>Essential cookies for website functionality</li>
          <li>Analytics cookies to understand user behavior</li>
          <li>Marketing cookies for personalized advertising</li>
          <li>You can control cookie preferences in your browser settings</li>
        </ul>
      </section>

      <section>
        <h2 class="text-2xl font-anton text-neon-purple mb-4">6. YOUR RIGHTS</h2>
        <p class="text-white/80 leading-relaxed mb-4">
          You have certain rights regarding your personal information, including the right to access, 
          update, delete, or restrict the use of your data.
        </p>
        <ul class="list-disc list-inside text-white/70 space-y-2 ml-4">
          <li>Access and update your account information</li>
          <li>Request deletion of your personal data</li>
          <li>Opt-out of marketing communications</li>
          <li>Data portability and export options</li>
        </ul>
      </section>

      <section>
        <h2 class="text-2xl font-anton text-neon-pink mb-4">7. THIRD-PARTY LINKS</h2>
        <p class="text-white/80 leading-relaxed mb-4">
          Our website may contain links to third-party sites. We are not responsible for 
          the privacy practices of these external websites.
        </p>
      </section>

      <section>
        <h2 class="text-2xl font-anton text-neon-orange mb-4">8. CHILDREN'S PRIVACY</h2>
        <p class="text-white/80 leading-relaxed mb-4">
          Our services are not intended for children under 13. We do not knowingly collect 
          personal information from children under 13 years of age.
        </p>
      </section>

      <section>
        <h2 class="text-2xl font-anton text-neon-cyan mb-4">9. POLICY UPDATES</h2>
        <p class="text-white/80 leading-relaxed mb-4">
          We may update this privacy policy from time to time. We will notify you of any 
          material changes by posting the new policy on our website.
        </p>
      </section>

      <section>
        <h2 class="text-2xl font-anton text-neon-purple mb-4">10. CONTACT US</h2>
        <p class="text-white/80 leading-relaxed mb-4">
          If you have any questions about this Privacy Policy, please contact us at privacy@bakwas.co.in 
          or through our contact page.
        </p>
      </section>
    </div>
  `;

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-black flex items-center justify-center">
        <motion.div 
          className="bg-black/40 backdrop-blur-xl border-2 border-neon-purple/30 rounded-2xl p-12 shadow-2xl shadow-neon-purple/20"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-4">
            <motion.div
              className="w-8 h-8 border-3 border-neon-purple border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <span className="text-2xl font-anton bg-gradient-to-r from-neon-purple to-neon-pink bg-clip-text text-transparent">
              LOADING PRIVACY...
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
        <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/15 via-black to-neon-pink/15 animate-gradient-shift"></div>
        <div className="absolute inset-0 bg-gradient-to-tl from-neon-cyan/8 via-transparent to-neon-orange/8 animate-pulse"></div>
        
        {/* Floating particles */}
        <div className="absolute inset-0">
          {[...Array(25)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1.5 h-1.5 bg-neon-purple/20 rounded-full"
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
                  'drop-shadow(0 0 15px rgba(139, 92, 246, 0.4))',
                  'drop-shadow(0 0 25px rgba(236, 72, 153, 0.4))',
                  'drop-shadow(0 0 15px rgba(139, 92, 246, 0.4))'
                ]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            
            <motion.h1 
              className="text-6xl md:text-8xl font-anton bg-gradient-to-r from-neon-purple via-neon-pink to-neon-cyan bg-clip-text text-transparent mb-6"
              animate={{ 
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{ duration: 6, repeat: Infinity }}
              style={{ backgroundSize: '200% 100%' }}
            >
              PRIVACY POLICY
            </motion.h1>
            
            <motion.p 
              className="text-xl md:text-2xl text-white/70 font-space max-w-4xl mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              Your privacy matters. Learn how we protect and handle your personal data at 
              <span className="text-neon-purple font-bold"> BAKWAS</span>.
            </motion.p>
          </div>

          {/* Breadcrumbs */}
          <motion.nav 
            className="flex items-center justify-center space-x-2 text-white/60 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            <Link to="/" className="hover:text-neon-purple transition-colors font-space">
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-neon-purple font-space">Privacy Policy</span>
          </motion.nav>
        </motion.div>

        <div className="max-w-6xl mx-auto space-y-12">
          {/* Privacy Protection Cards */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            {[
              { icon: Shield, title: "DATA PROTECTION", desc: "Advanced security measures", color: "neon-purple" },
              { icon: Lock, title: "ENCRYPTION", desc: "End-to-end data encryption", color: "neon-pink" },
              { icon: Eye, title: "TRANSPARENCY", desc: "Clear data usage policies", color: "neon-cyan" },
              { icon: UserCheck, title: "USER CONTROL", desc: "Full control over your data", color: "neon-orange" }
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

          {/* Privacy Commitment */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <Card className="bg-black/40 backdrop-blur-xl border-2 border-neon-pink/30 shadow-2xl shadow-neon-pink/20 rounded-2xl">
              <CardContent className="p-8">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-neon-pink/20 to-neon-purple/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Fingerprint className="h-8 w-8 text-neon-pink" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-anton text-neon-pink mb-2">OUR PRIVACY COMMITMENT</h3>
                    <p className="text-white/70 font-space text-lg leading-relaxed">
                      At BAKWAS, we believe privacy is a fundamental right. We're committed to being transparent 
                      about how we collect, use, and protect your personal information.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Last Updated Notice */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <Card className="bg-black/40 backdrop-blur-xl border-2 border-neon-cyan/30 shadow-2xl shadow-neon-cyan/20 rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Calendar className="h-6 w-6 text-neon-cyan" />
                  <div>
                    <h3 className="text-lg font-anton text-neon-cyan">LAST UPDATED</h3>
                    <p className="text-white/70 font-space">January 1, 2024 - Policy effective immediately</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Privacy Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            <Card className="bg-black/40 backdrop-blur-xl border-2 border-neon-purple/30 shadow-2xl shadow-neon-purple/20 rounded-2xl">
              <CardHeader className="pb-6">
                <CardTitle className="text-3xl font-anton text-neon-purple flex items-center gap-3">
                  <FileText className="h-8 w-8" />
                  PRIVACY POLICY
                </CardTitle>
                <p className="text-white/70 font-space text-lg">
                  Comprehensive information about how we handle your personal data.
                </p>
              </CardHeader>
              <CardContent className="p-8">
                <div 
                  className="prose prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ 
                    __html: content || defaultPrivacyContent 
                  }}
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* Data Rights Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            <Card className="bg-black/40 backdrop-blur-xl border-2 border-neon-orange/30 shadow-2xl shadow-neon-orange/20 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-2xl font-anton text-neon-orange flex items-center gap-3">
                  <Database className="h-6 w-6" />
                  YOUR DATA RIGHTS
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { icon: Eye, title: "Access Your Data", desc: "Request a copy of your personal information" },
                    { icon: Lock, title: "Update Information", desc: "Modify or correct your personal details" },
                    { icon: Shield, title: "Delete Data", desc: "Request deletion of your personal information" },
                    { icon: Bell, title: "Control Communications", desc: "Manage your marketing preferences" }
                  ].map((right, index) => (
                    <div key={right.title} className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-neon-orange/20 to-neon-pink/20 rounded-xl flex items-center justify-center flex-shrink-0">
                        <right.icon className="h-6 w-6 text-neon-orange" />
                      </div>
                      <div>
                        <h4 className="text-lg font-anton text-white mb-1">{right.title}</h4>
                        <p className="text-white/60 font-space text-sm">{right.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact and Help Section */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
          >
            <Card className="bg-black/40 backdrop-blur-xl border-2 border-neon-cyan/30 shadow-2xl shadow-neon-cyan/20 rounded-2xl">
              <CardContent className="p-12">
                <h3 className="text-4xl font-anton text-neon-cyan mb-6">QUESTIONS ABOUT YOUR PRIVACY?</h3>
                <p className="text-white/70 font-space text-xl mb-8 max-w-3xl mx-auto leading-relaxed">
                  Our privacy team is here to help with any questions or concerns about how we handle your data.
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
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink p-[2px] transition-all duration-500">
                        <div className="w-full h-full rounded-2xl bg-gradient-to-r from-gray-900/95 via-black to-gray-900/95"></div>
                      </div>
                      <div className="relative z-10 flex items-center justify-center gap-4 h-full px-10">
                        <Phone className="h-7 w-7 text-neon-cyan group-hover:text-neon-purple transition-colors duration-300" />
                        <span className="text-xl font-bold bg-gradient-to-r from-neon-cyan via-white to-neon-purple bg-clip-text text-transparent">
                          CONTACT PRIVACY
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
                      onClick={() => window.location.href = '/terms'}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 via-black/90 to-gray-900/80 backdrop-blur-xl transition-all duration-500 group-hover:from-gray-800/90 group-hover:via-gray-900/95 group-hover:to-gray-800/90"></div>
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-neon-purple via-neon-orange to-neon-pink p-[2px] transition-all duration-500">
                        <div className="w-full h-full rounded-2xl bg-gradient-to-r from-gray-900/95 via-black to-gray-900/95"></div>
                      </div>
                      <div className="relative z-10 flex items-center justify-center gap-4 h-full px-10">
                        <BookOpen className="h-7 w-7 text-neon-purple group-hover:text-neon-orange transition-colors duration-300" />
                        <span className="text-xl font-bold bg-gradient-to-r from-neon-purple via-white to-neon-orange bg-clip-text text-transparent">
                          VIEW TERMS
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

export default Privacy;

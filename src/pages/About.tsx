import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Target, Heart, Zap, Users, Award, MapPin, Calendar, Globe, Instagram, Twitter, Mail, ArrowRight } from 'lucide-react';

const About = () => {
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
        .eq('page_key', 'about')
        .single();

      if (error) throw error;
      setContent(data?.content || '');
    } catch (error) {
      console.error('Error fetching about page:', error);
    } finally {
      setLoading(false);
    }
  };

  const values = [
    {
      icon: Zap,
      title: 'BOLD CREATIVITY',
      description: 'We push boundaries and challenge conventional fashion with daring designs that speak to the rebellious spirit.',
      color: 'neon-cyan'
    },
    {
      icon: Heart,
      title: 'AUTHENTIC CULTURE',
      description: 'Born from Delhi\'s street culture, we stay true to our roots while evolving with the urban landscape.',
      color: 'neon-purple'
    },
    {
      icon: Award,
      title: 'PREMIUM QUALITY',
      description: 'Every piece is crafted with meticulous attention to detail, ensuring comfort, durability, and style.',
      color: 'neon-pink'
    },
    {
      icon: Users,
      title: 'COMMUNITY FIRST',
      description: 'We\'re more than a brand - we\'re a movement that connects street culture enthusiasts across India.',
      color: 'neon-orange'
    }
  ];

  const stats = [
    { number: '50K+', label: 'Happy Customers', icon: Users, color: 'neon-cyan' },
    { number: '500+', label: 'Unique Designs', icon: Award, color: 'neon-purple' },
    { number: '100+', label: 'Cities Reached', icon: MapPin, color: 'neon-pink' },
    { number: '2019', label: 'Founded', icon: Calendar, color: 'neon-orange' }
  ];

  const teamMembers = [
    {
      name: 'Shivam Khandelwal',
      role: 'Founder & CEO',
      description: 'Visionary leader driving BAKWAS to revolutionize India\'s streetwear culture and empower youth expression.',
      image: '/api/placeholder/300/300',
      social: { instagram: '#', twitter: '#' }
    },
    {
      name: 'Ashutosh Sharma',
      role: 'Head of Design',
      description: 'Creative mastermind behind BAKWAS\' bold designs that capture the essence of authentic street culture.',
      image: '/api/placeholder/300/300',
      social: { instagram: '#', twitter: '#' }
    },
    {
      name: 'Saurabh Choudhary',
      role: 'Head of Tech and Operations',
      description: 'Technology strategist ensuring seamless operations and innovative digital experiences for BAKWAS customers.',
      image: '/api/placeholder/300/300',
      social: { instagram: '#', twitter: '#' }
    }
  ];

  const defaultContent = `
    <div class="space-y-8">
      <div>
        <h2 class="text-3xl font-anton text-neon-cyan mb-4">OUR STORY</h2>
        <p class="text-white/80 text-lg leading-relaxed mb-6">
          BAKWAS was born in the vibrant streets of Delhi in 2019, emerging from a simple yet powerful idea: 
          streetwear should be as bold and authentic as the culture it represents. What started as a small collective 
          of street culture enthusiasts has evolved into India's most talked-about streetwear brand.
        </p>
        <p class="text-white/80 text-lg leading-relaxed">
          We saw a gap in the market - young Indians were hungry for fashion that spoke their language, 
          that understood their vibe, and that wasn't afraid to be different. BAKWAS filled that void with 
          designs that are unapologetically bold, culturally relevant, and premium in quality.
        </p>
      </div>

      <div>
        <h2 class="text-3xl font-anton text-neon-purple mb-4">OUR MISSION</h2>
        <p class="text-white/80 text-lg leading-relaxed">
          To empower the youth of India to express their individuality through fashion that's as fearless as they are. 
          We're not just making clothes; we're crafting a movement that celebrates authenticity, creativity, and the 
          beautiful chaos of urban life.
        </p>
      </div>

      <div>
        <h2 class="text-3xl font-anton text-neon-pink mb-4">WHY BAKWAS?</h2>
        <p class="text-white/80 text-lg leading-relaxed">
          "Bakwas" might mean nonsense in Hindi, but to us, it represents everything that's real and unfiltered about 
          street culture. We embrace the beautiful imperfection, the raw energy, and the authentic voice of India's youth. 
          Our name is our philosophy - we're here to disrupt, to challenge, and to create fashion that matters.
        </p>
      </div>
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
              LOADING STORY...
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
          {[...Array(20)].map((_, i) => (
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
          className="max-w-7xl mx-auto mb-16"
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
              ABOUT BAKWAS
            </motion.h1>
            
            <motion.p 
              className="text-xl md:text-2xl text-white/70 font-space max-w-4xl mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              Born from Delhi's streets, forged by passion, and driven by the rebellious spirit of India's youth. 
              We're not just a <span className="text-neon-cyan font-bold">streetwear brand</span> - we're a cultural revolution.
            </motion.p>
          </div>
        </motion.div>

        <div className="max-w-7xl mx-auto space-y-16">
          {/* Stats Section */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1, duration: 0.6 }}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <Card className={`bg-black/40 backdrop-blur-xl border-2 border-${stat.color}/30 shadow-2xl shadow-${stat.color}/20 hover:shadow-${stat.color}/40 transition-all duration-500 rounded-2xl text-center h-full`}>
                  <CardContent className="p-6">
                    <div className={`w-16 h-16 bg-gradient-to-r from-${stat.color} to-${stat.color}/60 rounded-full flex items-center justify-center mx-auto mb-4`}>
                      <stat.icon className="h-8 w-8 text-black" />
                    </div>
                    <h3 className={`text-3xl font-anton text-${stat.color} mb-2`}>
                      {stat.number}
                    </h3>
                    <p className="text-white/70 font-space font-semibold">
                      {stat.label}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <Card className="bg-black/40 backdrop-blur-xl border-2 border-neon-cyan/30 shadow-2xl shadow-neon-cyan/20 hover:shadow-neon-purple/30 transition-all duration-500 rounded-2xl">
              <CardHeader className="pb-6">
                <CardTitle className="text-neon-cyan text-3xl font-anton flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-neon-cyan to-neon-purple rounded-full flex items-center justify-center">
                    <Globe className="h-6 w-6 text-black" />
                  </div>
                  OUR JOURNEY
                </CardTitle>
                <div className="h-1 w-full bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink rounded-full"></div>
              </CardHeader>
              <CardContent>
                <div className="prose prose-invert prose-lg max-w-none text-white/80 font-space">
                  {content ? (
                    <div dangerouslySetInnerHTML={{ __html: content }} />
                  ) : (
                    <div dangerouslySetInnerHTML={{ __html: defaultContent }} />
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Values Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            <div className="text-center mb-12">
              <motion.h2 
                className="text-4xl md:text-6xl font-anton bg-gradient-to-r from-neon-purple via-neon-pink to-neon-orange bg-clip-text text-transparent mb-4"
                animate={{ 
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{ duration: 8, repeat: Infinity }}
                style={{ backgroundSize: '200% 100%' }}
              >
                OUR VALUES
              </motion.h2>
              <p className="text-white/70 font-space text-lg max-w-2xl mx-auto">
                These core principles guide everything we do and shape the BAKWAS experience.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {values.map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.2, duration: 0.6 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                >
                  <Card className={`bg-black/40 backdrop-blur-xl border-2 border-${value.color}/30 shadow-2xl shadow-${value.color}/20 hover:shadow-${value.color}/40 transition-all duration-500 rounded-2xl h-full`}>
                    <CardContent className="p-8">
                      <div className="flex items-start gap-6">
                        <div className={`w-16 h-16 bg-gradient-to-r from-${value.color} to-${value.color}/60 rounded-full flex items-center justify-center flex-shrink-0`}>
                          <value.icon className="h-8 w-8 text-black" />
                        </div>
                        <div>
                          <h3 className={`text-2xl font-anton text-${value.color} mb-3`}>
                            {value.title}
                          </h3>
                          <p className="text-white/70 font-space text-lg leading-relaxed">
                            {value.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Team Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
          >
            <Card className="bg-black/40 backdrop-blur-xl border-2 border-neon-purple/30 shadow-2xl shadow-neon-purple/20 hover:shadow-neon-cyan/30 transition-all duration-500 rounded-2xl">
              <CardHeader className="pb-8">
                <CardTitle className="text-neon-purple text-3xl font-anton flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-neon-purple to-neon-pink rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-black" />
                  </div>
                  MEET THE TEAM
                </CardTitle>
                <div className="h-1 w-full bg-gradient-to-r from-neon-purple via-neon-pink to-neon-orange rounded-full"></div>
                <p className="text-white/70 font-space text-lg">
                  The creative minds and passionate souls behind the BAKWAS revolution.
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {teamMembers.map((member, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1 + index * 0.2, duration: 0.6 }}
                      whileHover={{ scale: 1.03, y: -5 }}
                      className="text-center"
                    >
                      <div className="bg-gray-900/40 backdrop-blur-sm rounded-2xl p-6 border border-neon-purple/20 hover:border-neon-cyan/40 transition-all duration-300">
                        <div className="w-32 h-32 bg-gradient-to-r from-neon-purple/20 to-neon-cyan/20 rounded-full mx-auto mb-6 flex items-center justify-center">
                          <Users className="h-16 w-16 text-neon-purple" />
                        </div>
                        <h3 className="text-xl font-anton text-neon-cyan mb-2">
                          {member.name}
                        </h3>
                        <p className="text-neon-purple font-space font-semibold mb-3">
                          {member.role}
                        </p>
                        <p className="text-white/70 font-space text-sm leading-relaxed mb-4">
                          {member.description}
                        </p>
                        <div className="flex justify-center gap-3">
                          <Button size="sm" variant="outline" className="border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/10">
                            <Instagram className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="border-neon-purple/30 text-neon-purple hover:bg-neon-purple/10">
                            <Twitter className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Call to Action */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
          >
            <Card className="bg-black/40 backdrop-blur-xl border-2 border-neon-orange/30 shadow-2xl shadow-neon-orange/20 rounded-2xl">
              <CardContent className="p-12">
                <h3 className="text-4xl font-anton text-neon-orange mb-6">JOIN THE REVOLUTION</h3>
                <p className="text-white/70 font-space text-xl mb-8 max-w-3xl mx-auto leading-relaxed">
                  Ready to be part of something bigger? Explore our latest collections and discover 
                  why thousands of Indians choose <span className="text-neon-cyan font-bold">BAKWAS</span> to express their authentic selves.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      className="group relative h-16 text-xl font-anton overflow-hidden rounded-2xl border-0 bg-transparent p-0 transition-all duration-500 hover:scale-[1.02]"
                      onClick={() => window.location.href = '/products'}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 via-black/90 to-gray-900/80 backdrop-blur-xl transition-all duration-500 group-hover:from-gray-800/90 group-hover:via-gray-900/95 group-hover:to-gray-800/90"></div>
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-neon-orange via-neon-pink to-neon-cyan p-[2px] transition-all duration-500">
                        <div className="w-full h-full rounded-2xl bg-gradient-to-r from-gray-900/95 via-black to-gray-900/95"></div>
                      </div>
                      <div className="relative z-10 flex items-center justify-center gap-4 h-full px-10">
                        <ArrowRight className="h-7 w-7 text-neon-orange group-hover:text-neon-cyan transition-colors duration-300" />
                        <span className="text-xl font-bold bg-gradient-to-r from-neon-orange via-white to-neon-pink bg-clip-text text-transparent">
                          SHOP COLLECTION
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
                      onClick={() => window.location.href = '/contact'}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 via-black/90 to-gray-900/80 backdrop-blur-xl transition-all duration-500 group-hover:from-gray-800/90 group-hover:via-gray-900/95 group-hover:to-gray-800/90"></div>
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink p-[2px] transition-all duration-500">
                        <div className="w-full h-full rounded-2xl bg-gradient-to-r from-gray-900/95 via-black to-gray-900/95"></div>
                      </div>
                      <div className="relative z-10 flex items-center justify-center gap-4 h-full px-10">
                        <Mail className="h-7 w-7 text-neon-cyan group-hover:text-neon-orange transition-colors duration-300" />
                        <span className="text-xl font-bold bg-gradient-to-r from-neon-cyan via-white to-neon-purple bg-clip-text text-transparent">
                          GET IN TOUCH
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

export default About;
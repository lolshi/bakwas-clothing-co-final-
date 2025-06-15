import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Building2, Target, TrendingUp, Award, Users, MapPin, Calendar, Globe, Rocket, Star, Trophy, Zap, Heart, ArrowRight, Mail } from 'lucide-react';

const Company = () => {
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
        .eq('page_key', 'company')
        .single();

      if (error) throw error;
      setContent(data?.content || '');
    } catch (error) {
      console.error('Error fetching company page:', error);
    } finally {
      setLoading(false);
    }
  };

  const milestones = [
    {
      year: '2019',
      title: 'BAKWAS BORN',
      description: 'Founded in Delhi with a vision to revolutionize Indian streetwear culture.',
      icon: Rocket,
      color: 'neon-cyan'
    },
    {
      year: '2020',
      title: 'FIRST COLLECTION',
      description: 'Launched our debut collection featuring bold designs that captured youth attention.',
      icon: Star,
      color: 'neon-purple'
    },
    {
      year: '2021',
      title: 'NATIONWIDE EXPANSION',
      description: 'Expanded operations to serve customers across 100+ cities in India.',
      icon: Globe,
      color: 'neon-pink'
    },
    {
      year: '2022',
      title: 'COMMUNITY OF 50K+',
      description: 'Built a strong community of streetwear enthusiasts and loyal customers.',
      icon: Users,
      color: 'neon-orange'
    },
    {
      year: '2023',
      title: 'SUSTAINABILITY FOCUS',
      description: 'Introduced eco-friendly materials and sustainable production practices.',
      icon: Heart,
      color: 'neon-cyan'
    },
    {
      year: '2024',
      title: 'INNOVATION LEADER',
      description: 'Leading the industry with cutting-edge designs and customer experience.',
      icon: Trophy,
      color: 'neon-purple'
    }
  ];

  const achievements = [
    {
      number: '50K+',
      label: 'Happy Customers',
      description: 'Trusted by thousands across India',
      icon: Users,
      color: 'neon-cyan'
    },
    {
      number: '500+',
      label: 'Unique Designs',
      description: 'Original streetwear collections',
      icon: Award,
      color: 'neon-purple'
    },
    {
      number: '100+',
      label: 'Cities Served',
      description: 'Nationwide delivery network',
      icon: MapPin,
      color: 'neon-pink'
    },
    {
      number: '99%',
      label: 'Satisfaction Rate',
      description: 'Customer happiness guaranteed',
      icon: Star,
      color: 'neon-orange'
    }
  ];

  const companyPillars = [
    {
      icon: Target,
      title: 'OUR VISION',
      description: 'To become India\'s most authentic and influential streetwear brand, empowering youth to express their individuality through bold fashion choices.',
      color: 'neon-cyan'
    },
    {
      icon: TrendingUp,
      title: 'OUR MISSION',
      description: 'Creating premium streetwear that resonates with India\'s street culture while maintaining quality, authenticity, and accessibility.',
      color: 'neon-purple'
    },
    {
      icon: Zap,
      title: 'OUR PURPOSE',
      description: 'Breaking fashion boundaries and challenging conventions to give voice to the fearless, creative, and authentic youth of India.',
      color: 'neon-pink'
    },
    {
      icon: Heart,
      title: 'OUR VALUES',
      description: 'Authenticity, creativity, quality, and community - these principles guide every decision we make and every design we create.',
      color: 'neon-orange'
    }
  ];

  const defaultContent = `
    <div class="space-y-8">
      <div>
        <h2 class="text-3xl font-anton text-neon-cyan mb-4">COMPANY OVERVIEW</h2>
        <p class="text-white/80 text-lg leading-relaxed mb-6">
          BAKWAS Clothing Co. stands at the forefront of India's streetwear revolution. Since our inception in 2019, 
          we've been more than just a fashion brand - we're a cultural movement that celebrates the bold, 
          authentic spirit of India's youth.
        </p>
        <p class="text-white/80 text-lg leading-relaxed">
          Our name "BAKWAS" might mean nonsense in Hindi, but it represents our philosophy of embracing 
          the beautiful chaos of street culture. We create fashion that speaks to the rebellious, 
          creative soul of young India.
        </p>
      </div>

      <div>
        <h2 class="text-3xl font-anton text-neon-purple mb-4">WHAT DRIVES US</h2>
        <p class="text-white/80 text-lg leading-relaxed">
          Every piece we create tells a story of authenticity, quality, and cultural relevance. 
          We're not just selling clothes; we're building a community of individuals who aren't 
          afraid to stand out, speak up, and express their true selves through fashion.
        </p>
      </div>

      <div>
        <h2 class="text-3xl font-anton text-neon-pink mb-4">OUR IMPACT</h2>
        <p class="text-white/80 text-lg leading-relaxed">
          From our headquarters in Delhi to customers across India, BAKWAS has touched thousands of lives. 
          We've created jobs, supported local communities, and most importantly, given young Indians 
          a platform to express their individuality without compromise.
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
              LOADING COMPANY...
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
          {[...Array(25)].map((_, i) => (
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
              OUR COMPANY
            </motion.h1>
            
            <motion.p 
              className="text-xl md:text-2xl text-white/70 font-space max-w-4xl mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              Leading India's streetwear revolution since 2019. From Delhi's streets to the nation's heart, 
              <span className="text-neon-cyan font-bold"> BAKWAS</span> is redefining what authentic fashion means.
            </motion.p>
          </div>
        </motion.div>

        <div className="max-w-7xl mx-auto space-y-16">
          {/* Achievements Section */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            {achievements.map((achievement, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1, duration: 0.6 }}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <Card className={`bg-black/40 backdrop-blur-xl border-2 border-${achievement.color}/30 shadow-2xl shadow-${achievement.color}/20 hover:shadow-${achievement.color}/40 transition-all duration-500 rounded-2xl text-center h-full`}>
                  <CardContent className="p-6">
                    <div className={`w-16 h-16 bg-gradient-to-r from-${achievement.color} to-${achievement.color}/60 rounded-full flex items-center justify-center mx-auto mb-4`}>
                      <achievement.icon className="h-8 w-8 text-black" />
                    </div>
                    <h3 className={`text-3xl font-anton text-${achievement.color} mb-2`}>
                      {achievement.number}
                    </h3>
                    <p className="text-white/90 font-space font-semibold mb-1">
                      {achievement.label}
                    </p>
                    <p className="text-white/60 font-space text-sm">
                      {achievement.description}
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
                    <Building2 className="h-6 w-6 text-black" />
                  </div>
                  COMPANY STORY
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

          {/* Company Pillars */}
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
                COMPANY PILLARS
              </motion.h2>
              <p className="text-white/70 font-space text-lg max-w-2xl mx-auto">
                The foundational principles that drive BAKWAS forward and shape our company culture.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {companyPillars.map((pillar, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.2, duration: 0.6 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                >
                  <Card className={`bg-black/40 backdrop-blur-xl border-2 border-${pillar.color}/30 shadow-2xl shadow-${pillar.color}/20 hover:shadow-${pillar.color}/40 transition-all duration-500 rounded-2xl h-full`}>
                    <CardContent className="p-8">
                      <div className="flex items-start gap-6">
                        <div className={`w-16 h-16 bg-gradient-to-r from-${pillar.color} to-${pillar.color}/60 rounded-full flex items-center justify-center flex-shrink-0`}>
                          <pillar.icon className="h-8 w-8 text-black" />
                        </div>
                        <div>
                          <h3 className={`text-2xl font-anton text-${pillar.color} mb-3`}>
                            {pillar.title}
                          </h3>
                          <p className="text-white/70 font-space text-lg leading-relaxed">
                            {pillar.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Journey Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
          >
            <Card className="bg-black/40 backdrop-blur-xl border-2 border-neon-purple/30 shadow-2xl shadow-neon-purple/20 hover:shadow-neon-cyan/30 transition-all duration-500 rounded-2xl">
              <CardHeader className="pb-8">
                <CardTitle className="text-neon-purple text-3xl font-anton flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-neon-purple to-neon-pink rounded-full flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-black" />
                  </div>
                  OUR JOURNEY
                </CardTitle>
                <div className="h-1 w-full bg-gradient-to-r from-neon-purple via-neon-pink to-neon-orange rounded-full"></div>
                <p className="text-white/70 font-space text-lg">
                  Major milestones that define our growth and evolution as India's leading streetwear brand.
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {milestones.map((milestone, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1 + index * 0.1, duration: 0.6 }}
                      whileHover={{ scale: 1.03, y: -5 }}
                    >
                      <div className={`bg-gray-900/40 backdrop-blur-sm rounded-2xl p-6 border border-${milestone.color}/20 hover:border-${milestone.color}/40 transition-all duration-300`}>
                        <div className="flex items-center gap-4 mb-4">
                          <div className={`w-12 h-12 bg-gradient-to-r from-${milestone.color}/20 to-${milestone.color}/40 rounded-full flex items-center justify-center`}>
                            <milestone.icon className={`h-6 w-6 text-${milestone.color}`} />
                          </div>
                          <div className={`text-2xl font-anton text-${milestone.color}`}>
                            {milestone.year}
                          </div>
                        </div>
                        <h3 className="text-lg font-anton text-neon-cyan mb-2">
                          {milestone.title}
                        </h3>
                        <p className="text-white/70 font-space text-sm leading-relaxed">
                          {milestone.description}
                        </p>
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
                <h3 className="text-4xl font-anton text-neon-orange mb-6">BE PART OF OUR STORY</h3>
                <p className="text-white/70 font-space text-xl mb-8 max-w-3xl mx-auto leading-relaxed">
                  Join the thousands who've already made <span className="text-neon-cyan font-bold">BAKWAS</span> their choice 
                  for authentic streetwear. Be part of India's fashion revolution and express your fearless style.
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
                          EXPLORE COLLECTIONS
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
                      onClick={() => window.location.href = '/about'}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 via-black/90 to-gray-900/80 backdrop-blur-xl transition-all duration-500 group-hover:from-gray-800/90 group-hover:via-gray-900/95 group-hover:to-gray-800/90"></div>
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink p-[2px] transition-all duration-500">
                        <div className="w-full h-full rounded-2xl bg-gradient-to-r from-gray-900/95 via-black to-gray-900/95"></div>
                      </div>
                      <div className="relative z-10 flex items-center justify-center gap-4 h-full px-10">
                        <Building2 className="h-7 w-7 text-neon-cyan group-hover:text-neon-orange transition-colors duration-300" />
                        <span className="text-xl font-bold bg-gradient-to-r from-neon-cyan via-white to-neon-purple bg-clip-text text-transparent">
                          LEARN MORE
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

export default Company;

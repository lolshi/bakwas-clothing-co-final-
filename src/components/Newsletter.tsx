import React, { useState } from 'react';
import { Loader2, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      // Check if already subscribed
      const { data: existingSubscriber } = await supabase
        .from('subscribers')
        .select('id, is_active')
        .eq('email', email)
        .single();

      if (existingSubscriber) {
        if (existingSubscriber.is_active) {
          toast({
            title: "Already subscribed!",
            description: "You're already on our mailing list.",
            variant: "default",
          });
        } else {
          // Reactivate subscription
          const { error } = await supabase
            .from('subscribers')
            .update({ is_active: true, name: name || null })
            .eq('id', existingSubscriber.id);

          if (error) throw error;

          toast({
            title: "Welcome back!",
            description: "Your subscription has been reactivated.",
            variant: "default",
          });
        }
      } else {
        // New subscription
        const { error } = await supabase
          .from('subscribers')
          .insert([
            {
              email,
              name: name || null,
              is_active: true,
              subscribed_at: new Date().toISOString()
            }
          ]);

        if (error) throw error;

        toast({
          title: "Subscribed!",
          description: "Welcome to our newsletter! 🎉",
          variant: "default",
        });
      }

      setEmail('');
      setName('');
    } catch (error) {
      console.error('Error subscribing to newsletter:', error);
      toast({
        title: "Subscription failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative py-20">
      {/* Animated accent elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-neon-cyan/10 rounded-full filter blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-neon-pink/10 rounded-full filter blur-3xl animate-pulse delay-1000" />
      </div>
      
      <div className="container relative z-10">
        <motion.div 
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {/* Header */}
          <div className="text-center mb-10">
            <motion.div
              className="relative inline-block"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <h2 className="text-2xl sm:text-4xl md:text-7xl font-anton tracking-tight leading-none break-words text-balance">
                <span className="relative block sm:inline-block px-1 sm:px-2">
                  <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/90">JOIN THE</span>
                </span>
                <span className="relative block sm:inline-block px-1 sm:px-2">
                  <span className="relative z-10 text-transparent font-black tracking-wider bg-clip-text bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink animate-text-shimmer"
                    style={{
                      textShadow: `
                        -1px -1px 0px rgba(255,255,255,0.3),
                        2px 2px 0px rgba(0,225,255,0.7),
                        4px 4px 0px rgba(139,92,246,0.5),
                        6px 6px 0px rgba(255,0,128,0.4),
                        8px 8px 15px rgba(0,0,0,0.5)
                      `,
                      transform: 'perspective(500px) rotateX(10deg)',
                      display: 'inline-block'
                    }}
                  >
                    BAKWAS
                  </span>
                  {/* Enhanced glow effect */}
                  <div className="absolute -inset-2 blur-3xl bg-gradient-to-r from-neon-cyan/40 via-neon-purple/40 to-neon-pink/40 animate-pulse" />
                  {/* 3D reflection */}
                  <div 
                    className="absolute -bottom-4 left-0 right-0 h-2 blur-sm bg-gradient-to-r from-neon-cyan/30 via-neon-purple/30 to-neon-pink/30"
                    style={{
                      transform: 'perspective(500px) rotateX(60deg) scaleY(0.3)',
                      opacity: 0.5
                    }}
                  />
                </span>
                <span className="relative block sm:inline-block px-1 sm:px-2">
                  <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-white/90 via-white to-white/90">CREW</span>
                </span>
              </h2>
              
              {/* Decorative elements */}
              <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-16 h-16 border-l-2 border-neon-cyan/30 rounded-l-xl" />
              <div className="absolute -right-8 top-1/2 -translate-y-1/2 w-16 h-16 border-r-2 border-neon-pink/30 rounded-r-xl" />
            </motion.div>
            
            <motion.div 
              className="w-full max-w-xs mx-auto h-1 mt-8 mb-8"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <div className="h-full w-full bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink rounded-full" />
            </motion.div>
            
            <motion.p 
              className="text-lg text-white/70 max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              Get exclusive access to drops, discounts, and behind-the-scenes content. 
              Be part of the movement.
            </motion.p>
          </div>

          {/* Subscription Form */}
          <motion.div 
            className="max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <form onSubmit={handleSubscribe} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/70">Name (Optional)</label>
                    <Input
                      type="text"
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-11 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan/50 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/70">Email Address</label>
                    <Input
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-11 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan/50 rounded-xl"
                    />
                  </div>
                </div>
                
                <Button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full h-11 bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink hover:from-neon-cyan/90 hover:via-neon-purple/90 hover:to-neon-pink/90 text-black font-space font-semibold rounded-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Subscribing...
                    </>
                  ) : (
                    <>
                      Subscribe Now
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>
            </div>

            <motion.p 
              className="text-sm text-white/50 text-center mt-4 max-w-lg mx-auto"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              By subscribing, you agree to receive marketing communications from us.
              We respect your privacy and will never share your information.
            </motion.p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Newsletter; 
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Mail, MapPin, X, Send, MessageCircle, Clock } from 'lucide-react';

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // TODO: Replace with actual API call to /api/contact
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setShowModal(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Multiple animated gradient layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/20 via-black to-neon-cyan/20 animate-gradient-shift"></div>
        <div className="absolute inset-0 bg-gradient-to-tl from-neon-pink/10 via-transparent to-neon-orange/10 animate-pulse"></div>
        
        {/* Floating particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-neon-cyan/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.3, 1, 0.3],
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
      <div className="relative z-10 p-4 sm:p-6 md:p-8">
        {/* Hero Section */}
        <motion.div 
          className="text-center py-6 sm:py-8 md:py-12"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.img 
            src="/lovable-uploads/97535d1c-cb3e-4d54-ab8b-54078a7ca53c.png" 
            alt="Bakwas Clothing Co." 
            className="w-32 sm:w-40 md:w-48 h-auto mx-auto mb-4 sm:mb-6 md:mb-8 drop-shadow-2xl"
            animate={{ 
              filter: [
                'drop-shadow(0 0 20px rgba(0, 225, 255, 0.5))',
                'drop-shadow(0 0 30px rgba(139, 92, 246, 0.5))',
                'drop-shadow(0 0 20px rgba(0, 225, 255, 0.5))'
              ]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          
          <motion.h1 
            className="text-4xl sm:text-6xl md:text-8xl font-anton bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink bg-clip-text text-transparent mb-2 sm:mb-3 md:mb-4"
            animate={{ 
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{ duration: 5, repeat: Infinity }}
            style={{ backgroundSize: '200% 100%' }}
          >
            GET IN TOUCH
          </motion.h1>
          
          <motion.p 
            className="text-lg sm:text-xl md:text-2xl text-white/80 font-space max-w-2xl mx-auto px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            Ready to join the <span className="text-neon-cyan font-bold">BAKWAS</span> movement? 
            Let's connect and bring your streetwear vision to life.
          </motion.p>
        </motion.div>

        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {/* Contact Form - Takes 2 columns */}
            <motion.div 
              className="lg:col-span-2 order-2 lg:order-1"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <Card className="bg-black/40 backdrop-blur-xl border-2 border-neon-cyan/30 shadow-2xl shadow-neon-cyan/20 hover:shadow-neon-purple/30 transition-all duration-500">
                <CardHeader className="pb-4 sm:pb-6">
                  <CardTitle className="text-neon-cyan text-2xl sm:text-3xl font-anton flex items-center gap-2 sm:gap-3">
                    <MessageCircle className="h-6 w-6 sm:h-8 sm:w-8 text-neon-cyan" />
                    SEND US A MESSAGE
                  </CardTitle>
                  <div className="h-1 w-full bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink rounded-full"></div>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                    <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <Label htmlFor="name" className="text-neon-cyan font-space font-semibold text-base sm:text-lg mb-1 sm:mb-2 block">
                          Name *
                        </Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="bg-gray-900/60 text-white border-2 border-gray-600 focus:border-neon-cyan transition-all duration-300 rounded-xl h-10 sm:h-12 text-base sm:text-lg backdrop-blur-sm"
                          placeholder="Your Name"
                          required
                        />
                      </motion.div>
                      
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <Label htmlFor="email" className="text-neon-cyan font-space font-semibold text-base sm:text-lg mb-1 sm:mb-2 block">
                          Email *
                        </Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="bg-gray-900/60 text-white border-2 border-gray-600 focus:border-neon-cyan transition-all duration-300 rounded-xl h-10 sm:h-12 text-base sm:text-lg backdrop-blur-sm"
                          placeholder="your.email@example.com"
                          required
                        />
                      </motion.div>
                    </div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Label htmlFor="subject" className="text-neon-cyan font-space font-semibold text-base sm:text-lg mb-1 sm:mb-2 block">
                        Subject *
                      </Label>
                      <Input
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="bg-gray-900/60 text-white border-2 border-gray-600 focus:border-neon-cyan transition-all duration-300 rounded-xl h-10 sm:h-12 text-base sm:text-lg backdrop-blur-sm"
                        placeholder="How can we help?"
                        required
                      />
                    </motion.div>
                    
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Label htmlFor="message" className="text-neon-cyan font-space font-semibold text-base sm:text-lg mb-1 sm:mb-2 block">
                        Message *
                      </Label>
                      <Textarea
                        id="message"
                        name="message"
                        rows={6}
                        value={formData.message}
                        onChange={handleChange}
                        className="bg-gray-900/60 text-white border-2 border-gray-600 focus:border-neon-cyan transition-all duration-300 rounded-xl text-base sm:text-lg backdrop-blur-sm resize-none"
                        placeholder="Tell us more about your inquiry... Share your streetwear dreams, questions, or feedback!"
                        required
                      />
                    </motion.div>
                    
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="mt-6 sm:mt-8"
                    >
                      <Button 
                        type="submit" 
                        disabled={isSubmitting} 
                        className="group relative w-full h-12 sm:h-16 text-lg sm:text-xl font-anton overflow-hidden rounded-2xl border-0 bg-transparent p-0 transition-all duration-500 hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {/* Main glass background */}
                        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 via-black/90 to-gray-900/80 backdrop-blur-xl transition-all duration-500 group-hover:from-gray-800/90 group-hover:via-gray-900/95 group-hover:to-gray-800/90"></div>
                        
                        {/* Neon border gradient */}
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-cyan p-[2px] group-hover:from-neon-purple group-hover:via-neon-pink group-hover:to-neon-orange transition-all duration-500">
                          <div className="w-full h-full rounded-2xl bg-gradient-to-r from-gray-900/95 via-black to-gray-900/95"></div>
                        </div>
                        
                        {/* Subtle inner glow */}
                        <div className="absolute inset-2 rounded-xl bg-gradient-to-r from-neon-cyan/5 via-transparent to-neon-cyan/5 group-hover:from-neon-purple/10 group-hover:via-neon-pink/5 group-hover:to-neon-orange/10 transition-all duration-500"></div>
                        
                        {/* Animated shine effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neon-cyan/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                        
                        {/* Button content */}
                        <div className="relative z-10 flex items-center justify-center gap-4 h-full px-8">
                          {isSubmitting ? (
                            <motion.div 
                              className="flex items-center gap-4"
                              animate={{ opacity: [1, 0.7, 1] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            >
                              <motion.div 
                                className="w-7 h-7 border-3 border-neon-cyan border-t-transparent rounded-full"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              />
                              <span className="text-xl font-bold bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">
                                SENDING MESSAGE...
                              </span>
                            </motion.div>
                          ) : (
                            <motion.div 
                              className="flex items-center gap-4"
                              whileHover={{ x: 2 }}
                              transition={{ type: "spring", stiffness: 400 }}
                            >
                              <motion.div
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                transition={{ type: "spring", stiffness: 400 }}
                                className="text-neon-cyan group-hover:text-neon-pink transition-colors duration-300"
                              >
                                <Send className="h-7 w-7" />
                              </motion.div>
                              <span className="text-xl font-bold bg-gradient-to-r from-neon-cyan via-white to-neon-cyan bg-clip-text text-transparent group-hover:from-neon-purple group-hover:via-neon-pink group-hover:to-neon-orange transition-all duration-500">
                                SEND MESSAGE
                              </span>
                              <motion.div
                                animate={{ x: [0, 3, 0] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                className="text-neon-cyan/70 group-hover:text-neon-orange transition-colors duration-300 text-2xl"
                              >
                                →
                              </motion.div>
                            </motion.div>
                          )}
                        </div>
                        
                        {/* Outer glow effect */}
                        <div className="absolute inset-0 -m-2 rounded-3xl bg-gradient-to-r from-neon-cyan/10 via-neon-purple/5 to-neon-cyan/10 blur-xl opacity-0 group-hover:opacity-60 group-hover:from-neon-purple/15 group-hover:via-neon-pink/10 group-hover:to-neon-orange/15 transition-all duration-700"></div>
                      </Button>
                    </motion.div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>

            {/* Contact Information Sidebar */}
            <motion.div 
              className="space-y-4 sm:space-y-6 order-1 lg:order-2"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              {/* Contact Details */}
              <Card className="bg-black/40 backdrop-blur-xl border-2 border-neon-purple/30 shadow-2xl shadow-neon-purple/20 hover:shadow-neon-cyan/30 transition-all duration-500">
                <CardHeader className="p-3 sm:p-4 md:p-6">
                  <CardTitle className="text-neon-purple text-xl sm:text-2xl font-anton flex items-center gap-2 sm:gap-3">
                    <Mail className="h-5 w-5 sm:h-6 sm:w-6 text-neon-purple" />
                    CONNECT WITH US
                  </CardTitle>
                  <div className="h-1 w-full bg-gradient-to-r from-neon-purple to-neon-pink rounded-full"></div>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6">
                  <motion.div 
                    className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-900/40 rounded-xl border border-neon-cyan/20 hover:border-neon-cyan/50 transition-all duration-300"
                    whileHover={{ scale: 1.02, backgroundColor: "rgba(0, 225, 255, 0.1)" }}
                  >
                    <Mail className="h-5 w-5 sm:h-6 sm:w-6 text-neon-cyan flex-shrink-0" />
                    <div>
                      <p className="text-neon-cyan/80 text-xs sm:text-sm font-space font-medium">Email</p>
                      <p className="text-neon-cyan font-space font-bold text-base sm:text-lg break-all">support@bakwasclothingco.com</p>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-900/40 rounded-xl border border-neon-pink/20 hover:border-neon-pink/50 transition-all duration-300"
                    whileHover={{ scale: 1.02, backgroundColor: "rgba(236, 72, 153, 0.1)" }}
                  >
                    <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-neon-pink flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-neon-pink/80 text-xs sm:text-sm font-space font-medium">Address</p>
                      <p className="text-neon-pink font-space font-bold text-base sm:text-lg">RZG/634-B Lohia Marg, New Delhi 110077</p>
                    </div>
                  </motion.div>
                </CardContent>
              </Card>

              {/* Business Hours */}
              <Card className="bg-black/40 backdrop-blur-xl border-2 border-neon-orange/30 shadow-2xl shadow-neon-orange/20 hover:shadow-neon-cyan/30 transition-all duration-500">
                <CardHeader className="p-3 sm:p-4 md:p-6">
                  <CardTitle className="text-neon-orange text-xl sm:text-2xl font-anton flex items-center gap-2 sm:gap-3">
                    <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-neon-orange" />
                    BUSINESS HOURS
                  </CardTitle>
                  <div className="h-1 w-full bg-gradient-to-r from-neon-orange to-neon-pink rounded-full"></div>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-4 md:p-6">
                  <div className="grid grid-cols-2 gap-2 sm:gap-4">
                    <div className="text-white/80 font-space">
                      <p className="text-sm sm:text-base font-semibold">Monday - Friday</p>
                      <p className="text-xs sm:text-sm">10:00 AM - 7:00 PM</p>
                    </div>
                    <div className="text-white/80 font-space">
                      <p className="text-sm sm:text-base font-semibold">Saturday</p>
                      <p className="text-xs sm:text-sm">11:00 AM - 6:00 PM</p>
                    </div>
                    <div className="text-white/80 font-space col-span-2">
                      <p className="text-sm sm:text-base font-semibold">Sunday</p>
                      <p className="text-xs sm:text-sm">Closed</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-white/60 text-xs sm:text-sm font-space">
                      * All times are in Indian Standard Time (IST)
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showModal && (
        <motion.div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-2xl p-6 sm:p-8 max-w-md w-full relative border-2 border-neon-cyan/50 shadow-2xl shadow-neon-cyan/30"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <motion.button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 text-white/60 hover:text-neon-cyan transition-colors"
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
            </motion.button>
            
            <div className="text-center">
            <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 bg-neon-cyan/20 rounded-full flex items-center justify-center"
              >
                <Send className="h-8 w-8 sm:h-10 sm:w-10 text-neon-cyan" />
              </motion.div>
              
              <h3 className="text-2xl sm:text-3xl font-anton text-neon-cyan mb-2 sm:mb-3">
                Message Sent!
              </h3>
              
              <p className="text-white/80 text-base sm:text-lg font-space mb-6 sm:mb-8">
                Thank you for reaching out! We'll get back to you within 24-48 hours.
              </p>
              
                <Button 
                  onClick={() => setShowModal(false)}
                className="w-full bg-gradient-to-r from-neon-cyan to-neon-purple text-white font-anton text-lg sm:text-xl py-2 sm:py-3 rounded-xl hover:opacity-90 transition-opacity"
                >
                Close
                </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Contact;

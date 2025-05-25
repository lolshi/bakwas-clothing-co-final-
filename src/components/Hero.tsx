
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

const Hero = () => {
  useEffect(() => {
    document.body.classList.add('page-transition');
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Hero Banner Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/lovable-uploads/c8061720-2521-469a-a763-e4b69340fcda.png')"
        }}
      />
      
      {/* Semi-transparent overlay for better readability */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[0.5px]"></div>
      
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10 z-10">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-neon-cyan rounded-full"
            animate={{
              x: [0, Math.random() * 100, 0],
              y: [0, Math.random() * 100, 0],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
          />
        ))}
      </div>

      <div className="container relative z-20 text-center">
        {/* Brand Logo - Using the psychedelic background, we can make this more subtle */}
        <motion.h1 
          className="text-6xl md:text-8xl lg:text-9xl font-anton mb-8 text-white drop-shadow-2xl"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ 
            filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.8))',
            textShadow: '0 0 20px rgba(255, 255, 255, 0.3)'
          }}
        >
          WELCOME TO THE EXPERIENCE
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="text-xl md:text-2xl font-space text-gray-200 mb-12 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Where psychedelic meets streetwear in perfect harmony
        </motion.p>

        {/* CTA Buttons */}
        <motion.div 
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Button 
            size="lg" 
            className="bg-neon-cyan hover:bg-neon-cyan/80 text-black font-space font-semibold px-8 py-4 rounded-lg text-lg shadow-lg hover:shadow-xl transition-all duration-300"
            asChild
          >
            <a href="/shop">
              Shop Now
              <ChevronRight className="ml-2 h-5 w-5" />
            </a>
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            className="border-2 border-white text-white hover:bg-white hover:text-black font-space px-8 py-4 rounded-lg text-lg shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm"
            asChild
          >
            <a href="/shop?filter=collection">
              Explore Collection
            </a>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;

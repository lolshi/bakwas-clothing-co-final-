
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { Skull, Shirt, Hourglass } from "lucide-react";

const Hero = () => {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    setMousePosition({
      x: (e.clientX - centerX) / 20,
      y: (e.clientY - centerY) / 20
    });
  };

  const cards = [
    {
      id: 1,
      frontTitle: "TRIPPY MEETS STREET",
      frontIcon: Skull,
      backTitle: "Art That Moves You",
      backDescription: "Psychedelic patterns animating every step.",
      colors: {
        primary: "#FF00FF",
        glow: "shadow-[0_0_30px_#FF00FF40]",
        text: "text-[#FF00FF]",
        stroke: "text-stroke-pink"
      },
      delay: 0
    },
    {
      id: 2,
      frontTitle: "OVERSIZED, NOT OVERHYPED",
      frontIcon: Shirt,
      backTitle: "Effortless Fit",
      backDescription: "Relaxed cuts that flex with your flow.",
      colors: {
        primary: "#00FF66",
        glow: "shadow-[0_0_30px_#00FF6640]",
        text: "text-[#00FF66]",
        stroke: "text-stroke-green"
      },
      delay: 100
    },
    {
      id: 3,
      frontTitle: "NO MASS DROPOUTS",
      frontIcon: Hourglass,
      backTitle: "Limited Runs",
      backDescription: "Once you miss it, it's gone for good.",
      colors: {
        primary: "#00E1FF",
        glow: "shadow-[0_0_30px_#00E1FF40]",
        text: "text-[#00E1FF]",
        stroke: "text-stroke-blue"
      },
      delay: 200
    }
  ];

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-home bg-cover bg-center">
      {/* Semi-transparent overlay for readability */}
      <div className="absolute inset-0 bg-gray-900 bg-opacity-60"></div>
      
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
        {/* Brand Logo */}
        <motion.h1 
          className="text-6xl md:text-8xl lg:text-9xl font-anton mb-12 neon-glow h-20 md:h-24 flex items-center justify-center"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.5))' }}
        >
          BAKWAS
        </motion.h1>

        {/* Neon Flip Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
          {cards.map((card) => {
            const Icon = card.frontIcon;
            const isHovered = hoveredCard === card.id;
            
            return (
              <motion.div
                key={card.id}
                className="relative w-full max-w-[280px] h-[300px] mx-auto perspective-1000"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.6, 
                  delay: card.delay / 1000,
                  ease: "easeOut"
                }}
                onMouseEnter={() => setHoveredCard(card.id)}
                onMouseLeave={() => setHoveredCard(null)}
                onMouseMove={handleMouseMove}
                style={{
                  transform: isHovered 
                    ? `rotateX(${-mousePosition.y}deg) rotateY(${mousePosition.x}deg)`
                    : 'rotateX(0deg) rotateY(0deg)'
                }}
              >
                {/* Flip Card Container */}
                <motion.div
                  className={`relative w-full h-full preserve-3d transition-all duration-400 ease-out ${
                    isHovered ? 'rotate-y-180' : ''
                  }`}
                  animate={isHovered ? { rotateY: 180 } : { rotateY: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  {/* Front Face */}
                  <div className={`absolute inset-0 w-full h-full bg-gray-900 rounded-2xl border border-gray-700 backface-hidden ${
                    isHovered ? card.colors.glow : ''
                  } transition-all duration-300`}>
                    <div className="flex flex-col items-center justify-center h-full p-6 text-center relative overflow-hidden">
                      {/* Glitch overlay */}
                      {isHovered && (
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20"
                          initial={{ x: '-100%' }}
                          animate={{ x: '100%' }}
                          transition={{ duration: 0.15, delay: 0.1 }}
                        />
                      )}
                      
                      {/* Icon */}
                      <motion.div
                        className={`mb-6 p-4 rounded-full border-2 ${card.colors.text} border-current`}
                        animate={isHovered ? { 
                          scale: [1, 1.1, 1],
                          rotate: [0, 5, -5, 0]
                        } : {}}
                        transition={{ duration: 0.3 }}
                      >
                        <Icon 
                          className={`w-10 h-10 ${card.colors.text}`}
                          style={{
                            filter: isHovered ? `drop-shadow(0 0 10px ${card.colors.primary})` : 'none'
                          }}
                        />
                      </motion.div>

                      {/* Title */}
                      <motion.h3
                        className={`font-anton text-lg md:text-xl font-bold ${card.colors.text} leading-tight ${card.colors.stroke}`}
                        animate={isHovered ? {
                          textShadow: [
                            `0 0 10px ${card.colors.primary}`,
                            `0 0 20px ${card.colors.primary}`,
                            `0 0 10px ${card.colors.primary}`
                          ]
                        } : {}}
                        transition={{ duration: 0.3 }}
                        style={{
                          WebkitTextStroke: `1px ${card.colors.primary}`,
                          WebkitTextFillColor: 'transparent'
                        }}
                      >
                        {card.frontTitle}
                      </motion.h3>
                    </div>
                  </div>

                  {/* Back Face */}
                  <div className={`absolute inset-0 w-full h-full bg-gray-900 rounded-2xl border border-gray-700 backface-hidden rotate-y-180 ${
                    isHovered ? card.colors.glow : ''
                  } transition-all duration-300`}>
                    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                      <motion.h4
                        className={`font-anton text-xl font-bold ${card.colors.text} mb-4`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={isHovered ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                      >
                        {card.backTitle}
                      </motion.h4>
                      
                      <motion.p
                        className="font-space italic text-gray-300 text-sm leading-relaxed"
                        initial={{ opacity: 0, y: 20 }}
                        animate={isHovered ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                        transition={{ duration: 0.3, delay: 0.3 }}
                      >
                        {card.backDescription}
                      </motion.p>

                      {/* Pulsing glow effect */}
                      <motion.div
                        className={`absolute inset-0 rounded-2xl opacity-20`}
                        style={{ 
                          background: `radial-gradient(circle at center, ${card.colors.primary}20, transparent 70%)`
                        }}
                        animate={isHovered ? {
                          scale: [1, 1.1, 1],
                          opacity: [0.2, 0.4, 0.2]
                        } : {}}
                        transition={{ 
                          duration: 0.6,
                          repeat: Infinity,
                          repeatType: "reverse"
                        }}
                      />
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA Buttons */}
        <motion.div 
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Button 
            size="lg" 
            className="bg-neon-cyan hover:bg-neon-cyan/80 text-black font-space font-semibold px-6 py-3 rounded-lg text-lg"
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
            className="border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-black font-space px-6 py-3 rounded-lg text-lg"
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

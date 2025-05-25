
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Skull, Shirt, Hourglass } from 'lucide-react';

const USPFlipCards = () => {
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
    <section className="py-16 bg-[#111] relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
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

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {cards.map((card) => {
            const Icon = card.frontIcon;
            const isHovered = hoveredCard === card.id;
            
            return (
              <motion.div
                key={card.id}
                className="relative w-full max-w-[280px] h-[360px] mx-auto perspective-1000"
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
                          className={`w-12 h-12 ${card.colors.text}`}
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

                      {/* Glitch animation for card 3 */}
                      {card.id === 3 && isHovered && (
                        <motion.div
                          className="absolute inset-0"
                          animate={{
                            x: [0, 2, -2, 0],
                            opacity: [1, 0.8, 1]
                          }}
                          transition={{
                            duration: 0.1,
                            repeat: 3,
                            repeatType: "reverse"
                          }}
                        />
                      )}
                    </div>
                  </div>

                  {/* Back Face */}
                  <div className={`absolute inset-0 w-full h-full bg-gray-900 rounded-2xl border border-gray-700 backface-hidden rotate-y-180 ${
                    isHovered ? card.colors.glow : ''
                  } transition-all duration-300`}>
                    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                      <motion.h4
                        className={`font-anton text-2xl font-bold ${card.colors.text} mb-4`}
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
      </div>
    </section>
  );
};

export default USPFlipCards;

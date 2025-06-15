import { animated } from '@react-spring/web';
import { motion } from 'framer-motion';
import React from 'react';

interface USPCardProps {
  title: string;
  description: string;
  color: string;
  glowColor: string;
  icon: string;
  style: any;
  onClick?: () => void;
}

export const USPCard: React.FC<USPCardProps> = ({ 
  title, 
  description, 
  color, 
  glowColor, 
  icon, 
  style, 
  onClick 
}) => {
  return (
    <animated.div 
      className={`absolute w-64 h-96 md:w-72 md:h-[420px] p-6 rounded-3xl shadow-2xl cursor-pointer flex flex-col justify-between items-center text-center bg-black/30 backdrop-blur-lg border border-white/10`}
      style={{
        ...style,
        boxShadow: `0 0 30px ${glowColor}20`,
      }}
      onClick={onClick}
    >
      <div 
        className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-4 transition-all duration-300 ease-in-out" 
        style={{
          backgroundColor: `${glowColor}10`,
          boxShadow: `0 0 20px ${glowColor}, 0 0 30px ${glowColor} inset`,
          border: `2px solid ${glowColor}`
        }}
      >
        {icon}
      </div>
      <h3 
        className="text-2xl font-anton mb-2 uppercase tracking-wider drop-shadow-lg transition-all duration-300 ease-in-out"
        style={{ 
          color: glowColor,
          filter: `drop-shadow(0 0 10px ${glowColor})` 
        }}
      >
        {title}
      </h3>
      <p className="text-sm text-slate-300 font-space-grotesk leading-relaxed">
        {description}
      </p>
    </animated.div>
  );
}; 
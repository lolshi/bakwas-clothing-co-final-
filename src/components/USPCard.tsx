import React from 'react';
import { motion } from 'framer-motion';

interface USPCardProps {
  title: string;
  description: string;
  color: string;
  icon: string;
}

const USPCard = ({ title, description, color, icon }: USPCardProps) => {
  return (
    <motion.div
      className={`relative p-6 rounded-xl bg-black/40 backdrop-blur-sm border border-${color}/30 group hover:bg-black/50 transition-all duration-300`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Icon */}
      <div className={`mb-4 text-4xl`}>
        {icon}
      </div>

      {/* Title */}
      <h3 className={`text-xl font-bold mb-2 text-${color}`}>
        {title}
      </h3>

      {/* Description */}
      <p className="text-gray-300 text-sm">
        {description}
      </p>

      {/* Subtle glow effect on hover */}
      <div className={`absolute inset-0 rounded-xl bg-${color}/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
    </motion.div>
  );
};

export default USPCard; 
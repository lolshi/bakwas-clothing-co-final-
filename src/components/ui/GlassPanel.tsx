import React from 'react';

interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
  blurAmount?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'none'; // Control blur intensity
  backgroundColor?: string; // e.g., 'bg-black/30'
  borderRadius?: string;    // e.g., 'rounded-xl', 'rounded-2xl'
  padding?: string;         // e.g., 'p-4', 'p-6'
  shadow?: string;          // e.g., 'shadow-lg', 'shadow-xl'
  border?: string;          // e.g., 'border border-white/10'
}

export const GlassPanel: React.FC<GlassPanelProps> = ({
  children,
  className = '',
  blurAmount = 'md',
  backgroundColor = 'bg-black/40', // Default background color and opacity
  borderRadius = 'rounded-2xl',    // Default border radius
  padding = 'p-6',                 // Default padding
  shadow = 'shadow-xl',             // Default shadow
  border = 'border border-white/5',// Default subtle border
}) => {
  const blurClass = blurAmount === 'none' ? '' : `backdrop-blur-${blurAmount}`;

  return (
    <div
      className={`
        ${backgroundColor}
        ${blurClass}
        ${borderRadius}
        ${padding}
        ${shadow}
        ${border}
        relative
        overflow-hidden
        ${className}
      `.trim().replace(/\s+/g, ' ')}
    >
      {/* Optional: Add a subtle noise overlay or other effects here if desired */}
      {/* <div className="absolute inset-0 bg-noise opacity-5 pointer-events-none"></div> */}
      {children}
    </div>
  );
}; 
import React from 'react';
import { Link } from 'react-router-dom';

interface HeaderLogoProps {
  logoSrc?: string;
  altText?: string;
  className?: string; // For the wrapper div
  imgClassName?: string; // For the img tag itself
}

export const HeaderLogo: React.FC<HeaderLogoProps> = ({
  logoSrc = "/lovable-uploads/97535d1c-cb3e-4d54-ab8b-54078a7ca53c.png", // Default Bakwas logo
  altText = "Bakwas Clothing Co.",
  className = "logo-wrap", // Default class from original Header
  imgClassName = "h-16 md:h-20 lg:h-24 w-auto drop-shadow-2xl" // Default class from original Header
}) => {
  return (
    <Link to="/" className="flex items-center" aria-label="Go to homepage">
      <div className={className}>
        <img 
          src={logoSrc} 
          alt={altText} 
          className={imgClassName}
        />
      </div>
    </Link>
  );
}; 
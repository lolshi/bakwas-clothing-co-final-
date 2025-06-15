import React from 'react';
import { Instagram } from "lucide-react";

interface SocialLink {
  href: string;
  label: string;
  icon: React.ElementType;
}

const defaultSocialLinks: SocialLink[] = [
  {
    href: "https://www.instagram.com/bakwasclothingco",
    label: "Follow us on Instagram",
    icon: Instagram,
  }
];

interface HeaderSocialsProps {
  links?: SocialLink[];
  iconClassName?: string;
  containerClassName?: string;
}

export const HeaderSocials: React.FC<HeaderSocialsProps> = ({
  links = defaultSocialLinks,
  iconClassName = "h-6 w-6",
  containerClassName = "header-socials flex items-center"
}) => {
  if (!links || links.length === 0) {
    return null;
  }

  return (
    <div className={containerClassName}>
      {links.map((socialLink) => {
        const IconComponent = socialLink.icon;
        return (
          <a 
            key={socialLink.href}
            href={socialLink.href} 
            target="_blank" 
            rel="noopener noreferrer" 
            aria-label={socialLink.label}
            className="flex items-center justify-center text-gray-400 hover:text-neon-pink transition-colors duration-200 bg-white/5 hover:bg-white/10 rounded-full p-2"
          >
            <IconComponent className={iconClassName} />
          </a>
        );
      })}
    </div>
  );
}; 
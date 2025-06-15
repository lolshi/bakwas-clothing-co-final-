import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, Home, ShoppingBag, Bot, MessageCircle, User, BookOpen } from 'lucide-react';

export interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<any>;
  exact?: boolean;
  isAI?: boolean;
}

interface HeaderNavLinksProps {
  navItems: NavItem[];
  linkClassName?: string;
  activeLinkClassName?: string;
  onLinkClick?: () => void;
  ulClassName?: string;
}

const defaultNavItems: NavItem[] = [
  { to: "/", label: "Home", icon: Home, exact: true },
  { to: "/shop", label: "Shop", icon: ShoppingBag },
  { to: "/blogs", label: "Blog", icon: BookOpen },
  { to: "/help", label: "bakwAIs", icon: Bot, isAI: true },
  { to: "/contact", label: "Contact", icon: MessageCircle },
  { to: "/account", label: "Account", icon: User }
];

export const HeaderNavLinks: React.FC<HeaderNavLinksProps> = ({
  navItems = defaultNavItems,
  linkClassName = "font-anton font-semibold text-base uppercase tracking-wider px-4 py-2",
  activeLinkClassName = "text-neon-pink active",
  onLinkClick,
  ulClassName = "flex items-center justify-center space-x-2",
}) => {
  const location = useLocation();

  if (!navItems || navItems.length === 0) {
    return null;
  }

  return (
    <ul className={ulClassName}>
      {navItems.map((item) => {
        const isActive = item.exact 
          ? location.pathname === item.to 
          : location.pathname.startsWith(item.to) && location.pathname !== '/';
        
        const IconComponent = item.icon;

        if (item.isAI) {
          return (
            <li key={item.to}>
              <Link
                to={item.to}
                onClick={onLinkClick}
                className={`
                  ${linkClassName}
                  relative group flex items-center gap-2
                  bg-gradient-to-r from-purple-600/20 to-cyan-400/20
                  hover:from-purple-600/30 hover:to-cyan-400/30
                  border border-purple-500/50
                  rounded-full px-4 py-2
                  transition-all duration-300
                  ${isActive ? 'text-cyan-400 shadow-neon-cyan' : 'text-white hover:text-cyan-400'}
                `}
                aria-current={isActive ? 'page' : undefined}
              >
                <IconComponent className="h-4 w-4" />
                <span>{item.label}</span>
                <Sparkles className="absolute -right-1 -top-1 h-4 w-4 text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
            </li>
          );
        }

        return (
          <li key={item.to}>
            <Link
              to={item.to}
              onClick={onLinkClick}
              className={`${linkClassName} ${
                isActive ? activeLinkClassName : 'text-white hover:text-neon-pink'
              } transition-colors duration-200`}
              aria-current={isActive ? 'page' : undefined}
            >
              <span>{item.label}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}; 
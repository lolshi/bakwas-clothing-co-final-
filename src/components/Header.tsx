import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Home, ShoppingBag, MessageCircle, User, Sparkles, Bot, ClipboardList } from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import { useAuth } from '@/contexts/AuthContext';
import { motion } from "framer-motion";

import { HeaderLogo } from "./layout/HeaderLogo";
import { HeaderSocials } from "./layout/HeaderSocials";
import { HeaderActions } from "./layout/HeaderActions";
import { HeaderNavLinks } from "./layout/HeaderNavLinks";
import { MobileMenu } from "./layout/MobileMenu";

export interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<any>;
  exact?: boolean;
  isAI?: boolean;
}

const mainNavItems: NavItem[] = [
  { to: "/", label: "Home", icon: Home, exact: true },
  { to: "/shop", label: "Shop", icon: ShoppingBag },
  { 
    to: "/help", 
    label: "bakwAIs beta", 
    icon: Bot,
    isAI: true 
  },
  { to: "/contact", label: "Contact", icon: MessageCircle },
  { to: "/account", label: "Account", icon: User },
  { to: "/orders", label: "Orders", icon: ClipboardList },
];

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const isActive = (item: NavItem) => {
    return item.exact 
      ? location.pathname === item.to 
      : location.pathname.startsWith(item.to) && location.pathname !== '/';
  };

  return (
    <header 
      className={`footer sticky top-0 z-50 transition-all duration-300 ease-in-out border-b ${
        isScrolled || isMenuOpen 
          ? 'border-gray-700/50 shadow-2xl' 
          : 'border-transparent'
      }`}
    >
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex items-center justify-between h-20 md:h-24">
          {/* Left Side - Logo */}
          <div className="flex items-center flex-shrink-0">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <HeaderLogo imgClassName="h-14 md:h-16 lg:h-20 w-auto drop-shadow-lg" />
            </motion.div>
          </div>

          {/* Desktop Navigation - Centered */}
          <nav className="hidden lg:flex items-center justify-center flex-1">
            <HeaderNavLinks navItems={mainNavItems} />
          </nav>

          {/* Right Side - Actions & Social */}
          <div className="flex items-center space-x-4">
            <HeaderActions />
            <div className="hidden lg:flex">
              <HeaderSocials iconClassName="h-5 w-5" />
            </div>
            
            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="lg:hidden p-2 hover:bg-white/5 rounded-lg transition-colors"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMenuOpen}
        toggleMenu={toggleMenu}
        navItems={mainNavItems}
      />
    </header>
  );
};

export default Header;

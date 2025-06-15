import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { HeaderActions } from './HeaderActions';
import { HeaderSocials } from './HeaderSocials';
import { Sparkles } from 'lucide-react';

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<any>;
  exact?: boolean;
  isAI?: boolean;
}

interface MobileMenuProps {
  isOpen: boolean;
  toggleMenu: () => void;
  navItems: NavItem[];
}

export const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  toggleMenu,
  navItems
}) => {
  const location = useLocation();
  
  const isActive = (item: NavItem) => {
    return item.exact 
      ? location.pathname === item.to 
      : location.pathname.startsWith(item.to) && location.pathname !== '/';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
            onClick={toggleMenu}
          />

          {/* Menu Content */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-64 bg-gray-900/95 backdrop-blur-lg border-l border-gray-800 shadow-2xl z-50 overflow-y-auto"
          >
            <div className="relative z-10 py-6">
              {/* Navigation Links */}
              <nav className="px-4 mb-6">
                <div className="space-y-2">
                  {navItems.map((item, index) => {
                    const IconComponent = item.icon;
                    const active = isActive(item);
                    
                    if (item.isAI) {
                      return (
                        <motion.div
                          key={item.to}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1, duration: 0.3 }}
                        >
                          <Link
                            to={item.to}
                            onClick={toggleMenu}
                            className={`
                              group relative flex items-center gap-3 px-4 py-3 rounded-xl
                              bg-gradient-to-r from-purple-600/20 to-cyan-400/20
                              hover:from-purple-600/30 hover:to-cyan-400/30
                              border border-purple-500/50
                              font-anton font-semibold text-lg uppercase tracking-wider
                              transition-all duration-300
                              ${active ? 'text-cyan-400 shadow-neon-cyan' : 'text-white hover:text-cyan-400'}
                            `}
                          >
                            <IconComponent className="h-5 w-5" />
                            <span>{item.label}</span>
                            <Sparkles className="absolute -right-1 -top-1 h-4 w-4 text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          </Link>
                        </motion.div>
                      );
                    }

                    return (
                      <motion.div
                        key={item.to}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.3 }}
                      >
                        <Link
                          to={item.to}
                          onClick={toggleMenu}
                          className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl font-anton font-semibold text-lg uppercase tracking-wider transition-all duration-300 ${
                            active 
                              ? 'text-neon-pink bg-white/5' 
                              : 'text-gray-300 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          <IconComponent className={`h-5 w-5 transition-colors duration-300 ${
                            active ? 'text-neon-pink' : 'text-gray-400 group-hover:text-neon-pink'
                          }`} />
                          <span>{item.label}</span>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              </nav>

              {/* Actions Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.3 }}
                className="px-4 mb-6"
              >
                <div className="bg-black/40 backdrop-blur-md rounded-xl p-4 border border-white/10">
                  <HeaderActions 
                    onLinkClick={toggleMenu} 
                    iconClassName="h-6 w-6"
                    containerClassName="flex items-center justify-around space-x-4"
                    showLabels={false}
                  />
                </div>
              </motion.div>

              {/* Social Links */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.3 }}
                className="px-4"
              >
                <HeaderSocials 
                  containerClassName="flex items-center justify-center space-x-4"
                  iconClassName="h-5 w-5"
                />
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}; 
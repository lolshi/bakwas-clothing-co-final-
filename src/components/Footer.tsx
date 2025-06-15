import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Footer = () => {
  return (
    <footer className="footer text-gray-200 py-6 mt-auto relative">
      {/* Animated gradient background */}
      <motion.div 
        className="absolute inset-0 opacity-20"
        initial={false}
      >
        <motion.div 
          className="w-full h-full bg-gradient-to-r from-transparent via-neon-pink/10 to-transparent"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
        <motion.div 
          className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-neon-cyan/10 to-transparent"
          animate={{ x: ['100%', '-100%'] }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear", delay: 2 }}
        />
      </motion.div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Main Grid Layout */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
          {/* Brand - Spans 2 columns on mobile, 1 on desktop */}
          <div className="col-span-2 md:col-span-1">
            <motion.div 
              className="footer-logo mb-3 flex justify-center md:justify-start"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <img 
                src="/lovable-uploads/97535d1c-cb3e-4d54-ab8b-54078a7ca53c.png" 
                alt="Bakwas Clothing Co." 
                className="w-32 ml-4 md:ml-0 drop-shadow-[0_0_8px_rgba(255,0,153,0.6)]"
              />
            </motion.div>
            <p className="text-gray-300 font-space text-sm line-clamp-2 max-w-xs ml-4 md:ml-0">
              Born from Delhi's street pulse, we blend psychedelic energy with unfiltered expression. 
              For the ones who stand out, speak loud, and drip real.
            </p>
          </div>

          {/* Shop & Account - Mobile Accordion */}
          <div className="text-center md:text-left">
            {/* Desktop View */}
            <div className="hidden sm:block">
              <h4 className="footer-column-title text-neon-pink font-anton mb-3 text-base">SHOP</h4>
              <ul className="space-y-1.5 font-space text-sm">
                <li><Link to="/shop" className="footer-link hover:text-neon-pink transition-colors duration-300">All Products</Link></li>
                <li><Link to="/cart" className="footer-link hover:text-neon-pink transition-colors duration-300">Cart</Link></li>
                <li><Link to="/account" className="footer-link hover:text-neon-pink transition-colors duration-300">My Account</Link></li>
                <li><Link to="/order-history" className="footer-link hover:text-neon-pink transition-colors duration-300">Order History</Link></li>
                <li><Link to="/wishlist" className="footer-link hover:text-neon-pink transition-colors duration-300">Wishlist</Link></li>
              </ul>
            </div>
            
            {/* Mobile Accordion */}
            <details className="sm:hidden">
              <summary className="footer-column-title text-neon-pink font-anton mb-2 text-base cursor-pointer list-none">
                SHOP
                <span className="float-right">+</span>
              </summary>
              <ul className="space-y-1.5 font-space text-sm mt-2">
                <li><Link to="/shop" className="footer-link hover:text-neon-pink transition-colors duration-300">All Products</Link></li>
                <li><Link to="/cart" className="footer-link hover:text-neon-pink transition-colors duration-300">Cart</Link></li>
                <li><Link to="/account" className="footer-link hover:text-neon-pink transition-colors duration-300">My Account</Link></li>
                <li><Link to="/order-history" className="footer-link hover:text-neon-pink transition-colors duration-300">Order History</Link></li>
                <li><Link to="/wishlist" className="footer-link hover:text-neon-pink transition-colors duration-300">Wishlist</Link></li>
              </ul>
            </details>
          </div>

          {/* Support & Help - Mobile Accordion */}
          <div className="text-center md:text-left">
            {/* Desktop View */}
            <div className="hidden sm:block">
              <h4 className="footer-column-title text-neon-cyan font-anton mb-3 text-base">SUPPORT</h4>
              <ul className="space-y-1.5 font-space text-sm">
                <li><Link to="/help" className="footer-link hover:text-neon-cyan transition-colors duration-300">Help Center</Link></li>
                <li><Link to="/contact" className="footer-link hover:text-neon-cyan transition-colors duration-300">Contact Us</Link></li>
                <li><Link to="/returns-policy" className="footer-link hover:text-neon-cyan transition-colors duration-300">Returns Policy</Link></li>
                <li><Link to="/faqs" className="footer-link hover:text-neon-cyan transition-colors duration-300">FAQs</Link></li>
              </ul>
            </div>
            
            {/* Mobile Accordion */}
            <details className="sm:hidden">
              <summary className="footer-column-title text-neon-cyan font-anton mb-2 text-base cursor-pointer list-none">
                SUPPORT
                <span className="float-right">+</span>
              </summary>
              <ul className="space-y-1.5 font-space text-sm mt-2">
                <li><Link to="/help" className="footer-link hover:text-neon-cyan transition-colors duration-300">Help Center</Link></li>
                <li><Link to="/contact" className="footer-link hover:text-neon-cyan transition-colors duration-300">Contact Us</Link></li>
                <li><Link to="/returns-policy" className="footer-link hover:text-neon-cyan transition-colors duration-300">Returns Policy</Link></li>
                <li><Link to="/faqs" className="footer-link hover:text-neon-cyan transition-colors duration-300">FAQs</Link></li>
              </ul>
            </details>
          </div>

          {/* Company & Legal - Mobile Accordion */}
          <div className="text-center md:text-left">
            {/* Desktop View */}
            <div className="hidden sm:block">
              <h4 className="footer-column-title text-neon-purple font-anton mb-3 text-base">COMPANY</h4>
              <ul className="space-y-1.5 font-space text-sm">
                <li><Link to="/about" className="footer-link hover:text-neon-purple transition-colors duration-300">About Us</Link></li>
                <li><Link to="/company" className="footer-link hover:text-neon-purple transition-colors duration-300">Our Company</Link></li>
                <li><Link to="/blogs" className="footer-link hover:text-neon-purple transition-colors duration-300">Blog</Link></li>
                <li><Link to="/terms" className="footer-link hover:text-neon-purple transition-colors duration-300">Terms & Conditions</Link></li>
                <li><Link to="/privacy" className="footer-link hover:text-neon-purple transition-colors duration-300">Privacy Policy</Link></li>
              </ul>
            </div>
            
            {/* Mobile Accordion */}
            <details className="sm:hidden">
              <summary className="footer-column-title text-neon-purple font-anton mb-2 text-base cursor-pointer list-none">
                COMPANY
                <span className="float-right">+</span>
              </summary>
              <ul className="space-y-1.5 font-space text-sm mt-2">
                <li><Link to="/about" className="footer-link hover:text-neon-purple transition-colors duration-300">About Us</Link></li>
                <li><Link to="/company" className="footer-link hover:text-neon-purple transition-colors duration-300">Our Company</Link></li>
                <li><Link to="/blogs" className="footer-link hover:text-neon-purple transition-colors duration-300">Blog</Link></li>
                <li><Link to="/terms" className="footer-link hover:text-neon-purple transition-colors duration-300">Terms & Conditions</Link></li>
                <li><Link to="/privacy" className="footer-link hover:text-neon-purple transition-colors duration-300">Privacy Policy</Link></li>
              </ul>
            </details>
          </div>
        </div>

        {/* Inline Legal & Utility Links */}
        <div className="flex flex-col md:flex-row justify-between items-center text-sm pt-4 border-t border-white/10">
          <p className="footer-legal font-space mb-2 md:mb-0 text-gray-400">
            © 2024 Bakwas Clothing Co. All rights reserved.
          </p>
          <div className="flex space-x-4 font-space">
            <Link to="/privacy" className="footer-legal-link text-gray-400 hover:text-neon-pink transition-colors duration-300">Privacy Policy</Link>
            <Link to="/terms" className="footer-legal-link text-gray-400 hover:text-neon-pink transition-colors duration-300">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

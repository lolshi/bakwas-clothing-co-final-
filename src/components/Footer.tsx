
import { Instagram, Twitter, Youtube } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-gray-200 py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <img 
              src="/lovable-uploads/97535d1c-cb3e-4d54-ab8b-54078a7ca53c.png" 
              alt="Bakwas Clothing Co." 
              className="h-12 w-auto mb-4"
            />
            <p className="text-gray-300 font-space mb-4 max-w-md">
              Born from Delhi's street pulse, we blend psychedelic energy with unfiltered expression. 
              For the ones who stand out, speak loud, and drip real.
            </p>
            <div className="flex space-x-4">
              <Instagram className="h-5 w-5 text-gray-300 hover:text-neon-cyan cursor-pointer transition-colors" />
              <Twitter className="h-5 w-5 text-gray-300 hover:text-neon-cyan cursor-pointer transition-colors" />
              <Youtube className="h-5 w-5 text-gray-300 hover:text-neon-cyan cursor-pointer transition-colors" />
            </div>
          </div>

          {/* Shop & Account */}
          <div>
            <h4 className="font-anton text-lg mb-4 text-white">SHOP</h4>
            <ul className="space-y-2 font-space">
              <li><Link to="/shop" className="text-gray-300 hover:text-neon-cyan transition-colors">All Products</Link></li>
              <li><Link to="/cart" className="text-gray-300 hover:text-neon-cyan transition-colors">Cart</Link></li>
              <li><Link to="/account" className="text-gray-300 hover:text-neon-cyan transition-colors">My Account</Link></li>
              <li><Link to="/order-history" className="text-gray-300 hover:text-neon-cyan transition-colors">Order History</Link></li>
              <li><Link to="/wishlist" className="text-gray-300 hover:text-neon-cyan transition-colors">Wishlist</Link></li>
            </ul>
          </div>

          {/* Support & Help */}
          <div>
            <h4 className="font-anton text-lg mb-4 text-white">SUPPORT</h4>
            <ul className="space-y-2 font-space">
              <li><Link to="/help" className="text-gray-300 hover:text-neon-cyan transition-colors">Help Center</Link></li>
              <li><Link to="/contact" className="text-gray-300 hover:text-neon-cyan transition-colors">Contact Us</Link></li>
              <li><Link to="/returns-policy" className="text-gray-300 hover:text-neon-cyan transition-colors">Returns Policy</Link></li>
              <li><Link to="/return-request" className="text-gray-300 hover:text-neon-cyan transition-colors">Return Request</Link></li>
              <li><Link to="/faqs" className="text-gray-300 hover:text-neon-cyan transition-colors">FAQs</Link></li>
            </ul>
          </div>

          {/* Company & Legal */}
          <div>
            <h4 className="font-anton text-lg mb-4 text-white">COMPANY</h4>
            <ul className="space-y-2 font-space">
              <li><Link to="/about" className="text-gray-300 hover:text-neon-cyan transition-colors">About Us</Link></li>
              <li><Link to="/company" className="text-gray-300 hover:text-neon-cyan transition-colors">Our Company</Link></li>
              <li><Link to="/blogs" className="text-gray-300 hover:text-neon-cyan transition-colors">Blog</Link></li>
              <li><Link to="/terms" className="text-gray-300 hover:text-neon-cyan transition-colors">Terms & Conditions</Link></li>
              <li><Link to="/privacy" className="text-gray-300 hover:text-neon-cyan transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 font-space text-sm mb-4 md:mb-0">
            © 2024 Bakwas Clothing Co. All rights reserved.
          </p>
          <div className="flex space-x-6 text-sm font-space">
            <Link to="/privacy" className="text-gray-400 hover:text-neon-cyan transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="text-gray-400 hover:text-neon-cyan transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

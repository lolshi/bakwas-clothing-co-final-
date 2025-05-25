
import { Instagram, Twitter, Youtube } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-black/40 border-t border-border/50 py-16 backdrop-blur-sm">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <img 
              src="/lovable-uploads/40fa6e4a-a62b-4c00-b9c8-e3077d47e80b.png" 
              alt="Bakwas Clothing Co." 
              className="h-8 w-auto mb-4"
            />
            <p className="text-muted-foreground font-space mb-4 max-w-md">
              Born from Delhi's street pulse, we blend psychedelic energy with unfiltered expression. 
              For the ones who stand out, speak loud, and drip real.
            </p>
            <div className="flex space-x-4">
              <Instagram className="h-5 w-5 text-muted-foreground hover:text-neon-cyan cursor-pointer transition-colors" />
              <Twitter className="h-5 w-5 text-muted-foreground hover:text-neon-cyan cursor-pointer transition-colors" />
              <Youtube className="h-5 w-5 text-muted-foreground hover:text-neon-cyan cursor-pointer transition-colors" />
            </div>
          </div>

          {/* Shop & Account */}
          <div>
            <h4 className="font-anton text-lg mb-4">SHOP</h4>
            <ul className="space-y-2 font-space">
              <li><a href="/shop" className="text-muted-foreground hover:text-neon-cyan transition-colors">All Products</a></li>
              <li><a href="/cart" className="text-muted-foreground hover:text-neon-cyan transition-colors">Cart</a></li>
              <li><a href="/account" className="text-muted-foreground hover:text-neon-cyan transition-colors">My Account</a></li>
              <li><a href="/order-history" className="text-muted-foreground hover:text-neon-cyan transition-colors">Order History</a></li>
            </ul>
          </div>

          {/* Support & Help */}
          <div>
            <h4 className="font-anton text-lg mb-4">SUPPORT</h4>
            <ul className="space-y-2 font-space">
              <li><a href="/help" className="text-muted-foreground hover:text-neon-cyan transition-colors">Help Center</a></li>
              <li><a href="/contact" className="text-muted-foreground hover:text-neon-cyan transition-colors">Contact Us</a></li>
              <li><a href="/returns-policy" className="text-muted-foreground hover:text-neon-cyan transition-colors">Returns Policy</a></li>
              <li><a href="/return-request" className="text-muted-foreground hover:text-neon-cyan transition-colors">Return Request</a></li>
              <li><a href="/faqs" className="text-muted-foreground hover:text-neon-cyan transition-colors">FAQs</a></li>
            </ul>
          </div>

          {/* Company & Legal */}
          <div>
            <h4 className="font-anton text-lg mb-4">COMPANY</h4>
            <ul className="space-y-2 font-space">
              <li><a href="/about" className="text-muted-foreground hover:text-neon-cyan transition-colors">About Us</a></li>
              <li><a href="/company" className="text-muted-foreground hover:text-neon-cyan transition-colors">Our Company</a></li>
              <li><a href="/blogs" className="text-muted-foreground hover:text-neon-cyan transition-colors">Blog</a></li>
              <li><a href="/terms" className="text-muted-foreground hover:text-neon-cyan transition-colors">Terms & Conditions</a></li>
              <li><a href="/privacy" className="text-muted-foreground hover:text-neon-cyan transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-border/50 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-foreground font-space text-sm mb-4 md:mb-0">
            © 2024 Bakwas Clothing Co. All rights reserved.
          </p>
          <div className="flex space-x-6 text-sm font-space">
            <a href="/privacy" className="text-muted-foreground hover:text-neon-cyan transition-colors">Privacy Policy</a>
            <a href="/terms" className="text-muted-foreground hover:text-neon-cyan transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

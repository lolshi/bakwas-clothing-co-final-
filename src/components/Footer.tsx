
import { Instagram, Twitter, Youtube } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border/50 py-16">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <img 
              src="/lovable-uploads/6b112a77-ea8e-4f47-b08f-0f2be98c0b2f.png" 
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

          {/* Quick Links */}
          <div>
            <h4 className="font-anton text-lg mb-4">QUICK LINKS</h4>
            <ul className="space-y-2 font-space">
              <li><a href="/shop" className="text-muted-foreground hover:text-neon-cyan transition-colors">Shop</a></li>
              <li><a href="/collections" className="text-muted-foreground hover:text-neon-cyan transition-colors">Collections</a></li>
              <li><a href="/about" className="text-muted-foreground hover:text-neon-cyan transition-colors">About</a></li>
              <li><a href="/contact" className="text-muted-foreground hover:text-neon-cyan transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-anton text-lg mb-4">SUPPORT</h4>
            <ul className="space-y-2 font-space">
              <li><a href="/size-guide" className="text-muted-foreground hover:text-neon-cyan transition-colors">Size Guide</a></li>
              <li><a href="/shipping" className="text-muted-foreground hover:text-neon-cyan transition-colors">Shipping</a></li>
              <li><a href="/returns" className="text-muted-foreground hover:text-neon-cyan transition-colors">Returns</a></li>
              <li><a href="/faq" className="text-muted-foreground hover:text-neon-cyan transition-colors">FAQ</a></li>
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

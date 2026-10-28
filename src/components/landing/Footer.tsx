import { Facebook, Instagram, Linkedin, Globe } from 'lucide-react';
import { useApp } from '@/store';

export function Footer() {
  const { dispatch } = useApp();

  const handleNavigate = (view: 'terms' | 'privacy' | 'contact' | 'about') => {
    dispatch({ type: 'SET_VIEW', payload: view });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="py-16 px-4 border-t border-border/50 bg-card/50">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2 lg:col-span-2">
            {/* Light Mode Logo */}
            <img src="/logo/Logo main4tight.png" alt="Menuzo" className="h-8 w-auto mb-6 dark:hidden" />
            {/* Dark Mode Logo */}
            <img src="/logo/Logo main4dark.png" alt="Menuzo" className="h-8 w-auto mb-6 hidden dark:block" />
            <p className="text-muted-foreground mb-6 max-w-sm">
              The modern way to build, manage, and share your restaurant's digital menu. Loved by chefs, owners, and customers alike.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="#features" className="hover:text-primary transition-colors">Features</a></li>
              <li><a href="#how-it-works" className="hover:text-primary transition-colors">How It Works</a></li>
              <li><a href="#pricing" className="hover:text-primary transition-colors">Pricing</a></li>
              <li><a href="#faq" className="hover:text-primary transition-colors">FAQ</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="#faq" className="hover:text-primary transition-colors">Help Center</a></li>
              <li><a href="/qr-menu" className="hover:text-primary transition-colors">QR Menus</a></li>
              <li><a href="/digital-menu" className="hover:text-primary transition-colors">Digital Menus</a></li>
              <li><a href="/restaurant-menu" className="hover:text-primary transition-colors">Restaurant Guide</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <button 
                  type="button" 
                  onClick={() => handleNavigate('about')}
                  className="hover:text-primary transition-colors text-left"
                >
                  About Us
                </button>
              </li>
              <li>
                <button 
                  type="button" 
                  onClick={() => handleNavigate('contact')}
                  className="hover:text-primary transition-colors text-left"
                >
                  Contact
                </button>
              </li>
              <li><a href="/brand-book" className="hover:text-primary transition-colors">Brand Book</a></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} Menuzo. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-6">
            <button 
              type="button" 
              onClick={() => handleNavigate('terms')}
              className="hover:text-primary transition-colors"
            >
              Terms & Conditions
            </button>
            <button 
              type="button" 
              onClick={() => handleNavigate('privacy')}
              className="hover:text-primary transition-colors"
            >
              Privacy Policy
            </button>
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Globe className="w-3.5 h-3.5" />
              Sri Lanka (LKR)
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

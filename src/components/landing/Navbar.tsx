import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/store';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { motion, AnimatePresence } from 'framer-motion';

export function Navbar() {
  const { dispatch } = useApp();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'How it Works', href: '#how-it-works' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'FAQ', href: '#faq' },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth'
      });
    }
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-background/80 backdrop-blur-lg border-b border-border py-2' : 'bg-transparent py-4'}`}>
        <div className="flex items-center justify-between px-4 max-w-7xl mx-auto w-full">
          <div className="flex items-center">
            {/* Light Mode Logo */}
            <img 
              src="/logo/Logo main4tight.png" 
              alt="Menuzo" 
              className="h-8 w-auto cursor-pointer dark:hidden" 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
            />
            {/* Dark Mode Logo */}
            <img 
              src="/logo/Logo main4dark.png" 
              alt="Menuzo" 
              className="h-8 w-auto cursor-pointer hidden dark:block" 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
            />
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <div className="flex items-center gap-6 text-sm font-medium text-muted-foreground">
              {navLinks.map((link) => (
                <a 
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="hover:text-primary transition-colors"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />

            <Button
              variant="ghost"
              size="sm"
              onClick={() => dispatch({ type: 'SET_VIEW', payload: 'login' })}
              className="font-medium"
            >
              Log in
            </Button>
            <Button
              size="sm"
              onClick={() => dispatch({ type: 'SET_VIEW', payload: 'signup' })}
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-[14px] font-semibold px-5 shadow-lg shadow-primary/20"
            >
              Start Free
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <button 
              className="p-2 text-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-background/95 backdrop-blur-xl md:hidden pt-24 px-6 pb-6 flex flex-col"
          >
            <div className="flex flex-col gap-6 text-lg font-medium">
              {navLinks.map((link) => (
                <a 
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="text-foreground hover:text-primary transition-colors py-2 border-b border-border/50"
                >
                  {link.name}
                </a>
              ))}
            </div>
            
            <div className="mt-auto flex flex-col gap-4 pt-6 border-t border-border/50">
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  setMobileMenuOpen(false);
                  dispatch({ type: 'SET_VIEW', payload: 'login' });
                }}
                className="w-full text-base font-semibold h-12"
              >
                Log in
              </Button>
              <Button
                size="lg"
                onClick={() => {
                  setMobileMenuOpen(false);
                  dispatch({ type: 'SET_VIEW', payload: 'signup' });
                }}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-[14px] text-base font-semibold h-12 shadow-lg shadow-primary/20"
              >
                Start Free
              </Button>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useApp } from '@/store';
import { ArrowRight } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

export function MobileFloatingCTA() {
  const { dispatch } = useApp();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show CTA only after scrolling past the hero section (~600px)
      if (window.scrollY > 600) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleClick = () => {
    trackEvent('hero_cta_clicked', { source: 'mobile_floating_cta' });
    dispatch({ type: 'SET_VIEW', payload: 'login' });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 left-4 right-4 z-50 md:hidden"
        >
          <Button 
            onClick={handleClick}
            size="lg" 
            className="w-full h-14 rounded-full text-lg font-bold shadow-2xl shadow-primary/40"
          >
            Create Free Menu <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

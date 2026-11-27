import { ArrowRight, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/store';
import { motion } from 'framer-motion';
import { trackEvent } from '@/lib/analytics';

export function FinalCTASection() {
  const { dispatch } = useApp();

  return (
    <section className="py-40 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-orange-500/20 -z-10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-primary/20 rounded-full blur-[128px] -z-10 animate-pulse-glow" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, type: "spring" as any }}
        className="max-w-4xl mx-auto text-center relative z-10"
      >
        <motion.div 
          animate={{ rotate: [12, -12, 12] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="w-24 h-24 bg-background rounded-3xl shadow-2xl flex items-center justify-center mx-auto mb-10 border-4 border-primary"
        >
          <QrCode className="w-12 h-12 text-primary" />
        </motion.div>
        
        <h2 className="text-5xl md:text-7xl font-bold mb-8 tracking-tighter">Ready when you are.</h2>
        <p className="text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto font-medium">
          Create a digital menu you can update whenever your prices or dishes change.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            size="lg"
            onClick={() => {
              trackEvent('hero_cta_clicked', { source: 'final_cta' });
              dispatch({ type: 'SET_VIEW', payload: 'login' });
            }}}
            className="bg-primary text-[#12261F] hover:bg-primary/90 w-full sm:w-auto h-16 px-12 rounded-full text-xl font-bold shadow-[0_8px_30px_rgb(255,100,50,0.3)] hover:shadow-[0_8px_40px_rgb(255,100,50,0.4)] hover:-translate-y-1 transition-all duration-300"
          >
            Create your menu
            <ArrowRight className="w-6 h-6 ml-2" />
          </Button>
        </div>
        
      </motion.div>
    </section>
  );
}

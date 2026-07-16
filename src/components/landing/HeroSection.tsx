import { useState } from 'react';
import { ArrowRight, ChevronRight, Star, QrCode, BarChart3, CheckCircle2, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/store';
import { motion } from 'framer-motion';
import { trackEvent } from '@/lib/analytics';

export function HeroSection() {
  const { dispatch } = useApp();
  const [loadIframe, setLoadIframe] = useState(false);

  const handleCTAClick = () => {
    trackEvent('hero_cta_clicked', { location: 'hero' });
    dispatch({ type: 'SET_VIEW', payload: 'login' });
  };

  const handleDemoClick = () => {
    trackEvent('demo_opened', { source: 'hero_secondary_button' });
    setLoadIframe(true);
    document.getElementById('product-demo')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handlePhoneDemoClick = () => {
    trackEvent('demo_opened', { source: 'hero_phone_mockup' });
    setLoadIframe(true);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as any, stiffness: 100, damping: 20 } }
  };

  return (
    <section className="relative pt-32 pb-32 px-4 overflow-hidden">
      {/* Background Layers */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background to-background" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[128px] -z-10 animate-pulse-glow" />
        <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-orange-500/10 rounded-full blur-[128px] -z-10" />
      </div>

      <div className="max-w-7xl mx-auto text-center relative z-10">
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-3xl mx-auto flex flex-col items-center">
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-widest mb-8 backdrop-blur-sm shadow-[0_0_20px_rgba(255,100,50,0.2)]">
            <Star className="w-3 h-3 fill-primary" />
            Join 1,000+ modern restaurants
          </motion.div>
          <motion.h1 variants={itemVariants} className="text-5xl sm:text-7xl md:text-8xl font-bold leading-[1.1] mb-8 tracking-tighter">
            Your menu.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-primary via-orange-400 to-red-500">Live in minutes.</span>
          </motion.h1>
          <motion.p variants={itemVariants} className="text-xl sm:text-2xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            Turn your printed menu into a beautiful, interactive digital experience that grows your sales.
          </motion.p>
          <motion.div variants={itemVariants} className="flex flex-col w-full sm:w-auto items-center">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto mb-6">
              <Button
                size="lg"
                onClick={handleCTAClick}
                className="bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto h-14 px-8 rounded-full text-lg font-semibold shadow-[0_8px_30px_rgb(255,100,50,0.3)] hover:shadow-[0_8px_40px_rgb(255,100,50,0.4)] hover:-translate-y-1 transition-all duration-300"
              >
                Create Your Free Menu
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={handleDemoClick}
                className="w-full sm:w-auto h-14 px-8 rounded-full text-lg font-semibold border-border/80 bg-background/50 backdrop-blur-md hover:bg-muted/80 transition-all duration-300"
              >
                View Demo
                <ChevronRight className="w-5 h-5 ml-2 text-muted-foreground" />
              </Button>
            </div>

            {/* Trust Elements */}
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" /> No credit card required</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" /> Setup in under 5 minutes</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" /> Free forever plan</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Hero Mockup */}
        <motion.div
          id="product-demo"
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, type: "spring" as any, stiffness: 50 }}
          className="mt-24 relative max-w-5xl mx-auto flex justify-center"
        >
          {/* Left Floating Card - QR */}
          <motion.div
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-[10%] top-[20%] hidden xl:flex flex-col gap-3 p-5 rounded-3xl bg-card/80 border border-white/10 shadow-2xl backdrop-blur-xl z-20 w-64"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center"><QrCode className="w-5 h-5 text-primary" /></div>
              <div className="font-semibold text-sm">QR Code Ready</div>
            </div>
            <div className="aspect-square w-full bg-white rounded-xl p-3 flex items-center justify-center overflow-hidden">
              <img src="/Landing/spice-garden-kitchen-qr.png" alt="Spice Garden Kitchen QR" className="w-full h-full object-contain" />
            </div>
            <Button size="sm" variant="secondary" className="w-full rounded-lg pointer-events-none">Download</Button>
          </motion.div>

          {/* Right Floating Card - Analytics */}
          <motion.div
            animate={{ y: [0, 15, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute right-[5%] top-[40%] hidden xl:flex flex-col gap-3 p-5 rounded-3xl bg-card/80 border border-white/10 shadow-2xl backdrop-blur-xl z-20 w-64"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center"><BarChart3 className="w-4 h-4 text-green-500" /></div>
                <span className="font-semibold text-sm">Live Views</span>
              </div>
              <span className="text-green-500 text-xs font-bold bg-green-500/10 px-2 py-1 rounded-full">+24%</span>
            </div>
            <div className="text-4xl font-bold font-mono">1,284</div>
            <div className="h-12 flex items-end gap-1 mt-2">
              {[40, 70, 45, 90, 65, 100, 80].map((h, i) => (
                <div key={i} className="flex-1 bg-primary/50 rounded-t-sm" style={{ height: `${h}%` }} />
              ))}
            </div>
          </motion.div>

          {/* Central Phone Mockup */}
          <div className="relative z-10 w-[320px] md:w-[360px] h-[680px] md:h-[760px] bg-black rounded-[3rem] p-3 shadow-2xl shadow-primary/20 border-4 border-muted flex shrink-0 group">
            {/* Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-black rounded-b-3xl z-30" />

            {/* Screen */}
            <div className="w-full h-full bg-background rounded-[2.25rem] overflow-hidden relative flex flex-col">
              <div className="flex-1 w-full h-full relative z-10 pt-6 bg-black overflow-hidden rounded-[2rem]">
                {loadIframe ? (
                  <iframe
                    src={import.meta.env.VITE_MENU_DEMO_URL || "https://menuzo-six.vercel.app/menuzo/menu"}
                    className="border-none origin-top-left"
                    style={{
                      width: '125%',
                      height: 'calc(125% + 30px)',
                      transform: 'scale(0.8)',
                      marginTop: '-24px'
                    }}
                    title="Menuzo Demo Menu"
                    loading="lazy"
                  />
                ) : (
                  <div className="relative w-full h-full group cursor-pointer bg-black" onClick={handlePhoneDemoClick}>
                    <img
                      src="/Landing/liveDemoSchreenShot.jpeg"
                      alt="Menu Demo Placeholder"
                      className="w-full h-full object-cover opacity-50 group-hover:opacity-30 transition-opacity"
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px]">
                      <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center shadow-2xl shadow-primary/50 text-white pl-1 mb-4 group-hover:scale-110 transition-transform">
                        <Play className="w-10 h-10" />
                      </div>
                      <span className="text-white font-bold text-xl drop-shadow-md">Try Live Demo</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

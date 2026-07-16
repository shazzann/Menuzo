import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';

export function UseCasesSection() {
  const cases = [
    { 
      id: 'cafe',
      name: 'Café', 
      icon: '☕', 
      desc: 'Fast-moving menus for coffee shops, cafés, and dessert bars.',
      image: '/Landing/usecase-cafe.jpg',
      features: ['Fast ordering', 'Daily specials', 'QR access', 'Brand customization']
    },
    {
      id: 'restaurant',
      name: 'Restaurant',
      icon: '🍽',
      desc: 'Create a premium dining experience with beautifully branded digital menus.',
      image: '/Landing/liveDemoSchreenShot.jpeg',
      features: ['Beautiful food galleries', 'Categories', 'QR menu', 'Live updates', 'Brand customization']
    },
    {
      id: 'hotel',
      name: 'Hotel',
      icon: '🏨',
      desc: 'Offer room service menus that guests can access instantly with a simple scan.',
      image: '/Landing/usecase-hotel.jpg',
      features: ['Room service QR', 'Multi-language', 'Scheduled availability', 'Easy updates']
    },
    {
      id: 'bakery',
      name: 'Bakery',
      icon: '🥐',
      desc: 'Showcase fresh pastries and cakes with stunning photo galleries.',
      image: '/Landing/usecase-bakery.jpg',
      features: ['High-res galleries', 'Pre-order options', 'Dietary tags', 'Sold-out toggles']
    },
    {
      id: 'food-truck',
      name: 'Food Truck',
      icon: '🚚',
      desc: 'Serve customers faster with a clean digital menu that works anywhere.',
      image: '/Landing/usecase-truck.jpg',
      features: ['Scan-and-go', 'Easy to update', 'Mobile optimized', 'No printed menus']
    },
    {
      id: 'cloud-kitchen',
      name: 'Cloud Kitchen',
      icon: '🛵',
      desc: 'Build a professional digital storefront for delivery-first brands.',
      image: '/Landing/usecase-cloud.jpg',
      features: ['Multiple brands', 'Digital storefront', 'Menu syncing', 'Analytics']
    }
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % cases.length);
    }, 6000); // 6 seconds

    return () => clearInterval(interval);
  }, [isPaused, cases.length]);

  const activeCase = cases[activeIndex];

  return (
    <section className="py-32 px-4 bg-background border-y border-border/50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-bold uppercase tracking-widest mb-4">
            Use Cases
          </span>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Built for Every Food Business</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            One platform that adapts to every restaurant model.
          </p>
        </motion.div>

        {/* Interactive Container */}
        <div 
          className="max-w-5xl mx-auto"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          
          {/* Tabs */}
          <div 
            className="flex overflow-x-auto hide-scrollbar gap-2 md:gap-4 justify-start md:justify-center mb-10 pb-4 snap-x snap-mandatory px-4 md:px-0"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {cases.map((c, idx) => {
              const isActive = activeIndex === idx;
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveIndex(idx)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-full whitespace-nowrap snap-center transition-all duration-300 relative border ${
                    isActive 
                      ? 'bg-primary/10 text-primary border-primary/20 scale-105 shadow-sm' 
                      : 'bg-white dark:bg-zinc-900 border-border/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <span className="text-xl">{c.icon}</span>
                  <span className="font-semibold">{c.name}</span>
                  
                  {isActive && (
                    <motion.div
                      layoutId="activeTabUnderline"
                      className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary rounded-full"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Main Showcase Panel */}
          <div className="bg-white dark:bg-zinc-900 rounded-[2rem] border border-border/50 shadow-sm overflow-hidden p-6 md:p-10 transition-colors duration-300">
            <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-center">
              
              {/* Screenshot Area (Mobile Frame) */}
              <div className="w-[280px] md:w-[320px] h-[580px] md:h-[660px] shrink-0 mx-auto lg:mx-0 rounded-[2.5rem] md:rounded-[3rem] border-[8px] border-zinc-900 dark:border-black bg-zinc-950 overflow-hidden shadow-2xl relative">
                {/* iPhone Notch */}
                <div className="absolute top-0 inset-x-0 h-6 md:h-7 bg-zinc-900 dark:bg-black rounded-b-3xl w-32 md:w-40 mx-auto z-20" />

                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeCase.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="absolute inset-0 w-full h-full z-10 bg-muted"
                  >
                    {/* Fallback pattern/gradient if image not loaded */}
                    <div className="absolute inset-0 bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 flex flex-col items-center justify-center text-zinc-400 -z-10 text-center px-4">
                      <span className="text-4xl mb-2">{activeCase.icon}</span>
                      <span className="font-medium text-sm">Menuzo for {activeCase.name}</span>
                    </div>
                    <img 
                      src={activeCase.image} 
                      alt={`Menuzo for ${activeCase.name}`}
                      className="w-full h-full object-cover object-top relative z-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.opacity = '0';
                      }}
                      onLoad={(e) => {
                        (e.target as HTMLImageElement).style.opacity = '1';
                      }}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Info Panel */}
              <div className="w-full flex-1 flex flex-col justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`info-${activeCase.id}`}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.4 }}
                  >
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary text-2xl mb-6">
                      {activeCase.icon}
                    </div>
                    <h3 className="text-3xl font-bold mb-4">{activeCase.name}</h3>
                    <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                      {activeCase.desc}
                    </p>

                    <div className="h-px w-full bg-border/50 mb-8" />

                    <ul className="space-y-4">
                      {activeCase.features.map((feature, i) => (
                        <motion.li 
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 + (i * 0.1) }}
                          className="flex items-center gap-3 text-foreground font-medium"
                        >
                          <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
                            <Check className="w-3 h-3" strokeWidth={3} />
                          </div>
                          {feature}
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                </AnimatePresence>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

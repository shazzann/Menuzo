import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

export function AnalyticsSection() {
  return (
    <section className="py-32 px-4 bg-card/30 border-y border-border/50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="order-2 lg:order-1"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-bold uppercase tracking-widest mb-4">
              Analytics
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Know what sells.</h2>
            <p className="text-xl text-muted-foreground mb-10 leading-relaxed font-medium">
              Get real-time insights into exactly how your menu is performing. Stop guessing and start optimizing your offerings.
            </p>
            <ul className="space-y-6 mb-8">
              {[
                'Track daily QR scans and menu views',
                'Identify your most popular dishes',
                'Monitor peak visiting hours',
                'See how many customers click to call or find directions'
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-muted-foreground font-semibold text-lg">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, type: "spring" as any }}
            className="order-1 lg:order-2 flex justify-center items-center"
          >
            <div className="relative w-full max-w-md mx-auto">
              {/* Ambient Glow */}
              <div className="absolute -inset-4 bg-gradient-to-tr from-primary/30 via-orange-500/20 to-transparent rounded-[2.5rem] blur-2xl -z-10 opacity-70" />

              {/* Card Container */}
              <div className="rounded-[2rem] bg-[#090A0C] border border-white/10 p-4 sm:p-6 shadow-2xl overflow-hidden backdrop-blur-xl">
                <img 
                  src="/Landing/Analytics/Analytics.png" 
                  alt="Menuzo Shop Performance Analytics" 
                  className="w-full h-auto object-contain rounded-xl select-none"
                  loading="lazy"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

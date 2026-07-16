import { motion } from 'framer-motion';
import { CheckCircle2, MousePointerClick, QrCode } from 'lucide-react';

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
            className="order-1 lg:order-2"
          >
            <div className="relative rounded-[2.5rem] bg-background border border-border shadow-2xl p-8 backdrop-blur-xl">
               <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none -z-10">
                 <div className="w-32 h-32 bg-primary rounded-full blur-[64px]" />
               </div>

               <div className="flex items-center justify-between mb-10">
                 <h3 className="font-bold text-xl">Menu Performance</h3>
                 <span className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-sm font-bold shadow-sm">+12% this week</span>
               </div>

               <div className="grid grid-cols-2 gap-6 mb-10">
                  <div className="p-6 rounded-2xl bg-muted/50 border border-border shadow-sm">
                    <p className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2"><MousePointerClick className="w-4 h-4" /> Views</p>
                    <p className="text-4xl font-bold font-mono">1,248</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-muted/50 border border-border shadow-sm">
                    <p className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2"><QrCode className="w-4 h-4" /> Scans</p>
                    <p className="text-4xl font-bold font-mono">892</p>
                  </div>
               </div>
               
               <div className="space-y-6">
                  <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-widest border-b border-border/50 pb-2">Top Items</h4>
                  {[
                    { name: 'Spicy Burger', views: 342, perc: '78%' },
                    { name: 'Truffle Fries', views: 215, perc: '54%' },
                    { name: 'Craft Cola', views: 189, perc: '42%' }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between group">
                       <span className="font-bold">{item.name}</span>
                       <div className="flex items-center gap-4 w-1/2">
                         <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden shadow-inner">
                           <motion.div 
                             initial={{ width: 0 }}
                             whileInView={{ width: item.perc }}
                             transition={{ duration: 1, delay: 0.2 + (i * 0.1) }}
                             className="h-full bg-primary rounded-full" 
                           />
                         </div>
                         <span className="text-sm font-semibold text-muted-foreground w-8 text-right font-mono group-hover:text-foreground transition-colors">{item.views}</span>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

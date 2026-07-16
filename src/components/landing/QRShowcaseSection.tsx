import { motion } from 'framer-motion';
import { Settings, Download, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';


export function QRShowcaseSection() {
  return (
    <section className="py-32 px-4 overflow-hidden bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, type: "spring" as any }}
            className="relative"
          >
            {/* The QR display */}
            <div className="aspect-square max-w-md mx-auto rounded-[3rem] bg-gradient-to-tr from-primary/10 via-primary/5 to-orange-500/10 p-8 md:p-12 border border-primary/20 shadow-2xl shadow-primary/5 flex items-center justify-center relative backdrop-blur-3xl">
               <div className="bg-white p-6 rounded-3xl shadow-xl w-full h-full flex flex-col items-center justify-center relative z-10 border-4 border-primary overflow-hidden">
                 <img 
                   src="/Landing/spice-garden-kitchen-qr.png" 
                   alt="Spice Garden Kitchen QR Code" 
                   className="w-full h-full object-contain"
                 />
               </div>

               {/* Decorative elements */}
               <motion.div 
                 animate={{ rotate: 360 }}
                 transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
                 className="absolute inset-0 rounded-[3rem] border border-dashed border-primary/30 -z-10"
               />
            </div>
            
            <div className="flex justify-center gap-4 mt-8">
               <Button variant="outline" className="rounded-full gap-2 shadow-sm"><Download className="w-4 h-4"/> Download PNG</Button>
               <Button variant="outline" className="rounded-full gap-2 shadow-sm"><Share2 className="w-4 h-4"/> Share Link</Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, type: "spring" as any }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-bold uppercase tracking-widest mb-4">
              QR Customization
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Make it yours.</h2>
            <p className="text-xl text-muted-foreground mb-10 leading-relaxed font-medium">
              Don't settle for generic black-and-white squares. Customize your QR code with your brand colors, logo, and unique patterns.
            </p>

            <div className="space-y-6">
              {[
                { title: 'Brand Colors', desc: 'Match your QR to your exact hex codes.' },
                { title: 'Logo Integration', desc: 'Place your restaurant logo right in the center.' },
                { title: 'Frame Styles', desc: 'Add "Scan to View Menu" frames automatically.' }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 p-5 rounded-2xl bg-card border border-border/50 hover:border-primary/50 transition-colors shadow-sm group">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors duration-300 text-primary">
                    <Settings className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">{item.title}</h4>
                    <p className="text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

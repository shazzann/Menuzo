import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Zap, TrendingUp, Paintbrush, ArrowDown, Smartphone, AlertCircle, Ban } from 'lucide-react';

export function ProblemSolutionSection() {

  return (
    <section className="py-32 px-4 bg-background relative overflow-hidden selection:bg-primary/30">
      {/* Background Grid & Glows */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff15_1px,transparent_1px)] bg-[length:24px_24px] [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] pointer-events-none opacity-50" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header Area */}
        <div className="flex flex-col items-center text-center mb-28">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-bold uppercase tracking-widest mb-8 backdrop-blur-md"
          >
            <Sparkles className="w-4 h-4" /> WHY MENUZO
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-8 max-w-5xl leading-tight"
          >
            Your Menu Should Do More Than <br className="hidden md:block" />
            <span className="relative inline-block mt-2 md:mt-0">
              <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-primary via-orange-400 to-yellow-400">
                Just Display Food.
              </span>
              <span className="absolute -bottom-2 left-0 w-full h-3 bg-primary/20 blur-sm rounded-full" />
            </span>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl text-muted-foreground max-w-3xl leading-relaxed"
          >
            Transform your restaurant menu into a smart digital experience that updates, engages, and grows with your business.
          </motion.p>
        </div>

        {/* Transformation Scene */}
        <div className="flex flex-col xl:flex-row items-center justify-center gap-12 xl:gap-8 mb-32 relative">
          
          {/* Background Connection Path (Desktop only) */}
          <div className="hidden xl:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/3 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50 z-0" />

          {/* Left Card: Traditional Menu */}
          <motion.div 
            initial={{ opacity: 0, x: -50, rotate: 0 }}
            whileInView={{ opacity: 1, x: 0, rotate: -2 }}
            viewport={{ once: true, margin: "-100px" }}
            whileHover={{ rotate: 0, scale: 1.02 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="relative w-full max-w-md bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-[2rem] p-8 shadow-2xl z-10 group"
          >
            <div className="absolute inset-0 bg-noise opacity-[0.03] rounded-[2rem] pointer-events-none" />
            
            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-zinc-800">
              <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center text-2xl shadow-inner">
                📖
              </div>
              <div>
                <h3 className="text-xl font-bold text-zinc-100">Traditional Menu</h3>
                <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Static & Limited</p>
              </div>
            </div>
            
            {/* Paper Mockup */}
            <div className="bg-[#f4f4f5] rounded-lg p-6 shadow-inner font-serif relative overflow-hidden transform-gpu">
              {/* Coffee stain effect */}
              <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full border-[3px] border-[#d4d4d8] opacity-40 blur-[1px]" />
              
              <h4 className="text-xl font-bold text-zinc-800 uppercase tracking-widest text-center border-b-2 border-zinc-300 pb-4 mb-5">Menu</h4>
              
              <div className="space-y-4 opacity-70">
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-zinc-800">Chicken Burger</span>
                  <span className="text-zinc-500">..... $12</span>
                </div>
                <div className="flex justify-between items-baseline relative">
                  <span className="font-bold text-zinc-800">Beef Steak</span>
                  <span className="text-zinc-500">..... $25</span>
                  {/* Out of stock scribble */}
                  <div className="absolute top-1/2 left-0 w-full h-[2px] bg-red-500 -rotate-2" />
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-zinc-800">Special Rice</span>
                  <span className="text-zinc-500">..... $10</span>
                </div>
              </div>
            </div>

            {/* Floating Problem Tags */}
            <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 3, repeat: Infinity }} className="absolute -left-6 top-32 bg-zinc-950 border border-red-900/50 text-red-400 text-xs font-bold px-3 py-2 rounded-lg shadow-xl flex items-center gap-2 z-20">
              <AlertCircle className="w-3.5 h-3.5" /> Gets dirty
            </motion.div>
            <motion.div animate={{ y: [0, 4, 0] }} transition={{ duration: 4, repeat: Infinity, delay: 0.5 }} className="absolute -right-6 top-48 bg-zinc-950 border border-red-900/50 text-red-400 text-xs font-bold px-3 py-2 rounded-lg shadow-xl flex items-center gap-2 z-20">
              <Ban className="w-3.5 h-3.5" /> Outdated items
            </motion.div>
            <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 3.5, repeat: Infinity, delay: 1 }} className="absolute -left-2 bottom-8 bg-zinc-950 border border-red-900/50 text-red-400 text-xs font-bold px-3 py-2 rounded-lg shadow-xl flex items-center gap-2 z-20">
              💸 Expensive updates
            </motion.div>
          </motion.div>

          {/* Center Animated Connection */}
          <div className="flex xl:flex-col items-center justify-center gap-4 xl:w-24 py-4 xl:py-0 relative z-20">
            <motion.div 
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="hidden xl:flex flex-col items-center gap-4"
            >
               <motion.div 
                 animate={{ y: [0, 5, 0] }} 
                 transition={{ duration: 2, repeat: Infinity }}
                 className="w-14 h-14 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary shadow-[0_0_30px_-5px_rgba(249,115,22,0.4)] backdrop-blur-md"
               >
                 <ArrowRight className="w-6 h-6 rotate-90 xl:rotate-0" />
               </motion.div>
            </motion.div>
            
            <div className="xl:hidden w-14 h-14 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary shadow-lg backdrop-blur-md">
              <ArrowDown className="w-6 h-6 animate-bounce" />
            </div>
          </div>

          {/* Right Card: Menuzo Digital */}
          <motion.div 
            initial={{ opacity: 0, x: 50, rotate: 0 }}
            whileInView={{ opacity: 1, x: 0, rotate: 2 }}
            viewport={{ once: true, margin: "-100px" }}
            whileHover={{ rotate: 0, scale: 1.02 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="relative w-full max-w-md p-[2px] rounded-[2rem] z-10 group"
          >
            {/* Animated Gradient Border */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-orange-400 to-primary rounded-[2rem] opacity-70 group-hover:opacity-100 transition-opacity duration-500 blur-[2px]" />
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-orange-400 to-primary rounded-[2rem] opacity-50 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
            
            <div className="relative bg-black/90 backdrop-blur-2xl rounded-[2rem] p-8 shadow-2xl h-full border border-white/10">
              <div className="flex items-center gap-4 mb-8 pb-6 border-b border-white/10">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center text-white shadow-lg">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Menuzo</h3>
                  <p className="text-xs text-primary uppercase tracking-wider font-semibold">Living Digital Menu</p>
                </div>
              </div>
              
              {/* Phone Mockup UI */}
              <div className="bg-[#090A0C] rounded-[2rem] border-4 border-zinc-800 shadow-inner relative h-[300px] overflow-hidden flex flex-col items-center pt-3">
                {/* Notch */}
                <div className="absolute top-3 w-16 h-1.5 bg-zinc-800 rounded-full z-10" />
                
                <img 
                  src="/Landing/liveDemoSchreenShothalf.jpeg" 
                  alt="Menuzo Live Demo" 
                  className="w-full h-full object-cover object-top rounded-b-[1.7rem] rounded-t-2xl mt-4"
                />
              </div>

              {/* Floating Feature Chips */}
              <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }} className="absolute -right-6 top-12 bg-black/80 backdrop-blur-xl border border-primary/30 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-[0_0_20px_-5px_rgba(249,115,22,0.5)] flex items-center gap-2 z-20">
                <Zap className="w-4 h-4 text-primary"/> Instant Updates
              </motion.div>
              <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }} className="absolute -left-8 top-32 bg-black/80 backdrop-blur-xl border border-blue-500/30 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-[0_0_20px_-5px_rgba(59,130,246,0.5)] flex items-center gap-2 z-20">
                <TrendingUp className="w-4 h-4 text-blue-500"/> Smart Analytics
              </motion.div>
              <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="absolute -right-2 bottom-20 bg-black/80 backdrop-blur-xl border border-purple-500/30 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-[0_0_20px_-5px_rgba(168,85,247,0.5)] flex items-center gap-2 z-20">
                <Paintbrush className="w-4 h-4 text-purple-400"/> Custom Branding
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Enhanced Bottom Comparison Strip */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto relative group mb-32"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-orange-500/10 to-primary/20 rounded-3xl blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
          <div className="relative bg-zinc-900/90 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl p-8 md:p-12 overflow-hidden">
            
            {/* Background Accent */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-3xl pointer-events-none" />

            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-6 md:gap-12 text-base md:text-lg lg:text-xl font-medium relative z-10">
              <div className="text-right text-zinc-500 space-y-6 md:space-y-8 font-semibold">
                <div className="group/item relative inline-block">
                  <span className="relative z-10">Print Again</span>
                  <div className="absolute top-1/2 left-0 w-full h-0.5 bg-red-500/50 -translate-y-1/2 scale-x-100 group-hover/item:scale-x-110 transition-transform origin-right" />
                </div><br/>
                <div className="group/item relative inline-block">
                  <span className="relative z-10">Replace Cards</span>
                  <div className="absolute top-1/2 left-0 w-full h-0.5 bg-red-500/50 -translate-y-1/2 scale-x-100 group-hover/item:scale-x-110 transition-transform origin-right" />
                </div><br/>
                <div className="group/item relative inline-block">
                  <span className="relative z-10">Hide Information</span>
                  <div className="absolute top-1/2 left-0 w-full h-0.5 bg-red-500/50 -translate-y-1/2 scale-x-100 group-hover/item:scale-x-110 transition-transform origin-right" />
                </div><br/>
                <div className="group/item relative inline-block">
                  <span className="relative z-10">Guess Customers</span>
                  <div className="absolute top-1/2 left-0 w-full h-0.5 bg-red-500/50 -translate-y-1/2 scale-x-100 group-hover/item:scale-x-110 transition-transform origin-right" />
                </div>
              </div>
              
              <div className="flex flex-col gap-6 md:gap-8 text-primary/50 items-center">
                <ArrowRight className="w-6 h-6" />
                <ArrowRight className="w-6 h-6" />
                <ArrowRight className="w-6 h-6" />
                <ArrowRight className="w-6 h-6" />
              </div>
              
              <div className="text-left font-bold space-y-6 md:space-y-8 text-zinc-100">
                <div className="flex items-center gap-3"><div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center"><CheckCircle className="w-3.5 h-3.5 text-primary" /></div> Update Instantly</div>
                <div className="flex items-center gap-3"><div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center"><CheckCircle className="w-3.5 h-3.5 text-primary" /></div> Change Digitally</div>
                <div className="flex items-center gap-3"><div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center"><CheckCircle className="w-3.5 h-3.5 text-primary" /></div> Share Everywhere</div>
                <div className="flex items-center gap-3"><div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center"><CheckCircle className="w-3.5 h-3.5 text-primary" /></div> Understand Customers</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function CheckCircle(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

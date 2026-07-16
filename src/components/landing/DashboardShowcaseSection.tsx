import { motion } from 'framer-motion';


export function DashboardShowcaseSection() {
  return (
    <section className="py-32 px-4 bg-muted/30 overflow-hidden border-y border-border/50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-bold uppercase tracking-widest mb-4">
            Dashboard
          </span>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">Control everything.</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A lightning-fast, intuitive interface designed specifically for restaurant owners, not IT professionals.
          </p>
        </motion.div>

        {/* Dashboard Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, type: "spring" as any }}
          className="relative max-w-5xl mx-auto rounded-t-[2rem] border-x border-t border-border/50 bg-background shadow-2xl overflow-hidden aspect-[16/10] flex"
        >
          {/* Top Window Bar */}
          <div className="absolute top-0 left-0 right-0 h-12 bg-muted/80 backdrop-blur flex items-center px-4 border-b border-border/50 z-20">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
          </div>

          <div className="w-full h-full relative group">
            <img 
              src="/logo/liveDemoSchreenShot.jpeg" 
              alt="Menuzo Dashboard Preview" 
              className="w-full h-full object-cover object-top border-none"
            />
            {/* Fading bottom edge to imply continuation */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors duration-500 pointer-events-none" />
          </div>

          {/* Fading bottom edge to imply continuation */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-muted/30 to-transparent pointer-events-none" />
        </motion.div>
      </div>
    </section>
  );
}

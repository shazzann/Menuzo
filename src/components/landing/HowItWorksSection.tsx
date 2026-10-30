import { motion } from 'framer-motion';
import { Palette, ListPlus, QrCode, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function HowItWorksSection() {
  const steps = [
    {
      step: '01',
      title: 'Pick your vibe.',
      description: 'Start with a beautifully designed modern layout. Customize colors, fonts, and branding to perfectly match your restaurant\'s aesthetic.',
      icon: <Palette className="w-6 h-6 text-orange-500" />,
      image: '/Landing/mobile13.png',
      color: 'bg-orange-500/10'
    },
    {
      step: '02',
      title: 'Add your menu.',
      description: 'Upload mouth-watering photos, set up categories, and add customization options like sizes or dietary tags in just a few clicks.',
      icon: <ListPlus className="w-6 h-6 text-blue-500" />,
      image: '/Landing/mobile7.png',
      color: 'bg-blue-500/10'
    },
    {
      step: '03',
      title: 'Go live instantly.',
      description: 'Generate high-quality QR codes for your tables. Customers scan, view your stunning digital menu, and order instantly—no app required.',
      icon: <QrCode className="w-6 h-6 text-emerald-500" />,
      image: '/Landing/mobile14.png',
      color: 'bg-emerald-500/10'
    },
  ];

  return (
    <section id="how-it-works" className="py-32 px-4 bg-background relative overflow-hidden">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-40 right-[-20%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-40 left-[-20%] w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px] -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-24"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-bold uppercase tracking-widest mb-4">
            How It Works
          </span>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            From signup to live <br className="hidden md:block" /> in under 5 minutes.
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            We've stripped away the complexity. Launching a world-class digital menu has never been easier.
          </p>
        </motion.div>

        <div className="space-y-24 md:space-y-40">
          {steps.map((item, index) => {
            const isEven = index % 2 === 0;
            return (
              <div
                key={index}
                className={`flex flex-col gap-12 lg:gap-20 items-center ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}
              >

                {/* Text Content */}
                <motion.div
                  initial={{ opacity: 0, x: isEven ? -40 : 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                  className="w-full lg:w-1/2 flex flex-col justify-center text-center lg:text-left"
                >
                  <div className="flex items-center justify-center lg:justify-start gap-4 mb-6">
                    <span className="text-5xl md:text-7xl font-black text-zinc-300 dark:text-zinc-800/80">
                      {item.step}
                    </span>
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${item.color}`}>
                      {item.icon}
                    </div>
                  </div>

                  <h3 className="text-3xl md:text-4xl font-bold mb-6 tracking-tight">
                    {item.title}
                  </h3>

                  <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>

                  {/* Optional CTA if last step */}
                  {index === 2 && (
                    <div className="mt-10">
                      <Link
                        to="/signup"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-full hover:bg-primary/90 transition-all hover:gap-3 hover:shadow-xl hover:shadow-primary/20"
                      >
                        Create your menu now <ArrowRight className="w-5 h-5" />
                      </Link>
                    </div>
                  )}
                </motion.div>

                {/* Image Showcase */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
                  className="w-full lg:w-1/2 flex justify-center mt-8 lg:mt-0"
                >
                  <div className="relative p-2.5 sm:p-3 rounded-[2.25rem] sm:rounded-[2.5rem] border border-neutral-800/80 bg-[#121316] shadow-2xl shrink-0">
                    {/* Screen content with exact aspect ratio */}
                    <div className="w-[240px] sm:w-[260px] lg:w-[280px] aspect-[1179/2556] rounded-[1.5rem] sm:rounded-[1.8rem] overflow-hidden relative z-0 bg-black">
                      {/* Fallback pattern */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-400 bg-zinc-100 dark:bg-zinc-900 -z-10 text-center px-4">
                        {item.icon}
                        <span className="mt-4 font-medium text-sm">Step {item.step} Screenshot</span>
                      </div>

                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover block relative z-0 select-none pointer-events-none"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.opacity = '0';
                        }}
                        onLoad={(e) => {
                          (e.target as HTMLImageElement).style.opacity = '1';
                        }}
                      />
                    </div>
                  </div>
                </motion.div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

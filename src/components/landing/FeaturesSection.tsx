import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

export function FeaturesSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let animationFrameId: number;
    const speed = 1; // pixels per frame

    const scroll = () => {

      if (!isPaused) {
        // Scroll horizontally
        el.scrollLeft += speed;

        // Seamless loop using the exact offset of the 7th element (start of the duplicate set)
        const firstNode = el.children[0] as HTMLElement;
        const duplicateStartNode = el.children[7] as HTMLElement;

        if (firstNode && duplicateStartNode) {
          const loopPoint = duplicateStartNode.offsetLeft - firstNode.offsetLeft;
          if (el.scrollLeft >= loopPoint) {
            el.scrollLeft -= loopPoint;
          }
        }
      }
      animationFrameId = requestAnimationFrame(scroll);
    };

    animationFrameId = requestAnimationFrame(scroll);

    return () => cancelAnimationFrame(animationFrameId);
  }, [isPaused]);

  return (
    <section id="features" className="py-32 px-4 bg-background relative overflow-hidden">
      {/* Decorative gradient blur */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-bold uppercase tracking-widest mb-4">
            Everything You Need
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Powerful simplicity <br className="hidden md:block" /> behind every dish.
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Create, customize, and manage your restaurant menu from one simple platform.
          </p>
        </motion.div>

        {/* Main Screenshot Area - Mobile Carousel */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
          className="relative max-w-[100vw] -mx-4 sm:mx-auto sm:max-w-6xl mb-24 py-10"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent rounded-[3rem] blur-3xl opacity-50 pointer-events-none" />

          {/* Cleaner solution: CSS Mask Image for edge fading instead of solid color overlays */}
          <div className="[mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] md:[mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)] w-full overflow-hidden">
            <div
              ref={scrollRef}
              onPointerDown={(e) => {
                setIsPaused(true);
                isDragging.current = true;
                startX.current = e.pageX - scrollRef.current!.offsetLeft;
                scrollLeftStart.current = scrollRef.current!.scrollLeft;
              }}
              onPointerMove={(e) => {
                if (!isDragging.current) return;
                e.preventDefault();
                const x = e.pageX - scrollRef.current!.offsetLeft;
                const walk = (x - startX.current) * 2; // Scroll fast
                scrollRef.current!.scrollLeft = scrollLeftStart.current - walk;
              }}
              onPointerUp={() => {
                setIsPaused(false);
                isDragging.current = false;
              }}
              onPointerLeave={() => {
                setIsPaused(false);
                isDragging.current = false;
              }}
              onPointerCancel={() => {
                setIsPaused(false);
                isDragging.current = false;
              }}
              className="flex gap-6 md:gap-10 w-full px-4 md:px-10 relative z-10 overflow-x-auto hide-scrollbar select-none cursor-grab active:cursor-grabbing"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }} // hide scrollbar for Firefox/IE
            >
            {[
              "/Landing/mobile1.jpeg",
              "/Landing/mobile2.jpeg",
              "/Landing/mobile3.jpeg",
              "/Landing/mobile4.jpeg",
              "/Landing/mobile5.jpeg",
              "/Landing/mobile10.jpeg",
              "/Landing/mobile11.jpeg",
              // Duplicated set for seamless loop
              "/Landing/mobile1.jpeg",
              "/Landing/mobile2.jpeg",
              "/Landing/mobile3.jpeg",
              "/Landing/mobile4.jpeg",
              "/Landing/mobile5.jpeg",
              "/Landing/mobile10.jpeg",
              "/Landing/mobile11.jpeg",
            ].map((src, idx) => (
              <div
                key={idx}
                className="w-[230px] md:w-[250px] h-[480px] md:h-[520px] rounded-[2rem] md:rounded-[2.5rem] border-[6px] border-zinc-800 dark:border-zinc-900 bg-zinc-950 overflow-hidden shadow-2xl relative flex-shrink-0 group transform transition-transform duration-500 hover:scale-[1.02]"
              >
                <div className="absolute top-0 inset-x-0 h-5 md:h-6 bg-zinc-800 dark:bg-zinc-900 rounded-b-2xl w-28 md:w-32 mx-auto z-10" />

                {/* Fallback gradient if image is missing */}
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center text-zinc-700 text-sm font-medium -z-10">
                  Mobile Preview {(idx % 9) + 1}
                </div>

                <img
                  src={src}
                  alt={`Mobile Preview ${(idx % 9) + 1}`}
                  className="w-full h-full object-cover relative z-0 pointer-events-none"
                  onError={(e) => {
                    // Hide broken image icon if placeholder image doesn't exist yet
                    (e.target as HTMLImageElement).style.opacity = '0';
                  }}
                  onLoad={(e) => {
                    (e.target as HTMLImageElement).style.opacity = '1';
                  }}
                />
              </div>
            ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

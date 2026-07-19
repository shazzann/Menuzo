import { useState } from 'react';
import { brandBookSections } from '@/content/brand-book';
import { Menu, X, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  activeSection: string;
  onNavigate: (id: string) => void;
  progress: number;
}

export function BrandBookMobileNav({ activeSection, onNavigate, progress }: Props) {
  const [open, setOpen] = useState(false);

  const handleNav = (id: string) => {
    onNavigate(id);
    setOpen(false);
  };

  const activeTitle = brandBookSections.find(
    (s) => s.id === activeSection || s.subsections?.some((sub) => sub.id === activeSection)
  )?.title || 'Brand Book';

  return (
    <>
      {/* Sticky mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-background/90 backdrop-blur-xl border-b border-border/50">
        <div className="h-0.5 bg-muted/30">
          <div className="h-full bg-primary rounded-r-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3 min-w-0">
            <img src="/logo/Logo main4tight.png" alt="Menuzo" className="h-5 w-auto dark:hidden shrink-0" />
            <img src="/logo/Logo main4dark.png" alt="Menuzo" className="h-5 w-auto hidden dark:block shrink-0" />
            <ChevronRight className="w-3 h-3 text-muted-foreground/40 shrink-0" />
            <span className="text-sm font-medium text-foreground truncate">{activeTitle}</span>
          </div>
          <button onClick={() => setOpen(!open)} className="p-2 text-foreground" aria-label="Toggle navigation">
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile nav overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden fixed inset-0 z-30 bg-background/95 backdrop-blur-xl pt-16 overflow-y-auto"
          >
            <nav className="px-4 py-4">
              <ul className="space-y-1">
                {brandBookSections.map((section) => (
                  <li key={section.id}>
                    <button
                      onClick={() => handleNav(section.subsections?.[0]?.id || section.id)}
                      className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                        section.id === activeSection || section.subsections?.some((s) => s.id === activeSection)
                          ? 'text-primary bg-primary/8'
                          : 'text-foreground/70 hover:bg-muted/30'
                      }`}
                    >
                      {section.title}
                    </button>
                    {section.subsections && (
                      <ul className="ml-4 pl-3 border-l border-border/30 mt-1 mb-2 space-y-0.5">
                        {section.subsections.map((sub) => (
                          <li key={sub.id}>
                            <button
                              onClick={() => handleNav(sub.id)}
                              className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${
                                sub.id === activeSection
                                  ? 'text-primary font-medium'
                                  : 'text-muted-foreground hover:text-foreground'
                              }`}
                            >
                              {sub.title}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

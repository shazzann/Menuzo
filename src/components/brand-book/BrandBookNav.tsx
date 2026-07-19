import { useState, useEffect } from 'react';
import { brandBookSections } from '@/content/brand-book';
import { ChevronDown, ChevronRight, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BrandBookNavProps {
  activeSection: string;
  onNavigate: (id: string) => void;
  progress: number;
}

export function BrandBookNav({ activeSection, onNavigate, progress }: BrandBookNavProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [, setSearchOpen] = useState(false);

  useEffect(() => {
    const parent = brandBookSections.find(
      (s) => s.id === activeSection || s.subsections?.some((sub) => sub.id === activeSection)
    );
    if (parent) {
      setExpandedSections((prev) => new Set([...prev, parent.id]));
    }
  }, [activeSection]);

  const toggle = (id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const filteredSections = searchQuery
    ? brandBookSections.filter(
        (s) =>
          s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.keywords?.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase())) ||
          s.subsections?.some(
            (sub) =>
              sub.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              sub.keywords?.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase()))
          )
      )
    : brandBookSections;

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 sticky top-0 h-screen border-r border-border/50 bg-background/80 backdrop-blur-xl z-30">
      {/* Progress bar */}
      <div className="h-0.5 bg-muted/30">
        <motion.div
          className="h-full bg-primary rounded-r-full"
          style={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Header */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center gap-2 mb-1">
          <img src="/logo/Logo main4tight.png" alt="Menuzo" className="h-5 w-auto dark:hidden" />
          <img src="/logo/Logo main4dark.png" alt="Menuzo" className="h-5 w-auto hidden dark:block" />
        </div>
        <p className="text-xs text-muted-foreground font-medium tracking-wide uppercase mt-2">Brand Book</p>
        <p className="text-[10px] text-muted-foreground/60 mt-0.5">{Math.round(progress)}% Complete</p>
      </div>

      {/* Search */}
      <div className="px-4 pb-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" />
          <input
            type="text"
            placeholder="Search sections..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setSearchOpen(true); }}
            onFocus={() => setSearchOpen(true)}
            className="w-full pl-8 pr-8 py-1.5 text-xs bg-muted/30 border border-border/50 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/40 text-foreground placeholder:text-muted-foreground/50"
          />
          {searchQuery && (
            <button onClick={() => { setSearchQuery(''); setSearchOpen(false); }} className="absolute right-2 top-1/2 -translate-y-1/2">
              <X className="w-3 h-3 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 pb-6 scrollbar-hide" aria-label="Brand Book navigation">
        <ul className="space-y-0.5">
          {filteredSections.map((section) => {
            const isActive = section.id === activeSection;
            const hasActiveSub = section.subsections?.some((s) => s.id === activeSection);
            const isExpanded = expandedSections.has(section.id);

            return (
              <li key={section.id}>
                <button
                  onClick={() => {
                    if (section.subsections) toggle(section.id);
                    else onNavigate(section.id);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group
                    ${isActive || hasActiveSub ? 'text-primary bg-primary/8' : 'text-foreground/70 hover:text-foreground hover:bg-muted/40'}`}
                >
                  <span className="truncate">{section.title}</span>
                  {section.subsections && (
                    <span className="text-muted-foreground/50 group-hover:text-muted-foreground transition-colors">
                      {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    </span>
                  )}
                </button>
                <AnimatePresence>
                  {section.subsections && isExpanded && (
                    <motion.ul
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden ml-3 border-l border-border/40 pl-3 mt-0.5 mb-1"
                    >
                      {section.subsections
                        .filter((sub) => {
                          if (!searchQuery) return true;
                          const q = searchQuery.toLowerCase();
                          return (
                            sub.title.toLowerCase().includes(q) ||
                            sub.keywords?.some((k) => k.toLowerCase().includes(q)) ||
                            section.title.toLowerCase().includes(q) ||
                            section.keywords?.some((k) => k.toLowerCase().includes(q))
                          );
                        })
                        .map((sub) => (
                          <li key={sub.id}>
                            <button
                              onClick={() => onNavigate(sub.id)}
                              className={`w-full text-left px-2.5 py-1.5 rounded-md text-[13px] transition-all duration-200
                                ${sub.id === activeSection
                                  ? 'text-primary font-medium bg-primary/5'
                                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                                }`}
                            >
                              {sub.title}
                            </button>
                          </li>
                        ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}

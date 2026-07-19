import { useRef, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Copy, Check, ArrowUp, Maximize2, X } from 'lucide-react';

// ── Section Wrapper ──────────────────────────────────────

interface SectionProps {
  id: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}

export function Section({ id, title, subtitle, children, className = '' }: SectionProps) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section id={id} ref={ref} className={`scroll-mt-20 ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, ease: [0, 0, 0.2, 1] }}
      >
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">{title}</h2>
          {subtitle && <p className="mt-2 text-muted-foreground text-base max-w-2xl">{subtitle}</p>}
          <div className="mt-4 h-px bg-gradient-to-r from-primary/40 via-border/60 to-transparent" />
        </div>
        {children}
      </motion.div>
    </section>
  );
}

// ── Subsection ───────────────────────────────────────────

interface SubsectionProps {
  id: string;
  title: string;
  children: ReactNode;
}

export function Subsection({ id, title, children }: SubsectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <div id={id} ref={ref} className="scroll-mt-20 mb-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.4, ease: [0, 0, 0.2, 1] }}
      >
        <h3 className="text-lg md:text-xl font-semibold text-foreground mb-4">{title}</h3>
        {children}
      </motion.div>
    </div>
  );
}

// ── Copyable Text Block ──────────────────────────────────

interface CopyableProps {
  label: string;
  value: string;
  large?: boolean;
}

export function Copyable({ label, value, large }: CopyableProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`group relative bg-card border border-border/60 rounded-xl p-5 transition-all duration-200 hover:border-primary/30 hover:shadow-sm ${large ? '' : ''}`}>
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">{label}</p>
      <p className={`text-foreground ${large ? 'text-xl md:text-2xl font-semibold leading-snug' : 'text-sm leading-relaxed'}`}>{value}</p>
      <button
        onClick={handleCopy}
        className="absolute top-4 right-4 p-1.5 rounded-md text-muted-foreground/40 opacity-0 group-hover:opacity-100 hover:text-primary hover:bg-primary/5 transition-all duration-200"
        aria-label={`Copy ${label}`}
      >
        {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}

// ── Brand Card ───────────────────────────────────────────

interface BrandCardProps {
  icon?: string;
  title: string;
  description: string;
  className?: string;
}

export function BrandCard({ icon, title, description, className = '' }: BrandCardProps) {
  return (
    <div className={`bg-card border border-border/60 rounded-xl p-5 transition-all duration-200 hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5 ${className}`}>
      {icon && <span className="text-2xl mb-3 block">{icon}</span>}
      <h4 className="font-semibold text-foreground mb-1.5">{title}</h4>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

// ── Tag Chip ─────────────────────────────────────────────

export function TagChip({ label, variant = 'default' }: { label: string; variant?: 'default' | 'avoid' | 'success' }) {
  const styles = {
    default: 'bg-primary/8 text-primary border-primary/20',
    avoid: 'bg-destructive/8 text-destructive border-destructive/20',
    success: 'bg-green-500/8 text-green-600 dark:text-green-400 border-green-500/20',
  };
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${styles[variant]}`}>
      {label}
    </span>
  );
}

// ── Placeholder Block ────────────────────────────────────

interface PlaceholderProps {
  label: string;
  height?: string;
  lightbox?: boolean;
  imagePath?: string;
  description?: string;
  type?: 'logo' | 'image' | 'download' | 'component' | 'none';
}

export function Placeholder({ label, height = 'h-40', lightbox = false, imagePath, description, type }: PlaceholderProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div 
        onClick={() => lightbox && setIsOpen(true)}
        className={`${height} rounded-xl border-2 border-dashed border-border/60 ${imagePath ? 'bg-transparent p-2' : 'bg-muted/10'} flex flex-col items-center justify-center gap-2 transition-all ${lightbox ? 'cursor-pointer hover:border-primary/50 hover:bg-muted/20 group relative overflow-hidden' : ''}`}
      >
        {imagePath ? (
          <img src={imagePath} alt={label} className="w-full h-full object-contain" />
        ) : (
          <>
            <div className="w-10 h-10 rounded-lg bg-muted/30 flex items-center justify-center transition-transform group-hover:scale-110">
              <div className="w-5 h-5 rounded bg-muted/50" />
            </div>
            <p className="text-xs text-muted-foreground/60 font-medium group-hover:text-muted-foreground/80">{label}</p>
            <p className="text-[10px] text-muted-foreground/40">{type ? type.toUpperCase() : 'Reserved for Future Content'}</p>
          </>
        )}
        
        {lightbox && (
          <div className="absolute top-2 right-2 p-1.5 rounded-md bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
            <Maximize2 className="w-3.5 h-3.5 text-foreground/70" />
          </div>
        )}
      </div>

      {lightbox && (
        <AnimatePresence>
          {isOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
                className="absolute inset-0 bg-background/95 backdrop-blur-xl cursor-zoom-out"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative w-full max-w-5xl aspect-video rounded-2xl border border-border/40 bg-card shadow-2xl flex flex-col items-center justify-center overflow-hidden"
              >
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-background/50 hover:bg-background/80 text-foreground transition-colors z-10"
                >
                  <X className="w-5 h-5" />
                </button>
                {imagePath ? (
                  <img src={imagePath} alt={label} className="w-full h-full object-contain p-8" />
                ) : (
                  <>
                    <div className="w-24 h-24 rounded-2xl bg-muted/30 flex items-center justify-center mb-6">
                      <div className="w-12 h-12 rounded-lg bg-muted/50" />
                    </div>
                    <p className="text-xl font-medium text-foreground">{label}</p>
                    <p className="text-sm text-muted-foreground/60 mt-2">{description || 'Fullscreen Placeholder'}</p>
                  </>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      )}
    </>
  );
}

// ── Code Block with Copy ─────────────────────────────────

export function CodeBlock({ code, language = 'css' }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group rounded-xl border border-border/60 bg-[#0d1117] dark:bg-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/30 bg-muted/5">
        <span className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-wider">{language}</span>
        <button
          onClick={handleCopy}
          className="text-xs text-muted-foreground/50 hover:text-primary flex items-center gap-1 transition-colors"
        >
          {copied ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-xs leading-relaxed font-mono text-green-300 dark:text-green-400">
        <code>{code}</code>
      </pre>
    </div>
  );
}

// ── Color Swatch ─────────────────────────────────────────

interface ColorSwatchProps {
  name: string;
  hex: string;
  rgb: string;
  hsl: string;
  usage: string;
  cssVar: string;
}

export function ColorSwatch({ name, hex, rgb, hsl, usage, cssVar }: ColorSwatchProps) {
  const [copied, setCopied] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(hex);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="group rounded-xl border border-border/60 overflow-hidden bg-card transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
      onClick={handleCopy}
      onMouseEnter={() => setShowDetails(true)}
      onMouseLeave={() => setShowDetails(false)}
    >
      <div className="h-20 relative" style={{ backgroundColor: hex }}>
        <motion.div
          initial={false}
          animate={{ opacity: showDetails ? 1 : 0 }}
          className="absolute inset-0 bg-black/60 flex items-center justify-center"
        >
          <span className="text-white text-xs font-mono">
            {copied ? '✓ Copied!' : 'Click to copy'}
          </span>
        </motion.div>
      </div>
      <div className="p-3">
        <p className="text-sm font-semibold text-foreground truncate">{name}</p>
        <p className="text-[10px] font-mono text-muted-foreground mt-0.5">{hex}</p>
        <motion.div
          initial={false}
          animate={{ height: showDetails ? 'auto' : 0, opacity: showDetails ? 1 : 0 }}
          className="overflow-hidden"
        >
          <div className="pt-2 mt-2 border-t border-border/40 space-y-1">
            <p className="text-[10px] font-mono text-muted-foreground/70">RGB: {rgb}</p>
            <p className="text-[10px] font-mono text-muted-foreground/70">HSL: {hsl}</p>
            <p className="text-[10px] font-mono text-muted-foreground/70">Var: {cssVar}</p>
            <p className="text-[10px] text-muted-foreground/60 mt-1">{usage}</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ── Callout Block ────────────────────────────────────────

type CalloutType = 'tip' | 'important' | 'warning' | 'example' | 'best-practice';

const calloutConfig: Record<CalloutType, { icon: string; color: string; bg: string; border: string }> = {
  tip: { icon: '💡', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/5', border: 'border-blue-500/20' },
  important: { icon: '⚡', color: 'text-primary', bg: 'bg-primary/5', border: 'border-primary/20' },
  warning: { icon: '⚠️', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/5', border: 'border-amber-500/20' },
  example: { icon: '📋', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-500/5', border: 'border-green-500/20' },
  'best-practice': { icon: '✅', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/5', border: 'border-emerald-500/20' },
};

export function Callout({ type, children }: { type: CalloutType; children: ReactNode }) {
  const cfg = calloutConfig[type];
  return (
    <div className={`rounded-xl border ${cfg.border} ${cfg.bg} p-4 flex gap-3 items-start`}>
      <span className="text-lg shrink-0 mt-0.5">{cfg.icon}</span>
      <div className={`text-sm leading-relaxed ${cfg.color}`}>{children}</div>
    </div>
  );
}

// ── Back to Top ──────────────────────────────────────────

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-40 w-10 h-10 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/20 flex items-center justify-center hover:scale-110 transition-transform"
          aria-label="Back to top"
        >
          <ArrowUp className="w-4 h-4" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

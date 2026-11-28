import { ArrowLeft, ArrowUpRight, Globe, Instagram, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { Footer } from '@/components/landing/Footer';
import { useApp } from '@/store';

interface FounderLink {
  label: string;
  href: string;
  kind: 'linkedin' | 'website' | 'instagram';
}

interface Founder {
  name: string;
  role: string;
  initials: string;
  photo?: string;
  links: FounderLink[];
}

const founders: Founder[] = [
  {
    name: 'Hasni Zihar',
    role: 'Co-Founder',
    initials: 'HZ',
    photo: '/Landing/founder-hasni.webp',
    links: [
      { label: 'LinkedIn', href: 'https://www.linkedin.com/in/kr-hasni-zihar/', kind: 'linkedin' },
      { label: 'Portfolio', href: 'https://hasnizihar.vercel.app/', kind: 'website' },
      { label: '@ziharhasni', href: 'https://www.instagram.com/ziharhasni/', kind: 'instagram' },
    ],
  },
  {
    name: 'Shazan',
    role: 'Co-Founder',
    initials: 'S',
    photo: '/Landing/founder-shazan.webp',
    links: [
      { label: 'LinkedIn', href: 'https://www.linkedin.com/in/shazanshaheed/', kind: 'linkedin' },
      { label: 'Portfolio', href: 'https://www.shazion.com/', kind: 'website' },
      { label: '@shaza__n', href: 'https://www.instagram.com/shaza__n/', kind: 'instagram' },
    ],
  },
];

function FounderLinkIcon({ kind }: { kind: FounderLink['kind'] }) {
  if (kind === 'linkedin') {
    return <Linkedin className="w-4 h-4 text-muted-foreground shrink-0" strokeWidth={1.5} aria-hidden="true" />;
  }
  if (kind === 'instagram') {
    return <Instagram className="w-4 h-4 text-muted-foreground shrink-0" strokeWidth={1.5} aria-hidden="true" />;
  }
  return <Globe className="w-4 h-4 text-muted-foreground shrink-0" strokeWidth={1.5} aria-hidden="true" />;
}

export function AboutPage() {
  const { state, dispatch } = useApp();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20">
      {/* Sticky Header */}
      <header className="h-16 bg-background/95 backdrop-blur-md border-b border-border px-4 sm:px-6 flex items-center justify-between sticky top-0 z-50">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            dispatch({ type: 'SET_VIEW', payload: 'landing' });
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" />
          <span className="hidden sm:inline">Back to Home</span>
          <span className="sm:hidden">Home</span>
        </Button>

        {/* Brand Logo */}
        <button
          type="button"
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => {
            dispatch({ type: 'SET_VIEW', payload: 'landing' });
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          title="Menuzo Home"
        >
          <img src="/logo/Logo main4tight.png" alt="Menuzo" className="h-7 w-auto dark:hidden" />
          <img src="/logo/Logo main4dark.png" alt="Menuzo" className="h-7 w-auto hidden dark:block" />
        </button>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {state.user ? (
            <Button
              size="sm"
              onClick={() => dispatch({ type: 'SET_VIEW', payload: 'user-dashboard' })}
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-medium"
            >
              Dashboard
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => {
                dispatch({ type: 'SET_VIEW', payload: 'signup' });
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-medium"
            >
              Start Free
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-16 sm:space-y-20">
          {/* Section 1: About Menuzo */}
          <section className="max-w-2xl">
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground mb-4">
              About Menuzo
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              Menuzo is a digital menu platform that helps restaurants create, customize, and share their menus through QR codes and simple web links. Built with simplicity and accessibility in mind, Menuzo makes digital menu management easier for restaurants of all sizes.
            </p>
          </section>

          {/* Section 2: Meet the Co-Founders */}
          <section className="pt-12 border-t border-border">
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground mb-6">
              Meet the Co-Founders
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {founders.map((founder) => (
                <article
                  key={founder.name}
                  className="p-6 rounded-2xl bg-card border border-border flex flex-col justify-between gap-6"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-muted border border-border overflow-hidden flex items-center justify-center text-foreground font-semibold text-base shrink-0">
                      {founder.photo ? (
                        <img
                          src={founder.photo}
                          alt={founder.name}
                          width={56}
                          height={56}
                          className="w-full h-full object-cover object-top"
                        />
                      ) : (
                        <span>{founder.initials}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg font-semibold text-foreground truncate">
                        {founder.name}
                      </h3>
                      <p className="text-sm font-medium text-[#C2530A] dark:text-primary">
                        {founder.role}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border space-y-1.5">
                    {founder.links.map((link) => (
                      <a
                        key={link.href}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${founder.name} on ${link.label}`}
                        className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-muted/60 transition-colors min-h-[44px]"
                      >
                        <span className="inline-flex items-center gap-2.5 min-w-0">
                          <FounderLinkIcon kind={link.kind} />
                          <span className="truncate">{link.label}</span>
                        </span>
                        <ArrowUpRight className="w-4 h-4 text-muted-foreground shrink-0" strokeWidth={1.5} aria-hidden="true" />
                      </a>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { Footer } from '@/components/landing/Footer';
import { useApp } from '@/store';

interface Founder {
  name: string;
  role: string;
  initials: string;
  photo?: string;
  bio?: string;
}

const founders: Founder[] = [
  {
    name: 'Hasni Zihar',
    role: 'Co-Founder',
    initials: 'HZ',
    // Biography can be updated here when provided
    bio: '',
  },
  {
    name: 'Shazan',
    role: 'Co-Founder',
    initials: 'S',
    // Biography can be updated here when provided
    bio: '',
  },
];

export function AboutPage() {
  const { state, dispatch } = useApp();

  return (
    <div className="min-h-screen bg-background dark:bg-[#090A0C] text-foreground flex flex-col selection:bg-primary/20">
      {/* Sticky Header */}
      <header className="h-16 bg-background/95 dark:bg-[#090A0C]/95 backdrop-blur-md border-b border-border/80 dark:border-neutral-800/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-50">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            dispatch({ type: 'SET_VIEW', payload: 'landing' });
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back to Home</span>
          <span className="sm:hidden">Home</span>
        </Button>

        {/* Brand Logo */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => {
            dispatch({ type: 'SET_VIEW', payload: 'landing' });
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          title="Menuzo Home"
        >
          <img src="/logo/Logo main4tight.png" alt="Menuzo" className="h-7 w-auto dark:hidden" />
          <img src="/logo/Logo main4dark.png" alt="Menuzo" className="h-7 w-auto hidden dark:block" />
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {state.user ? (
            <Button
              size="sm"
              onClick={() => dispatch({ type: 'SET_VIEW', payload: 'user-dashboard' })}
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-semibold shadow-xs"
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
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-semibold shadow-xs"
            >
              Start Free
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          
          {/* Section 1: About Menuzo */}
          <section className="text-center max-w-2xl mx-auto mb-16 sm:mb-20">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-6">
              About Menuzo
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
              Menuzo is a digital menu platform that helps restaurants create, customize, and share their menus through QR codes and simple web links. Built with simplicity and accessibility in mind, Menuzo makes digital menu management easier for restaurants of all sizes.
            </p>
          </section>

          {/* Section 2: Meet the Co-Founders */}
          <section className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Meet the Co-Founders
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              {founders.map((founder) => (
                <div
                  key={founder.name}
                  className="p-8 sm:p-10 rounded-3xl bg-card dark:bg-[#1C1E22] border border-border/60 dark:border-neutral-800/80 hover:border-border dark:hover:border-neutral-700 transition-all duration-300 shadow-sm flex flex-col items-center text-center group"
                >
                  {/* Photo or Tasteful Initials Avatar */}
                  <div className="w-24 h-24 rounded-full sm:rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-primary/30 flex items-center justify-center text-primary font-bold text-2xl tracking-wider shadow-inner mb-6 transition-transform duration-300 group-hover:scale-105">
                    {founder.photo ? (
                      <img
                        src={founder.photo}
                        alt={founder.name}
                        className="w-full h-full object-cover rounded-full sm:rounded-2xl"
                      />
                    ) : (
                      <span>{founder.initials}</span>
                    )}
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-1">
                    {founder.name}
                  </h3>
                  <p className="text-sm font-semibold uppercase tracking-wider text-primary mb-2">
                    {founder.role}
                  </p>

                  {/* Short Introduction (editable placeholder) */}
                  {founder.bio && (
                    <p className="text-muted-foreground text-sm leading-relaxed mt-2">
                      {founder.bio}
                    </p>
                  )}
                </div>
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

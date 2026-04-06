import { ArrowRight, QrCode, Zap, Globe, ChevronRight, Star, Quote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/store';

export function LandingPage() {
  const { dispatch } = useApp();

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background grain-overlay">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="font-bold text-primary-foreground text-sm">M</span>
            </div>
            <span className="font-bold text-lg">Menuzo</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => dispatch({ type: 'SET_VIEW', payload: 'login' })}
            >
              Sign in
            </Button>
            <Button
              size="sm"
              onClick={() => dispatch({ type: 'SET_VIEW', payload: 'login' })}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Create menu
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-mono uppercase tracking-wider mb-6 animate-fade-in-up">
            <Star className="w-3 h-3" />
            Free to start. No card required.
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            Your menu.{' '}
            <span className="text-primary">Live in minutes.</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Build a beautiful QR menu and ordering micro-site. Update anytime—instantly on every phone.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <Button
              size="lg"
              onClick={() => dispatch({ type: 'SET_VIEW', payload: 'login' })}
              className="bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto"
            >
              Create menu
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => scrollToSection('preview')}
              className="w-full sm:w-auto"
            >
              See demo
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-card/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-mono uppercase tracking-wider text-primary mb-2 block">
              How It Works
            </span>
            <h2 className="text-3xl font-bold">Build in 3 steps</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                title: 'Pick a look',
                description: 'Choose a clean, modern layout that matches your vibe.',
                icon: <Globe className="w-6 h-6" />,
              },
              {
                step: '02',
                title: 'Add your items',
                description: 'Upload photos, set prices, add options in seconds.',
                icon: <Zap className="w-6 h-6" />,
              },
              {
                step: '03',
                title: 'Go live',
                description: 'Share your QR code or link. Update anytime.',
                icon: <QrCode className="w-6 h-6" />,
              },
            ].map((item, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl bg-card card-border card-shadow animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono uppercase text-muted-foreground">
                    Step {item.step}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    {item.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Preview */}
      <section id="preview" className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="animate-slide-in-left">
              <span className="text-xs font-mono uppercase tracking-wider text-primary mb-2 block">
                Live Preview
              </span>
              <h2 className="text-3xl font-bold mb-4">
                A menu that feels like an app.
              </h2>
              <ul className="space-y-3 mb-6">
                {[
                  'Categories, search, and specials—built in.',
                  'Updates publish instantly.',
                  'Works offline after first load.',
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    </div>
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => dispatch({ type: 'SET_VIEW', payload: 'customer-menu' })}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                See a demo
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
            <div className="relative animate-slide-in-right">
              <div className="relative rounded-3xl overflow-hidden card-shadow border border-border">
                <img
                  src="/food-burger.jpg"
                  alt="Menu preview"
                  className="w-full aspect-[4/3] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="p-4 rounded-xl bg-card/90 backdrop-blur-sm card-border">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                        <QrCode className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">Scan to view menu</p>
                        <p className="text-xs text-muted-foreground">Works on any device</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-card/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-mono uppercase tracking-wider text-primary mb-2 block">
              Features
            </span>
            <h2 className="text-3xl font-bold">Everything you need</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: 'Unlimited items', desc: 'Add as many dishes as you want.' },
              { title: 'Photos & descriptions', desc: 'Showcase your food beautifully.' },
              { title: 'Options & modifiers', desc: 'Let customers customize orders.' },
              { title: 'Dietary tags', desc: 'Mark vegan, gluten-free, etc.' },
              { title: 'Analytics', desc: 'See what customers love most.' },
              { title: 'Team access', desc: 'Invite staff to manage the menu.' },
            ].map((feature, index) => (
              <div
                key={index}
                className="p-5 rounded-2xl bg-card card-border hover:border-primary/30 transition-colors animate-fade-in-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <h3 className="font-semibold mb-1">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-mono uppercase tracking-wider text-primary mb-2 block">
              Testimonials
            </span>
            <h2 className="text-3xl font-bold">Loved by small teams</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote: "Menuzo turned our paper menu into something guests actually want to browse.",
                name: 'Alex Chen',
                role: 'Café Owner',
                avatar: '/avatar-1.jpg',
              },
              {
                quote: "Updates are instant. We change specials every day without reprinting.",
                name: 'Sam Rodriguez',
                role: 'Head Chef',
                avatar: '/avatar-2.jpg',
              },
              {
                quote: "Setup took 10 minutes. The QR poster is clean and sharp.",
                name: 'Jordan Park',
                role: 'Food Truck Owner',
                avatar: '/avatar-3.jpg',
              },
            ].map((testimonial, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl bg-card card-border card-shadow animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <Quote className="w-8 h-8 text-primary/30 mb-4" />
                <p className="text-muted-foreground mb-6">{testimonial.quote}</p>
                <div className="flex items-center gap-3">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-sm">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-card/50">
        <div className="max-w-2xl mx-auto text-center">
          <div className="animate-fade-in-up">
            <h2 className="text-3xl font-bold mb-4">Ready when you are.</h2>
            <p className="text-muted-foreground mb-8">
              Build your QR menu today. Upgrade only when you are ready.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                onClick={() => dispatch({ type: 'SET_VIEW', payload: 'login' })}
                className="bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto"
              >
                Create menu
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto"
              >
                Talk to sales
              </Button>
            </div>
            <div className="flex items-center justify-center gap-6 mt-8 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                Free start
              </span>
              <span className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                Cancel anytime
              </span>
              <span className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                Support 24/7
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="font-bold text-primary-foreground text-sm">M</span>
              </div>
              <span className="font-bold">Menuzo</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
              <a href="#" className="hover:text-foreground transition-colors">Support</a>
            </div>
            <p className="text-xs text-muted-foreground">
              © 2024 Menuzo. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/store';

export function LegalPage({ type }: { type: 'privacy' | 'terms' }) {
  const { dispatch } = useApp();
  
  const title = type === 'privacy' ? 'Privacy Policy' : 'Terms of Service';
  const lastUpdated = 'July 15, 2026';

  return (
    <div className="min-h-screen bg-background">
      <header className="h-16 bg-background border-b border-border px-6 flex items-center justify-between sticky top-0 z-50">
        <Button variant="ghost" onClick={() => dispatch({ type: 'SET_VIEW', payload: 'landing' })} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Button>
        <div className="font-bold text-xl tracking-tight text-primary">Menuzo</div>
        <div className="w-24" /> {/* Spacer */}
      </header>

      <main className="max-w-3xl mx-auto py-20 px-6">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">{title}</h1>
        <p className="text-muted-foreground mb-12 border-b border-border pb-8">Last Updated: {lastUpdated}</p>
        
        <div className="prose prose-zinc dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              Welcome to Menuzo. This {title.toLowerCase()} outlines our rules, guidelines, and policies regarding your use of our digital menu platform and related services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">2. Data Collection</h2>
            <p className="text-muted-foreground leading-relaxed">
              We collect minimal information necessary to provide our services. This includes your restaurant details, menu items, and basic analytics data about how your customers interact with your QR menus. We do not sell your personal data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">3. User Responsibilities</h2>
            <p className="text-muted-foreground leading-relaxed">
              As a restaurant owner using Menuzo, you are responsible for ensuring the accuracy of your menu items, prices, and allergen information. Menuzo is not liable for disputes between you and your customers regarding food descriptions or pricing.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">4. Subscriptions & Payments</h2>
            <p className="text-muted-foreground leading-relaxed">
              Certain features may require a paid subscription. Payments are processed securely via our third-party payment providers. You may cancel your subscription at any time, but we do not offer refunds for partial months of service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">5. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about this {title.toLowerCase()}, please contact us via our contact form or support email.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}

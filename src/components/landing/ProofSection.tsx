import { Banknote, ExternalLink, UtensilsCrossed } from 'lucide-react';
import { LANDING_PROOF_ITEMS } from '@/data/landingProof';
import { Card } from '@/components/ui/card';
import { trackEvent } from '@/lib/analytics';

const LIVE_MENU_URL = 'https://menuzo.lk/spicegardenkitchen';

export function ProofSection() {
  if (LANDING_PROOF_ITEMS.length > 0) {
    return (
      <section id="trust" className="landing-section bg-background border-b border-border">
        <div className="landing-container">
          <div className="max-w-2xl mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
              Built for the way restaurants work
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {LANDING_PROOF_ITEMS.map((item) => (
              <Card key={item.id} className="p-6 rounded-2xl border-border bg-card shadow-xs flex flex-col justify-between gap-5">
                <div>
                  {item.logoUrl && (
                    <img
                      src={item.logoUrl}
                      alt={`${item.restaurantName} logo`}
                      width={120}
                      height={32}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                      className="h-7 w-auto object-contain mb-4"
                    />
                  )}
                  <blockquote className="text-base text-foreground leading-relaxed">
                    “{item.quote}”
                  </blockquote>
                </div>

                <footer className="pt-4 border-t border-border flex items-center gap-3">
                  {item.photoUrl && (
                    <img
                      src={item.photoUrl}
                      alt={item.authorName}
                      width={40}
                      height={40}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                      className="w-10 h-10 rounded-xl object-cover shrink-0 border border-border"
                    />
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{item.authorName}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {[item.authorRole, item.restaurantName, item.city].filter(Boolean).join(', ')}
                    </p>
                  </div>
                </footer>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="trust" className="landing-paper border-b landing-divider py-10 sm:py-12">
      <div className="landing-container landing-reveal flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
        <div className="max-w-sm">
          <h2 className="text-lg font-semibold tracking-tight text-foreground mb-1.5">
            Inspect the live product before signing up
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Open Spice Garden Kitchen’s public menu in your browser to see what guests receive.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-0 sm:divide-x landing-divider flex-1 lg:max-w-[44rem]">
          <div className="flex items-start gap-3 sm:px-6 sm:first:pl-0">
            <span className="landing-icon-tile shrink-0" aria-hidden="true">
              <ExternalLink className="w-4 h-4" strokeWidth={1.5} />
            </span>
            <div className="min-w-0">
              <a
                href={LIVE_MENU_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent('demo_first_interaction', { source: 'trust_live_link' })}
                className="inline-flex items-center gap-1 text-sm font-semibold text-foreground underline decoration-primary/40 decoration-1 underline-offset-4 hover:decoration-primary transition-colors min-h-[44px] sm:min-h-0"
              >
                Spice Garden Kitchen
              </a>
              <p className="text-xs text-muted-foreground mt-0.5">Live Menuzo public menu</p>
            </div>
          </div>

          <div className="flex items-start gap-3 sm:px-6">
            <span className="landing-icon-tile shrink-0" aria-hidden="true">
              <UtensilsCrossed className="w-4 h-4" strokeWidth={1.5} />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">Direct table ordering</p>
              <p className="text-xs text-muted-foreground mt-0.5">Guests browse and order with staff</p>
            </div>
          </div>

          <div className="flex items-start gap-3 sm:px-6 sm:last:pr-0">
            <span className="landing-icon-tile shrink-0" aria-hidden="true">
              <Banknote className="w-4 h-4" strokeWidth={1.5} />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">Transparent LKR plans</p>
              <p className="text-xs text-muted-foreground mt-0.5">No per-order commissions</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

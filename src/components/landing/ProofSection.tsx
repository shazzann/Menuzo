import { ExternalLink, Globe, QrCode, RefreshCw } from 'lucide-react';
import { LANDING_PROOF_ITEMS } from '@/data/landingProof';
import { Card } from '@/components/ui/card';
import { FREE_PLAN_LIMITS } from '@/lib/subscription';
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
    <section id="trust" className="bg-muted/30 border-b border-border py-8 sm:py-10">
      <div className="landing-container flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="max-w-md">
          <h2 className="text-base font-medium text-foreground mb-1">
            Real product, verifiable in any browser
          </h2>
          <p className="text-sm text-muted-foreground">
            Inspect the live public Spice Garden Kitchen menu directly in your own browser.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 flex-1 lg:max-w-2xl">
          <div className="flex items-start gap-2.5">
            <QrCode className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" strokeWidth={1.5} aria-hidden="true" />
            <div>
              <p className="text-sm font-medium text-foreground">Standard QR included</p>
              <p className="text-xs text-muted-foreground">Up to {FREE_PLAN_LIMITS.items} items on Free</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Globe className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" strokeWidth={1.5} aria-hidden="true" />
            <div>
              <p className="text-sm font-medium text-foreground">Browser access only</p>
              <p className="text-xs text-muted-foreground">No guest download required</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <RefreshCw className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" strokeWidth={1.5} aria-hidden="true" />
            <div>
              <a
                href={LIVE_MENU_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent('demo_first_interaction', { source: 'trust_live_link' })}
                className="inline-flex items-center gap-1 text-sm font-medium text-foreground hover:text-primary transition-colors min-h-[44px] sm:min-h-0"
              >
                Spice Garden Kitchen
                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.5} aria-hidden="true" />
              </a>
              <p className="text-xs text-muted-foreground">Live Menuzo customer menu</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

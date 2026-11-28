import { LANDING_PROOF_ITEMS } from '@/data/landingProof';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

export function ProofSection() {
  if (LANDING_PROOF_ITEMS.length === 0) {
    return null;
  }

  return (
    <section id="proof" className="landing-section bg-background border-b border-border">
      <div className="landing-container">
        <div className="max-w-2xl mb-10 sm:mb-12">
          <Badge
            variant="outline"
            className="mb-3 bg-primary/10 text-primary border-primary/20 text-xs font-semibold uppercase tracking-wider"
          >
            Trusted by venues
          </Badge>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
            Built for the way restaurants work.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
                <blockquote className="text-base sm:text-lg text-foreground leading-relaxed">
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
                  <p className="text-sm font-semibold text-foreground truncate">{item.authorName}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {[item.authorRole, item.restaurantName, item.city].filter(Boolean).join(' · ')}
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

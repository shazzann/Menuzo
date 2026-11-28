import { LANDING_PROOF_ITEMS } from '@/data/landingProof';

export function ProofSection() {
  if (LANDING_PROOF_ITEMS.length === 0) {
    return null;
  }

  return (
    <section id="proof" className="landing-section border-b border-[#D2D8CF]">
      <div className="landing-container">
        <div className="max-w-2xl mb-10 sm:mb-12">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#3D4A44] mb-2">
            Trusted by venues
          </p>
          <h2 className="text-2xl sm:text-4xl font-bold text-[#12261F]">
            Built for the way restaurants work.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {LANDING_PROOF_ITEMS.map((item) => (
            <article key={item.id} className="landing-card p-6 bg-white flex flex-col justify-between gap-5">
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
                <blockquote className="landing-serif text-base sm:text-lg text-[#12261F] leading-relaxed">
                  “{item.quote}”
                </blockquote>
              </div>

              <footer className="pt-4 border-t border-[#EAECE6] flex items-center gap-3">
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
                    className="w-10 h-10 rounded-[4px] object-cover shrink-0 border border-[#D2D8CF]"
                  />
                )}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#12261F] truncate">{item.authorName}</p>
                  <p className="text-xs text-[#3D4A44] truncate">
                    {[item.authorRole, item.restaurantName, item.city].filter(Boolean).join(' · ')}
                  </p>
                </div>
              </footer>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

import { Check, X } from 'lucide-react';

const printedBefore = [
  'Reprinting menus whenever ingredient costs or LKR prices shift.',
  'Guests ordering dishes that already sold out in the kitchen.',
  'Sharing scarce physical booklets or managing outdated PDF links.',
];

const menuzoAfter = [
  'Edit prices once in your dashboard so every QR code stays current.',
  'Mark items sold out cleanly while keeping your saved dishes intact.',
  'Every table opens your live menu simultaneously in their browser.',
];

export function ProblemSolutionSection() {
  return (
    <section id="problem" className="landing-section bg-background border-b landing-divider">
      <div className="landing-container">
        <div className="landing-reveal max-w-2xl mb-12 sm:mb-16">
          <span className="landing-rule" aria-hidden="true" />
          <h2 className="landing-h2 text-foreground mb-5">
            Stop reprinting menus for daily kitchen changes
          </h2>
          <p className="landing-lede">
            Replace paper price stickers and crossed-out dishes with a menu your staff and guests can trust.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6 items-stretch">
          <div className="landing-reveal rounded-[1.25rem] border landing-divider landing-paper p-6 sm:p-9 flex flex-col">
            <div className="pb-5 mb-6 border-b landing-divider flex items-center justify-between gap-3">
              <h3 className="text-lg sm:text-xl font-semibold tracking-tight text-muted-foreground">Printed & static menus</h3>
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#C8372D] dark:text-red-400 px-2.5 py-1 rounded-full bg-[#C8372D]/[0.07] dark:bg-red-400/10">Before</span>
            </div>
            <ul className="space-y-5">
              {printedBefore.map((point) => (
                <li key={point} className="flex items-start gap-3.5 text-sm sm:text-base text-muted-foreground leading-relaxed">
                  <span className="mt-0.5 inline-flex items-center justify-center w-5 h-5 rounded-full border landing-divider bg-card shrink-0" aria-hidden="true">
                    <X className="w-3 h-3 text-[#C8372D] dark:text-red-400" strokeWidth={2.25} />
                  </span>
                  <span className="line-through decoration-muted-foreground/25 decoration-1">{point}</span>
                </li>
              ))}
            </ul>
          </div>

          <div
            className="landing-reveal landing-card-raised relative overflow-hidden p-6 sm:p-9 flex flex-col"
            style={{ '--reveal-delay': '120ms' } as React.CSSProperties}
          >
            <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent" aria-hidden="true" />
            <div className="pb-5 mb-6 border-b landing-divider flex items-center justify-between gap-3">
              <h3 className="text-lg sm:text-xl font-semibold tracking-tight text-foreground">With Menuzo</h3>
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#18753F] dark:text-emerald-400 px-2.5 py-1 rounded-full bg-[#18753F]/[0.08] dark:bg-emerald-400/10">After</span>
            </div>
            <ul className="space-y-5">
              {menuzoAfter.map((point) => (
                <li key={point} className="flex items-start gap-3.5 text-sm sm:text-base text-foreground leading-relaxed">
                  <span className="mt-0.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#18753F] dark:bg-emerald-500 shrink-0" aria-hidden="true">
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

import { Check, X } from 'lucide-react';

const printedBefore = [
  'Paying to reprint menus every time ingredient costs or LKR prices shift.',
  'Guests ordering dishes that just sold out in the kitchen.',
  'Waiting for shared paper menus to free up during busy service hours.',
  'Crossing out items by hand or managing outdated static PDF links.',
];

const menuzoAfter = [
  'Change prices and descriptions once and every table QR stays current.',
  'Flip a dish to Sold out so unavailable items are clearly marked for guests.',
  'Every customer scans with their own phone browser with zero waiting.',
  'Organize clean categories, daily specials, and multiple portion prices.',
];

export function ProblemSolutionSection() {
  return (
    <section id="problem" className="landing-section bg-background border-b border-border">
      <div className="landing-container">
        <div className="max-w-2xl mb-10 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground mb-3">
            Stop reprinting menus for small daily changes
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Replace static paper menus and crossed-out price sheets with one live menu your staff and guests can rely on.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* Before: Printed Menus */}
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 flex flex-col">
            <div className="pb-4 mb-5 border-b border-border flex items-center justify-between gap-3">
              <h3 className="text-lg font-medium text-foreground">Printed & static menus</h3>
              <span className="text-xs font-medium text-[#C8372D] dark:text-red-400">Before Menuzo</span>
            </div>
            <ul className="space-y-4">
              {printedBefore.map((point) => (
                <li key={point} className="flex items-start gap-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
                  <X className="w-4 h-4 mt-1 shrink-0 text-[#C8372D] dark:text-red-400" strokeWidth={1.75} aria-hidden="true" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* After: Menuzo Digital Menu (Company Chalkboard #12261F) */}
          <div className="rounded-2xl border border-[#243E35] bg-[#12261F] text-[#F3F5F0] p-6 sm:p-8 flex flex-col">
            <div className="pb-4 mb-5 border-b border-[#243E35] flex items-center justify-between gap-3">
              <h3 className="text-lg font-medium text-white">With Menuzo</h3>
              <span className="text-xs font-medium text-primary">One source of truth</span>
            </div>
            <ul className="space-y-4">
              {menuzoAfter.map((point) => (
                <li key={point} className="flex items-start gap-3 text-sm sm:text-base text-[#D2D8CF] leading-relaxed">
                  <Check className="w-4 h-4 mt-1 shrink-0 text-primary" strokeWidth={2} aria-hidden="true" />
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

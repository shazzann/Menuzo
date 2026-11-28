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
    <section id="problem" className="landing-section bg-background border-b border-border">
      <div className="landing-container">
        <div className="max-w-2xl mb-10 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground mb-3">
            Stop reprinting menus for daily kitchen changes
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Replace paper price stickers and crossed-out dishes with a menu your staff and guests can trust.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 flex flex-col">
            <div className="pb-4 mb-5 border-b border-border flex items-center justify-between gap-3">
              <h3 className="text-lg font-medium text-foreground">Printed & static menus</h3>
              <span className="text-xs font-medium text-[#C8372D] dark:text-red-400">Before</span>
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

          <div className="rounded-2xl border border-primary/35 bg-muted/40 p-6 sm:p-8 flex flex-col">
            <div className="pb-4 mb-5 border-b border-border flex items-center justify-between gap-3">
              <h3 className="text-lg font-medium text-foreground">With Menuzo</h3>
              <span className="text-xs font-medium text-[#18753F] dark:text-emerald-400">After</span>
            </div>
            <ul className="space-y-4">
              {menuzoAfter.map((point) => (
                <li key={point} className="flex items-start gap-3 text-sm sm:text-base text-foreground leading-relaxed">
                  <Check className="w-4 h-4 mt-1 shrink-0 text-[#18753F] dark:text-emerald-400" strokeWidth={2} aria-hidden="true" />
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

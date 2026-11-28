import { Globe, QrCode, UtensilsCrossed } from 'lucide-react';

const steps = [
  {
    number: '01',
    title: 'Build your restaurant menu',
    description: 'Add categories, dish photos, LKR prices, and portion sizes in one dashboard.',
    icon: UtensilsCrossed,
  },
  {
    number: '02',
    title: 'Export your table QR',
    description: 'Choose a preset or custom theme and download a print-ready PNG or SVG code.',
    icon: QrCode,
  },
  {
    number: '03',
    title: 'Serve with one permanent link',
    description: 'Place the code on tables once while menu updates publish online anytime.',
    icon: Globe,
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="landing-section bg-muted/30 border-b border-border">
      <div className="landing-container">
        <div className="max-w-2xl mb-10 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground mb-2">
            From setup to restaurant tables in three steps
          </h2>
          <p className="text-base text-muted-foreground">
            Publish your digital menu once and keep the same QR on every table.
          </p>
        </div>

        <ol className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <li key={step.number} className="pt-5 border-t border-border">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <span className="text-xs font-medium text-muted-foreground tabular-nums">
                    {step.number}
                  </span>
                  <Icon className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} aria-hidden="true" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">{step.title}</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

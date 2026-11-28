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
    <section id="how-it-works" className="landing-section landing-paper border-b landing-divider">
      <div className="landing-container">
        <div className="landing-reveal max-w-2xl mb-12 sm:mb-16">
          <span className="landing-rule" aria-hidden="true" />
          <h2 className="landing-h2 text-foreground mb-5">
            From setup to restaurant tables in three steps
          </h2>
          <p className="landing-lede">
            Publish your digital menu once and keep the same QR on every table.
          </p>
        </div>

        <ol className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 lg:gap-12">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <li
                key={step.number}
                className="landing-reveal landing-step pt-7"
                style={{ '--reveal-delay': `${index * 110}ms` } as React.CSSProperties}
              >
                <div className="flex items-start justify-between gap-3 mb-8">
                  <span className="landing-num text-5xl sm:text-6xl font-medium leading-none text-foreground/20">
                    {step.number}
                  </span>
                  <span className="landing-icon-tile" aria-hidden="true">
                    <Icon className="w-[18px] h-[18px]" strokeWidth={1.5} />
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold tracking-tight text-foreground mb-2.5">{step.title}</h3>
                <p className="text-sm sm:text-[15px] text-muted-foreground leading-relaxed">
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

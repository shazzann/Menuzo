import { Globe, QrCode, UtensilsCrossed } from 'lucide-react';

const steps = [
  {
    number: '01',
    title: 'Create your digital menu',
    description:
      'Add your restaurant profile, menu categories, dish photos, prices, and portion options from one dashboard.',
    icon: UtensilsCrossed,
  },
  {
    number: '02',
    title: 'Generate your QR code',
    description:
      'Pick a preset or custom theme and download a table-ready QR code as PNG or SVG.',
    icon: QrCode,
  },
  {
    number: '03',
    title: 'Let customers scan and browse',
    description:
      'Guests scan the QR code using their mobile browser with no app download needed, and order directly with your staff.',
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
            Publish once, print your QR code once, and keep every dish up to date without reprinting.
          </p>
        </div>

        <ol className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <li
                key={step.number}
                className="rounded-2xl border border-border bg-card p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <span className="text-xs font-medium text-[#C2530A] dark:text-primary tabular-nums">
                      Step {step.number}
                    </span>
                    <Icon className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">{step.title}</h3>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

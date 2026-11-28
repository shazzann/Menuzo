import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

const steps = [
  {
    number: '01',
    title: 'Create your account',
    description: 'Set up your restaurant profile.',
  },
  {
    number: '02',
    title: 'Add your dishes',
    description: 'Add food names, prices, categories, and images.',
  },
  {
    number: '03',
    title: 'Customize your menu',
    description: 'Choose an available theme and prepare your QR code.',
  },
  {
    number: '04',
    title: 'Share your QR code',
    description: 'Download your QR code and place it on restaurant tables.',
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="landing-section bg-background border-b border-border">
      <div className="landing-container">
        <div className="max-w-2xl mb-10 sm:mb-12">
          <Badge
            variant="outline"
            className="mb-3 bg-primary/10 text-primary border-primary/20 text-xs font-semibold uppercase tracking-wider"
          >
            How it works
          </Badge>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
            Your digital menu, ready in a few simple steps.
          </h2>
        </div>

        <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map((step) => (
            <li key={step.number} className="flex">
              <Card className="p-6 rounded-2xl border-border bg-card shadow-xs gap-2.5 w-full">
                <span className="text-xs font-bold tracking-widest text-primary tabular-nums">
                  STEP {step.number}
                </span>
                <h3 className="text-lg font-bold text-foreground">{step.title}</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </Card>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

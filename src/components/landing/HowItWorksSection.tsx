const steps = [
  {
    number: '01',
    title: 'Create your account',
    description: 'Set up your restaurant profile',
  },
  {
    number: '02',
    title: 'Add your dishes',
    description: 'Add food names, prices, categories, and images',
  },
  {
    number: '03',
    title: 'Customize your menu',
    description: 'Choose an available theme and prepare your QR code',
  },
  {
    number: '04',
    title: 'Share your QR code',
    description: 'Download your QR code and place it on restaurant tables',
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="landing-section bg-background border-b border-border">
      <div className="landing-container">
        <div className="max-w-2xl mb-10 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
            Your digital menu, ready in a few simple steps
          </h2>
        </div>

        <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step) => (
            <li key={step.number} className="pt-4 border-t border-border">
              <span className="block text-xs font-medium text-primary tabular-nums mb-3">
                {step.number}
              </span>
              <h3 className="text-base sm:text-lg font-medium text-foreground mb-1.5">
                {step.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

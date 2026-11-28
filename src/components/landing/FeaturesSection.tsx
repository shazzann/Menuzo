import {
  BarChart3,
  FolderKanban,
  QrCode,
  RefreshCw,
  Smartphone,
  ToggleLeft,
} from 'lucide-react';

const benefits = [
  {
    title: 'Instant menu updates',
    description: 'Change prices and dish details without printing new copies',
    icon: RefreshCw,
  },
  {
    title: 'Availability control',
    description: 'Mark a dish as sold out and update what customers see',
    icon: ToggleLeft,
  },
  {
    title: 'No app required',
    description: 'Customers scan and open the menu directly in their browser',
    icon: Smartphone,
  },
  {
    title: 'Flexible menu presentation',
    description: 'Organize dishes into categories and use available customization options',
    icon: FolderKanban,
  },
  {
    title: 'QR code sharing',
    description: 'Use a downloadable QR code to connect customers to your menu',
    icon: QrCode,
  },
  {
    title: 'Menu insights',
    description: 'View menu visits and QR scan activity on plans that support insights',
    icon: BarChart3,
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="landing-section bg-muted/30 border-b border-border">
      <div className="landing-container grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-10 lg:gap-12 items-start">
        <div className="max-w-md">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground mb-3">
            Everything your menu needs. Nothing your customers need to install.
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Built for Sri Lankan cafés and restaurants that want accurate prices and dish availability without reprinting.
          </p>
        </div>

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 border-t border-border pt-6 lg:border-t-0 lg:pt-0">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <div key={benefit.title} className="flex items-start gap-3">
                <div className="w-5 h-5 mt-0.5 shrink-0 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <dt className="text-base font-medium text-foreground mb-1">{benefit.title}</dt>
                  <dd className="text-sm text-muted-foreground leading-relaxed">
                    {benefit.description}
                  </dd>
                </div>
              </div>
            );
          })}
        </dl>
      </div>
    </section>
  );
}

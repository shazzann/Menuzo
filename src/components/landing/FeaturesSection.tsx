import {
  BarChart3,
  FolderKanban,
  QrCode,
  RefreshCw,
  Smartphone,
  ToggleLeft,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

const benefits = [
  {
    title: 'Instant menu updates',
    description: 'Change prices and dish details without printing new copies.',
    icon: RefreshCw,
  },
  {
    title: 'Availability control',
    description: 'Mark a dish as sold out and update what customers see.',
    icon: ToggleLeft,
  },
  {
    title: 'No app required',
    description: 'Customers scan and open the menu directly in their browser.',
    icon: Smartphone,
  },
  {
    title: 'Flexible menu presentation',
    description: 'Organize dishes into categories and use available customization options.',
    icon: FolderKanban,
  },
  {
    title: 'QR code sharing',
    description: 'Use a downloadable QR code to connect customers to your menu.',
    icon: QrCode,
  },
  {
    title: 'Menu insights',
    description: 'View menu visits and QR scan activity on plans that support insights.',
    icon: BarChart3,
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="landing-section bg-muted/30 border-b border-border">
      <div className="landing-container">
        <div className="max-w-2xl mb-10 sm:mb-12">
          <Badge
            variant="outline"
            className="mb-3 bg-primary/10 text-primary border-primary/20 text-xs font-semibold uppercase tracking-wider"
          >
            Benefits
          </Badge>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
            Everything your menu needs. Nothing your customers need to install.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <Card key={benefit.title} className="p-6 rounded-2xl border-border bg-card shadow-xs gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-bold text-foreground">{benefit.title}</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {benefit.description}
                </p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

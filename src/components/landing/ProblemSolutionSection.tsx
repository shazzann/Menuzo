import { AlertCircle, BookOpen, Printer } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

const problems = [
  {
    title: 'Constant reprinting',
    description: 'A simple price change means editing and printing menus again.',
    icon: Printer,
  },
  {
    title: 'Sold-out confusion',
    description: 'Customers may select dishes that are no longer available.',
    icon: AlertCircle,
  },
  {
    title: 'Limited menu copies',
    description: 'Customers may have to wait for a physical menu to become available.',
    icon: BookOpen,
  },
];

export function ProblemSolutionSection() {
  return (
    <section id="problem" className="landing-section bg-muted/30 border-b border-border">
      <div className="landing-container">
        <div className="max-w-2xl mb-10 sm:mb-12">
          <Badge
            variant="outline"
            className="mb-3 bg-primary/10 text-primary border-primary/20 text-xs font-semibold uppercase tracking-wider"
          >
            The problem
          </Badge>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground mb-3">
            Still managing your menu with printed copies?
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Small menu changes can create unnecessary work for restaurant owners.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {problems.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.title} className="p-6 rounded-2xl border-border bg-card shadow-xs gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-bold text-foreground">{item.title}</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

import { AlertCircle, BookOpen, Printer } from 'lucide-react';

const problems = [
  {
    number: '01',
    title: 'Constant reprinting',
    description: 'A simple price change means editing and printing menus again.',
    icon: Printer,
  },
  {
    number: '02',
    title: 'Sold-out confusion',
    description: 'Customers may select dishes that are no longer available.',
    icon: AlertCircle,
  },
  {
    number: '03',
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
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground mb-3">
            Still managing your menu with printed copies?
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Small menu changes can create unnecessary work for restaurant owners.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 border-y border-border divide-y md:divide-y-0 md:divide-x divide-border">
          {problems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="py-6 md:py-8 md:px-6 first:md:pl-0 last:md:pr-0">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <span className="text-xs font-mono text-muted-foreground tabular-nums">
                    {item.number}
                  </span>
                  <Icon className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} aria-hidden="true" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">{item.title}</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

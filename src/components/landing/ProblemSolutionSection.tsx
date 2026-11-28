import { AlertCircle, BookOpen, Printer } from 'lucide-react';

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
    <section id="problem" className="landing-section bg-white border-b border-[#D2D8CF]">
      <div className="landing-container">
        <div className="max-w-2xl mb-10 sm:mb-12">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#3D4A44] mb-2">
            The problem
          </p>
          <h2 className="text-2xl sm:text-4xl font-bold text-[#12261F] mb-3">
            Still managing your menu with printed copies?
          </h2>
          <p className="text-base sm:text-lg text-[#3D4A44] leading-relaxed">
            Small menu changes can create unnecessary work for restaurant owners.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {problems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="landing-card p-6 bg-[#F3F5F0]">
                <div className="w-10 h-10 rounded-[4px] bg-white border border-[#D2D8CF] flex items-center justify-center text-[#12261F] mb-4">
                  <Icon className="w-5 h-5 text-[#F97316]" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-bold text-[#12261F] mb-2">{item.title}</h3>
                <p className="text-sm sm:text-base text-[#3D4A44] leading-relaxed">
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

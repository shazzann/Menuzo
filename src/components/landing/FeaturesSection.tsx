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
    <section id="features" className="landing-section bg-white border-b border-[#D2D8CF]">
      <div className="landing-container">
        <div className="max-w-2xl mb-10 sm:mb-12">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#3D4A44] mb-2">
            Benefits
          </p>
          <h2 className="text-2xl sm:text-4xl font-bold text-[#12261F]">
            Everything your menu needs. Nothing your customers need to install.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <div key={benefit.title} className="landing-card p-6 bg-[#F3F5F0]">
                <div className="w-10 h-10 rounded-[4px] bg-white border border-[#D2D8CF] flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-[#12261F]" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-bold text-[#12261F] mb-2">{benefit.title}</h3>
                <p className="text-sm sm:text-base text-[#3D4A44] leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

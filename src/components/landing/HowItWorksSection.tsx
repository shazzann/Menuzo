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
    <section id="how-it-works" className="landing-section border-b border-[#D2D8CF]">
      <div className="landing-container">
        <div className="max-w-2xl mb-10 sm:mb-12">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#3D4A44] mb-2">
            How it works
          </p>
          <h2 className="text-2xl sm:text-4xl font-bold text-[#12261F]">
            Your digital menu, ready in a few simple steps.
          </h2>
        </div>

        <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map((step) => (
            <li key={step.number} className="landing-card p-6 bg-white flex flex-col">
              <span className="text-xs font-bold tracking-widest text-[#F97316] mb-3 tabular-nums">
                STEP {step.number}
              </span>
              <h3 className="text-lg font-bold text-[#12261F] mb-2">{step.title}</h3>
              <p className="text-sm sm:text-base text-[#3D4A44] leading-relaxed">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

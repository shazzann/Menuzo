import { useState } from 'react';
import { BarChart3, Layout, Smartphone, QrCode, Palette, Store, Settings, MousePointerClick } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function InteractiveProductPreviewSection() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: <Layout className="w-4 h-4" /> },
    { id: 'qr', label: 'QR Generator', icon: <QrCode className="w-4 h-4" /> },
    { id: 'themes', label: 'Themes', icon: <Palette className="w-4 h-4" /> },
    { id: 'menu', label: 'Customer Menu', icon: <Smartphone className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
  ];

  const content: Record<string, { title: string, desc: string, img: string }> = {
    dashboard: {
      title: 'Manage everything in one place',
      desc: 'Add items, update prices, and control your entire menu from a beautiful, lightning-fast dashboard.',
      img: '/food-burger.jpg',
    },
    qr: {
      title: 'Custom QR Codes',
      desc: 'Generate branded QR codes with your colors and logo. Download in print-ready formats.',
      img: '/food-salad.jpg',
    },
    themes: {
      title: 'Beautiful Themes',
      desc: 'Switch the entire look of your menu with one click. Designed to make your food look delicious.',
      img: '/food-steak.jpg',
    },
    menu: {
      title: 'App-like Experience',
      desc: 'Your customers get a seamless, native-feeling menu right in their browser. No downloads required.',
      img: '/food-pasta.jpg',
    },
    analytics: {
      title: 'Actionable Insights',
      desc: 'See exactly what your customers are looking at, what they love, and when they visit.',
      img: '/food-poke.jpg',
    },
  };

  return (
    <section id="product-preview" className="py-24 px-4 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Powerful yet simple</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Everything you need to run your digital menu, wrapped in an interface you will actually enjoy using.
          </p>
        </div>

        <div className="bg-card border border-border rounded-[2rem] p-4 md:p-8 shadow-xl">
          {/* Tabs */}
          <div className="flex overflow-x-auto pb-4 mb-4 md:mb-8 gap-2 scrollbar-hide">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full whitespace-nowrap font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="grid md:grid-cols-2 gap-8 items-center min-h-[400px]">
            <div className="order-2 md:order-1 animate-fade-in-up" key={activeTab}>
              <h3 className="text-3xl font-bold mb-4">{content[activeTab].title}</h3>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                {content[activeTab].desc}
              </p>
              <Button className="rounded-xl px-6" variant="outline">
                Explore feature
              </Button>
            </div>
            <div className="order-1 md:order-2">
              <div className="relative aspect-video md:aspect-[4/3] rounded-2xl overflow-hidden border border-border shadow-2xl bg-muted animate-fade-in-up" key={activeTab + 'img'}>
                <img src={content[activeTab].img} alt={content[activeTab].title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-2xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function QRShowcaseSection() {
  return (
    <section className="py-24 px-4 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative">
            {/* The QR display */}
            <div className="aspect-square max-w-md mx-auto rounded-[3rem] bg-gradient-to-tr from-primary/10 to-orange-500/10 p-8 md:p-12 border border-border shadow-2xl flex items-center justify-center relative">
               <div className="bg-white p-8 rounded-3xl shadow-xl w-full h-full flex flex-col items-center justify-center relative z-10 border-4 border-primary">
                 <QrCode className="w-32 h-32 text-black mb-4" />
                 <div className="w-12 h-12 bg-primary rounded-lg absolute flex items-center justify-center">
                    <Store className="w-6 h-6 text-white" />
                 </div>
               </div>
            </div>
          </div>

          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-primary mb-2 block">
              QR Customization
            </span>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Make it yours.</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Don't settle for generic black-and-white squares. Customize your QR code with your brand colors, logo, and unique patterns.
            </p>

            <div className="space-y-6">
              {[
                { title: 'Brand Colors', desc: 'Match your QR to your exact hex codes.' },
                { title: 'Logo Integration', desc: 'Place your restaurant logo right in the center.' },
                { title: 'Frame Styles', desc: 'Add "Scan to View Menu" frames automatically.' }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-2xl bg-card border border-border/50 hover:border-primary/50 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Settings className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">{item.title}</h4>
                    <p className="text-muted-foreground text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function AnalyticsSection() {
  return (
    <section className="py-24 px-4 bg-card/30 border-y border-border/50">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1">
            <span className="text-xs font-mono uppercase tracking-wider text-primary mb-2 block">
              Analytics
            </span>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Know what sells.</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Get real-time insights into exactly how your menu is performing. Stop guessing and start optimizing your offerings.
            </p>
            <ul className="space-y-4 mb-8">
              {[
                'Track daily QR scans and menu views',
                'Identify your most popular dishes',
                'Monitor peak visiting hours',
                'See how many customers click to call or find directions'
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-muted-foreground font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="order-1 lg:order-2">
            <div className="relative rounded-[2rem] bg-card border border-border shadow-2xl p-6">
               <div className="flex items-center justify-between mb-8">
                 <h3 className="font-semibold text-lg">Menu Performance</h3>
                 <span className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-xs font-semibold">+12% this week</span>
               </div>
               <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="p-4 rounded-xl bg-muted/50 border border-border">
                    <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2"><MousePointerClick className="w-4 h-4" /> Views</p>
                    <p className="text-3xl font-bold">1,248</p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/50 border border-border">
                    <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2"><QrCode className="w-4 h-4" /> Scans</p>
                    <p className="text-3xl font-bold">892</p>
                  </div>
               </div>
               
               <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Top Items</h4>
                  {[
                    { name: 'Spicy Burger', views: 342, perc: '78%' },
                    { name: 'Truffle Fries', views: 215, perc: '54%' },
                    { name: 'Craft Cola', views: 189, perc: '42%' }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                       <span className="font-medium">{item.name}</span>
                       <div className="flex items-center gap-4 w-1/2">
                         <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                           <div className="h-full bg-primary rounded-full" style={{ width: item.perc }} />
                         </div>
                         <span className="text-sm text-muted-foreground w-8 text-right">{item.views}</span>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import { CheckCircle2 } from 'lucide-react';

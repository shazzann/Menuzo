import { ArrowLeft, ArrowRight, Store, QrCode as QrIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/store';
import { QRCodeSVG } from 'qrcode.react';

export function DemoPage() {
  const { dispatch } = useApp();

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col">
      {/* Header */}
      <header className="h-16 bg-background border-b border-border px-6 flex items-center justify-between sticky top-0 z-50">
        <Button variant="ghost" onClick={() => dispatch({ type: 'SET_VIEW', payload: 'landing' })} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Button>
        <div className="font-bold text-xl tracking-tight text-primary">Menuzo</div>
        <Button onClick={() => dispatch({ type: 'SET_VIEW', payload: 'signup' })} className="rounded-full shadow-md hover:-translate-y-0.5 transition-transform">
          Create Your Menu <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </header>

      {/* Main Demo Area */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 grid lg:grid-cols-2 gap-8 items-center">
        
        {/* Left Side: Info & QR */}
        <div className="space-y-8">
          <div>
            <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider rounded-full mb-4">Live Product Demo</span>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">The Spice Garden</h1>
            <p className="text-xl text-muted-foreground">Interact with the menu exactly as a customer would on their own device.</p>
          </div>

          <div className="bg-card p-6 rounded-3xl border border-border/50 shadow-sm flex items-center gap-6 max-w-md">
            <div className="w-32 h-32 bg-white rounded-2xl p-2 shadow-inner border-2 border-primary overflow-hidden shrink-0">
               <QRCodeSVG 
                 value={import.meta.env.VITE_MENU_DEMO_URL || "https://menuzo-six.vercel.app/menuzo/menu"}
                 size={120}
                 fgColor="#f97316"
                 bgColor="transparent"
                 level="H"
                 style={{ width: "100%", height: "100%" }}
               />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1 flex items-center gap-2"><QrIcon className="w-4 h-4 text-primary" /> Scan to view</h3>
              <p className="text-sm text-muted-foreground mb-3">Open your phone camera and point it here.</p>
              <Button size="sm" variant="outline" className="w-full">Share Link</Button>
            </div>
          </div>
          
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6">
            <h4 className="font-bold mb-2 flex items-center gap-2"><Store className="w-5 h-5 text-primary" /> Try these features:</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Click through the food categories</li>
              <li>• View the photo gallery for an item</li>
              <li>• Read the rich item descriptions</li>
              <li>• Tap the contact or location buttons</li>
            </ul>
          </div>
        </div>

        {/* Right Side: Phone Mockup */}
        <div className="flex justify-center lg:justify-end">
           <div className="relative w-[340px] h-[720px] bg-black rounded-[3rem] p-3 shadow-2xl shadow-primary/20 border-4 border-muted">
             {/* Notch */}
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-black rounded-b-3xl z-30" />
             
             {/* Screen */}
             <div className="w-full h-full bg-background rounded-[2.25rem] overflow-hidden relative">
               <iframe 
                 src={import.meta.env.VITE_MENU_DEMO_URL || "https://menuzo-six.vercel.app/menuzo/menu"}
                 className="w-full h-full border-none"
                 title="Menuzo Demo Menu"
               />
             </div>
           </div>
        </div>

      </div>
    </div>
  );
}

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Store, Phone, MapPin, CheckCircle2, ChevronRight, Upload, Clock, Loader2 } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';
import { QRCodeSVG } from 'qrcode.react';

const STEPS = ['Restaurant Info', 'Business Details', 'First Category', 'First Menu Item', 'Generate QR'];

export function OnboardingPage() {
  const { dispatch, state } = useApp();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // Data States
  const [info, setInfo] = useState({ description: '' });
  const [business, setBusiness] = useState({ phone: '', address: '', hours: '9:00 AM - 10:00 PM' });
  const [category, setCategory] = useState({ name: 'Main Course' });
  const [food, setFood] = useState({ name: '', price: '', description: '' });

  const handleNext = () => {
    if (currentStep === 0) trackEvent('onboarding_started');
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      finishOnboarding();
    }
  };

  const finishOnboarding = async () => {
    setLoading(true);
    // Simulate Supabase insert of all these details
    setTimeout(() => {
      setLoading(false);
      trackEvent('qr_generated');
      trackEvent('menu_published');
      
      // We will inject the new food item into state for the dashboard checklist to show completion
      dispatch({
        type: 'SET_FOOD_ITEMS',
        payload: [{
          id: 'food-1',
          name: food.name || 'Sample Burger',
          description: food.description || 'Delicious meal.',
          category: category.name,
          image: '/food-burger.jpg',
          originalPrice: parseFloat(food.price) || 12.99,
          finalPrice: parseFloat(food.price) || 12.99,
          isSpecialOffer: false,
          isAvailable: true,
          tagline: 'Chef Recommended'
        }]
      });

      dispatch({ type: 'SET_VIEW', payload: 'user-dashboard' });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-muted/20 py-12 px-4 flex flex-col items-center">
      <div className="w-full max-w-3xl mb-8 flex items-center justify-between">
        <div className="font-bold text-2xl text-primary">Menuzo Setup</div>
        <div className="text-sm font-medium text-muted-foreground">Step {currentStep + 1} of {STEPS.length}</div>
      </div>

      <div className="w-full max-w-3xl bg-card border border-border shadow-xl rounded-3xl p-8 md:p-12">
        <div className="flex gap-2 mb-12">
          {STEPS.map((_, idx) => (
            <div key={idx} className={`h-2 flex-1 rounded-full transition-colors ${idx <= currentStep ? 'bg-primary' : 'bg-muted'}`} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="min-h-[400px]"
          >
            {currentStep === 0 && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold flex items-center gap-3"><Store className="w-8 h-8 text-primary" /> Welcome, let's setup {state.shop?.name || 'your restaurant'}</h2>
                <p className="text-muted-foreground">Add some basic details about your brand.</p>
                
                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="w-32 h-32 rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/50 cursor-pointer transition-colors">
                    <Upload className="w-8 h-8 mb-2 text-primary" />
                    <span className="text-xs font-semibold">Upload Logo</span>
                  </div>
                  <div className="flex-1">
                     <Textarea 
                       placeholder="Short description of your restaurant (e.g. Authentic Italian dining in the heart of the city)" 
                       className="min-h-[128px] resize-none"
                       value={info.description}
                       onChange={e => setInfo({...info, description: e.target.value})}
                     />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold">Business Details</h2>
                <p className="text-muted-foreground">How can customers reach you?</p>
                <div className="space-y-4">
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input placeholder="Phone Number" className="pl-12 h-14 text-lg" value={business.phone} onChange={e => setBusiness({...business, phone: e.target.value})} />
                  </div>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input placeholder="Full Address" className="pl-12 h-14 text-lg" value={business.address} onChange={e => setBusiness({...business, address: e.target.value})} />
                  </div>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input placeholder="Opening Hours (e.g. 9AM - 10PM)" className="pl-12 h-14 text-lg" value={business.hours} onChange={e => setBusiness({...business, hours: e.target.value})} />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold">Create First Category</h2>
                <p className="text-muted-foreground">Menus are broken into categories like Starters, Mains, or Drinks.</p>
                <div className="space-y-4">
                  <Input placeholder="Category Name" className="h-14 text-lg" value={category.name} onChange={e => setCategory({name: e.target.value})} />
                  <div className="flex gap-2 flex-wrap mt-4">
                    {['Starters', 'Main Course', 'Desserts', 'Beverages'].map(suggested => (
                      <Button key={suggested} variant="outline" size="sm" onClick={() => setCategory({name: suggested})}>{suggested}</Button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold">Add First Menu Item</h2>
                <p className="text-muted-foreground">Let's add something delicious to {category.name}.</p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="aspect-square bg-muted/30 rounded-3xl border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/50 cursor-pointer">
                    <Upload className="w-8 h-8 mb-2 text-primary" />
                    <span className="font-semibold">Upload Food Photo</span>
                  </div>
                  <div className="space-y-4">
                    <Input placeholder="Item Name (e.g. Truffle Pasta)" className="h-14 text-lg" value={food.name} onChange={e => setFood({...food, name: e.target.value})} />
                    <Input type="number" placeholder="Price ($)" className="h-14 text-lg" value={food.price} onChange={e => setFood({...food, price: e.target.value})} />
                    <Textarea placeholder="Description..." className="resize-none" rows={3} value={food.description} onChange={e => setFood({...food, description: e.target.value})} />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-8 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-2">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold mb-2">You're ready to go!</h2>
                  <p className="text-muted-foreground">Here is your unique restaurant QR code.</p>
                </div>
                
                <div className="bg-white p-6 rounded-3xl shadow-xl border-4 border-primary inline-block">
                  <QRCodeSVG 
                    value={`https://menuzo.app/${state.shop.username}/menu`}
                    size={200}
                    fgColor="#000000"
                    bgColor="transparent"
                  />
                </div>
                
                <p className="text-sm font-mono bg-muted px-4 py-2 rounded-lg">menuzo.app/{state.shop.username || 'your-shop'}/menu</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-12 flex justify-end pt-6 border-t border-border">
          <Button size="lg" className="h-14 px-8 text-lg rounded-xl font-bold" onClick={handleNext} disabled={loading}>
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : currentStep === STEPS.length - 1 ? 'Go to Dashboard' : 'Continue'}
            {!loading && <ChevronRight className="w-5 h-5 ml-2" />}
          </Button>
        </div>
      </div>
    </div>
  );
}

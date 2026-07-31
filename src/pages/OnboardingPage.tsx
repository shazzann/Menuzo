import { useState } from 'react';
import { useApp } from '@/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Store, Loader2, User, ChevronRight, ArrowLeft } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';
import { RestaurantService } from '@/services/restaurant.service';
import { toast } from 'sonner';

export function OnboardingPage() {
  const { dispatch, state } = useApp();
  const [loading, setLoading] = useState(false);
  const [basicInfo, setBasicInfo] = useState({ restaurantName: '', ownerName: '' });

  const handleNext = async () => {
    trackEvent('onboarding_started');
    if (!basicInfo.restaurantName || !basicInfo.ownerName) {
      toast.error('Please enter restaurant and owner names.');
      return;
    }
    setLoading(true);
    try {
      const sanitizedShopName = basicInfo.restaurantName.toLowerCase().replace(/[^a-z0-9]/g, '');
      const randomTwoDigits = Math.floor(10 + Math.random() * 90);
      const generatedUsername = `${sanitizedShopName}${randomTwoDigits}`;
      
      const shopData = await RestaurantService.createRestaurant(
        state.user!.id,
        basicInfo.restaurantName,
        state.user!.email,
        generatedUsername
      );
      
      dispatch({
         type: 'UPDATE_SHOP',
         payload: {
           id: shopData.id,
           username: generatedUsername,
           name: basicInfo.restaurantName,
           isOpen: true,
           email: state.user!.email,
           tagline: '',
           description: '',
           location: '',
           contactNumber: '',
           logo: '',
           banner: '',
           openingHours: [],
           socialLinks: { instagram: '', facebook: '', website: '' },
           categoryOrder: []
         }
      });
      
      trackEvent('restaurant_created');
      dispatch({ type: 'SET_VIEW', payload: 'admin-shop-details' });
    } catch (err: any) {
      toast.error(`Error creating shop: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/20 py-12 px-4 flex flex-col items-center justify-center relative">
      <div className="absolute top-6 left-6">
        <Button variant="ghost" onClick={() => window.location.href = '/'} className="gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Button>
      </div>
      <div className="w-full max-w-3xl bg-card border border-border shadow-xl rounded-3xl p-8 md:p-12">
        <div className="space-y-6">
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <Store className="w-8 h-8 text-primary" /> 
            Welcome to Menuzo
          </h2>
          <p className="text-muted-foreground">Let's start by getting your restaurant's name.</p>
          
          <div className="space-y-4 pt-4">
            <div className="relative">
              <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input 
                required
                placeholder="Restaurant Name" 
                className="pl-12 h-14 text-lg"
                value={basicInfo.restaurantName}
                onChange={(e) => setBasicInfo({...basicInfo, restaurantName: e.target.value})}
              />
            </div>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input 
                required
                placeholder="Owner Name" 
                className="pl-12 h-14 text-lg"
                value={basicInfo.ownerName}
                onChange={(e) => setBasicInfo({...basicInfo, ownerName: e.target.value})}
              />
            </div>
          </div>
        </div>

        <div className="mt-12 flex justify-end pt-6 border-t border-border">
          <Button size="lg" className="h-14 px-8 text-lg rounded-xl font-bold" onClick={handleNext} disabled={loading}>
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Continue'}
            {!loading && <ChevronRight className="w-5 h-5 ml-2" />}
          </Button>
        </div>
      </div>
    </div>
  );
}

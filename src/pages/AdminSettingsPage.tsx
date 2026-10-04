import { useState } from 'react';
import { ArrowLeft, ChevronRight, Store, Paintbrush, QrCode, Shield, CreditCard, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/store';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export function AdminSettingsPage() {
  const { dispatch } = useApp();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      dispatch({ type: 'LOGOUT' });
    } catch {
      toast.error('Could not log out. Please try again.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const settingsCards = [
    {
      id: 'admin-shop-details',
      title: 'Shop Details',
      description: 'Update your shop name, description, location, and social links',
      icon: Store,
    },
    {
      id: 'admin-theme',
      title: 'Theme Customization',
      description: 'Change colors and styles for your menu',
      icon: Paintbrush,
    },
    {
      id: 'admin-qr',
      title: 'QR Customization',
      description: 'Style your QR code with custom colors and shapes',
      icon: QrCode,
    },
    {
      id: 'admin-subscription',
      title: 'Subscription & Payments',
      description: 'Choose Pro, submit a bank payment, and track verification',
      icon: CreditCard,
    },
    {
      id: 'admin-security',
      title: 'Security',
      description: 'Manage your password and account settings',
      icon: Shield,
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="flex items-center gap-2 px-4 py-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => dispatch({ type: 'SET_VIEW', payload: 'user-dashboard' })}
            className="text-muted-foreground hover:text-foreground -ml-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-semibold text-lg">Settings</h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 space-y-4 max-w-md mx-auto">
        {settingsCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              role="button"
              tabIndex={0}
              onClick={() => dispatch({ type: 'SET_VIEW', payload: card.id as any })}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  dispatch({ type: 'SET_VIEW', payload: card.id as any });
                }
              }}
              className="w-full flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted border border-border/50 hover:border-border transition-all group text-left cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-background border border-border flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{card.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                    {card.description}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
            </div>
          );
        })}
        <div className="pt-4">
          <Button
            variant="outline"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="w-4 h-4 mr-2" />
            {isLoggingOut ? 'Logging out…' : 'Log Out'}
          </Button>
        </div>
        <div className="flex justify-center pt-6 pb-2">
          <img src="/logo/Logo main4tight.png" alt="Menuzo" className="h-12 w-auto max-w-full object-contain dark:hidden" />
          <img src="/logo/Logo main4dark.png" alt="Menuzo" className="hidden h-12 w-auto max-w-full object-contain dark:block" />
        </div>
      </div>
    </div>
  );
}

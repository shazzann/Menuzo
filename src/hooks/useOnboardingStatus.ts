import { useApp } from '@/store';
import { hasGeneratedQr } from '@/lib/qrProgress';

export function useOnboardingStatus() {
  const { state } = useApp();

  const hasRestaurant = !!state.shop?.name && state.shop.name !== 'My Kitchen' && state.shop.name !== 'My Awesome Shop';
  const hasTheme = !!state.shop?.theme;
  const hasFood = state.foodItems && state.foodItems.length > 0;
  const hasGeneratedQR = hasGeneratedQr(state.shop);
  
  // For the sake of MVP dashboard empty state:
  const steps = [
    { label: 'Restaurant created', completed: hasRestaurant, view: 'admin-settings' },
    { label: 'Theme selected', completed: hasTheme, view: 'admin-theme' },
    { label: 'Add first menu item', completed: hasFood, view: 'admin-add-food' },
    { label: 'Generate QR', completed: hasGeneratedQR, view: 'admin-qr' } 
  ] as const;
  
  const completedCount = steps.filter(s => s.completed).length;
  return { steps, completedCount, isComplete: completedCount === steps.length };
}

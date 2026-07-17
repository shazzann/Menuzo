import { useApp } from '@/store';
import { trackEvent } from './analytics';
import { toast } from 'sonner';

export const loadDemoRestaurant = (dispatch: ReturnType<typeof useApp>['dispatch']) => {
  try {
    const demoShop = {
      username: 'the-spice-garden',
      name: 'The Spice Garden',
      tagline: 'Authentic flavors, modern experience.',
      description: 'Experience the best of Sri Lankan spices in a modern setting. All our ingredients are sourced locally to bring you the most authentic taste.',
      logo: '/logo/Logo favicon.png', // Fallback to app logo
      banner: '/food-burger.jpg', // Fallback to sample image
      location: '123 Spice Lane, Colombo 03',
      openingHours: [
        { type: 'regular', dayOfWeek: 1, isOpen: true, openTime: '11:00', closeTime: '22:00' },
        { type: 'regular', dayOfWeek: 2, isOpen: true, openTime: '11:00', closeTime: '22:00' },
        { type: 'regular', dayOfWeek: 3, isOpen: true, openTime: '11:00', closeTime: '22:00' },
        { type: 'regular', dayOfWeek: 4, isOpen: true, openTime: '11:00', closeTime: '22:00' },
        { type: 'regular', dayOfWeek: 5, isOpen: true, openTime: '11:00', closeTime: '22:00' },
        { type: 'regular', dayOfWeek: 6, isOpen: true, openTime: '09:00', closeTime: '23:00' },
        { type: 'regular', dayOfWeek: 0, isOpen: true, openTime: '09:00', closeTime: '23:00' }
      ] as any, // Bypass full validation for demo shop
      contactNumber: '+94 11 234 5678',
      email: 'hello@thespicegarden.lk',
      isOpen: true,
      theme: { primary: '#f97316', secondary: '#1c1917', accent: '#f97316', qrStyle: 'brand' }
    };

    const categories = [
      { id: 'cat-1', name: 'Starters' },
      { id: 'cat-2', name: 'Mains' },
      { id: 'cat-3', name: 'Desserts' },
    ];

    const foodItems = [
      {
        id: 'food-1', name: 'Hot Butter Cuttlefish', price: 1250, description: 'Crispy cuttlefish tossed in hot butter and chili.', category: 'Starters', image: '/food-burger.jpg', originalPrice: 1250, finalPrice: 1250, isSpecialOffer: false, isAvailable: true, tagline: 'Crowd Favorite'
      },
      {
        id: 'food-2', name: 'Vegetable Spring Rolls', price: 650, description: 'Crispy rolls with sweet chili dip.', category: 'Starters', image: '/food-burger.jpg', originalPrice: 650, finalPrice: 650, isSpecialOffer: false, isAvailable: true, tagline: 'Vegan'
      },
      {
        id: 'food-3', name: 'Chicken Kottu', price: 950, description: 'Classic Sri Lankan street food with chopped roti and chicken.', category: 'Mains', image: '/food-burger.jpg', originalPrice: 1100, finalPrice: 950, discount: 150, isSpecialOffer: true, isAvailable: true, tagline: 'Spicy'
      },
      {
        id: 'food-4', name: 'Black Pork Curry', price: 1400, description: 'Slow cooked pork in dark roasted spices.', category: 'Mains', image: '/food-burger.jpg', originalPrice: 1400, finalPrice: 1400, isSpecialOffer: false, isAvailable: true, tagline: 'Signature Dish'
      },
      {
        id: 'food-5', name: 'Watalappan', price: 500, description: 'Traditional coconut custard pudding with jaggery.', category: 'Desserts', image: '/food-burger.jpg', originalPrice: 500, finalPrice: 500, isSpecialOffer: false, isAvailable: true, tagline: 'Sweet'
      }
    ];

    dispatch({ type: 'UPDATE_SHOP', payload: demoShop });
    dispatch({ type: 'SET_CATEGORIES', payload: categories });
    dispatch({ type: 'SET_FOOD_ITEMS', payload: foodItems as any });

    trackEvent('demo_restaurant_loaded');
    toast.success('Demo restaurant loaded successfully!');
  } catch (e) {
    console.error(e);
    toast.error('Failed to load demo data.');
  }
};

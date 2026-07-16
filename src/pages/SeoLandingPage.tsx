import { LandingPage } from './LandingPage';
import { useApp } from '@/store';
import { useEffect } from 'react';

// For MVP, we will render the main LandingPage but update document head for SEO.
// In a full Next.js/SSR app, this would be a real page component with distinct H1s.

const SEO_CONTENT = {
  'seo-qr-menu': {
    title: 'Menuzo | QR Menu for Restaurants',
    description: 'Create beautiful, contactless QR menus for your restaurant. Update items instantly and give customers a modern dining experience.',
    h1: 'The Best QR Menu for Restaurants',
  },
  'seo-digital-menu': {
    title: 'Menuzo | Digital Restaurant Menus',
    description: 'Replace your printed menus with a stunning digital restaurant menu. Boost sales with photos and instant updates.',
    h1: 'Digital Restaurant Menus Made Simple',
  },
  'seo-restaurant-menu': {
    title: 'Menuzo | Modern Restaurant Menu Solution',
    description: 'The complete digital menu solution for modern restaurants. Manage food items, pricing, and QR codes from one dashboard.',
    h1: 'Modern Restaurant Menu Solution',
  }
};

export function SeoLandingPage() {
  const { state } = useApp();
  const currentSeoKey = state.currentView as keyof typeof SEO_CONTENT;
  
  useEffect(() => {
    if (SEO_CONTENT[currentSeoKey]) {
      document.title = SEO_CONTENT[currentSeoKey].title;
      
      let metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', SEO_CONTENT[currentSeoKey].description);
      }
    }
  }, [currentSeoKey]);

  // We return the same optimized LandingPage. 
  // It handles its own conversion sections.
  return <LandingPage />;
}

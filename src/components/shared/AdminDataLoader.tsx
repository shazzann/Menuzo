import { useEffect, useRef } from 'react';
import { useApp } from '@/store';
import { RestaurantService, MenuService } from '@/services';
import { filterExpiredSpecialDates } from '@/lib/timeUtils';
import type { Shop, FoodItem } from '@/types';

export function AdminDataLoader() {
  const { state, dispatch } = useApp();
  const { user, currentView } = state;
  const loadedUserId = useRef('');

  useEffect(() => {
    if (!user?.id) {
      loadedUserId.current = '';
      return;
    }

    // Company admins do not need a restaurant to access the platform portal.
    if (currentView === 'company-admin-login' || currentView === 'company-admin') return;

    // Load if user is logged in
    if (user.id === 'google-auth-bypass-id' || user.id === 'user-1') return;
    
    // If we already loaded data for this user, skip
    if (loadedUserId.current === user.id) return;

    let isCancelled = false;

    async function loadData() {
      try {
        let shopData = await RestaurantService.getRestaurantByUserId(user!.id);

        if (isCancelled) return;

        if (!shopData) {
          loadedUserId.current = user!.id;
          if (currentView !== 'onboarding') {
            dispatch({ type: 'SET_VIEW', payload: 'onboarding' });
          }
          return;
        }

        if (shopData) {
          const dailyStats = await RestaurantService.getShopDailyStats(shopData.id);

          if (isCancelled) return;

          const rawOpeningHours = Array.isArray((shopData as any).opening_hours) ? (shopData as any).opening_hours : [];
          const activeOpeningHours = filterExpiredSpecialDates(rawOpeningHours);

          // Automatically delete expired special dates from the database if any have passed
          if (activeOpeningHours.length !== rawOpeningHours.length && shopData.id) {
            RestaurantService.updateRestaurant(shopData.id, { opening_hours: activeOpeningHours as any }).catch(err => {
              console.error('Failed to clean up expired special dates:', err);
            });
          }

          const formattedShop: Shop = {
            id: shopData.id,
            username: shopData.username || `menuzo${Math.floor(100 + Math.random() * 900)}`,
            name: shopData.name,
            tagline: shopData.tagline || '',
            description: shopData.description || '',
            location: shopData.location || '',
            contactNumber: shopData.contact_number || '',
            contacts: (shopData.contacts as any) || [],
            email: shopData.email || '',
            isOpen: !!shopData.is_open,
            logo: shopData.logo || '',
            banner: shopData.banner || '',
            theme: (shopData.theme as any) || undefined,
            openingHours: activeOpeningHours,
            socialLinks: {
              instagram: shopData.instagram || '',
              facebook: shopData.facebook || '',
              website: shopData.website || '',
            },
            categoryOrder: shopData.category_order || undefined,
            view_count: shopData.view_count || 0,
            qr_scan_count: shopData.qr_scan_count || 0,
            daily_stats: dailyStats || [],
          };
          dispatch({ type: 'UPDATE_SHOP', payload: formattedShop });

          const foodData = await MenuService.getMenuByShopId(shopData.id);

          if (isCancelled) return;

          if (foodData) {
            const formattedFood: FoodItem[] = foodData.map(item => ({
              id: item.id,
              name: item.name,
              description: item.description || '',
              tagline: item.tagline || '',
              category: item.category || 'unassigned',
              image: item.image || '/food-burger.jpg',
              originalPrice: Number(item.original_price),
              discount: Number(item.discount),
              finalPrice: Number(item.final_price),
              isSpecialOffer: !!item.is_special_offer,
              isAvailable: !!item.is_available,
            }));
            dispatch({ type: 'SET_FOOD_ITEMS', payload: formattedFood });
          }
          loadedUserId.current = user!.id;
        }
      } catch (err) {
        console.error("Error loading admin dashboard data:", err);
      }
    }

    loadData();

    // Ignore results from an earlier page or session, including onboarding redirects.
    return () => {
      isCancelled = true;
    };
  }, [user?.id, currentView, dispatch]);

  return null;
}

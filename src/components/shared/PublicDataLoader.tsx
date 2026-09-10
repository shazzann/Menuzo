import { useEffect, useState } from 'react';
import { useApp } from '@/store';
import { RestaurantService, MenuService } from '@/services';
import { filterExpiredSpecialDates } from '@/lib/timeUtils';
import type { Shop, FoodItem } from '@/types';

export function PublicDataLoader() {
  const { state, dispatch } = useApp();
  const { shop, currentView } = state;
  const [loadingUsername, setLoadingUsername] = useState('');

  useEffect(() => {
    // Only load if we are on a customer view
    const isCustomerView = currentView === 'customer-menu' || currentView === 'customer-shop-detail' || currentView === 'customer-food-detail';
    
    if (!isCustomerView) return;
    if (!shop.username) return;
    
    // If we already have real data for this shop, skip
    if (shop.id && shop.id !== 'shop-1' && loadingUsername === shop.username) return;

    let isCancelled = false;

    async function loadData() {
      try {
        setLoadingUsername(shop.username);
        
        const shopData = await RestaurantService.getRestaurantByUsername(shop.username);

        if (isCancelled) return;

        if (shopData) {
          dispatch({ type: 'SET_SHOP_NOT_FOUND', payload: false });
          const formattedShop: Shop = {
            id: shopData.id,
            name: shopData.name,
            tagline: shopData.tagline || '',
            description: shopData.description || '',
            location: shopData.location || '',
            contactNumber: shopData.contact_number || '',
            contacts: (shopData.contacts as any) || [],
            theme: (shopData.theme as any) || undefined,
            email: shopData.email || '',
            isOpen: !!shopData.is_open,
            logo: shopData.logo || '',
            banner: shopData.banner || '',
            username: shop.username,
            openingHours: filterExpiredSpecialDates(Array.isArray((shopData as any).opening_hours) ? (shopData as any).opening_hours : []),
            socialLinks: {
              instagram: shopData.instagram || '',
              facebook: shopData.facebook || '',
              website: shopData.website || '',
            },
            categoryOrder: shopData.category_order || undefined,
            view_count: shopData.view_count || 0,
            qr_scan_count: shopData.qr_scan_count || 0,
            plan: (shopData as any).plan || 'free',
          };
          dispatch({ type: 'UPDATE_SHOP', payload: formattedShop });

          const foodData = await MenuService.getMenuByShopId(shopData.id);

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

            // Check if we are deeply linked to a food item
            const pathParts = window.location.pathname.split('/').filter(Boolean);
            if (pathParts[1] === 'food' && pathParts[2]) {
               const deepLinkedFoodId = pathParts[2];
               const foodToSelect = formattedFood.find(f => f.id === deepLinkedFoodId);
               if (foodToSelect) {
                 dispatch({ type: 'SELECT_FOOD_ITEM', payload: foodToSelect });
               }
            }
          }
        } else {
          dispatch({ type: 'SET_SHOP_NOT_FOUND', payload: true });
        }
      } catch (err) {
        console.error("Error loading public shop data:", err);
      }
    }

    loadData();

    return () => {
      isCancelled = true;
    };
  }, [shop.username, currentView, shop.id, loadingUsername, dispatch]);

  return null;
}

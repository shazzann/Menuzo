import { useEffect, useState } from 'react';
import { useApp } from '@/store';
import { supabase } from '@/lib/supabase';
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

    async function loadData() {
      try {
        setLoadingUsername(shop.username);
        
        // Fetch Shop (currently fetches first shop since username column doesn't exist in DB schema yet)
        const { data: shopData, error: shopError } = await supabase
          .from('shops')
          .select('*')
          .limit(1)
          .single();
          
        if (shopError) {
          console.error("Supabase shops fetch error:", shopError);
        }

        if (shopData) {
          const formattedShop: Shop = {
            id: shopData.id,
            name: shopData.name,
            tagline: shopData.tagline || '',
            description: shopData.description || '',
            location: shopData.location || '',
            contactNumber: shopData.contact_number || '',
            email: shopData.email || '',
            isOpen: shopData.is_open,
            logo: shopData.logo || '',
            banner: shopData.banner || '',
            username: shopData.username || shop.username,
            openingHours: [
              { day: 'Monday - Saturday', hours: '10:00 AM - 10:00 PM' } // Mocked for now, same as dashboard
            ],
            socialLinks: {
              instagram: shopData.instagram || '',
              facebook: shopData.facebook || '',
              website: shopData.website || '',
            }
          };
          dispatch({ type: 'UPDATE_SHOP', payload: formattedShop });


          // Fetch Food Items
          const { data: foodData } = await supabase
            .from('food_items')
            .select('*')
            .eq('shop_id', shopData.id);

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
              isSpecialOffer: item.is_special_offer,
              isAvailable: item.is_available,
            }));
            dispatch({ type: 'SET_FOOD_ITEMS', payload: formattedFood });
          }
        }
      } catch (err) {
        console.error("Error loading public shop data:", err);
      }
    }

    loadData();
  }, [shop.username, currentView, shop.id, loadingUsername, dispatch]);

  return null;
}

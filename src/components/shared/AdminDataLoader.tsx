import { useEffect, useState } from 'react';
import { useApp } from '@/store';
import { supabase } from '@/lib/supabase';
import type { Shop, FoodItem } from '@/types';

export function AdminDataLoader() {
  const { state, dispatch } = useApp();
  const { user, shop, currentView } = state;
  const [loadedUserId, setLoadedUserId] = useState('');

  useEffect(() => {
    // Only load if we are in an admin view (but not login)
    const isAdminView = currentView.startsWith('admin-') || currentView === 'user-dashboard';
    
    if (!isAdminView) return;
    if (!user?.id || user.id === 'google-auth-bypass-id' || user.id === 'user-1') return;
    
    // If we already loaded data for this user, skip
    if (loadedUserId === user.id) return;

    async function loadData() {
      try {
        setLoadedUserId(user!.id);
        
        let { data: shopData } = (await supabase
          .from('shops')
          .select('*')
          .eq('user_id', user!.id)
          .single()) as { data: any };

        if (!shopData) {
          const { data: newShop } = await supabase
            .from('shops')
            .insert({
              user_id: user!.id,
              name: 'My Awesome Shop',
              is_open: false,
            })
            .select()
            .single();
          
          if (newShop) {
            shopData = newShop;
          }
        }

        if (shopData) {
          const formattedShop: Shop = {
            id: shopData.id,
            username: shopData.username || shop.username || (user!.email ? user!.email.split('@')[0] : 'owner'),
            name: shopData.name,
            tagline: shopData.tagline || '',
            description: shopData.description || '',
            location: shopData.location || '',
            contactNumber: shopData.contact_number || '',
            contacts: shopData.contacts || [],
            email: shopData.email || '',
            isOpen: !!shopData.is_open,
            logo: shopData.logo || '',
            banner: shopData.banner || '',
            theme: shopData.theme as any || undefined,
            openingHours: shopData.opening_hours || [
              { day: 'Monday - Saturday', hours: '10:00 AM - 10:00 PM' }
            ],
            socialLinks: {
              instagram: shopData.instagram || '',
              facebook: shopData.facebook || '',
              website: shopData.website || '',
            },
            categoryOrder: shopData.category_order || undefined,
          };
          dispatch({ type: 'UPDATE_SHOP', payload: formattedShop });

          // Fetch Food Items
          const { data: foodData } = (await supabase
            .from('food_items')
            .select('*')
            .eq('shop_id', shopData.id)) as { data: any[] | null };

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
        console.error("Error loading admin dashboard data:", err);
      }
    }

    loadData();
  }, [user?.id, currentView, loadedUserId, dispatch]);

  return null;
}

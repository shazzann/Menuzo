export interface FoodItem {
  id: string;
  name: string;
  description: string;
  tagline: string;
  category: string;
  image: string;
  originalPrice: number;
  discount?: number;
  discountedPrice?: number;
  finalPrice: number;
  isSpecialOffer: boolean;
  isAvailable: boolean;
}

export interface Shop {
  id: string;
  name: string;
  tagline: string;
  description: string;
  logo: string;
  banner: string;
  location: string;
  openingHours: {
    day: string;
    hours: string;
    isSpecialDay?: boolean;
    date?: string;
  }[];
  contactNumber: string;
  email: string;
  isOpen: boolean;
  socialLinks?: {
    instagram?: string;
    facebook?: string;
    website?: string;
  };
}

export interface User {
  id: string;
  email: string;
  shopName: string;
  shopId: string;
  subscription: {
    plan: 'free' | 'pro' | 'enterprise';
    expiresAt: Date;
    status: 'active' | 'expired' | 'cancelled';
  };
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
}

export type View = 
  | 'landing'
  | 'login' 
  | 'customer-menu' 
  | 'customer-food-detail' 
  | 'customer-shop-detail'
  | 'admin-preview'
  | 'admin-shop-details'
  | 'admin-add-food'
  | 'admin-edit-food'
  | 'admin-analytics'
  | 'admin-settings';

export type AdminTab = 'menu-preview' | 'shop-details' | 'add-food' | 'analytics';

export interface AppState {
  currentView: View;
  currentAdminTab: AdminTab;
  selectedFoodItem: FoodItem | null;
  user: User | null;
  shop: Shop;
  foodItems: FoodItem[];
  categories: Category[];
  searchQuery: string;
  selectedCategory: string;
}

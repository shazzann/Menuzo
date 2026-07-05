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
  | 'user-dashboard'
  | 'admin-preview'
  | 'admin-shop-details'
  | 'admin-add-food'
  | 'admin-edit-food'
  | 'admin-analytics'
  | 'admin-settings'
  | 'company-admin'
  | 'company-admin-login';

export type AdminTab = 'dashboard' | 'menu-preview' | 'settings' | 'add-food' | 'analytics';

export type CompanyAdminSection =
  | 'dashboard'
  | 'shops'
  | 'shop-verification'
  | 'shop-requests'
  | 'subscription-plans'
  | 'coupons'
  | 'promotions'
  | 'theme-library'
  | 'theme-marketplace'
  | 'campaigns'
  | 'notifications'
  | 'revenue-reports'
  | 'shop-reports'
  | 'usage-analytics'
  | 'growth'
  | 'tickets'
  | 'live-chat'
  | 'messages'
  | 'blog'
  | 'help-center'
  | 'faq'
  | 'settings-general'
  | 'settings-security'
  | 'settings-billing'
  | 'settings-integrations'
  | 'settings-email'
  | 'settings-notifications'
  | 'audit-logs'
  | 'system-health'
  | 'shop-detail';

// Company Admin specific types
export interface ManagedShop {
  id: string;
  name: string;
  owner: string;
  ownerEmail: string;
  phone: string;
  location: string;
  plan: 'free' | 'starter' | 'pro' | 'enterprise';
  status: 'active' | 'inactive' | 'suspended' | 'trial' | 'expired';
  revenue: number;
  menuItems: number;
  rating: number;
  verified: boolean;
  createdAt: string;
  expiresAt: string;
  logo: string;
  qrScans: number;
  visitors: number;
}

export interface KPICard {
  title: string;
  value: string | number;
  previousValue: string | number;
  change: number;
  icon: string;
  trend: 'up' | 'down' | 'neutral';
  color: string;
}

export interface ActivityItem {
  id: string;
  type: 'registration' | 'payment' | 'renewal' | 'theme' | 'menu-update' | 'suspension';
  message: string;
  shopName: string;
  timestamp: string;
  icon: string;
}

export interface SupportTicket {
  id: string;
  subject: string;
  shopName: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  createdAt: string;
  lastReply: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: 'monthly' | 'yearly';
  features: string[];
  limits: {
    menuItems: number;
    categories: number;
    storage: string;
    customDomain: boolean;
    analytics: boolean;
    support: string;
  };
  isPopular: boolean;
  activeSubscribers: number;
  color: string;
}

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
  companyAdminSection: CompanyAdminSection;
  selectedManagedShop: ManagedShop | null;
}

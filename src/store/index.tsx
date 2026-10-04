import React, { createContext, useContext, useReducer, type ReactNode } from 'react';
import type { AppState, View, AdminTab, FoodItem, Shop, User, Category, CompanyAdminSection, ManagedShop, MenuPosition, DailyStat } from '@/types';

import { isPublicShopView, parseShopRoute } from '@/lib/shopRoutes';

const initialShop: Shop = {
  id: '',
  username: 'menuzo',
  name: '',
  tagline: '',
  description: '',
  logo: '',
  banner: '',
  location: '',
  openingHours: [],
  contactNumber: '',
  contacts: [],
  email: '',
  isOpen: false,
  socialLinks: {
    instagram: '',
    facebook: '',
    website: '',
  },
  theme: {
    primary: '#090A0C',
    secondary: '#1C1E22',
    accent: '#FB8500',
  },
};

const initialFoodItems: FoodItem[] = [];

const initialCategories: Category[] = [
  { id: 'all', name: 'All' },
];

const getInitialView = (): View => parseShopRoute(typeof window === 'undefined' ? '/' : window.location.pathname).view;

const initialState: AppState = {
  menuPosition: null,
  shopDataContext: '', shopDataStatus: 'idle', shopLoadError: '', shopLoadVersion: 0,
  currentView: getInitialView(),
  currentAdminTab: 'menu-preview',
  selectedFoodItem: null,
  user: null,
  shop: initialShop,
  foodItems: initialFoodItems,
  categories: initialCategories,
  searchQuery: '',
  selectedCategory: 'all',
  companyAdminSection: 'dashboard',
  selectedManagedShop: null,
  shopNotFound: false,
};

type Action =
  | { type: 'SAVE_MENU_POSITION'; payload: MenuPosition }
  | { type: 'REKEY_PUBLIC_SHOP'; payload: { shopId: string; from: string; to: string } }
  | { type: 'SET_SHOP_STATS'; payload: { userId: string; shopId: string; stats?: DailyStat[]; error?: string } }
  | { type: 'SET_SHOP_MENU_URL'; payload: { userId: string; shopId: string; slug: string } }
  | { type: 'SHOP_LOAD_START'; payload: string }
  | { type: 'SHOP_LOAD_SUCCESS'; payload: { context: string; shop: Shop; food: FoodItem[]; selectedFoodId?: string } }
  | { type: 'SHOP_LOAD_ERROR'; payload: { context: string; message: string; notFound?: boolean } }
  | { type: 'RETRY_SHOP_LOAD' }
  | { type: 'SET_VIEW'; payload: View }
  | { type: 'SET_ADMIN_TAB'; payload: AdminTab }
  | { type: 'SELECT_FOOD_ITEM'; payload: FoodItem | null }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_SUBSCRIPTION'; payload: { userId: string; subscription: User['subscription'] } }
  | { type: 'UPDATE_SHOP'; payload: Partial<Shop> }
  | { type: 'ADD_FOOD_ITEM'; payload: FoodItem }
  | { type: 'UPDATE_FOOD_ITEM'; payload: FoodItem }
  | { type: 'DELETE_FOOD_ITEM'; payload: string }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_SELECTED_CATEGORY'; payload: string }
  | { type: 'ADD_CATEGORY'; payload: Category }
  | { type: 'SET_CATEGORIES'; payload: Category[] }
  | { type: 'SET_FOOD_ITEMS'; payload: FoodItem[] }
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'SESSION_CLEARED' }
  | { type: 'SET_COMPANY_ADMIN_SECTION'; payload: CompanyAdminSection }
  | { type: 'SELECT_MANAGED_SHOP'; payload: ManagedShop | null }
  | { type: 'SET_SHOP_NOT_FOUND'; payload: boolean };

function extractCategories(foodItems: FoodItem[], categoryOrder?: string[]): Category[] {
  const uniqueNames = Array.from(new Set(foodItems.map(item => item.category))).filter(Boolean);
  
  if (categoryOrder && categoryOrder.length > 0) {
    uniqueNames.sort((a, b) => {
      const indexA = categoryOrder.indexOf(a);
      const indexB = categoryOrder.indexOf(b);
      if (indexA === -1 && indexB === -1) return 0;
      if (indexA === -1) return 1; // Unordered items go to the end
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
  }

  return [
    { id: 'all', name: 'All' },
    ...uniqueNames.map(name => ({
      id: name,
      name
    }))
  ];
}

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'REKEY_PUBLIC_SHOP':
      return state.shop.id === action.payload.shopId && state.shopDataContext === `public:${action.payload.from}`
        ? { ...state, shopDataContext: `public:${action.payload.to}` } : state;
    case 'SET_SHOP_STATS':
      return state.shop.id === action.payload.shopId && state.user?.id === action.payload.userId && state.shopDataContext === `owner:${action.payload.userId}` && state.shopDataStatus === 'ready'
        ? { ...state, shop: { ...state.shop, ...(action.payload.stats ? { daily_stats: action.payload.stats } : {}), dailyStatsError: action.payload.error || '' } } : state;
    case 'SET_SHOP_MENU_URL':
      return state.shop.id === action.payload.shopId && state.user?.id === action.payload.userId && state.shopDataContext === `owner:${action.payload.userId}`
        ? { ...state, shop: { ...state.shop, menuSlug: action.payload.slug } } : state;
    case 'SAVE_MENU_POSITION':
      return { ...state, menuPosition: action.payload };
    case 'SHOP_LOAD_START':
      return { ...state,menuPosition:null,shopDataContext:action.payload,shopDataStatus:'loading',shopLoadError:'',shopNotFound:false,
        shop:initialShop,foodItems:[],categories:initialCategories,selectedFoodItem:null,searchQuery:'',selectedCategory:'all' };
    case 'SHOP_LOAD_SUCCESS':
      return state.shopDataContext !== action.payload.context ? state : { ...state,shopDataStatus:'ready',shopLoadError:'',shopNotFound:false,
        shop:action.payload.shop,foodItems:action.payload.food,selectedFoodItem:action.payload.food.find(item => item.id === action.payload.selectedFoodId) || null,categories:extractCategories(action.payload.food,action.payload.shop.categoryOrder) };
    case 'SHOP_LOAD_ERROR':
      return state.shopDataContext !== action.payload.context ? state : { ...state,shopDataStatus:action.payload.notFound ? 'not-found' : 'error',
        shopLoadError:action.payload.message,shopNotFound:!!action.payload.notFound };
    case 'RETRY_SHOP_LOAD':
      return { ...state,shopLoadVersion:state.shopLoadVersion+1,shopDataStatus:'idle',shopLoadError:'',shopNotFound:false };

    case 'SET_SUBSCRIPTION':
      return state.user?.id === action.payload.userId
        ? { ...state, user: { ...state.user, subscription: action.payload.subscription } }
        : state;
    case 'SET_VIEW':
      return { ...state, currentView: action.payload };
    case 'SET_SHOP_NOT_FOUND':
      return { ...state, shopNotFound: action.payload };
    case 'SET_ADMIN_TAB':
      return { ...state, currentAdminTab: action.payload };
    case 'SELECT_FOOD_ITEM':
      return { ...state, selectedFoodItem: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'UPDATE_SHOP': {
      const newShop = { ...state.shop, ...action.payload };
      return { 
        ...state, 
        shop: newShop,
        categories: extractCategories(state.foodItems, newShop.categoryOrder) 
      };
    }
    case 'ADD_FOOD_ITEM': {
      const newItems = [...state.foodItems, action.payload];
      return { ...state, foodItems: newItems, categories: extractCategories(newItems, state.shop.categoryOrder) };
    }
    case 'UPDATE_FOOD_ITEM': {
      const updatedItems = state.foodItems.map((item) =>
        item.id === action.payload.id ? action.payload : item
      );
      return { ...state, foodItems: updatedItems, categories: extractCategories(updatedItems, state.shop.categoryOrder) };
    }
    case 'DELETE_FOOD_ITEM': {
      const remainingItems = state.foodItems.filter((item) => item.id !== action.payload);
      return { ...state, foodItems: remainingItems, categories: extractCategories(remainingItems, state.shop.categoryOrder) };
    }
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    case 'SET_SELECTED_CATEGORY':
      return { ...state, selectedCategory: action.payload };
    case 'ADD_CATEGORY':
      return { ...state, categories: [...state.categories, action.payload] };
    case 'SET_CATEGORIES':
      return { ...state, categories: action.payload };
    case 'SET_FOOD_ITEMS': {
      const items = action.payload;
      return { ...state, foodItems: items, categories: extractCategories(items, state.shop.categoryOrder) };
    }
    case 'LOGIN': {
      // Restoring a saved session must not turn a visit to the home page into
      // a dashboard request (and then onboarding for accounts without a shop).
      const shouldRedirect = state.currentView === 'login' || state.currentView === 'signup';
      return {
        ...state,
        user: state.user?.id === action.payload.id
          ? { ...action.payload, subscription: state.user.subscription }
          : action.payload,
        ...(state.user?.id !== action.payload.id && !isPublicShopView(state.currentView)
          ? { shop: initialShop, foodItems: [], categories: initialCategories, shopDataContext: '', shopDataStatus: 'idle' as const, shopNotFound: false } : {}),
        currentView: shouldRedirect ? 'user-dashboard' : state.currentView,
        currentAdminTab: shouldRedirect ? 'dashboard' : state.currentAdminTab,
      };
    }
    case 'SESSION_CLEARED':
      return state.user ? appReducer(state, { type: 'LOGOUT' }) : state;
    case 'LOGOUT':
      return { ...state, menuPosition: null, user: null, shop: initialShop, foodItems: [], categories: initialCategories, shopDataContext: '', shopDataStatus: 'idle', shopNotFound: false,
        currentView: state.currentView === 'landing' ? 'landing'
          : state.currentView.startsWith('company-admin') ? 'company-admin-login' : 'login' };
    case 'SET_COMPANY_ADMIN_SECTION':
      return { ...state, companyAdminSection: action.payload };
    case 'SELECT_MANAGED_SHOP':
      return { ...state, selectedManagedShop: action.payload };
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

import React, { createContext, useContext, useReducer, type ReactNode } from 'react';
import type { AppState, View, AdminTab, FoodItem, Shop, User, Category, CompanyAdminSection, ManagedShop } from '@/types';

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
  email: '',
  isOpen: false,
  socialLinks: {
    instagram: '',
    facebook: '',
    website: '',
  },
};

const initialFoodItems: FoodItem[] = [];

const initialCategories: Category[] = [
  { id: 'all', name: 'All' },
];

const getInitialView = (): View => {
  if (typeof window !== 'undefined') {
    const path = window.location.pathname;
    if (path === '/' || path === '') return 'landing';
    if (path === '/login') return 'login';
    if (path === '/admin') return 'company-admin-login';
    if (path.startsWith('/admin-portal') || path === '/admin-login') return 'company-admin';
    
    const parts = path.split('/').filter(Boolean);
    if (parts.length >= 2) {
      const page = parts[1];
      switch (page) {
        case 'menu': return 'customer-menu';
        case 'shop': return 'customer-shop-detail';
        case 'dashboard': return 'user-dashboard';
        case 'menupreview': return 'admin-preview';
        case 'settings': return 'admin-settings';
        case 'add-food': return 'admin-add-food';
        case 'analytics': return 'admin-analytics';
      }
    }
  }
  return 'landing';
};

const initialState: AppState = {
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
};

type Action =
  | { type: 'SET_VIEW'; payload: View }
  | { type: 'SET_ADMIN_TAB'; payload: AdminTab }
  | { type: 'SELECT_FOOD_ITEM'; payload: FoodItem | null }
  | { type: 'SET_USER'; payload: User | null }
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
  | { type: 'SET_COMPANY_ADMIN_SECTION'; payload: CompanyAdminSection }
  | { type: 'SELECT_MANAGED_SHOP'; payload: ManagedShop | null };

function extractCategories(foodItems: FoodItem[]): Category[] {
  const uniqueNames = Array.from(new Set(foodItems.map(item => item.category))).filter(Boolean);
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
    case 'SET_VIEW':
      return { ...state, currentView: action.payload };
    case 'SET_ADMIN_TAB':
      return { ...state, currentAdminTab: action.payload };
    case 'SELECT_FOOD_ITEM':
      return { ...state, selectedFoodItem: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'UPDATE_SHOP':
      return { ...state, shop: { ...state.shop, ...action.payload } };
    case 'ADD_FOOD_ITEM': {
      const newItems = [...state.foodItems, action.payload];
      return { ...state, foodItems: newItems, categories: extractCategories(newItems) };
    }
    case 'UPDATE_FOOD_ITEM': {
      const updatedItems = state.foodItems.map((item) =>
        item.id === action.payload.id ? action.payload : item
      );
      return { ...state, foodItems: updatedItems, categories: extractCategories(updatedItems) };
    }
    case 'DELETE_FOOD_ITEM': {
      const remainingItems = state.foodItems.filter((item) => item.id !== action.payload);
      return { ...state, foodItems: remainingItems, categories: extractCategories(remainingItems) };
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
      return { ...state, foodItems: items, categories: extractCategories(items) };
    }
    case 'LOGIN': {
      const shouldRedirect = state.currentView === 'landing' || state.currentView === 'login';
      return {
        ...state,
        user: action.payload,
        currentView: shouldRedirect ? 'user-dashboard' : state.currentView,
        currentAdminTab: shouldRedirect ? 'dashboard' : state.currentAdminTab,
      };
    }
    case 'LOGOUT':
      return { ...state, user: null, currentView: 'login' };
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

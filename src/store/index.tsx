import React, { createContext, useContext, useReducer, type ReactNode } from 'react';
import type { AppState, View, AdminTab, FoodItem, Shop, User, Category, CompanyAdminSection, ManagedShop } from '@/types';

const initialShop: Shop = {
  id: '',
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
  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
    if (window.location.pathname === '/admin') {
      return 'company-admin-login';
    } else {
      return 'company-admin';
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
    case 'ADD_FOOD_ITEM':
      return { ...state, foodItems: [...state.foodItems, action.payload] };
    case 'UPDATE_FOOD_ITEM':
      return {
        ...state,
        foodItems: state.foodItems.map((item) =>
          item.id === action.payload.id ? action.payload : item
        ),
      };
    case 'DELETE_FOOD_ITEM':
      return {
        ...state,
        foodItems: state.foodItems.filter((item) => item.id !== action.payload),
      };
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    case 'SET_SELECTED_CATEGORY':
      return { ...state, selectedCategory: action.payload };
    case 'ADD_CATEGORY':
      return { ...state, categories: [...state.categories, action.payload] };
    case 'SET_CATEGORIES':
      return { ...state, categories: action.payload };
    case 'SET_FOOD_ITEMS':
      return { ...state, foodItems: action.payload };
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

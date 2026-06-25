import React, { createContext, useContext, useReducer, type ReactNode } from 'react';
import type { AppState, View, AdminTab, FoodItem, Shop, User, Category } from '@/types';

const initialShop: Shop = {
  id: 'shop-1',
  name: 'Nocturne Kitchen',
  tagline: 'Modern fusion, timeless flavors',
  description: 'Experience the perfect blend of contemporary culinary techniques with classic recipes. Our menu features locally sourced ingredients crafted into unforgettable dishes.',
  logo: '/shop-banner.jpg',
  banner: '/shop-banner.jpg',
  location: '123 Culinary District, Foodie City, FC 12345',
  openingHours: [
    { day: 'Monday - Thursday', hours: '11:00 AM - 10:00 PM' },
    { day: 'Friday - Saturday', hours: '11:00 AM - 11:00 PM' },
    { day: 'Sunday', hours: '10:00 AM - 9:00 PM' },
  ],
  contactNumber: '+1 (555) 123-4567',
  email: 'hello@nocturnekitchen.com',
  isOpen: true,
  socialLinks: {
    instagram: '@nocturnekitchen',
    facebook: 'NocturneKitchen',
    website: 'www.nocturnekitchen.com',
  },
};

const initialFoodItems: FoodItem[] = [
  {
    id: '1',
    name: 'Signature Burger',
    description: 'Juicy beef patty with caramelized onions, melted cheddar, and our secret sauce on a brioche bun.',
    tagline: 'Our bestseller since day one',
    category: 'mains',
    image: '/food-burger.jpg',
    originalPrice: 18.99,
    discount: 15,
    finalPrice: 16.14,
    isSpecialOffer: true,
    isAvailable: true,
  },
  {
    id: '2',
    name: 'Street Tacos',
    description: 'Three authentic tacos with your choice of protein, topped with fresh cilantro and onions.',
    tagline: 'Taste of Mexico City',
    category: 'mains',
    image: '/food-taco.jpg',
    originalPrice: 14.99,
    finalPrice: 14.99,
    isSpecialOffer: false,
    isAvailable: true,
  },
  {
    id: '3',
    name: 'Fresh Poke Bowl',
    description: 'Hawaiian-inspired bowl with sushi-grade fish, avocado, and fresh vegetables.',
    tagline: 'Ocean fresh, always',
    category: 'bowls',
    image: '/food-poke.jpg',
    originalPrice: 19.99,
    finalPrice: 19.99,
    isSpecialOffer: false,
    isAvailable: true,
  },
  {
    id: '4',
    name: 'Chocolate Decadence',
    description: 'Rich chocolate mousse cake with a glossy ganache finish.',
    tagline: 'For the true chocolate lover',
    category: 'desserts',
    image: '/food-dessert.jpg',
    originalPrice: 12.99,
    discount: 20,
    finalPrice: 10.39,
    isSpecialOffer: true,
    isAvailable: true,
  },
  {
    id: '5',
    name: 'Crispy Wings',
    description: 'Double-fried chicken wings with your choice of sauce.',
    tagline: 'Crispy outside, juicy inside',
    category: 'starters',
    image: '/food-chicken.jpg',
    originalPrice: 13.99,
    finalPrice: 13.99,
    isSpecialOffer: false,
    isAvailable: true,
  },
  {
    id: '6',
    name: 'Sushi Platter',
    description: 'Assorted fresh sushi rolls with wasabi and pickled ginger.',
    tagline: 'Chef\'s selection',
    category: 'mains',
    image: '/food-sushi.jpg',
    originalPrice: 24.99,
    finalPrice: 24.99,
    isSpecialOffer: false,
    isAvailable: true,
  },
  {
    id: '7',
    name: 'Truffle Pasta',
    description: 'Creamy pasta with black truffle shavings and parmesan.',
    tagline: 'Italian elegance',
    category: 'mains',
    image: '/food-pasta.jpg',
    originalPrice: 22.99,
    finalPrice: 22.99,
    isSpecialOffer: false,
    isAvailable: true,
  },
  {
    id: '8',
    name: 'Garden Salad',
    description: 'Fresh seasonal greens with house-made vinaigrette.',
    tagline: 'Fresh from the garden',
    category: 'starters',
    image: '/food-salad.jpg',
    originalPrice: 9.99,
    finalPrice: 9.99,
    isSpecialOffer: false,
    isAvailable: true,
  },
  {
    id: '9',
    name: 'Prime Ribeye',
    description: 'Perfectly seared ribeye steak with roasted vegetables.',
    tagline: 'The carnivore\'s dream',
    category: 'mains',
    image: '/food-steak.jpg',
    originalPrice: 34.99,
    discount: 10,
    finalPrice: 31.49,
    isSpecialOffer: true,
    isAvailable: true,
  },
];

const initialCategories: Category[] = [
  { id: 'all', name: 'All' },
  { id: 'starters', name: 'Starters' },
  { id: 'mains', name: 'Mains' },
  { id: 'bowls', name: 'Bowls' },
  { id: 'desserts', name: 'Desserts' },
];

const initialState: AppState = {
  currentView: 'landing',
  currentAdminTab: 'menu-preview',
  selectedFoodItem: null,
  user: null,
  shop: initialShop,
  foodItems: initialFoodItems,
  categories: initialCategories,
  searchQuery: '',
  selectedCategory: 'all',
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
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' };

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
    case 'LOGIN':
      return { ...state, user: action.payload, currentView: 'admin-preview' };
    case 'LOGOUT':
      return { ...state, user: null, currentView: 'login' };
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

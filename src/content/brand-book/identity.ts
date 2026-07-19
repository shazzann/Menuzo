import type { PersonaType } from './types';

export const brandPersonality = {
  traits: ['Modern', 'Friendly', 'Professional', 'Reliable', 'Clean', 'Innovative', 'Minimal', 'Helpful'],
  avoid: ['Loud', 'Corporate', 'Complicated', 'Cheap-looking'],
};

export const targetAudience = {
  primary: ['Restaurants', 'Cafés', 'Hotels', 'Bakeries', 'Food Trucks'],
  secondary: ['Cloud Kitchens', 'Juice Bars', 'Dessert Shops', 'Catering Businesses'],
};

export const customerPersona: PersonaType = {
  title: 'Restaurant Owner',
  age: '25 – 50',
  problems: [
    'Printing menus is expensive',
    'Updating prices is slow',
    'QR code management is confusing',
    'Poor online presence',
  ],
  goals: [
    'Save money on printing',
    'Look professional online',
    'Update menus instantly',
    'Better customer experience',
  ],
};

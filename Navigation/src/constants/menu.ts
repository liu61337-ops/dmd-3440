/**
 * Static menu data for the Brew & Board coffee-shop app.
 * Kept simple on purpose — this assignment focuses on navigation structure,
 * not data persistence.
 */

export type MenuItem = {
  id: string;
  emoji: string;
  name: string;
  description: string;
  price: number;
};

export const MENU_ITEMS: MenuItem[] = [
  {
    id: 'flat-white',
    emoji: '☕',
    name: 'Flat White',
    description: 'Double ristretto with silky steamed milk.',
    price: 4.5,
  },
  {
    id: 'cold-brew',
    emoji: '🧊',
    name: 'Cold Brew',
    description: 'Steeped 18 hours, served over ice.',
    price: 5.0,
  },
  {
    id: 'matcha-latte',
    emoji: '🍵',
    name: 'Matcha Latte',
    description: 'Ceremonial-grade matcha with oat milk.',
    price: 5.5,
  },
  {
    id: 'croissant',
    emoji: '🥐',
    name: 'Butter Croissant',
    description: 'Baked fresh each morning, 3-day laminated dough.',
    price: 3.75,
  },
  {
    id: 'avocado-toast',
    emoji: '🥑',
    name: 'Avocado Toast',
    description: 'Sourdough, smashed avocado, chili crisp, lime.',
    price: 8.5,
  },
  {
    id: 'cheesecake',
    emoji: '🍰',
    name: 'Basque Cheesecake',
    description: 'Burnt-top, custardy center, seasonal berries.',
    price: 6.25,
  },
];

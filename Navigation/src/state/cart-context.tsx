/**
 * Minimal in-memory cart shared by the Menu and Cart screens.
 * No persistence on purpose — the assignment asks us to focus on navigation,
 * not state management. Adding a drink on the Menu screen simply shows up on
 * the Cart screen so the tab/drawer flows have something to demonstrate.
 */

import { createContext, useContext, useMemo, useState, type PropsWithChildren } from 'react';

export type CartLine = {
  /** Unique per line so ordering the same drink twice creates two rows. */
  lineId: string;
  name: string;
  price: number;
};

type CartContextValue = {
  items: CartLine[];
  itemCount: number;
  total: number;
  addItem: (item: Omit<CartLine, 'lineId'>) => void;
  removeItem: (lineId: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: PropsWithChildren) {
  const [items, setItems] = useState<CartLine[]>([]);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      itemCount: items.length,
      total: items.reduce((sum, line) => sum + line.price, 0),
      addItem: (item) =>
        setItems((prev) => [...prev, { ...item, lineId: `${item.name}-${Date.now()}` }]),
      removeItem: (lineId) => setItems((prev) => prev.filter((line) => line.lineId !== lineId)),
      clearCart: () => setItems([]),
    }),
    [items],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a <CartProvider>.');
  }
  return context;
}

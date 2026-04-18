import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CartItem, Product } from '@/types';
import { toast } from 'sonner';
import { getProductLineTotalWithVat } from '@/lib/pricing';

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const BACKORDER_MAX_QUANTITY = 99;

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const addItem = useCallback((product: Product, quantity = 1) => {
    const requestedQuantity = Math.max(1, quantity);
    let addedQuantity = 0;

    setItems(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) {
        const nextQuantity = product.stock > 0
          ? Math.min(product.stock, existing.quantity + requestedQuantity)
          : Math.min(BACKORDER_MAX_QUANTITY, existing.quantity + requestedQuantity);
        addedQuantity = nextQuantity - existing.quantity;
        return prev.map(i => i.product.id === product.id ? { ...i, quantity: nextQuantity } : i);
      }
      addedQuantity = product.stock > 0 ? Math.min(product.stock, requestedQuantity) : Math.min(BACKORDER_MAX_QUANTITY, requestedQuantity);
      return [...prev, { product, quantity: addedQuantity }];
    });

    if (addedQuantity <= 0) {
      toast.error(`Ai deja cantitatea maximă disponibilă pentru ${product.name}.`);
      setIsOpen(true);
      return;
    }

    setIsOpen(true);
    toast.success(`${product.name} a fost adăugat în coș`);
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems(prev => prev.filter(i => i.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems(prev => prev.filter(i => i.product.id !== productId));
      return;
    }
    setItems(prev =>
      prev.map(i =>
        i.product.id === productId
          ? { ...i, quantity: i.product.stock > 0 ? Math.min(quantity, i.product.stock) : Math.min(quantity, BACKORDER_MAX_QUANTITY) }
          : i,
      ),
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + getProductLineTotalWithVat(i.product, i.quantity), 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, subtotal, isOpen, setIsOpen }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}

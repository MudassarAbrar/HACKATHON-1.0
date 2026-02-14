import { useState, useCallback } from "react";
import type { Product, CartItem } from "./products";

let cartItems: CartItem[] = [];
let listeners: Set<() => void> = new Set();

function emitChange() {
  listeners.forEach((l) => l());
}

export function useCart() {
  const [, setTick] = useState(0);

  const subscribe = useCallback(() => {
    const listener = () => setTick((t) => t + 1);
    listeners.add(listener);
    return () => listeners.delete(listener);
  }, []);

  useState(() => {
    const unsub = subscribe();
    return unsub;
  });

  const addToCart = useCallback(
    (product: Product, quantity = 1, selectedSize?: string, selectedColor?: string) => {
      const existing = cartItems.find(
        (item) =>
          item.product.id === product.id &&
          item.selectedSize === selectedSize &&
          item.selectedColor === selectedColor
      );
      if (existing) {
        existing.quantity += quantity;
      } else {
        cartItems.push({ product, quantity, selectedSize, selectedColor });
      }
      cartItems = [...cartItems];
      emitChange();
    },
    []
  );

  const removeFromCart = useCallback((productId: number) => {
    cartItems = cartItems.filter((item) => item.product.id !== productId);
    emitChange();
  }, []);

  const updateQuantity = useCallback((productId: number, quantity: number) => {
    const item = cartItems.find((i) => i.product.id === productId);
    if (item) {
      if (quantity <= 0) {
        cartItems = cartItems.filter((i) => i.product.id !== productId);
      } else {
        item.quantity = quantity;
        cartItems = [...cartItems];
      }
      emitChange();
    }
  }, []);

  const clearCart = useCallback(() => {
    cartItems = [];
    emitChange();
  }, []);

  const total = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return {
    items: cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    total,
    itemCount,
  };
}

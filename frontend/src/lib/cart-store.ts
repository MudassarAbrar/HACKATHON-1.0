import { create } from "zustand";
import { persist } from "zustand/middleware";
import { addToCart as apiAddToCart, updateCartItem as apiUpdateCartItem, removeFromCart as apiRemoveFromCart } from "./api-client";
import { Cart, CartItem } from "./types";

interface CartStore {
  items: CartItem[];
  isLoading: boolean;
  error: string | null;
  addItem: (userId: string, productId: string, quantity?: number, size?: string, color?: string) => Promise<void>;
  updateItem: (itemId: string, updates: { quantity?: number; size?: string; color?: string }) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => void;
  setCart: (cart: Cart) => void;
}

export const useCart = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      isLoading: false,
      error: null,

      addItem: async (userId, productId, quantity = 1, size, color) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiAddToCart(userId, productId, quantity, color, size);
          if (response.success && response.data) {
            set({ items: response.data.items, isLoading: false });
          } else {
            throw new Error(response.error || "Failed to add item to cart");
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Failed to add item";
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      updateItem: async (itemId, updates) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiUpdateCartItem(itemId, updates.quantity || 1);
          if (response.success && response.data) {
            set({ items: response.data.items, isLoading: false });
          } else {
            throw new Error(response.error || "Failed to update cart item");
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Failed to update item";
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      removeItem: async (itemId) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiRemoveFromCart(itemId);
          if (response.success && response.data) {
            set({ items: response.data.items, isLoading: false });
          } else {
            throw new Error(response.error || "Failed to remove item from cart");
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Failed to remove item";
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      clearCart: () => {
        set({ items: [], error: null });
      },

      setCart: (cart: Cart) => {
        set({ items: cart.items });
      },
    }),
    {
      name: "cart-storage",
      partialize: (state) => ({ items: state.items }), // Only persist items
    }
  )
);

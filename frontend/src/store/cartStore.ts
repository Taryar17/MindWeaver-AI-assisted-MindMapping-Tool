import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { cartAPI } from "../api/cart";
import { emitCartEvent } from "../lib/events";

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  available?: number;
}

interface CartState {
  carts: CartItem[];
  sessionId?: string;
  isLoading: boolean;
}

interface CartActions {
  getTotalItems: () => number;
  getTotalPrice: () => number;

  // Local actions
  addItem: (item: CartItem) => void;
  updateItem: (id: number, quantity: number) => void;
  removeItem: (id: number) => void;
  clearCart: () => void;
  setSessionId: (sessionId: string) => void;
  setLoading: (loading: boolean) => void;
  resetCart: () => void; // NEW: Reset cart function

  // Server actions
  addItemToServer: (item: CartItem) => Promise<void>;
  updateItemOnServer: (id: number, quantity: number) => Promise<void>;
  removeItemFromServer: (id: number) => Promise<void>;
  syncCartWithServer: () => Promise<void>;
  clearCartOnServer: () => Promise<void>;

  // Helper actions
  refreshProductData: (productId: number) => Promise<void>;
  getCartItem: (productId: number) => CartItem | undefined;
}

const initialState: CartState = {
  carts: [],
  sessionId: undefined,
  isLoading: false,
};

export const useCartStore = create<CartState & CartActions>()(
  persist(
    immer((set, get) => ({
      ...initialState,

      getTotalItems: () => {
        const { carts } = get();
        return carts.reduce((total, product) => total + product.quantity, 0);
      },

      getTotalPrice: () => {
        const { carts } = get();
        return carts.reduce(
          (total, product) => total + product.price * product.quantity,
          0
        );
      },

      addItem: (item) =>
        set((state) => {
          const existingItem = state.carts.find((i) => i.id === item.id);
          if (existingItem) {
            existingItem.quantity = item.quantity;
            if (item.available !== undefined) {
              existingItem.available = item.available;
            }
          } else {
            state.carts.push(item);
          }
        }),

      updateItem: (id, quantity) =>
        set((state) => {
          const item = state.carts.find((item) => item.id === id);
          if (item) {
            item.quantity = quantity;
          }
        }),

      removeItem: (id) =>
        set((state) => {
          state.carts = state.carts.filter((item) => item.id !== id);
        }),

      clearCart: () => set(initialState),

      resetCart: () => {
        // Clear localStorage
        localStorage.removeItem("cart-storage");
        // Reset state
        set(initialState);
      },

      setSessionId: (sessionId) =>
        set((state) => {
          state.sessionId = sessionId;
        }),

      setLoading: (loading) =>
        set((state) => {
          state.isLoading = loading;
        }),

      // Helper to get cart item
      getCartItem: (productId) => {
        const { carts } = get();
        return carts.find((item) => item.id === productId);
      },

      // Server actions
      addItemToServer: async (item) => {
        const { setLoading, addItem, setSessionId, refreshProductData } = get();

        setLoading(true);
        try {
          console.log("Adding item to cart:", {
            productId: item.id,
            quantity: item.quantity,
          });

          const response = await cartAPI.addItem(item.id, item.quantity);
          console.log("Add to cart response:", response);

          // Update local state with response data if available
          if (response.item) {
            addItem({
              ...item,
              quantity: response.item.quantity,
              available: response.item.available,
            });
          } else {
            // Fallback to original item data
            addItem(item);
          }

          if (response.sessionId) {
            setSessionId(response.sessionId);
          }

          // Refresh product data to get updated stock information
          try {
            await refreshProductData(item.id);
          } catch (refreshError) {
            console.error("Failed to refresh product data:", refreshError);
          }
        } catch (error: any) {
          console.error("Failed to add item:", error);

          let errorMessage = error.message || "Failed to add to cart";

          if (
            errorMessage.includes("404") ||
            errorMessage.includes("not found")
          ) {
            // Reset cart if session not found
            get().resetCart();
            throw new Error(
              "Cart session expired. Please refresh and try again."
            );
          }

          if (
            errorMessage.includes("stock") ||
            errorMessage.includes("Stock") ||
            errorMessage.includes("available") ||
            errorMessage.includes("Available")
          ) {
            throw new Error(errorMessage);
          } else if (
            errorMessage.includes("401") ||
            errorMessage.includes("Unauthorized")
          ) {
            throw new Error("Please login to add items to cart");
          } else if (
            errorMessage.includes("Invalid") ||
            errorMessage.includes("invalid")
          ) {
            throw new Error("Invalid product or quantity");
          } else {
            throw new Error("Failed to add to cart. Please try again.");
          }
        } finally {
          setLoading(false);
        }
      },

      updateItemOnServer: async (id, quantity) => {
        const {
          setLoading,
          updateItem,
          removeItem,
          sessionId,
          carts,
          refreshProductData,
        } = get();

        if (!sessionId) {
          throw new Error("No active cart session");
        }

        const item = carts.find((item) => item.id === id);
        if (!item) {
          throw new Error("Item not found in cart");
        }

        if (quantity === 0) {
          console.log("Quantity is 0, removing item instead");
          return get().removeItemFromServer(id);
        }

        setLoading(true);
        try {
          const response = await cartAPI.updateItem(sessionId, id, quantity);
          updateItem(id, quantity);

          // Refresh product data after update
          try {
            await refreshProductData(id);
          } catch (refreshError) {
            console.error("Failed to refresh product data:", refreshError);
          }

          return response;
        } catch (error: any) {
          console.error("Failed to update item:", error);

          // Handle 404 errors
          if (
            error.message.includes("404") ||
            error.message.includes("not found")
          ) {
            get().resetCart();
            throw new Error(
              "Cart session expired. Please refresh and try again."
            );
          }

          throw new Error(error.message || "Failed to update cart");
        } finally {
          setLoading(false);
        }
      },

      removeItemFromServer: async (id) => {
        const { setLoading, removeItem, sessionId, refreshProductData } = get();

        if (!sessionId) {
          throw new Error("No active cart session");
        }

        setLoading(true);
        try {
          console.log("Removing item from server:", {
            sessionId,
            productId: id,
          });

          const response = await cartAPI.removeItem(sessionId, id);
          console.log("Remove item response:", response);
          removeItem(id);

          // Refresh product data after removal
          try {
            await refreshProductData(id);
          } catch (refreshError) {
            console.error("Failed to refresh product data:", refreshError);
          }

          return response;
        } catch (error: any) {
          console.error("Failed to remove item:", error);

          // Check if error indicates item was already removed
          if (
            error.message.includes("already removed") ||
            error.message.includes("404") ||
            error.message.includes("not found")
          ) {
            console.log(
              "Item was already removed on server, updating local state"
            );
            removeItem(id);
            return { success: true, message: "Item was already removed" };
          }

          // For other errors
          throw new Error(error.message || "Failed to remove item");
        } finally {
          setLoading(false);
        }
      },
      syncCartWithServer: async () => {
        const { setLoading, resetCart } = get();

        setLoading(true);
        try {
          console.log("Syncing cart with server...");
          const response = await cartAPI.getCart();
          console.log("Cart sync response:", response);

          // Update the local state with server response
          set((state) => {
            state.carts = response.items || [];
            if (response.sessionId) {
              state.sessionId = response.sessionId;
            }
          });

          // Emit event for product components to refresh
          if (response.items && response.items.length > 0) {
            response.items.forEach((item: any) => {
              emitCartEvent();
            });
          }
        } catch (error: any) {
          console.error("Failed to sync cart:", error);

          // If authentication error or 404, reset the cart
          if (
            error.message.includes("Authentication failed") ||
            error.message.includes("401") ||
            error.message.includes("404") ||
            error.message.includes("Unauthorized")
          ) {
            resetCart();
          }
        } finally {
          setLoading(false);
        }
      },
      clearCartOnServer: async () => {
        const { setLoading, clearCart, sessionId, carts } = get();

        if (!sessionId) return;

        setLoading(true);
        try {
          await cartAPI.clearCart(sessionId);
          clearCart();

          if (carts.length > 0) {
            const { refreshProductData } = get();
            await Promise.allSettled(
              carts.map((item) =>
                refreshProductData(item.id).catch((e) =>
                  console.error(`Failed to refresh product ${item.id}:`, e)
                )
              )
            );
          }
        } catch (error: any) {
          console.error("Failed to clear cart:", error);
        } finally {
          setLoading(false);
        }
      },

      // Refresh product data in React Query cache
      refreshProductData: async (productId: number) => {
        try {
          const { queryClient } = await import("../api/query");

          if (queryClient) {
            // Invalidate product detail query
            await queryClient.invalidateQueries({
              queryKey: ["products", "detail", productId],
            });

            // Invalidate product stock query if exists
            await queryClient.invalidateQueries({
              queryKey: ["product-stock", productId],
            });

            // Invalidate products list to update stock in product cards
            await queryClient.invalidateQueries({
              queryKey: ["products"],
            });

            console.log(`Refreshed product data for ID: ${productId}`);
          }
        } catch (error) {
          console.error("Error refreshing product data:", error);
        }
      },
    })),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        carts: state.carts,
        sessionId: state.sessionId,
      }),
      version: 1,
      // Add migration if needed
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          return {
            ...initialState,
            ...persistedState,
          };
        }
        return persistedState;
      },
    }
  )
);

const API_URL = import.meta.env.VITE_API_URL;

export const cartAPI = {
  addItem: async (productId: number, quantity: number) => {
    const response = await fetch(`${API_URL}cart/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ productId, quantity }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Authentication failed. Please login again.");
      }
      const error = await response.json();
      throw new Error(error.error || "Failed to add to cart");
    }

    return response.json();
  },

  getCart: async () => {
    try {
      const response = await fetch(`${API_URL}cart`, {
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Authentication failed. Please login again.");
        }
        if (response.status === 404) {
          return { items: [] };
        }
        throw new Error("Failed to fetch cart");
      }

      return response.json();
    } catch (error: any) {
      if (error.message.includes("Authentication failed")) {
        return { items: [] };
      }
      throw error;
    }
  },

  updateItem: async (
    sessionId: string,
    productId: number,
    quantity: number,
  ) => {
    const response = await fetch(`${API_URL}cart/${sessionId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ productId, quantity }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Authentication failed. Please login again.");
      }
      const error = await response.json();
      throw new Error(error.error || "Failed to update cart");
    }

    return response.json();
  },

  removeItem: async (sessionId: string, productId: number) => {
    try {
      const url = `${API_URL}cart/${sessionId}/item/${productId}`;
      console.log("DELETE request to:", url);
      const response = await fetch(
        `${API_URL}cart/${sessionId}/item/${productId}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        if (response.status === 404) {
          console.log(`Item ${productId} not found (likely already removed)`);
          return { success: true, message: "Item already removed" };
        }

        if (response.status === 401) {
          throw new Error("Authentication failed. Please login again.");
        }

        let errorMessage = "Failed to remove item";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = response.statusText || errorMessage;
        }

        throw new Error(errorMessage);
      }

      return response.json();
    } catch (error: any) {
      // Re-throw with more context
      if (!error.message.includes("already removed")) {
        throw new Error(`Failed to remove item: ${error.message}`);
      }
      throw error;
    }
  },

  clearCart: async (sessionId: string) => {
    const response = await fetch(`${API_URL}cart/${sessionId}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Authentication failed. Please login again.");
      }
      throw new Error("Failed to clear cart");
    }

    return response.json();
  },
};

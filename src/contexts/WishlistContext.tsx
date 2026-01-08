import React, { createContext, useContext, useReducer, useEffect, type ReactNode } from "react";
import type { Product } from "@/data/products";
import { toast } from "sonner";

interface WishlistState {
  items: Product[];
}

type WishlistAction =
  | { type: "ADD_ITEM"; product: Product }
  | { type: "REMOVE_ITEM"; productId: string }
  | { type: "CLEAR_WISHLIST" }
  | { type: "LOAD_WISHLIST"; items: Product[] };

interface WishlistContextType extends WishlistState {
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  clearWishlist: () => void;
  isInWishlist: (productId: string) => boolean;
  itemCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

function wishlistReducer(state: WishlistState, action: WishlistAction): WishlistState {
  switch (action.type) {
    case "ADD_ITEM": {
      const exists = state.items.some((item) => item.id === action.product.id);
      if (exists) return state;
      return { ...state, items: [...state.items, action.product] };
    }
    
    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.productId),
      };
    
    case "CLEAR_WISHLIST":
      return { ...state, items: [] };
    
    case "LOAD_WISHLIST":
      return { ...state, items: action.items };
    
    default:
      return state;
  }
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(wishlistReducer, { items: [] });

  // Load wishlist from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("beejveda-wishlist");
    if (saved) {
      try {
        const items = JSON.parse(saved);
        dispatch({ type: "LOAD_WISHLIST", items });
      } catch (e) {
        console.error("Failed to load wishlist:", e);
      }
    }
  }, []);

  // Save wishlist to localStorage on change
  useEffect(() => {
    localStorage.setItem("beejveda-wishlist", JSON.stringify(state.items));
  }, [state.items]);

  const addToWishlist = (product: Product) => {
    const exists = state.items.some((item) => item.id === product.id);
    if (exists) {
      removeFromWishlist(product.id);
    } else {
      dispatch({ type: "ADD_ITEM", product });
      toast.success(`${product.name} added to wishlist!`);
    }
  };

  const removeFromWishlist = (productId: string) => {
    dispatch({ type: "REMOVE_ITEM", productId });
    toast.success("Removed from wishlist");
  };

  const clearWishlist = () => {
    dispatch({ type: "CLEAR_WISHLIST" });
  };

  const isInWishlist = (productId: string) => {
    return state.items.some((item) => item.id === productId);
  };

  return (
    <WishlistContext.Provider
      value={{
        ...state,
        addToWishlist,
        removeFromWishlist,
        clearWishlist,
        isInWishlist,
        itemCount: state.items.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}

import React, { createContext, useContext, useReducer, useEffect, type ReactNode } from "react";
import type { Product } from "@/data/products";
import { toast } from "sonner";

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

type CartAction =
  | { type: "ADD_ITEM"; product: Product; quantity?: number }
  | { type: "SET_PRODUCT_QUANTITY"; product: Product; quantity: number }
  | { type: "REMOVE_ITEM"; productId: string }
  | { type: "UPDATE_QUANTITY"; productId: string; quantity: number }
  | { type: "CLEAR_CART" }
  | { type: "TOGGLE_CART" };

interface CartContextType extends CartState {
  addToCart: (product: Product, quantity?: number) => void;
  setProductQuantity: (product: Product, quantity: number) => void;
  getProductQuantity: (product: Product) => number;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function getLocalCartItemKey(product: Product): string {
  return product.slug;
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const existingIndex = state.items.findIndex(
        (item) => getLocalCartItemKey(item.product) === getLocalCartItemKey(action.product)
      );
      
      if (existingIndex > -1) {
        const newItems = [...state.items];
        newItems[existingIndex] = {
          ...newItems[existingIndex],
          quantity: newItems[existingIndex].quantity + (action.quantity || 1),
        };
        return { ...state, items: newItems };
      }
      
      return {
        ...state,
        items: [...state.items, { product: action.product, quantity: action.quantity || 1 }],
      };
    }

    case "SET_PRODUCT_QUANTITY": {
      const productKey = getLocalCartItemKey(action.product);
      const existingItem = state.items.find(
        (item) => getLocalCartItemKey(item.product) === productKey
      );

      if (action.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter(
            (item) => getLocalCartItemKey(item.product) !== productKey
          ),
        };
      }

      if (!existingItem) {
        return {
          ...state,
          items: [...state.items, { product: action.product, quantity: action.quantity }],
        };
      }

      return {
        ...state,
        items: state.items.map((item) =>
          getLocalCartItemKey(item.product) === productKey
            ? { ...item, quantity: action.quantity }
            : item
        ),
      };
    }
    
    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter((item) => item.product.id !== action.productId),
      };
    
    case "UPDATE_QUANTITY": {
      if (action.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter((item) => item.product.id !== action.productId),
        };
      }
      
      return {
        ...state,
        items: state.items.map((item) =>
          item.product.id === action.productId
            ? { ...item, quantity: action.quantity }
            : item
        ),
      };
    }
    
    case "CLEAR_CART":
      return { ...state, items: [] };
    
    case "TOGGLE_CART":
      return { ...state, isOpen: !state.isOpen };
    
    default:
      return state;
  }
}

function loadCart(state: CartState): CartState {
  try {
    const saved = localStorage.getItem("beejveda-cart");
    if (!saved) return state;
    const parsed: unknown = JSON.parse(saved);
    if (!Array.isArray(parsed)) return state;

    const itemsByProduct = new Map<string, CartItem>();
    for (const item of parsed as CartItem[]) {
      if (!item?.product?.slug || !Number.isInteger(item.quantity) || item.quantity < 1) continue;
      const existing = itemsByProduct.get(getLocalCartItemKey(item.product));
      if (existing) existing.quantity += item.quantity;
      else itemsByProduct.set(getLocalCartItemKey(item.product), item);
    }

    return { ...state, items: Array.from(itemsByProduct.values()) };
  } catch (error) {
    console.error("Failed to load cart:", error);
    return state;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(
    cartReducer,
    { items: [], isOpen: false },
    loadCart
  );

  // Save cart to localStorage on change
  useEffect(() => {
    localStorage.setItem("beejveda-cart", JSON.stringify(state.items));
  }, [state.items]);

  const addToCart = (product: Product, quantity = 1) => {
    dispatch({ type: "ADD_ITEM", product, quantity });
    toast.success(`${product.name} added to cart!`);
  };

  const setProductQuantity = (product: Product, quantity: number) => {
    dispatch({ type: "SET_PRODUCT_QUANTITY", product, quantity });
  };

  const getProductQuantity = (product: Product) => {
    const key = getLocalCartItemKey(product);
    return state.items.find((item) => getLocalCartItemKey(item.product) === key)?.quantity ?? 0;
  };

  const removeFromCart = (productId: string) => {
    dispatch({ type: "REMOVE_ITEM", productId });
    toast.success("Item removed from cart");
  };

  const updateQuantity = (productId: string, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", productId, quantity });
  };

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" });
    toast.success("Cart cleared");
  };

  const toggleCart = () => {
    dispatch({ type: "TOGGLE_CART" });
  };

  const total = state.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        ...state,
        addToCart,
        setProductQuantity,
        getProductQuantity,
        removeFromCart,
        updateQuantity,
        clearCart,
        toggleCart,
        total,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

// FastAPI Backend API Service
// Configure this with your FastAPI backend URL

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    console.error("API Error:", error);
    return { error: error instanceof Error ? error.message : "Unknown error" };
  }
}

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    apiRequest<{ access_token: string; user: any }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  
  register: (email: string, password: string, name: string) =>
    apiRequest<{ user: any }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    }),
  
  logout: (token: string) =>
    apiRequest("/auth/logout", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    }),
  
  getProfile: (token: string) =>
    apiRequest<{ user: any }>("/auth/profile", {
      headers: { Authorization: `Bearer ${token}` },
    }),
};

// Products API
export const productsApi = {
  getAll: (params?: { category?: string; search?: string; page?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.set("category", params.category);
    if (params?.search) searchParams.set("search", params.search);
    if (params?.page) searchParams.set("page", params.page.toString());
    return apiRequest<{ products: any[]; total: number }>(`/products?${searchParams}`);
  },
  
  getBySlug: (slug: string) =>
    apiRequest<{ product: any }>(`/products/${slug}`),
  
  getCategories: () =>
    apiRequest<{ categories: any[] }>("/categories"),
};

// Cart API
export const cartApi = {
  get: (token: string) =>
    apiRequest<{ items: any[]; total: number }>("/cart", {
      headers: { Authorization: `Bearer ${token}` },
    }),
  
  addItem: (token: string, productId: string, quantity: number) =>
    apiRequest<{ cart: any }>("/cart/items", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ product_id: productId, quantity }),
    }),
  
  updateItem: (token: string, itemId: string, quantity: number) =>
    apiRequest<{ cart: any }>(`/cart/items/${itemId}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ quantity }),
    }),
  
  removeItem: (token: string, itemId: string) =>
    apiRequest(`/cart/items/${itemId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }),
};

// Wishlist API
export const wishlistApi = {
  get: (token: string) =>
    apiRequest<{ items: any[] }>("/wishlist", {
      headers: { Authorization: `Bearer ${token}` },
    }),
  
  addItem: (token: string, productId: string) =>
    apiRequest("/wishlist", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ product_id: productId }),
    }),
  
  removeItem: (token: string, productId: string) =>
    apiRequest(`/wishlist/${productId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }),
};

// Orders API
export const ordersApi = {
  create: (token: string, data: { address: any; payment_method: string }) =>
    apiRequest<{ order: any }>("/orders", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    }),
  
  getAll: (token: string) =>
    apiRequest<{ orders: any[] }>("/orders", {
      headers: { Authorization: `Bearer ${token}` },
    }),
  
  getById: (token: string, orderId: string) =>
    apiRequest<{ order: any }>(`/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
};

export { API_BASE_URL };

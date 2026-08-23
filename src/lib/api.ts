const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getAccessToken(): string | null {
  return localStorage.getItem("bv_access_token");
}

function setAccessToken(token: string) {
  localStorage.setItem("bv_access_token", token);
}

function clearAccessToken() {
  localStorage.removeItem("bv_access_token");
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAccessToken();

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  // Only set Content-Type for non-FormData bodies
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: "include", // send cookies for refresh token
  });

  // If 401, try refreshing the token once
  if (response.status === 401 && !endpoint.includes("/auth/")) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      // Retry with new token
      headers["Authorization"] = `Bearer ${getAccessToken()}`;
      const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
        credentials: "include",
      });

      if (!retryResponse.ok) {
        const err = await retryResponse.json().catch(() => ({}));
        throw new Error(err.message || `HTTP ${retryResponse.status}`);
      }

      return retryResponse.json();
    }
  }

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || err.error || `HTTP ${response.status}`);
  }

  return response.json();
}

async function tryRefreshToken(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });

    if (!res.ok) return false;

    const data = await res.json();
    if (data.success && data.data?.accessToken) {
      setAccessToken(data.data.accessToken);
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Auth API
// ---------------------------------------------------------------------------

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  role: "customer" | "admin";
  phone?: string;
  addresses?: any[];
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: AuthUser;
    accessToken: string;
  };
}

export const authApi = {
  register: async (name: string, email: string, password: string) => {
    const res = await apiRequest<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
    setAccessToken(res.data.accessToken);
    return res.data;
  },

  login: async (email: string, password: string) => {
    const res = await apiRequest<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setAccessToken(res.data.accessToken);
    return res.data;
  },

  logout: async () => {
    await apiRequest("/auth/logout", { method: "POST" });
    clearAccessToken();
  },

  getMe: async () => {
    const res = await apiRequest<{ success: boolean; data: AuthUser }>(
      "/auth/me"
    );
    return res.data;
  },

  refresh: async () => {
    return tryRefreshToken();
  },
};

// ---------------------------------------------------------------------------
// Products API
// ---------------------------------------------------------------------------

export interface ApiProductImage {
  key: string;
  alt?: string;
  isPrimary: boolean;
  url?: string;
}

export interface ApiProductVariant {
  _id: string;
  unitType: "piece" | "weight" | "volume";
  value: number;
  unit: string;
  displayLabel: string;
  price: number;
  originalPrice?: number;
  sku?: string;
  stock: number;
  isDefault: boolean;
}

export interface ApiProduct {
  _id: string;
  name: string;
  slug: string;
  category: { _id: string; name: string; slug: string } | string;
  description: string;
  benefits: string[];
  ingredients: string[];
  howToUse: string;
  images: ApiProductImage[];
  badge?: string;
  brand: string;
  ratingsAverage: number;
  ratingsCount: number;
  isActive: boolean;
  variants: ApiProductVariant[];
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    products?: T[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface ApiCategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  imageUrl?: string;
  isActive: boolean;
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

export const productsApi = {
  getAll: async (params?: {
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
    page?: number;
    limit?: number;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.set("category", params.category);
    if (params?.search) searchParams.set("search", params.search);
    if (params?.minPrice !== undefined) searchParams.set("minPrice", String(params.minPrice));
    if (params?.maxPrice !== undefined) searchParams.set("maxPrice", String(params.maxPrice));
    if (params?.sort) searchParams.set("sort", params.sort);
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));

    const qs = searchParams.toString();
    return apiRequest<PaginatedResponse<ApiProduct>>(`/products${qs ? `?${qs}` : ""}`);
  },

  getBySlug: async (slug: string) => {
    const res = await apiRequest<{ success: boolean; data: ApiProduct }>(
      `/products/${slug}`
    );
    return res.data;
  },
};

// ---------------------------------------------------------------------------
// Categories API
// ---------------------------------------------------------------------------

export const categoriesApi = {
  getAll: async () => {
    const res = await apiRequest<{ success: boolean; data: ApiCategory[] }>(
      "/products/categories"
    );
    return res.data;
  },

  getBySlug: async (slug: string) => {
    const res = await apiRequest<{ success: boolean; data: ApiCategory }>(
      `/products/categories/${slug}`
    );
    return res.data;
  },
};

// ---------------------------------------------------------------------------
// Cart API
// ---------------------------------------------------------------------------

export interface CartItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    slug: string;
    images: ApiProductImage[];
    category: string;
  };
  variant: {
    _id: string;
    unitType: string;
    value: number;
    unit: string;
    displayLabel: string;
    price: number;
    originalPrice?: number;
    stock: number;
    inStock: boolean;
  };
  quantity: number;
  lineTotal: number;
}

export const cartApi = {
  get: async () => {
    const res = await apiRequest<{
      success: boolean;
      data: { items: CartItem[]; total: number; itemCount: number };
    }>("/cart");
    return res.data;
  },

  addItem: async (productId: string, variantId: string, quantity = 1) => {
    const res = await apiRequest<{ success: boolean; message: string }>(
      "/cart/items",
      {
        method: "POST",
        body: JSON.stringify({ productId, variantId, quantity }),
      }
    );
    return res;
  },

  updateItem: async (itemId: string, quantity: number) => {
    const res = await apiRequest<{ success: boolean; message: string }>(
      `/cart/items/${itemId}`,
      {
        method: "PATCH",
        body: JSON.stringify({ quantity }),
      }
    );
    return res;
  },

  removeItem: async (itemId: string) => {
    const res = await apiRequest<{ success: boolean; message: string }>(
      `/cart/items/${itemId}`,
      { method: "DELETE" }
    );
    return res;
  },

  clear: async () => {
    const res = await apiRequest<{ success: boolean; message: string }>(
      "/cart",
      { method: "DELETE" }
    );
    return res;
  },
};

// ---------------------------------------------------------------------------
// Orders API
// ---------------------------------------------------------------------------

export interface Order {
  _id: string;
  user: { _id: string; name: string; email: string };
  items: {
    product: { _id: string; name: string; slug: string };
    name: string;
    imageKey?: string;
    variant: {
      unitType: string;
      value: number;
      unit: string;
      displayLabel: string;
    };
    unitPrice: number;
    quantity: number;
    lineTotal: number;
  }[];
  shippingAddress: {
    address: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  itemsTotal: number;
  shippingFee: number;
  grandTotal: number;
  createdAt: string;
  updatedAt: string;
}

export const ordersApi = {
  create: async (data: {
    shippingAddress: any;
    paymentMethod?: string;
  }) => {
    const res = await apiRequest<{ success: boolean; data: Order }>(
      "/orders",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
    return res.data;
  },

  getMyOrders: async () => {
    const res = await apiRequest<{ success: boolean; data: Order[] }>(
      "/orders"
    );
    return res.data;
  },

  getById: async (id: string) => {
    const res = await apiRequest<{ success: boolean; data: Order }>(
      `/orders/${id}`
    );
    return res.data;
  },
};

// ---------------------------------------------------------------------------
// Reviews API
// ---------------------------------------------------------------------------

export interface Review {
  _id: string;
  product: string;
  user: { _id: string; name: string };
  rating: number;
  comment: string;
  createdAt: string;
}

export const reviewsApi = {
  getByProduct: async (productId: string) => {
    const res = await apiRequest<{ success: boolean; data: Review[] }>(
      `/reviews/product/${productId}`
    );
    return res.data;
  },

  create: async (productId: string, rating: number, comment: string) => {
    const res = await apiRequest<{ success: boolean; data: Review }>(
      "/reviews",
      {
        method: "POST",
        body: JSON.stringify({ product: productId, rating, comment }),
      }
    );
    return res.data;
  },
};

// ---------------------------------------------------------------------------
// Admin API
// ---------------------------------------------------------------------------

export const adminApi = {
  // Products
  getProducts: async (params?: {
    search?: string;
    category?: string;
    isActive?: string;
    page?: number;
    limit?: number;
  }) => {
    const sp = new URLSearchParams();
    if (params?.search) sp.set("search", params.search);
    if (params?.category) sp.set("category", params.category);
    if (params?.isActive !== undefined) sp.set("isActive", params.isActive);
    if (params?.page) sp.set("page", String(params.page));
    if (params?.limit) sp.set("limit", String(params.limit));
    const qs = sp.toString();
    return apiRequest(`/admin/products${qs ? `?${qs}` : ""}`);
  },

  getProductById: async (id: string) => {
    return apiRequest(`/admin/products/${id}`);
  },

  createProduct: async (data: any) => {
    return apiRequest("/admin/products", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateProduct: async (id: string, data: any) => {
    return apiRequest(`/admin/products/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  deleteProduct: async (id: string, hard = false) => {
    return apiRequest(`/admin/products/${id}${hard ? "?hard=true" : ""}`, {
      method: "DELETE",
    });
  },

  // Categories
  getCategories: async () => {
    return apiRequest("/admin/categories");
  },

  createCategory: async (data: any) => {
    return apiRequest("/admin/categories", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateCategory: async (id: string, data: any) => {
    return apiRequest(`/admin/categories/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  deleteCategory: async (id: string) => {
    return apiRequest(`/admin/categories/${id}`, { method: "DELETE" });
  },

  // Orders
  getOrders: async (params?: {
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    const sp = new URLSearchParams();
    if (params?.status) sp.set("status", params.status);
    if (params?.page) sp.set("page", String(params.page));
    if (params?.limit) sp.set("limit", String(params.limit));
    const qs = sp.toString();
    return apiRequest(`/admin/orders${qs ? `?${qs}` : ""}`);
  },

  getOrderById: async (id: string) => {
    return apiRequest(`/admin/orders/${id}`);
  },

  updateOrderStatus: async (id: string, status: string) => {
    return apiRequest(`/admin/orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },

  // Users
  getUsers: async (params?: {
    search?: string;
    role?: string;
    page?: number;
    limit?: number;
  }) => {
    const sp = new URLSearchParams();
    if (params?.search) sp.set("search", params.search);
    if (params?.role) sp.set("role", params.role);
    if (params?.page) sp.set("page", String(params.page));
    if (params?.limit) sp.set("limit", String(params.limit));
    const qs = sp.toString();
    return apiRequest(`/admin/users${qs ? `?${qs}` : ""}`);
  },

  updateUserRole: async (id: string, role: string) => {
    return apiRequest(`/admin/users/${id}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    });
  },
};

// ---------------------------------------------------------------------------
// Upload API
// ---------------------------------------------------------------------------

export const uploadApi = {
  productImage: async (productId: string, file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    const res = await apiRequest<{ success: boolean; data: any }>(
      `/upload/product/${productId}`,
      {
        method: "POST",
        body: formData,
      }
    );
    return res.data;
  },

  deleteProductImage: async (productId: string, key: string) => {
    return apiRequest(`/upload/product/${productId}/image/${encodeURIComponent(key)}`, {
      method: "DELETE",
    });
  },

  categoryImage: async (categoryId: string, file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    const res = await apiRequest<{ success: boolean; data: any }>(
      `/upload/category/${categoryId}`,
      {
        method: "POST",
        body: formData,
      }
    );
    return res.data;
  },

  deleteCategoryImage: async (categoryId: string) => {
    return apiRequest(`/upload/category/${categoryId}/image`, {
      method: "DELETE",
    });
  },
};

// ---------------------------------------------------------------------------
// Mapper: ApiProduct → local Product type (for existing components)
// ---------------------------------------------------------------------------

import type { Product } from "@/data/products";

/**
 * Convert an ApiProduct from the backend to the local Product interface
 * so that existing components (ProductCard, etc.) work without changes.
 */
export function mapApiProductToLocal(api: ApiProduct): Product {
  const defaultVariant =
    api.variants?.find((v) => v.isDefault) || api.variants?.[0];

  const categoryName =
    typeof api.category === "object" && api.category !== null
      ? api.category.name
      : "";
  const categorySlug =
    typeof api.category === "object" && api.category !== null
      ? api.category.slug
      : "";

  // Pick the primary image URL, or first image, or empty string
  const primaryImage =
    api.images?.find((img) => img.isPrimary) || api.images?.[0];
  const imageUrl = primaryImage?.url || "";

  const hasStock =
    defaultVariant !== undefined ? defaultVariant.stock > 0 : false;

  return {
    id: api._id,
    name: api.name,
    slug: api.slug,
    category: categoryName,
    categorySlug: categorySlug,
    price: defaultVariant?.price ?? 0,
    originalPrice: defaultVariant?.originalPrice,
    weight: defaultVariant?.displayLabel || "",
    image: imageUrl,
    rating: api.ratingsAverage || 0,
    reviews: api.ratingsCount || 0,
    badge: api.badge,
    benefits: api.benefits || [],
    ingredients: api.ingredients || [],
    howToUse: api.howToUse || "",
    description: api.description || "",
    inStock: hasStock,
  };
}

/**
 * Convert an ApiCategory from the backend to the local Category interface.
 */
export function mapApiCategoryToLocal(
  api: ApiCategory
): import("@/data/products").Category {
  return {
    id: api._id,
    name: api.name,
    slug: api.slug,
    description: api.description || "",
    image: api.imageUrl || "",
    productCount: api.productCount,
  };
}

export { API_BASE_URL, getAccessToken, clearAccessToken };

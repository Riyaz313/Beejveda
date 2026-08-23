import { useQuery } from "@tanstack/react-query";
import {
  productsApi,
  categoriesApi,
  mapApiProductToLocal,
  mapApiCategoryToLocal,
} from "@/lib/api";
import type { Product, Category } from "@/data/products";

export function useProducts(params?: {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  page?: number;
  limit?: number;
}) {
  const query = useQuery({
    queryKey: ["products", params],
    queryFn: () => productsApi.getAll(params),
    staleTime: 5 * 60 * 1000,
  });

  // Also provide mapped data for existing components
  const mappedProducts: Product[] =
    query.data?.data?.products?.map(mapApiProductToLocal) ?? [];

  return { ...query, mappedProducts };
}

export function useProduct(slug: string | undefined) {
  const query = useQuery({
    queryKey: ["product", slug],
    queryFn: () => productsApi.getBySlug(slug!),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });

  const mappedProduct: Product | null = query.data
    ? mapApiProductToLocal(query.data)
    : null;

  return { ...query, mappedProduct };
}

export function useCategories() {
  const query = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoriesApi.getAll(),
    staleTime: 10 * 60 * 1000,
  });

  const mappedCategories: Category[] =
    query.data?.map(mapApiCategoryToLocal) ?? [];

  return { ...query, mappedCategories };
}

export function useCategory(slug: string | undefined) {
  const query = useQuery({
    queryKey: ["category", slug],
    queryFn: () => categoriesApi.getBySlug(slug!),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });

  const mappedCategory: Category | null = query.data
    ? mapApiCategoryToLocal(query.data)
    : null;

  return { ...query, mappedCategory };
}

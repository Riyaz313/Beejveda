import React, { createContext, useContext, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { productsApi, mapApiProductToLocal } from "@/lib/api";
import type { Product } from "@/data/products";

interface SearchContextType {
  query: string;
  setQuery: (query: string) => void;
  results: Product[];
  isSearching: boolean;
  search: (query: string) => void;
  clearSearch: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState("");
  const searchQuery = useQuery({
    queryKey: ["product-search", query.trim()],
    queryFn: () => productsApi.getAll({ search: query.trim(), limit: 20 }),
    enabled: Boolean(query.trim()),
    staleTime: 60 * 1000,
  });
  const results: Product[] = searchQuery.data?.data.products?.map(mapApiProductToLocal) ?? [];

  const search = (searchQuery: string) => {
    setQuery(searchQuery);
  };

  const clearSearch = () => {
    setQuery("");
  };

  return (
    <SearchContext.Provider
      value={{
        query,
        setQuery,
        results,
        isSearching: searchQuery.isFetching,
        search,
        clearSearch,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return context;
}

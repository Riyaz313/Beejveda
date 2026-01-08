import React, { createContext, useContext, useState, type ReactNode } from "react";
import { products, type Product } from "@/data/products";

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
  const [results, setResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const search = (searchQuery: string) => {
    setQuery(searchQuery);
    setIsSearching(true);

    if (!searchQuery.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    const lowerQuery = searchQuery.toLowerCase();
    const filtered = products.filter(
      (product) =>
        product.name.toLowerCase().includes(lowerQuery) ||
        product.category.toLowerCase().includes(lowerQuery) ||
        product.description.toLowerCase().includes(lowerQuery) ||
        product.benefits.some((b) => b.toLowerCase().includes(lowerQuery))
    );

    setResults(filtered);
    setIsSearching(false);
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
  };

  return (
    <SearchContext.Provider
      value={{
        query,
        setQuery,
        results,
        isSearching,
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

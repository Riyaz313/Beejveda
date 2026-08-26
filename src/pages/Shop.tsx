import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProducts, useCategories } from "@/hooks/useProducts";

export default function Shop() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);

  // Build API query params
  const queryParams: Record<string, any> = {
    limit: 50,
  };
  if (searchQuery) queryParams.search = searchQuery;
  if (selectedCategory) queryParams.category = selectedCategory;
  if (sortBy) queryParams.sort = sortBy;

  const { mappedProducts, isLoading, isError } = useProducts(queryParams);
  const { mappedCategories } = useCategories();

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-gradient-hero py-16">
        <div className="container text-center text-primary-foreground">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Shop All Products
          </h1>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto">
            Explore our complete range of organic superfoods, herbal teas,
            microgreens, and wellness products.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="container">
          {/* Search and Filters Bar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 rounded-lg border border-input bg-background text-sm"
              >
                <option value="newest">Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
                <option value="name">Name A-Z</option>
              </select>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="sm:hidden"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex gap-8">
            {/* Sidebar Filters */}
            <aside
              className={cn(
                "w-64 shrink-0 space-y-6",
                showFilters
                  ? "fixed inset-0 z-50 bg-card p-6 overflow-auto sm:relative sm:bg-transparent sm:p-0"
                  : "hidden sm:block"
              )}
            >
              {showFilters && (
                <div className="flex items-center justify-between sm:hidden mb-4">
                  <h3 className="font-display font-semibold text-lg">
                    Filters
                  </h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowFilters(false)}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              )}

              {/* Categories */}
              <div>
                <h3 className="font-display font-semibold text-lg mb-4">
                  Categories
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                      !selectedCategory
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-secondary"
                    )}
                  >
                    All Products
                  </button>
                  {mappedCategories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.slug)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                        selectedCategory === cat.slug
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-secondary"
                      )}
                    >
                      {cat.name} ({cat.productCount})
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            {/* Products Grid */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-6">
                <p className="text-muted-foreground">
                  {isLoading
                    ? "Loading products..."
                    : `Showing ${mappedProducts.length} products`}
                </p>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      className="bg-card rounded-2xl overflow-hidden animate-pulse"
                    >
                      <div className="aspect-square bg-secondary/50" />
                      <div className="p-4 space-y-3">
                        <div className="h-3 bg-secondary/50 rounded w-1/3" />
                        <div className="h-4 bg-secondary/50 rounded w-2/3" />
                        <div className="h-3 bg-secondary/50 rounded w-1/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : isError ? (
                <div className="text-center py-16">
                  <p className="text-destructive text-lg mb-4">
                    Failed to load products. Make sure the backend is running.
                  </p>
                  <Button onClick={() => window.location.reload()}>
                    Try Again
                  </Button>
                </div>
              ) : mappedProducts.length > 0 ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {mappedProducts.map((product, index) => (
                    <div
                      key={product.id}
                      className="animate-fade-up"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <p className="text-muted-foreground text-lg mb-4">
                    No products found matching your criteria.
                  </p>
                  <Button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory(null);
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { ProductCard } from "@/components/ProductCard";
import { useCategory, useProducts } from "@/hooks/useProducts";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

export default function Category() {
  const { slug } = useParams<{ slug: string }>();
  const {
    mappedCategory: category,
    isLoading: categoryLoading,
    isError: categoryError,
  } = useCategory(slug);

  // Fetch products filtered by category slug
  const {
    mappedProducts: products,
    isLoading: productsLoading,
  } = useProducts({
    category: slug || undefined,
    limit: 50,
  });

  if (categoryLoading) {
    return (
      <Layout>
        <section className="relative h-64 md:h-80 overflow-hidden bg-secondary/30">
          <div className="container h-full flex items-center">
            <div className="animate-pulse-soft text-muted-foreground">
              Loading category...
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  if (categoryError || !category) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <h1 className="font-display text-3xl font-bold mb-4">
            Category Not Found
          </h1>
          <p className="text-muted-foreground mb-6">
            This category doesn't exist.
          </p>
          <Link to="/shop">
            <Button>Browse All Products</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero */}
      <section className="relative h-64 md:h-80 overflow-hidden">
        {category.image ? (
          <img
            src={category.image}
            alt={category.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-hero" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/60" />
        <div className="relative container h-full flex flex-col justify-center text-primary-foreground">
          <nav className="flex items-center gap-2 text-sm mb-4">
            <Link to="/" className="hover:underline opacity-80">
              Home
            </Link>
            <ChevronRight className="w-4 h-4" />
            <Link to="/shop" className="hover:underline opacity-80">
              Shop
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span>{category.name}</span>
          </nav>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-2">
            {category.name}
          </h1>
          <p className="text-primary-foreground/80 max-w-xl">
            {category.description}
          </p>
        </div>
      </section>

      {/* Products */}
      <section className="py-12">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <p className="text-muted-foreground">
              {productsLoading
                ? "Loading products..."
                : `${products.length} products`}
            </p>
          </div>

          {productsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
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
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {products.map((product, index) => (
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
                No products available in this category yet.
              </p>
              <Link to="/shop">
                <Button>Browse All Products</Button>
              </Link>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}

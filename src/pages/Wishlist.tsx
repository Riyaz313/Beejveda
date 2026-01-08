import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Heart, ArrowRight } from "lucide-react";
import { useWishlist } from "@/contexts/WishlistContext";
import { ProductCard } from "@/components/ProductCard";

export default function Wishlist() {
  const { items, clearWishlist } = useWishlist();

  return (
    <Layout>
      <section className="py-16">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <h1 className="font-display text-3xl font-bold">My Wishlist</h1>
            {items.length > 0 && (
              <Button
                variant="ghost"
                onClick={clearWishlist}
                className="text-destructive hover:text-destructive"
              >
                Clear Wishlist
              </Button>
            )}
          </div>

          {items.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-secondary/50 flex items-center justify-center">
                <Heart className="w-12 h-12 text-muted-foreground" />
              </div>
              <h2 className="font-display text-2xl font-semibold mb-2">
                Your wishlist is empty
              </h2>
              <p className="text-muted-foreground mb-8">
                Save your favorite products here to buy them later!
              </p>
              <Link to="/shop">
                <Button size="lg" className="group">
                  Explore Products
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {items.map((product, index) => (
                <div
                  key={product.id}
                  className="animate-fade-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}

import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Product } from "@/data/products";
import { cn } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();
  
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.inStock) {
      addToCart(product);
    }
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToWishlist(product);
  };

  return (
    <div className={cn("group bg-card rounded-2xl overflow-hidden shadow-sm card-hover", className)}>
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden">
        <Link to={`/product/${product.slug}`}>
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.badge && (
            <span className={cn(
              "px-3 py-1 text-xs font-semibold rounded-full",
              product.badge === "Bestseller" && "bg-gold text-primary-foreground",
              product.badge === "New" && "bg-leaf text-primary-foreground",
              product.badge === "Premium" && "bg-primary text-primary-foreground",
              product.badge === "Coming Soon" && "bg-muted text-muted-foreground",
              !["Bestseller", "New", "Premium", "Coming Soon"].includes(product.badge) && "bg-secondary text-secondary-foreground"
            )}>
              {product.badge}
            </span>
          )}
          {discount > 0 && (
            <span className="px-3 py-1 bg-destructive text-destructive-foreground text-xs font-semibold rounded-full">
              -{discount}%
            </span>
          )}
        </div>

        {/* Quick Actions */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="icon"
            variant="secondary"
            className={cn(
              "w-9 h-9 rounded-full shadow-md",
              inWishlist && "bg-destructive text-destructive-foreground hover:bg-destructive/90"
            )}
            onClick={handleWishlist}
          >
            <Heart className={cn("w-4 h-4", inWishlist && "fill-current")} />
          </Button>
        </div>

        {/* Add to Cart Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-primary/90 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <Button
            variant="secondary"
            size="sm"
            className="w-full"
            disabled={!product.inStock}
            onClick={handleAddToCart}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            {product.inStock ? "Add to Cart" : "Out of Stock"}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Category */}
        <Link
          to={`/category/${product.categorySlug}`}
          className="text-xs text-leaf font-medium hover:underline"
        >
          {product.category}
        </Link>

        {/* Title */}
        <Link to={`/product/${product.slug}`}>
          <h3 className="font-display font-semibold text-foreground mt-1 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-gold text-gold" />
            <span className="text-sm font-medium">{product.rating}</span>
          </div>
          <span className="text-sm text-muted-foreground">
            ({product.reviews} reviews)
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-foreground">
            ₹{product.price}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              ₹{product.originalPrice}
            </span>
          )}
          <span className="text-xs text-muted-foreground ml-auto">
            {product.weight}
          </span>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Heart, Minus, Plus, ShoppingCart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Product } from "@/data/products";
import { cn } from "@/lib/utils";
import { useWishlist } from "@/contexts/WishlistContext";
import { useProductCart } from "@/hooks/useProductCart";

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const { addToWishlist, isInWishlist } = useWishlist();
  const { quantity: quantityInCart, isLoading: cartLoading, isUpdating, setQuantity } = useProductCart(product);

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const inWishlist = isInWishlist(product.id);
  const images = product.images?.length ? product.images : product.image ? [{ key: product.image, alt: product.name, isPrimary: true, url: product.image }] : [];
  const activeImage = images[activeImageIndex] || images[0];

  const changeImage = (event: React.MouseEvent, offset: number) => {
    event.preventDefault();
    event.stopPropagation();
    setActiveImageIndex((index) => (index + offset + images.length) % images.length);
  };

  const handleCartQuantity = (e: React.MouseEvent, quantity: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product.inStock) return;
    void setQuantity(quantity);
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
          {activeImage ? (
            <img
              src={activeImage.url}
              alt={activeImage.alt || product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-secondary/40 text-sm text-muted-foreground">Image unavailable</div>
          )}
        </Link>

        {images.length > 1 && (
          <>
            <Button type="button" variant="secondary" size="icon" aria-label={`Previous ${product.name} image`} className="absolute left-2 top-1/2 z-10 h-8 w-8 -translate-y-1/2 rounded-full opacity-0 shadow-md transition-opacity group-hover:opacity-100 group-focus-within:opacity-100" onClick={(event) => changeImage(event, -1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button type="button" variant="secondary" size="icon" aria-label={`Next ${product.name} image`} className="absolute right-2 top-1/2 z-10 h-8 w-8 -translate-y-1/2 rounded-full opacity-0 shadow-md transition-opacity group-hover:opacity-100 group-focus-within:opacity-100" onClick={(event) => changeImage(event, 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <div className="absolute bottom-16 left-0 right-0 z-10 flex justify-center gap-1.5" aria-label={`${images.length} product images`}>
              {images.map((image, index) => (
                <button key={image.key} type="button" aria-label={`Show image ${index + 1} of ${product.name}`} aria-current={index === activeImageIndex} onClick={(event) => { event.preventDefault(); event.stopPropagation(); setActiveImageIndex(index); }} className={`h-1.5 rounded-full shadow-sm transition-all ${index === activeImageIndex ? "w-5 bg-white" : "w-1.5 bg-white/60"}`} />
              ))}
            </div>
          </>
        )}

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
        <div className={cn(
          "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary/90 to-transparent p-3 transition-transform duration-300",
          quantityInCart > 0 ? "translate-y-0" : "translate-y-full group-hover:translate-y-0 group-focus-within:translate-y-0"
        )}>
          {quantityInCart > 0 ? (
            <div className="mx-auto flex h-9 w-fit items-center gap-3 rounded-md bg-card px-2 shadow-md" aria-label={`${quantityInCart} in cart`}>
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8" aria-label={`Decrease ${product.name} quantity`} disabled={isUpdating || cartLoading} onClick={(e) => handleCartQuantity(e, quantityInCart - 1)}>
                <Minus className="h-4 w-4" />
              </Button>
              <span className="min-w-5 text-center text-sm font-semibold" aria-live="polite">{quantityInCart}</span>
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8" aria-label={`Increase ${product.name} quantity`} disabled={isUpdating || cartLoading} onClick={(e) => handleCartQuantity(e, quantityInCart + 1)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="w-full"
              disabled={!product.inStock || isUpdating || cartLoading}
              onClick={(e) => handleCartQuantity(e, 1)}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              {!product.inStock ? "Out of Stock" : cartLoading ? "Loading cart..." : "Add to Cart"}
            </Button>
          )}
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

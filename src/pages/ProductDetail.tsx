import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { getProductBySlug, getProductsByCategory } from "@/data/products";
import { ProductCard } from "@/components/ProductCard";
import { 
  Star, 
  Heart, 
  ShoppingCart, 
  Minus, 
  Plus, 
  Truck, 
  Shield, 
  RefreshCcw,
  Check,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const product = getProductBySlug(slug || "");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"benefits" | "ingredients" | "howToUse">("benefits");

  if (!product) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <h1 className="font-display text-3xl font-bold mb-4">Product Not Found</h1>
          <p className="text-muted-foreground mb-6">The product you're looking for doesn't exist.</p>
          <Link to="/shop">
            <Button>Browse All Products</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const relatedProducts = getProductsByCategory(product.categorySlug)
    .filter(p => p.id !== product.id)
    .slice(0, 4);

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <Layout>
      {/* Breadcrumb */}
      <div className="bg-secondary/30">
        <div className="container py-3">
          <nav className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-muted-foreground hover:text-foreground">Home</Link>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <Link to="/shop" className="text-muted-foreground hover:text-foreground">Shop</Link>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <Link to={`/category/${product.categorySlug}`} className="text-muted-foreground hover:text-foreground">
              {product.category}
            </Link>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <span className="text-foreground font-medium">{product.name}</span>
          </nav>
        </div>
      </div>

      <section className="py-12">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="aspect-square rounded-2xl overflow-hidden bg-secondary/30">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Product Info */}
            <div>
              {/* Badges */}
              <div className="flex gap-2 mb-4">
                {product.badge && (
                  <span className={cn(
                    "px-3 py-1 text-xs font-semibold rounded-full",
                    product.badge === "Bestseller" && "bg-gold text-primary-foreground",
                    product.badge === "New" && "bg-leaf text-primary-foreground",
                    product.badge === "Premium" && "bg-primary text-primary-foreground",
                    !["Bestseller", "New", "Premium"].includes(product.badge) && "bg-secondary text-secondary-foreground"
                  )}>
                    {product.badge}
                  </span>
                )}
                {discount > 0 && (
                  <span className="px-3 py-1 bg-destructive text-destructive-foreground text-xs font-semibold rounded-full">
                    Save {discount}%
                  </span>
                )}
              </div>

              {/* Category */}
              <Link
                to={`/category/${product.categorySlug}`}
                className="text-leaf font-medium text-sm hover:underline"
              >
                {product.category}
              </Link>

              {/* Title */}
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "w-5 h-5",
                        i < Math.floor(product.rating) ? "fill-gold text-gold" : "fill-muted text-muted"
                      )}
                    />
                  ))}
                </div>
                <span className="font-medium">{product.rating}</span>
                <span className="text-muted-foreground">({product.reviews} reviews)</span>
              </div>

              {/* Description */}
              <p className="text-muted-foreground leading-relaxed mb-6">
                {product.description}
              </p>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-3xl font-bold text-foreground">₹{product.price}</span>
                {product.originalPrice && (
                  <span className="text-xl text-muted-foreground line-through">
                    ₹{product.originalPrice}
                  </span>
                )}
                <span className="text-muted-foreground text-sm">/ {product.weight}</span>
              </div>

              {/* Quantity & Add to Cart */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <div className="flex items-center border border-input rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-secondary transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-3 hover:bg-secondary transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <Button size="lg" className="flex-1" disabled={!product.inStock}>
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {product.inStock ? "Add to Cart" : "Out of Stock"}
                </Button>
                <Button size="lg" variant="outline">
                  <Heart className="w-5 h-5" />
                </Button>
              </div>

              {/* Buy Now */}
              {product.inStock && (
                <Button size="lg" variant="gold" className="w-full mb-8">
                  Buy Now
                </Button>
              )}

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-secondary/30 rounded-xl">
                <div className="text-center">
                  <Truck className="w-6 h-6 mx-auto mb-2 text-leaf" />
                  <p className="text-xs font-medium">Free Shipping</p>
                  <p className="text-xs text-muted-foreground">Above ₹999</p>
                </div>
                <div className="text-center">
                  <Shield className="w-6 h-6 mx-auto mb-2 text-leaf" />
                  <p className="text-xs font-medium">100% Organic</p>
                  <p className="text-xs text-muted-foreground">Certified</p>
                </div>
                <div className="text-center">
                  <RefreshCcw className="w-6 h-6 mx-auto mb-2 text-leaf" />
                  <p className="text-xs font-medium">Easy Returns</p>
                  <p className="text-xs text-muted-foreground">7 Days</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-16">
            <div className="border-b border-border">
              <nav className="flex gap-8">
                {(["benefits", "ingredients", "howToUse"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "pb-4 font-medium transition-colors relative",
                      activeTab === tab
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {tab === "benefits" && "Benefits"}
                    {tab === "ingredients" && "Ingredients"}
                    {tab === "howToUse" && "How to Use"}
                    {activeTab === tab && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                    )}
                  </button>
                ))}
              </nav>
            </div>

            <div className="py-8">
              {activeTab === "benefits" && (
                <ul className="grid sm:grid-cols-2 gap-3">
                  {product.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-leaf shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              )}
              {activeTab === "ingredients" && (
                <ul className="space-y-2">
                  {product.ingredients.map((ingredient, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-leaf" />
                      <span>{ingredient}</span>
                    </li>
                  ))}
                </ul>
              )}
              {activeTab === "howToUse" && (
                <p className="text-muted-foreground leading-relaxed max-w-2xl">
                  {product.howToUse}
                </p>
              )}
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mt-16">
              <h2 className="font-display text-2xl font-bold mb-8">You May Also Like</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {relatedProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}

import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { ShoppingBag, ArrowRight, Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useCartAPI } from "@/hooks/useCartAPI";
import { useAuth } from "@/contexts/AuthContext";
import { mapApiProductToLocal } from "@/lib/api";
import { toast } from "sonner";

export default function Cart() {
  const { isAuthenticated } = useAuth();
  const {
    items: localItems,
    total: localTotal,
    removeFromCart: localRemove,
    updateQuantity: localUpdate,
    clearCart: localClear,
  } = useCart();

  const {
    cart: apiCart,
    isLoading: apiLoading,
    removeItem: apiRemove,
    updateItem: apiUpdate,
    clearCart: apiClear,
  } = useCartAPI();

  // If logged in, use backend cart
  const isUsingApi = isAuthenticated;

  const handleRemove = async (itemId: string) => {
    if (isUsingApi) {
      try {
        await apiRemove(itemId);
        toast.success("Item removed from cart");
      } catch {
        toast.error("Failed to remove item");
      }
    } else {
      localRemove(itemId);
    }
  };

  const handleUpdateQuantity = async (itemId: string, quantity: number) => {
    if (isUsingApi) {
      try {
        await apiUpdate({ itemId, quantity });
      } catch {
        toast.error("Failed to update quantity");
      }
    } else {
      localUpdate(itemId, quantity);
    }
  };

  const handleClear = async () => {
    if (isUsingApi) {
      try {
        await apiClear();
        toast.success("Cart cleared");
      } catch {
        toast.error("Failed to clear cart");
      }
    } else {
      localClear();
    }
  };

  // Determine items and total based on auth state
  const displayItems = isUsingApi
    ? (apiCart?.items || []).map((item) => ({
        id: item._id,
        name: item.product.name,
        slug: item.product.slug,
        image:
          item.product.images?.find((img) => img.isPrimary)?.url ||
          item.product.images?.[0]?.url ||
          "",
        variantLabel: item.variant.displayLabel,
        price: item.variant.price,
        quantity: item.quantity,
        lineTotal: item.lineTotal,
      }))
    : localItems.map((item) => ({
        id: item.product.id,
        name: item.product.name,
        slug: item.product.slug,
        image: item.product.image,
        variantLabel: item.product.weight,
        price: item.product.price,
        quantity: item.quantity,
        lineTotal: item.product.price * item.quantity,
      }));

  const displayTotal = isUsingApi ? apiCart?.total || 0 : localTotal;
  const itemCount = isUsingApi
    ? apiCart?.itemCount || 0
    : localItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Layout>
      <section className="py-16">
        <div className="container max-w-4xl">
          <h1 className="font-display text-3xl font-bold mb-8">
            Shopping Cart
          </h1>

          {(isUsingApi && apiLoading) || displayItems.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-secondary/50 flex items-center justify-center">
                <ShoppingBag className="w-12 h-12 text-muted-foreground" />
              </div>
              <h2 className="font-display text-2xl font-semibold mb-2">
                Your cart is empty
              </h2>
              <p className="text-muted-foreground mb-8">
                Looks like you haven't added any products yet. Start exploring
                our organic collection!
              </p>
              <Link to="/shop">
                <Button size="lg" className="group">
                  Continue Shopping
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Cart Items */}
              <div className="bg-card rounded-2xl shadow-sm overflow-hidden">
                {displayItems.map((item, index) => (
                  <div
                    key={item.id}
                    className={`flex gap-4 p-4 ${
                      index !== displayItems.length - 1
                        ? "border-b border-border"
                        : ""
                    }`}
                  >
                    {/* Product Image */}
                    <Link
                      to={`/product/${item.slug}`}
                      className="shrink-0"
                    >
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-24 h-24 bg-secondary/50 rounded-lg flex items-center justify-center text-xs text-muted-foreground">
                          No image
                        </div>
                      )}
                    </Link>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <Link to={`/product/${item.slug}`}>
                        <h3 className="font-display font-semibold text-foreground hover:text-primary transition-colors">
                          {item.name}
                        </h3>
                      </Link>
                      <p className="text-sm text-muted-foreground mb-2">
                        {item.variantLabel}
                      </p>

                      <div className="flex items-center justify-between">
                        {/* Quantity Controls */}
                        <div className="flex items-center border border-input rounded-lg">
                          <button
                            onClick={() =>
                              handleUpdateQuantity(
                                item.id,
                                item.quantity - 1
                              )
                            }
                            className="p-2 hover:bg-secondary transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-10 text-center font-medium text-sm">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              handleUpdateQuantity(
                                item.id,
                                item.quantity + 1
                              )
                            }
                            className="p-2 hover:bg-secondary transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <p className="font-bold text-foreground">
                            ₹{item.lineTotal}
                          </p>
                          {item.quantity > 1 && (
                            <p className="text-xs text-muted-foreground">
                              ₹{item.price} each
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Cart Summary */}
              <div className="bg-card rounded-2xl shadow-sm p-6">
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">₹{displayTotal}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium text-leaf">
                      {displayTotal >= 999 ? "Free" : "₹99"}
                    </span>
                  </div>
                  <div className="border-t border-border pt-3 flex justify-between">
                    <span className="font-semibold">Total</span>
                    <span className="font-bold text-lg">
                      ₹{displayTotal >= 999 ? displayTotal : displayTotal + 99}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {!isAuthenticated ? (
                    <Link to="/account" className="block">
                      <Button size="lg" className="w-full">
                        Sign In to Checkout
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                    </Link>
                  ) : (
                    <Link to="/checkout" className="block">
                      <Button size="lg" className="w-full">
                        Proceed to Checkout
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                    </Link>
                  )}
                  <div className="flex gap-3">
                    <Link to="/shop" className="flex-1">
                      <Button
                        variant="outline"
                        size="lg"
                        className="w-full"
                      >
                        Continue Shopping
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="lg"
                      onClick={handleClear}
                      className="text-destructive hover:text-destructive"
                    >
                      Clear Cart
                    </Button>
                  </div>
                </div>

                {displayTotal < 999 && (
                  <p className="text-sm text-center text-muted-foreground mt-4">
                    Add ₹{999 - displayTotal} more for free shipping!
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}

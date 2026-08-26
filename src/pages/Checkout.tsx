import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/contexts/CartContext";
import { useCartAPI } from "@/hooks/useCartAPI";
import { useAuth } from "@/contexts/AuthContext";
import { ordersApi } from "@/lib/api";
import { ArrowLeft, CreditCard, Truck, Shield, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function Checkout() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Local cart for guests
  const { items: localItems, total: localTotal, clearCart: localClear } = useCart();

  // API cart for logged-in users
  const { cart: apiCart, isLoading: apiLoading, clearCart: apiClear } = useCartAPI();

  const isUsingApi = isAuthenticated;
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
  const shipping = displayTotal >= 999 ? 0 : 99;
  const grandTotal = displayTotal + shipping;

  const [isProcessing, setIsProcessing] = useState(false);

  // Shipping form state
  const [address, setAddress] = useState("");
  const [address2, setAddress2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error("Please sign in to place an order");
      navigate("/account");
      return;
    }

    setIsProcessing(true);

    try {
      await ordersApi.create({
        shippingAddress: {
          address: address2 ? `${address}, ${address2}` : address,
          city,
          state,
          pincode,
          country: "India",
        },
        paymentMethod: "COD",
      });

      // Clear cart
      try {
        await apiClear();
      } catch {
        // ignore clear errors
      }

      toast.success(
        "Order placed successfully! We'll send you a confirmation email."
      );
      navigate("/");
    } catch (err: any) {
      toast.error(err.message || "Failed to place order");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isUsingApi && apiLoading) {
    return (
      <Layout>
        <section className="py-16">
          <div className="container max-w-4xl text-center">
            <div className="animate-pulse-soft text-muted-foreground">
              Loading cart...
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  if (displayItems.length === 0) {
    return (
      <Layout>
        <section className="py-16">
          <div className="container max-w-4xl text-center">
            <h1 className="font-display text-3xl font-bold mb-4">
              Your cart is empty
            </h1>
            <p className="text-muted-foreground mb-8">
              Add some products to your cart before checking out.
            </p>
            <Link to="/shop">
              <Button>Continue Shopping</Button>
            </Link>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="py-12">
        <div className="container">
          <Link
            to="/cart"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Cart
          </Link>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Checkout Form */}
            <div>
              <h1 className="font-display text-3xl font-bold mb-8">
                Checkout
              </h1>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Shipping Address */}
                <div className="bg-card rounded-2xl p-6 shadow-sm">
                  <h2 className="font-display text-xl font-semibold mb-4">
                    Shipping Address
                  </h2>
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="address">Address *</Label>
                      <Input
                        id="address"
                        required
                        placeholder="123 Main St"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address2">
                        Apartment, suite, etc. (optional)
                      </Label>
                      <Input
                        id="address2"
                        placeholder="Apt 4B"
                        value={address2}
                        onChange={(e) => setAddress2(e.target.value)}
                      />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City *</Label>
                        <Input
                          id="city"
                          required
                          placeholder="Mumbai"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">State *</Label>
                        <Input
                          id="state"
                          required
                          placeholder="Maharashtra"
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="pincode">PIN Code *</Label>
                        <Input
                          id="pincode"
                          required
                          placeholder="400001"
                          value={pincode}
                          onChange={(e) => setPincode(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Input id="country" value="India" readOnly />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="bg-card rounded-2xl p-6 shadow-sm">
                  <h2 className="font-display text-xl font-semibold mb-4">
                    Payment Method
                  </h2>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-4 border border-border rounded-lg bg-secondary/30">
                      <input
                        type="radio"
                        name="payment"
                        value="cod"
                        defaultChecked
                        className="w-4 h-4"
                        readOnly
                      />
                      <span className="font-medium">Cash on Delivery</span>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5 mr-2" />
                      Place Order • ₹{grandTotal}
                    </>
                  )}
                </Button>
              </form>
            </div>

            {/* Order Summary */}
            <div className="lg:sticky lg:top-32 lg:self-start">
              <div className="bg-card rounded-2xl p-6 shadow-sm">
                <h2 className="font-display text-xl font-semibold mb-6">
                  Order Summary
                </h2>

                {/* Items */}
                <div className="space-y-4 mb-6">
                  {displayItems.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="relative">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-secondary/50 rounded-lg flex items-center justify-center text-xs text-muted-foreground">
                            —
                          </div>
                        )}
                        <span className="absolute -top-2 -right-2 w-5 h-5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.variantLabel}
                        </p>
                      </div>
                      <p className="font-semibold text-sm">₹{item.lineTotal}</p>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="space-y-3 border-t border-border pt-4 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">₹{displayTotal}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium text-leaf">
                      {shipping === 0 ? "Free" : `₹${shipping}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t border-border pt-3">
                    <span>Total</span>
                    <span>₹{grandTotal}</span>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-secondary/30 rounded-xl">
                  <div className="flex items-center gap-2 text-sm">
                    <Truck className="w-5 h-5 text-leaf" />
                    <span>Fast Delivery</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="w-5 h-5 text-leaf" />
                    <span>Secure Checkout</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

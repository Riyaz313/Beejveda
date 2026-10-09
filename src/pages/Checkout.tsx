import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/contexts/CartContext";
import { useCartAPI } from "@/hooks/useCartAPI";
import { useAuth } from "@/contexts/AuthContext";
import { authApi, ordersApi } from "@/lib/api";
import { useProducts } from "@/hooks/useProducts";
import { ArrowLeft, CreditCard, Truck, Shield, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function Checkout() {
  const navigate = useNavigate();
  const { isAuthenticated, user, updateUser } = useAuth();
  const nameParts = (user?.name || "").trim().split(/\s+/);
  const firstNameFromUser = nameParts[0] || "";
  const lastNameFromUser = nameParts.slice(1).join(" ") || "";

  // Local cart for guests
  const { items: localItems, total: localTotal, clearCart: localClear } = useCart();

  // API cart for logged-in users
  const { cart: apiCart, isLoading: apiLoading, clearCart: apiClear } = useCartAPI();
  const { mappedProducts: catalogProducts } = useProducts({ limit: 100 });
  const apiImageBySlug = new Map(catalogProducts.map((product) => [product.slug, product.image]));

  const isUsingApi = isAuthenticated;
  const displayItems = isUsingApi
    ? (apiCart?.items || []).map((item) => ({
        id: item._id,
        name: item.product.name,
        slug: item.product.slug,
        image:
          item.product.images?.find((img) => img.isPrimary)?.url ||
          item.product.images?.[0]?.url ||
          apiImageBySlug.get(item.product.slug) ||
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
        image: apiImageBySlug.get(item.product.slug) || "",
        variantLabel: item.product.weight,
        price: item.product.price,
        quantity: item.quantity,
        lineTotal: item.product.price * item.quantity,
      }));

  const displayTotal = isUsingApi ? apiCart?.total || 0 : localTotal;
  const shipping = displayTotal >= 999 ? 0 : 99;
  const grandTotal = displayTotal + shipping;

  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [saveAddressToBook, setSaveAddressToBook] = useState(false);

  const clearAddressSelection = () => setSelectedAddressId("");

  // Shipping form state
  const [firstName, setFirstName] = useState(firstNameFromUser);
  const [lastName, setLastName] = useState(lastNameFromUser);
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [address, setAddress] = useState("");
  const [address2, setAddress2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");

  useEffect(() => {
    if (!isAuthenticated || !Array.isArray(user?.addresses) || user.addresses.length === 0) {
      return;
    }

    const defaultAddress =
      user.addresses.find((addr: any) => addr.isDefault) || user.addresses[0];

    if (!defaultAddress) return;

    setSelectedAddressId(defaultAddress._id || "");
    setAddress(defaultAddress.address || "");
    setAddress2(defaultAddress.address2 || "");
    setCity(defaultAddress.city || "");
    setState(defaultAddress.state || "");
    setPincode(defaultAddress.pincode || "");
  }, [isAuthenticated, user]);

  const applySavedAddress = (id: string) => {
    if (!isAuthenticated || !Array.isArray(user?.addresses)) return;

    const found = user.addresses.find((addr: any) => String(addr._id) === String(id));
    if (!found) return;

    setSelectedAddressId(String(found._id || ""));
    setAddress(found.address || "");
    setAddress2(found.address2 || "");
    setCity(found.city || "");
    setState(found.state || "");
    setPincode(found.pincode || "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error("Please sign in to place an order");
      navigate("/account");
      return;
    }

    setIsProcessing(true);

    try {
      if (isAuthenticated && saveAddressToBook && selectedAddressId === "" && address.trim() && city.trim() && state.trim() && pincode.trim()) {
        const addresses = Array.isArray(user?.addresses) ? [...user.addresses] : [];
        const matchesExisting = addresses.some((addr: any) => (
          String(addr.address || "").trim().toLowerCase() === address.trim().toLowerCase() &&
          String(addr.city || "").trim().toLowerCase() === city.trim().toLowerCase() &&
          String(addr.state || "").trim().toLowerCase() === state.trim().toLowerCase() &&
          String(addr.pincode || "").trim().toLowerCase() === pincode.trim().toLowerCase()
        ));

        if (!matchesExisting) {
          const nextAddress = {
            label: "Checkout",
            address,
            address2,
            city,
            state,
            pincode,
            country: "India",
            isDefault: addresses.length === 0,
          };
          addresses.push(nextAddress);
          const nextUser = await authApi.updateMe({ addresses });
          updateUser(nextUser);
        }
      }

      await ordersApi.create({
        shippingAddress: {
          firstName,
          lastName,
          email,
          phone,
          address: address2 ? `${address}, ${address2}` : address,
          address2,
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
                    {isAuthenticated && Array.isArray(user?.addresses) && user.addresses.length > 0 && (
                      <div className="space-y-2">
                        <Label htmlFor="savedAddress">Choose saved address</Label>
                        <select
                          id="savedAddress"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          value={selectedAddressId}
                          onChange={(e) => {
                            const nextId = e.target.value;
                            setSelectedAddressId(nextId);
                            if (!nextId) {
                              setAddress("");
                              setAddress2("");
                              setCity("");
                              setState("");
                              setPincode("");
                              return;
                            }
                            applySavedAddress(nextId);
                          }}
                        >
                          <option value="">Enter new address</option>
                          {user.addresses.map((addr: any) => (
                            <option key={String(addr._id || `${addr.address}-${addr.city}`)} value={String(addr._id || "")}> 
                              {addr.label || "Shipping"} {addr.isDefault ? "(Default)" : ""} - {addr.address}, {addr.city}, {addr.state}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    {isAuthenticated && (
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="save-address-check"
                          checked={saveAddressToBook}
                          onChange={(e) => setSaveAddressToBook(e.target.checked)}
                          className="h-4 w-4"
                        />
                        <Label htmlFor="save-address-check" className="text-sm text-muted-foreground">
                          Save this new address in the address book
                        </Label>
                      </div>
                    )}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input
                          id="firstName"
                          required
                          placeholder="First Name"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input
                          id="lastName"
                          required
                          placeholder="Last Name"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          required
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone *</Label>
                        <Input
                          id="phone"
                          required
                          placeholder="+91 9876543210"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Address *</Label>
                      <Input
                        id="address"
                        required
                        placeholder="123 Main St"
                        value={address}
                        onChange={(e) => {
                          setSelectedAddressId("");
                          setAddress(e.target.value);
                        }}
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

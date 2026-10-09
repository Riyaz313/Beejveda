import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Mail, Lock, ArrowRight, LogOut, ShoppingBag, Heart, Shield, PackageCheck, MapPin, Star, Phone, Edit3, Plus, Trash2, Save, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";
import { authApi, ordersApi, type Order } from "@/lib/api";
import { toast } from "sonner";

export default function Account() {
  const { user, isAuthenticated, isAdmin, login, register, logout, isLoading, updateUser } = useAuth();
  const { itemCount: wishlistCount } = useWishlist();
  const { itemCount: cartCount } = useCart();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileNameDraft, setProfileNameDraft] = useState(user?.name ?? "");
  const [profilePhoneDraft, setProfilePhoneDraft] = useState(user?.phone ?? "");
  const [addressBookMode, setAddressBookMode] = useState<"view" | "edit" | "add">("view");
  const [editingAddressIndex, setEditingAddressIndex] = useState<number | null>(null);
  const emptyAddress = {
    label: "",
    address: "",
    address2: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    isDefault: false,
  };
  const [addressDraft, setAddressDraft] = useState(emptyAddress);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (isLogin) {
        await login(email, password);
        toast.success("Welcome back!");
      } else {
        await register(name, email, password);
        toast.success("Account created successfully!");
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
  };

  const savedDefaultAddress = user?.addresses?.find((a: any) => a.isDefault);
  const defaultAddress = savedDefaultAddress ?
    `${savedDefaultAddress.address}, ${savedDefaultAddress.city}, ${savedDefaultAddress.state} - ${savedDefaultAddress.pincode}, ${savedDefaultAddress.country}` :
    "No address yet";

  const openProfileEditor = () => {
    setProfileNameDraft(user?.name ?? "");
    setProfilePhoneDraft(user?.phone ?? "");
    setIsEditingProfile(true);
  };

  const saveProfile = async () => {
    try {
      const nextUser = await authApi.updateMe({
        name: profileNameDraft.trim(),
        phone: profilePhoneDraft.trim(),
      });
      updateUser(nextUser);
      setIsEditingProfile(false);
      toast.success("Profile updated");
    } catch (err: any) {
      toast.error(err.message || "Unable to update profile");
    }
  };

  const openAddressEditor = (address?: any, index?: number) => {
    setAddressDraft(address ? { ...address } : { ...emptyAddress });
    setEditingAddressIndex(index ?? null);
    setAddressBookMode(address ? "edit" : "add");
  };

  const saveAddress = async () => {
    if (!addressDraft.address || !addressDraft.city || !addressDraft.state || !addressDraft.pincode) {
      toast.error("Complete address details before saving");
      return;
    }

    const addresses = Array.isArray(user?.addresses) ? [...user.addresses] : [];

    if (addressBookMode === "add") {
      addresses.push({ ...addressDraft, isDefault: addresses.length === 0 });
    }

    if (addressBookMode === "edit" && editingAddressIndex !== null) {
      addresses[editingAddressIndex] = { ...addresses[editingAddressIndex], ...addressDraft };
    }

    try {
      const nextUser = await authApi.updateMe({ addresses });
      updateUser(nextUser);
      setAddressBookMode("view");
      setEditingAddressIndex(null);
      setAddressDraft(emptyAddress);
      toast.success("Address saved");
    } catch (err: any) {
      toast.error(err.message || "Unable to update address book");
    }
  };

  const deleteAddress = async (index: number) => {
    if (!user?.addresses || !user.addresses.length) return;
    const addresses = user.addresses.filter((_, i) => i !== index);
    try {
      const nextUser = await authApi.updateMe({ addresses });
      updateUser(nextUser);
      toast.success("Address removed");
    } catch (err: any) {
      toast.error(err.message || "Unable to remove address");
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    const loadOrders = async () => {
      setOrdersLoading(true);
      try {
        const data = await ordersApi.getMyOrders();
        setOrders(data);
      } catch (err: any) {
        toast.error(err.message || "Unable to load your orders");
      } finally {
        setOrdersLoading(false);
      }
    };

    loadOrders();
  }, [isAuthenticated]);

  // Loading state
  if (isLoading) {
    return (
      <Layout>
        <section className="py-16 bg-secondary/30 min-h-[70vh] flex items-center justify-center">
          <div className="animate-pulse-soft text-muted-foreground">Loading...</div>
        </section>
      </Layout>
    );
  }

  // Authenticated - show account dashboard
  if (isAuthenticated && user) {
    return (
      <Layout>
        <section className="min-h-[70vh] bg-secondary/30 py-8 md:py-12">
          <div className="container max-w-7xl">
            <header className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-hero text-xl font-bold text-primary-foreground">
                  {user.name?.trim().charAt(0).toUpperCase() || <User className="h-6 w-6" />}
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Your BeejVeda account</p>
                  <h1 className="font-display text-2xl font-bold md:text-3xl">Welcome, {user.name}</h1>
                  <p className="mt-1 text-sm text-muted-foreground">Manage your orders, profile, and delivery addresses.</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="outline" size="sm"><a href="#orders"><PackageCheck className="mr-2 h-4 w-4" />Orders</a></Button>
                <Button asChild variant="outline" size="sm"><a href="#address-book"><MapPin className="mr-2 h-4 w-4" />Addresses</a></Button>
                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={handleLogout}><LogOut className="mr-2 h-4 w-4" />Sign out</Button>
              </div>
            </header>

            <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
              <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10"><PackageCheck className="h-5 w-5 text-primary" /></div>
                <div><p className="font-display text-xl font-bold">{orders.length}</p><p className="text-xs text-muted-foreground">Orders placed</p></div>
              </div>
              <Link to="/cart" className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-secondary/40">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10"><ShoppingBag className="h-5 w-5 text-primary" /></div>
                <div><p className="font-display text-xl font-bold">{cartCount}</p><p className="text-xs text-muted-foreground">Cart items</p></div>
              </Link>
              <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10"><MapPin className="h-5 w-5 text-primary" /></div>
                <div><p className="font-display text-xl font-bold">{user.addresses?.length || 0}</p><p className="text-xs text-muted-foreground">Saved addresses</p></div>
              </div>
              <Link to="/wishlist" className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-secondary/40">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10"><Heart className="h-5 w-5 text-primary" /></div>
                <div><p className="font-display text-xl font-bold">{wishlistCount}</p><p className="text-xs text-muted-foreground">Wishlist items</p></div>
              </Link>
            </div>

            <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
              <section id="orders" className="min-w-0 rounded-xl border border-border bg-card p-4 md:col-span-7 md:p-6 lg:col-span-8">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2"><PackageCheck className="h-5 w-5 text-primary" /><h2 className="font-display text-xl font-bold">My orders</h2></div>
                  <span className="text-sm text-muted-foreground">{orders.length} {orders.length === 1 ? "order" : "orders"}</span>
                </div>
                {ordersLoading ? (
                  <p className="text-sm text-muted-foreground">Loading orders...</p>
                ) : orders.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-border px-5 py-10 text-center">
                    <PackageCheck className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                    <p className="font-medium">No orders yet</p>
                    <p className="mt-1 text-sm text-muted-foreground">Your orders will appear here after checkout.</p>
                    <Button asChild variant="outline" size="sm" className="mt-4"><Link to="/shop">Browse products</Link></Button>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {orders.slice(0, 4).map((order) => (
                      <div key={order._id} className="py-3 first:pt-0 last:pb-0">
                        <button type="button" aria-expanded={selectedOrderId === order._id} onClick={() => setSelectedOrderId(order._id === selectedOrderId ? null : order._id)} className="flex min-h-14 w-full flex-wrap items-center justify-between gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-secondary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2"><span className="text-sm font-semibold">Order #{order._id.slice(-6).toUpperCase()}</span><span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-medium capitalize text-primary">{order.status}</span></div>
                            <div className="mt-1 text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()} · ₹{order.grandTotal}</div>
                          </div>
                          <span className="text-xs font-medium capitalize text-muted-foreground">{order.paymentStatus}</span>
                        </button>
                        {selectedOrderId === order._id && (
                          <div className="mt-2 rounded-lg border border-border bg-secondary/20 p-4">
                            <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><div className="font-display text-lg font-bold">Order #{order._id.slice(-6).toUpperCase()}</div><div className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</div></div><span className="rounded-full bg-leaf/10 px-3 py-1 text-[11px] font-bold uppercase text-leaf">{order.status}</span></div>
                            <div className="grid gap-4 sm:grid-cols-2">
                              <div><div className="flex items-center gap-2 text-sm font-semibold"><PackageCheck className="h-4 w-4 text-primary" />Products</div><div className="mt-2 space-y-2">{order.items.map((item, idx) => <div key={idx} className="flex items-center justify-between gap-3 text-xs"><span className="text-muted-foreground">{item.name}</span><span className="shrink-0 font-medium">Qty {item.quantity} · ₹{item.lineTotal}</span></div>)}</div></div>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between gap-4"><span className="text-muted-foreground">Amount</span><span className="font-bold">₹{order.grandTotal}</span></div>
                                <div className="flex justify-between gap-4"><span className="text-muted-foreground">Shipping</span><span className="font-medium">₹{order.shippingFee}</span></div>
                                <div className="flex justify-between gap-4"><span className="text-muted-foreground">Payment</span><span className="font-medium uppercase">{order.paymentMethod}</span></div>
                                <div className="flex justify-between gap-4"><span className="text-muted-foreground">Payment status</span><span className="font-medium capitalize">{order.paymentStatus}</span></div>
                              </div>
                            </div>
                            <div className="mt-4 border-t border-border pt-3"><div className="flex items-center gap-2 text-sm font-semibold"><MapPin className="h-4 w-4 text-primary" />Shipping address</div><div className="mt-2 text-xs leading-5 text-muted-foreground"><div>{order.shippingAddress.address}</div><div>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</div><div>{order.shippingAddress.country}</div></div></div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <aside className="space-y-4 md:col-span-5 lg:col-span-4">
                <section id="profile" className="rounded-xl border border-border bg-card p-5">
                  <div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2"><User className="h-5 w-5 text-primary" /><h2 className="font-display text-lg font-bold">Profile</h2></div><Button type="button" variant="outline" size="sm" onClick={openProfileEditor}><Edit3 className="mr-2 h-4 w-4" />Edit</Button></div>
                  <div className="mt-4 space-y-3"><div className="flex items-center gap-3 break-all"><Mail className="h-4 w-4 shrink-0 text-muted-foreground" /><span className="text-sm text-muted-foreground">{user.email}</span></div><div className="flex items-center gap-3"><Phone className="h-4 w-4 shrink-0 text-muted-foreground" /><span className="text-sm text-muted-foreground">{user.phone || "No phone added"}</span></div></div>
                  {isEditingProfile && <div className="mt-4 space-y-3 border-t border-border pt-4"><div><label className="text-xs font-semibold text-muted-foreground">Name</label><Input value={profileNameDraft} onChange={(e) => setProfileNameDraft(e.target.value)} className="mt-1" /></div><div><label className="text-xs font-semibold text-muted-foreground">Phone</label><Input value={profilePhoneDraft} onChange={(e) => setProfilePhoneDraft(e.target.value)} className="mt-1" /></div><div className="flex flex-wrap gap-2"><Button type="button" size="sm" onClick={saveProfile}><Save className="mr-2 h-4 w-4" />Save changes</Button><Button type="button" variant="ghost" size="sm" onClick={() => setIsEditingProfile(false)}><X className="mr-2 h-4 w-4" />Cancel</Button></div></div>}
                </section>

                <section id="address-book" className="rounded-xl border border-border bg-card p-5">
                  <div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2"><MapPin className="h-5 w-5 text-primary" /><h2 className="font-display text-lg font-bold">Address book</h2></div><Button type="button" variant="outline" size="sm" onClick={() => openAddressEditor()}><Plus className="mr-2 h-4 w-4" />Add</Button></div>
                  <p className="mt-1 text-sm text-muted-foreground">Default for checkout: {defaultAddress}</p>
                  <div className="mt-4 space-y-3">
                    {Array.isArray(user.addresses) && user.addresses.length > 0 ? user.addresses.map((addr: any, index: number) => (
                      <div key={addr._id || index} className="rounded-lg border border-border p-3">
                        <div className="flex items-start justify-between gap-3"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="text-sm font-semibold">{addr.label || "Shipping"}</span>{addr.isDefault && <span className="rounded-full bg-leaf/10 px-2 py-1 text-[10px] font-semibold text-leaf">Default</span>}</div><p className="mt-2 text-xs leading-5 text-muted-foreground">{addr.address}{addr.address2 ? `, ${addr.address2}` : ""}, {addr.city}, {addr.state} - {addr.pincode}, {addr.country}</p></div>
                          <div className="flex shrink-0 items-center gap-1"><button type="button" title="Edit address" aria-label="Edit address" onClick={() => openAddressEditor(addr, index)} className="rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-primary"><Edit3 className="h-4 w-4" /></button><button type="button" title={addr.isDefault ? "Default address" : "Set as default"} aria-label={addr.isDefault ? "Default address" : "Set as default address"} disabled={addr.isDefault} onClick={async () => { const nextAddresses = user.addresses.map((item: any, itemIndex: number) => ({ ...item, isDefault: itemIndex === index })); try { const nextUser = await authApi.updateMe({ addresses: nextAddresses }); updateUser(nextUser); toast.success("Default address updated"); } catch (err: any) { toast.error(err.message || "Unable to set default address"); } }} className="rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-primary disabled:opacity-40"><Star className="h-4 w-4" /></button><button type="button" title="Remove address" aria-label="Remove address" onClick={() => deleteAddress(index)} className="rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-destructive"><Trash2 className="h-4 w-4" /></button></div>
                        </div>
                      </div>
                    )) : <p className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">No saved addresses yet. Add one to speed up checkout.</p>}
                  </div>
                  {(addressBookMode === "add" || addressBookMode === "edit") && <div className="mt-4 space-y-3 border-t border-border pt-4"><Input aria-label="Address label" placeholder="Label, e.g. Home" value={addressDraft.label ?? ""} onChange={(e) => setAddressDraft({ ...addressDraft, label: e.target.value })} /><Input aria-label="Street address" placeholder="Street address" value={addressDraft.address} onChange={(e) => setAddressDraft({ ...addressDraft, address: e.target.value })} /><Input aria-label="Address line 2" placeholder="Address line 2" value={addressDraft.address2 ?? ""} onChange={(e) => setAddressDraft({ ...addressDraft, address2: e.target.value })} /><div className="grid grid-cols-2 gap-2"><Input aria-label="City" placeholder="City" value={addressDraft.city} onChange={(e) => setAddressDraft({ ...addressDraft, city: e.target.value })} /><Input aria-label="State" placeholder="State" value={addressDraft.state} onChange={(e) => setAddressDraft({ ...addressDraft, state: e.target.value })} /></div><div className="grid grid-cols-2 gap-2"><Input aria-label="Pincode" placeholder="Pincode" value={addressDraft.pincode} onChange={(e) => setAddressDraft({ ...addressDraft, pincode: e.target.value })} /><Input aria-label="Country" placeholder="Country" value={addressDraft.country} onChange={(e) => setAddressDraft({ ...addressDraft, country: e.target.value })} /></div><div className="flex flex-wrap gap-2"><Button type="button" size="sm" onClick={saveAddress}><Save className="mr-2 h-4 w-4" />Save address</Button><Button type="button" variant="ghost" size="sm" onClick={() => { setAddressBookMode("view"); setAddressDraft(emptyAddress); setEditingAddressIndex(null); }}>Cancel</Button></div></div>}
                </section>

                <nav aria-label="Account shortcuts" className="rounded-xl border border-border bg-card p-5"><h2 className="font-display text-lg font-bold">Quick links</h2><div className="mt-3 grid gap-1"><Link to="/wishlist" className="rounded-md px-2 py-2 text-sm text-primary hover:bg-secondary">My wishlist</Link><Link to="/cart" className="rounded-md px-2 py-2 text-sm text-primary hover:bg-secondary">My cart</Link><Link to="/shipping" className="rounded-md px-2 py-2 text-sm text-primary hover:bg-secondary">Shipping information</Link><Link to="/refund" className="rounded-md px-2 py-2 text-sm text-primary hover:bg-secondary">Returns and refunds</Link></div></nav>
              </aside>
            </div>

            {isAdmin && <div className="mt-6"><Button asChild variant="outline"><Link to="/admin"><Shield className="mr-2 h-4 w-4" />Admin dashboard</Link></Button></div>}
          </div>
        </section>
      </Layout>
    );
  }

  // Not authenticated - show login/register form
  return (
    <Layout>
      <section className="py-16 bg-secondary/30 min-h-[70vh] flex items-center">
        <div className="container max-w-md">
          <div className="bg-card p-8 rounded-2xl shadow-lg">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-hero flex items-center justify-center">
                <User className="w-8 h-8 text-primary-foreground" />
              </div>
              <h1 className="font-display text-2xl font-bold">
                {isLogin ? "Welcome Back" : "Create Account"}
              </h1>
              <p className="text-muted-foreground text-sm mt-2">
                {isLogin
                  ? "Sign in to access your orders and wishlist"
                  : "Join BeejVedaNaturals for exclusive offers"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      placeholder="John Doe"
                      className="pl-10"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="john@example.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <Button size="lg" className="w-full group" type="submit" disabled={submitting}>
                {submitting ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-primary font-medium hover:underline"
                >
                  {isLogin ? "Sign Up" : "Sign In"}
                </button>
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

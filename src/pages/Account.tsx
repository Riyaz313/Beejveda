import { useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Mail, Lock, ArrowRight, LogOut, ShoppingBag, Heart, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function Account() {
  const { user, isAuthenticated, isAdmin, login, register, logout, isLoading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
        <section className="py-16 bg-secondary/30 min-h-[70vh]">
          <div className="container max-w-2xl">
            <div className="bg-card p-8 rounded-2xl shadow-lg">
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-hero flex items-center justify-center">
                  <User className="w-8 h-8 text-primary-foreground" />
                </div>
                <h1 className="font-display text-2xl font-bold">My Account</h1>
                <p className="text-muted-foreground text-sm mt-1">
                  Welcome, {user.name}
                </p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-4 p-4 bg-secondary/30 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-secondary/30 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium capitalize">{user.role}</p>
                    <p className="text-xs text-muted-foreground">Account type</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <Link to="/wishlist">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Heart className="w-4 h-4" />
                    My Wishlist
                  </Button>
                </Link>
                <Link to="/cart">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <ShoppingBag className="w-4 h-4" />
                    My Cart
                  </Button>
                </Link>
              </div>

              {isAdmin && (
                <Link to="/admin" className="block mb-6">
                  <Button variant="default" className="w-full gap-2">
                    <Shield className="w-4 h-4" />
                    Admin Dashboard
                  </Button>
                </Link>
              )}

              <Button
                variant="ghost"
                className="w-full text-destructive hover:text-destructive"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
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

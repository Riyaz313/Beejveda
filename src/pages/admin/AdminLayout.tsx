import { useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Layout } from "@/components/layout/Layout";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
  SidebarSeparator,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  Package,
  Tags,
  ShoppingCart,
  Users,
  ArrowLeft,
  LogOut,
  Leaf,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";

const adminNav = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Categories", href: "/admin/categories", icon: Tags },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { name: "Users", href: "/admin/users", icon: Users },
];

export default function AdminLayout() {
  const { user, isAuthenticated, isAdmin, isLoading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      navigate("/account");
    }
  }, [isLoading, isAuthenticated, isAdmin, navigate]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-pulse-soft text-muted-foreground">Loading admin panel...</div>
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out");
    navigate("/");
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-hero flex items-center justify-center">
              <Leaf className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-display font-bold text-sm text-primary leading-tight">
                BeejVeda
              </h2>
              <p className="text-[10px] text-muted-foreground">Admin Panel</p>
            </div>
          </Link>
        </SidebarHeader>

        <SidebarSeparator />

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Management</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminNav.map((item) => {
                  const isActive =
                    item.href === "/admin"
                      ? location.pathname === "/admin"
                      : location.pathname.startsWith(item.href);

                  return (
                    <SidebarMenuItem key={item.name}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        className={
                          isActive
                            ? "bg-primary text-primary-foreground hover:bg-primary/90"
                            : ""
                        }
                      >
                        <Link to={item.href}>
                          <item.icon className="w-4 h-4" />
                          <span>{item.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarSeparator />

        <SidebarFooter className="p-4 space-y-2">
          <Link to="/" className="block">
            <Button variant="outline" size="sm" className="w-full gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Store
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="w-full gap-2 text-destructive hover:text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        {/* Top bar */}
        <header className="flex items-center gap-2 border-b border-border px-4 py-3">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-6" />
          <div className="flex-1">
            <h1 className="font-display font-semibold text-lg text-foreground">
              {adminNav.find(
                (n) =>
                  n.href === "/admin"
                    ? location.pathname === "/admin"
                    : location.pathname.startsWith(n.href)
              )?.name || "Admin"}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {user?.name}
            </span>
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || "A"}
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 p-4 md:p-6 overflow-auto">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

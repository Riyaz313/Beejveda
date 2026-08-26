import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingCart, Users, IndianRupee } from "lucide-react";

interface DashboardStats {
  products: number;
  orders: number;
  users: number;
  revenue: number;
  recentOrders: any[];
}

export default function AdminDashboard() {
  const productsQuery = useQuery({
    queryKey: ["admin-stats-products"],
    queryFn: () => adminApi.getProducts({ limit: 1 }),
  });

  const ordersQuery = useQuery({
    queryKey: ["admin-stats-orders"],
    queryFn: () => adminApi.getOrders({ limit: 10 }),
  });

  const usersQuery = useQuery({
    queryKey: ["admin-stats-users"],
    queryFn: () => adminApi.getUsers({ limit: 1 }),
  });

  const productsData = productsQuery.data as any;
  const ordersData = ordersQuery.data as any;
  const usersData = usersQuery.data as any;

  const totalRevenue =
    ordersData?.data?.orders?.reduce(
      (sum: number, o: any) => sum + (o.grandTotal || 0),
      0
    ) || 0;

  const stats = [
    {
      title: "Total Products",
      value: productsData?.data?.total ?? "—",
      icon: Package,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Total Orders",
      value: ordersData?.data?.total ?? "—",
      icon: ShoppingCart,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Total Users",
      value: usersData?.data?.total ?? "—",
      icon: Users,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      title: "Revenue",
      value: `₹${totalRevenue.toLocaleString()}`,
      icon: IndianRupee,
      color: "text-gold",
      bg: "bg-amber-50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-display">
                {productsQuery.isLoading || ordersQuery.isLoading || usersQuery.isLoading
                  ? "..."
                  : stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display">Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {ordersQuery.isLoading ? (
            <p className="text-muted-foreground text-sm">Loading orders...</p>
          ) : ordersData?.data?.orders?.length > 0 ? (
            <div className="space-y-3">
              {ordersData.data.orders.slice(0, 5).map((order: any) => (
                <div
                  key={order._id}
                  className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {order.user?.name || "Unknown"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                  <div className="text-right ml-4 shrink-0">
                    <p className="font-semibold text-sm">₹{order.grandTotal}</p>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        order.status === "delivered"
                          ? "bg-green-100 text-green-700"
                          : order.status === "cancelled"
                          ? "bg-red-100 text-red-700"
                          : order.status === "processing"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm text-center py-4">
              No orders yet
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

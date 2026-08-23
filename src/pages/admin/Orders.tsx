import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Eye,
} from "lucide-react";
import { toast } from "sonner";

const STATUS_OPTIONS = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const statusColor: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  processing: "bg-indigo-100 text-indigo-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function AdminOrders() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const ordersQuery = useQuery({
    queryKey: ["admin-orders", statusFilter, page],
    queryFn: () =>
      adminApi.getOrders({
        status: statusFilter === "all" ? undefined : statusFilter,
        page,
        limit: 10,
      }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      adminApi.updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      toast.success("Order status updated");
      setDetailDialogOpen(false);
    },
    onError: (err: any) => toast.error(err.message),
  });

  const ordersData = (ordersQuery.data as any)?.data;
  const orders = ordersData?.orders || [];
  const totalPages = ordersData?.pages || 1;

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={statusFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setStatusFilter("all");
              setPage(1);
            }}
          >
            All
          </Button>
          {STATUS_OPTIONS.map((s) => (
            <Button
              key={s}
              variant={statusFilter === s ? "default" : "outline"}
              size="sm"
              className="capitalize"
              onClick={() => {
                setStatusFilter(s);
                setPage(1);
              }}
            >
              {s}
            </Button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          {ordersQuery.isLoading ? (
            <div className="p-8 text-center text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
              Loading orders...
            </div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No orders found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left font-medium p-4 text-muted-foreground">
                      Order ID
                    </th>
                    <th className="text-left font-medium p-4 text-muted-foreground hidden sm:table-cell">
                      Customer
                    </th>
                    <th className="text-left font-medium p-4 text-muted-foreground hidden md:table-cell">
                      Items
                    </th>
                    <th className="text-left font-medium p-4 text-muted-foreground">
                      Total
                    </th>
                    <th className="text-left font-medium p-4 text-muted-foreground">
                      Status
                    </th>
                    <th className="text-left font-medium p-4 text-muted-foreground hidden lg:table-cell">
                      Date
                    </th>
                    <th className="text-right font-medium p-4 text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order: any) => (
                    <tr
                      key={order._id}
                      className="border-b border-border last:border-0 hover:bg-secondary/30"
                    >
                      <td className="p-4">
                        <span className="font-mono text-xs">
                          {order._id.slice(-8).toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4 hidden sm:table-cell">
                        <p className="font-medium">{order.user?.name || "—"}</p>
                        <p className="text-xs text-muted-foreground">
                          {order.user?.email || ""}
                        </p>
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        <span className="text-sm">
                          {order.items?.length || 0} item
                          {order.items?.length !== 1 ? "s" : ""}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="font-semibold">₹{order.grandTotal}</span>
                      </td>
                      <td className="p-4">
                        <Badge
                          variant="secondary"
                          className={`${statusColor[order.status] || ""} capitalize`}
                        >
                          {order.status}
                        </Badge>
                      </td>
                      <td className="p-4 hidden lg:table-cell">
                        <span className="text-sm text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => {
                            setSelectedOrder(order);
                            setDetailDialogOpen(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">Order Details</DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Order ID</p>
                  <p className="font-mono text-sm">
                    {selectedOrder._id.slice(-8).toUpperCase()}
                  </p>
                </div>
                <Badge
                  variant="secondary"
                  className={`${statusColor[selectedOrder.status] || ""} capitalize`}
                >
                  {selectedOrder.status}
                </Badge>
              </div>

              <div className="p-3 bg-secondary/30 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Customer</p>
                <p className="font-medium text-sm">
                  {selectedOrder.user?.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {selectedOrder.user?.email}
                </p>
                {selectedOrder.user?.phone && (
                  <p className="text-xs text-muted-foreground">
                    {selectedOrder.user.phone}
                  </p>
                )}
              </div>

              <div className="p-3 bg-secondary/30 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">
                  Shipping Address
                </p>
                <p className="text-sm">
                  {selectedOrder.shippingAddress?.address},{" "}
                  {selectedOrder.shippingAddress?.city},{" "}
                  {selectedOrder.shippingAddress?.state} -{" "}
                  {selectedOrder.shippingAddress?.pincode}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-2">Items</p>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item: any, i: number) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-sm p-2 bg-secondary/30 rounded"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.variant?.displayLabel} × {item.quantity}
                        </p>
                      </div>
                      <span className="font-medium ml-2">
                        ₹{item.lineTotal}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-border pt-3 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{selectedOrder.itemsTotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>
                    {selectedOrder.shippingFee === 0
                      ? "Free"
                      : `₹${selectedOrder.shippingFee}`}
                  </span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>₹{selectedOrder.grandTotal}</span>
                </div>
              </div>

              <div className="border-t border-border pt-3">
                <p className="text-xs text-muted-foreground mb-2">
                  Update Status
                </p>
                <div className="flex gap-2">
                  <Select
                    value={selectedOrder.status}
                    onValueChange={(v) => {
                      updateStatusMutation.mutate({
                        id: selectedOrder._id,
                        status: v,
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((s) => (
                        <SelectItem key={s} value={s} className="capitalize">
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

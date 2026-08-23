import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  UserIcon,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminUsers() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingRoleChange, setPendingRoleChange] = useState<{
    userId: string;
    userName: string;
    newRole: string;
  } | null>(null);

  const usersQuery = useQuery({
    queryKey: ["admin-users", search, roleFilter, page],
    queryFn: () =>
      adminApi.getUsers({
        search: search || undefined,
        role: roleFilter === "all" ? undefined : roleFilter,
        page,
        limit: 10,
      }),
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) =>
      adminApi.updateUserRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("User role updated");
      setConfirmDialogOpen(false);
      setPendingRoleChange(null);
    },
    onError: (err: any) => {
      toast.error(err.message);
      setConfirmDialogOpen(false);
    },
  });

  const usersData = (usersQuery.data as any)?.data;
  const users = usersData?.users || [];
  const totalPages = usersData?.pages || 1;

  const handleRoleChange = (userId: string, userName: string, newRole: string) => {
    setPendingRoleChange({ userId, userName, newRole });
    setConfirmDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            className="pl-10"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <Select
          value={roleFilter}
          onValueChange={(v) => {
            setRoleFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="customer">Customer</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          {usersQuery.isLoading ? (
            <div className="p-8 text-center text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
              Loading users...
            </div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No users found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left font-medium p-4 text-muted-foreground">
                      User
                    </th>
                    <th className="text-left font-medium p-4 text-muted-foreground hidden sm:table-cell">
                      Email
                    </th>
                    <th className="text-left font-medium p-4 text-muted-foreground">
                      Role
                    </th>
                    <th className="text-left font-medium p-4 text-muted-foreground hidden md:table-cell">
                      Joined
                    </th>
                    <th className="text-right font-medium p-4 text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user: any) => (
                    <tr
                      key={user._id}
                      className="border-b border-border last:border-0 hover:bg-secondary/30"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <span className="text-sm font-bold text-primary">
                              {user.name?.charAt(0)?.toUpperCase() || "?"}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium truncate">{user.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 hidden sm:table-cell">
                        <span className="text-sm text-muted-foreground">
                          {user.email}
                        </span>
                      </td>
                      <td className="p-4">
                        <Badge
                          variant="secondary"
                          className={`capitalize ${
                            user.role === "admin"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {user.role}
                        </Badge>
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        <span className="text-sm text-muted-foreground">
                          {new Date(user.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <Select
                          value={user.role}
                          onValueChange={(v) =>
                            handleRoleChange(user._id, user.name, v)
                          }
                        >
                          <SelectTrigger className="w-[110px] h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="customer">Customer</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
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

      {/* Role Change Confirmation */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display">Change User Role</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to change{" "}
            <strong>{pendingRoleChange?.userName}</strong>'s role to{" "}
            <strong className="capitalize">{pendingRoleChange?.newRole}</strong>?
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setConfirmDialogOpen(false);
                setPendingRoleChange(null);
              }}
            >
              Cancel
            </Button>
            <Button
              disabled={updateRoleMutation.isPending}
              onClick={() => {
                if (pendingRoleChange) {
                  updateRoleMutation.mutate({
                    id: pendingRoleChange.userId,
                    role: pendingRoleChange.newRole,
                  });
                }
              }}
            >
              {updateRoleMutation.isPending && (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              )}
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

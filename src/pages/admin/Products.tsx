import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi, categoriesApi } from "@/lib/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminProducts() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [deletingProduct, setDeletingProduct] = useState<any>(null);

  // Form state
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    badge: "",
    brand: "Beejveda",
    benefits: "",
    ingredients: "",
    howToUse: "",
    isActive: true,
  });

  const [variantForm, setVariantForm] = useState({
    unitType: "weight" as string,
    value: 0,
    unit: "g",
    price: 0,
    originalPrice: 0,
    stock: 0,
    isDefault: true,
  });

  const productsQuery = useQuery({
    queryKey: ["admin-products", search, page],
    queryFn: () =>
      adminApi.getProducts({ search: search || undefined, page, limit: 10 }),
  });

  const categoriesQuery = useQuery({
    queryKey: ["admin-categories-list"],
    queryFn: () => categoriesApi.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => adminApi.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("Product created");
      setDialogOpen(false);
      resetForm();
    },
    onError: (err: any) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      adminApi.updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("Product updated");
      setDialogOpen(false);
      resetForm();
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteProduct(id, false),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("Product deactivated");
      setDeleteDialogOpen(false);
      setDeletingProduct(null);
    },
    onError: (err: any) => toast.error(err.message),
  });

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      category: "",
      badge: "",
      brand: "Beejveda",
      benefits: "",
      ingredients: "",
      howToUse: "",
      isActive: true,
    });
    setVariantForm({
      unitType: "weight",
      value: 0,
      unit: "g",
      price: 0,
      originalPrice: 0,
      stock: 0,
      isDefault: true,
    });
    setEditingProduct(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (product: any) => {
    setEditingProduct(product);
    const defaultVariant =
      product.variants?.find((v: any) => v.isDefault) || product.variants?.[0];
    setForm({
      name: product.name || "",
      description: product.description || "",
      category: product.category?._id || product.category || "",
      badge: product.badge || "",
      brand: product.brand || "Beejveda",
      benefits: (product.benefits || []).join(", "),
      ingredients: (product.ingredients || []).join(", "),
      howToUse: product.howToUse || "",
      isActive: product.isActive ?? true,
    });
    if (defaultVariant) {
      setVariantForm({
        unitType: defaultVariant.unitType,
        value: defaultVariant.value,
        unit: defaultVariant.unit,
        price: defaultVariant.price,
        originalPrice: defaultVariant.originalPrice || 0,
        stock: defaultVariant.stock,
        isDefault: true,
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      name: form.name,
      description: form.description,
      category: form.category,
      badge: form.badge || undefined,
      brand: form.brand,
      benefits: form.benefits
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      ingredients: form.ingredients
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      howToUse: form.howToUse,
      isActive: form.isActive,
      variants: [
        {
          unitType: variantForm.unitType,
          value: variantForm.value,
          unit: variantForm.unit,
          price: variantForm.price,
          originalPrice: variantForm.originalPrice || undefined,
          stock: variantForm.stock,
          isDefault: true,
        },
      ],
    };

    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct._id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const productsData = productsQuery.data as any;
  const categoriesData = categoriesQuery.data as any;
  const products = productsData?.data?.products || [];
  const totalPages = productsData?.data?.pages || 1;

  const getCategoryName = (cat: any) => {
    if (typeof cat === "object" && cat?.name) return cat.name;
    const found = categoriesData?.find?.((c: any) => c._id === cat);
    return found?.name || "—";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            className="pl-10"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <Button onClick={openCreateDialog} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Product
        </Button>
      </div>

      {/* Products Table */}
      <Card>
        <CardContent className="p-0">
          {productsQuery.isLoading ? (
            <div className="p-8 text-center text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
              Loading products...
            </div>
          ) : products.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No products found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left font-medium p-4 text-muted-foreground">
                      Product
                    </th>
                    <th className="text-left font-medium p-4 text-muted-foreground hidden md:table-cell">
                      Category
                    </th>
                    <th className="text-left font-medium p-4 text-muted-foreground hidden lg:table-cell">
                      Price
                    </th>
                    <th className="text-left font-medium p-4 text-muted-foreground hidden sm:table-cell">
                      Status
                    </th>
                    <th className="text-right font-medium p-4 text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product: any) => {
                    const defaultVariant =
                      product.variants?.find((v: any) => v.isDefault) ||
                      product.variants?.[0];

                    return (
                      <tr
                        key={product._id}
                        className="border-b border-border last:border-0 hover:bg-secondary/30"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center shrink-0 text-xs text-muted-foreground">
                              {product.images?.length > 0 ? "📷" : "—"}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium truncate max-w-[200px]">
                                {product.name}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {product.slug}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 hidden md:table-cell">
                          <span className="text-sm">
                            {getCategoryName(product.category)}
                          </span>
                        </td>
                        <td className="p-4 hidden lg:table-cell">
                          <span className="font-semibold">
                            ₹{defaultVariant?.price || 0}
                          </span>
                          {defaultVariant?.originalPrice && (
                            <span className="text-xs text-muted-foreground line-through ml-1">
                              ₹{defaultVariant.originalPrice}
                            </span>
                          )}
                        </td>
                        <td className="p-4 hidden sm:table-cell">
                          <Badge
                            variant={product.isActive ? "default" : "secondary"}
                            className={
                              product.isActive
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-600"
                            }
                          >
                            {product.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => openEditDialog(product)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => {
                                setDeletingProduct(product);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
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

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editingProduct ? "Edit Product" : "Create Product"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm({ ...form, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {(categoriesData || []).map((cat: any) => (
                      <SelectItem key={cat._id} value={cat._id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description *</Label>
              <Textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Brand</Label>
                <Input
                  value={form.brand}
                  onChange={(e) => setForm({ ...form, brand: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Badge</Label>
                <Input
                  value={form.badge}
                  onChange={(e) => setForm({ ...form, badge: e.target.value })}
                  placeholder="e.g. Bestseller"
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={form.isActive ? "active" : "inactive"}
                  onValueChange={(v) =>
                    setForm({ ...form, isActive: v === "active" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Benefits (comma-separated)</Label>
              <Input
                value={form.benefits}
                onChange={(e) =>
                  setForm({ ...form, benefits: e.target.value })
                }
                placeholder="e.g. Boosts immunity, Rich in antioxidants"
              />
            </div>

            <div className="space-y-2">
              <Label>Ingredients (comma-separated)</Label>
              <Input
                value={form.ingredients}
                onChange={(e) =>
                  setForm({ ...form, ingredients: e.target.value })
                }
                placeholder="e.g. Organic Tulasi leaves, Dried ginger"
              />
            </div>

            <div className="space-y-2">
              <Label>How to Use</Label>
              <Textarea
                value={form.howToUse}
                onChange={(e) =>
                  setForm({ ...form, howToUse: e.target.value })
                }
                rows={2}
              />
            </div>

            <Separator className="my-4" />

            <h3 className="font-display font-semibold text-sm">
              Default Variant
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Unit Type</Label>
                <Select
                  value={variantForm.unitType}
                  onValueChange={(v) => {
                    const units: Record<string, string> = {
                      piece: "pc",
                      weight: "g",
                      volume: "ml",
                    };
                    setVariantForm({
                      ...variantForm,
                      unitType: v,
                      unit: units[v] || "g",
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="piece">Piece</SelectItem>
                    <SelectItem value="weight">Weight</SelectItem>
                    <SelectItem value="volume">Volume</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Value</Label>
                <Input
                  type="number"
                  value={variantForm.value}
                  onChange={(e) =>
                    setVariantForm({
                      ...variantForm,
                      value: Number(e.target.value),
                    })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Unit</Label>
                <Input
                  value={variantForm.unit}
                  onChange={(e) =>
                    setVariantForm({ ...variantForm, unit: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Price (₹) *</Label>
                <Input
                  type="number"
                  value={variantForm.price}
                  onChange={(e) =>
                    setVariantForm({
                      ...variantForm,
                      price: Number(e.target.value),
                    })
                  }
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Original Price (₹)</Label>
                <Input
                  type="number"
                  value={variantForm.originalPrice}
                  onChange={(e) =>
                    setVariantForm({
                      ...variantForm,
                      originalPrice: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Stock</Label>
                <Input
                  type="number"
                  value={variantForm.stock}
                  onChange={(e) =>
                    setVariantForm({
                      ...variantForm,
                      stock: Number(e.target.value),
                    })
                  }
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                )}
                {editingProduct ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display">Deactivate Product</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to deactivate "{deletingProduct?.name}"? It
            will no longer be visible to customers.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => {
                if (deletingProduct) {
                  deleteMutation.mutate(deletingProduct._id);
                }
              }}
            >
              {deleteMutation.isPending && (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              )}
              Deactivate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Separator({ className }: { className?: string }) {
  return <div className={`h-px bg-border ${className || ""}`} />;
}

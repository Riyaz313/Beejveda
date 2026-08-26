import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cartApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export function useCartAPI() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const cartQuery = useQuery({
    queryKey: ["cart"],
    queryFn: () => cartApi.get(),
    enabled: isAuthenticated,
    staleTime: 30 * 1000,
  });

  const addItemMutation = useMutation({
    mutationFn: ({
      productId,
      variantId,
      quantity,
    }: {
      productId: string;
      variantId: string;
      quantity: number;
    }) => cartApi.addItem(productId, variantId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: ({
      itemId,
      quantity,
    }: {
      itemId: string;
      quantity: number;
    }) => cartApi.updateItem(itemId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: (itemId: string) => cartApi.removeItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  const clearMutation = useMutation({
    mutationFn: () => cartApi.clear(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  return {
    cart: cartQuery.data,
    isLoading: cartQuery.isLoading,
    addItem: addItemMutation.mutateAsync,
    updateItem: updateItemMutation.mutateAsync,
    removeItem: removeItemMutation.mutateAsync,
    clearCart: clearMutation.mutateAsync,
  };
}

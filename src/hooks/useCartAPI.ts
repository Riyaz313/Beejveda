import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cartApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export function useCartAPI() {
  const { isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ["cart", user?._id] as const;

  const cartQuery = useQuery({
    queryKey,
    queryFn: () => cartApi.get(),
    enabled: isAuthenticated,
    staleTime: 30 * 1000,
  });

  const refreshCart = () => queryClient.invalidateQueries({ queryKey });

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
    onSuccess: async () => {
      await refreshCart();
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
    onSuccess: async () => {
      await refreshCart();
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: (itemId: string) => cartApi.removeItem(itemId),
    onSuccess: async () => {
      await refreshCart();
    },
  });

  const clearMutation = useMutation({
    mutationFn: () => cartApi.clear(),
    onSuccess: async () => {
      await refreshCart();
    },
  });

  return {
    cart: cartQuery.data,
    isLoading: cartQuery.isLoading,
    isFetching: cartQuery.isFetching,
    isError: cartQuery.isError,
    isMutating:
      addItemMutation.isPending ||
      updateItemMutation.isPending ||
      removeItemMutation.isPending ||
      clearMutation.isPending,
    addItem: addItemMutation.mutateAsync,
    updateItem: updateItemMutation.mutateAsync,
    removeItem: removeItemMutation.mutateAsync,
    clearCart: clearMutation.mutateAsync,
  };
}

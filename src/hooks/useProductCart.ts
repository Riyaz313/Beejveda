import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Product } from "@/data/products";
import { productsApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useCartAPI } from "@/hooks/useCartAPI";

const objectIdPattern = /^[a-f\d]{24}$/i;

export function useProductCart(product: Product | null) {
  const { isAuthenticated } = useAuth();
  const {
    cart,
    isLoading: apiCartLoading,
    isFetching: apiCartFetching,
    isError: apiCartError,
    isMutating,
    addItem,
    updateItem,
    removeItem,
  } = useCartAPI();
  const {
    addToCart,
    getProductQuantity,
    setProductQuantity,
  } = useCart();
  const [isUpdatingLocalCart, setIsUpdatingLocalCart] = useState(false);

  const needsCanonicalProduct = Boolean(
    isAuthenticated &&
      product &&
      (!objectIdPattern.test(product.id) || !product.variantId || !objectIdPattern.test(product.variantId))
  );
  const productQuery = useQuery({
    queryKey: ["product", product?.slug],
    queryFn: () => productsApi.getBySlug(product!.slug),
    enabled: needsCanonicalProduct,
    staleTime: 5 * 60 * 1000,
  });

  const canonicalProduct = needsCanonicalProduct ? productQuery.data : undefined;
  const canonicalProductId = canonicalProduct?._id || product?.id;
  const canonicalVariant = canonicalProduct
    ? canonicalProduct.variants?.find((variant) => variant.isDefault) || canonicalProduct.variants?.[0]
    : undefined;
  const canonicalVariantId = canonicalVariant?._id || product?.variantId;
  const apiCartItem = cart?.items.find(
    (item) =>
      item.product._id === canonicalProductId &&
      item.variant._id === canonicalVariantId
  );
  const quantity = isAuthenticated
    ? apiCartItem?.quantity ?? 0
    : product
      ? getProductQuantity(product)
      : 0;
  const isLoading = isAuthenticated && (
    apiCartLoading ||
    apiCartFetching ||
    (needsCanonicalProduct && productQuery.isFetching)
  );
  const isUpdating = isAuthenticated ? isMutating : isUpdatingLocalCart;

  const setQuantity = async (requestedQuantity: number): Promise<boolean> => {
    if (!product || !Number.isFinite(requestedQuantity)) return false;
    const nextQuantity = Math.max(0, Math.floor(requestedQuantity));

    if (isAuthenticated) {
      if (isLoading) return false;
      if (apiCartError) {
        toast.error("Unable to load your cart. Please try again.");
        return false;
      }

      const productId = canonicalProduct?._id || (objectIdPattern.test(product.id) ? product.id : undefined);
      const variantId = canonicalVariant?._id || (objectIdPattern.test(product.variantId || "") ? product.variantId : undefined);
      if (!productId || !variantId) {
        toast.error("This product is not available in your cart right now.");
        return false;
      }

      try {
        if (apiCartItem) {
          if (nextQuantity === 0) {
            await removeItem(apiCartItem._id);
          } else if (nextQuantity !== apiCartItem.quantity) {
            await updateItem({ itemId: apiCartItem._id, quantity: nextQuantity });
          }
        } else if (nextQuantity > 0) {
          await addItem({ productId, variantId, quantity: nextQuantity });
        }
        return true;
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to update your cart");
        return false;
      }
    }

    setIsUpdatingLocalCart(true);
    try {
      if (nextQuantity === 0) {
        setProductQuantity(product, 0);
      } else if (quantity === 0) {
        addToCart(product, nextQuantity);
      } else {
        setProductQuantity(product, nextQuantity);
      }
      return true;
    } finally {
      setIsUpdatingLocalCart(false);
    }
  };

  return { quantity, isLoading, isUpdating, setQuantity };
}

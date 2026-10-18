/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from "@/lib/api/axios";
import { addToCart, cartQueryOptions } from "@/lib/api/cart";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useAddToCart(onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variantId: string) => addToCart(variantId, 1),
    onSuccess: (res) => {
      // Update the global cart cache immediately
      if (res.success) {
        queryClient.setQueryData(cartQueryOptions().queryKey, res);
      }
      toast.success("Added to cart");

      if (onSuccessCallback) {
        onSuccessCallback();
      }
    },
    onError: (err: any) => {
      const message =
        err?.response?.data?.error?.message ?? "Could not add to cart";
      toast.error(message);
    },
  });
}

// ─── NEW ───────────────────────────────────────────
export function useUpdateCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      itemId,
      quantity,
    }: {
      itemId: string;
      quantity: number;
    }) => {
      const { data } = await api.patch(`/cart/items/${itemId}`, { quantity });
      return data;
    },
    onSuccess: (res) => {
      queryClient.setQueryData(cartQueryOptions().queryKey, res);
    },
    onError: (err: any) => {
      const message =
        err?.response?.data?.error?.message ?? "Could not update quantity";
      toast.error(message);
    },
  });
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: string) => {
      const { data } = await api.delete(`/cart/items/${itemId}`);
      return data;
    },
    onSuccess: (res) => {
      queryClient.setQueryData(cartQueryOptions().queryKey, res);
      toast.success("Item removed");
    },
    onError: (err: any) => {
      const message =
        err?.response?.data?.error?.message ?? "Could not remove item";
      toast.error(message);
    },
  });
}
// ───────────────────────────────────────────────────\

export function useSwapCartItemVariant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      oldItemId,
      newVariantId,
      quantity,
    }: {
      oldItemId: string;
      newVariantId: string | null;
      quantity: number;
    }) => {
      // 1. Remove the old item
      await api.delete(`/cart/items/${oldItemId}`);

      // 2. Add the new variant
      const { data } = await api.post(`/cart/items`, {
        variantId: newVariantId,
        quantity,
      });
      return data;
    },
    onSuccess: (res) => {
      // console.log(res,'>>>>>>>>>>>>>>>>>');
      queryClient.setQueryData(cartQueryOptions().queryKey, res);
      toast.success("Size updated");
    },
    onError: (err: any) => {
      // If the new size is out of stock, the API will return an error here.
      const message =
        err?.response?.data?.error?.message ?? "Could not change size";
      toast.error(message);

      // Force refetch to reset the UI back to the old valid state
      queryClient.invalidateQueries({ queryKey: cartQueryOptions().queryKey });
    },
  });
}
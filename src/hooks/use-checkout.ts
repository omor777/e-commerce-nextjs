import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/lib/api/axios";
import { cartQueryOptions } from "@/lib/api/cart";

export type CheckoutPayload = {
  email: string;
  phone: string;
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

export function useCheckout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CheckoutPayload) => {
      const { data } = await api.post("/checkout", payload);
      return data;
    },
    onSuccess: () => {
      toast.success("Order placed successfully!");
      // Clear the cart cache so the header badge updates
      queryClient.invalidateQueries({ queryKey: cartQueryOptions().queryKey });
      // Redirect to success page
      router.push("/checkout/success");
    },
    onError: (err: any) => {
      const message =
        err?.response?.data?.error?.message ?? "Failed to place order.";
      toast.error(message);
    },
  });
}

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/axios";

export type Variant = {
  id: string;
  size: string;
  color: string;
  price: string;
  stock: number;
  isActive: boolean;
};

const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];

export function useProductVariants(productId: string, enabled = true) {
  return useQuery({
    queryKey: ["variants", productId],
    queryFn: async () => {
      const { data } = await api.get(`/products/${productId}/variants`);
      const variants = data.data as Variant[];

      // Sort by custom size order, then color
      return variants.sort((a, b) => {
        const sizeA = SIZE_ORDER.indexOf(a.size.toUpperCase());
        const sizeB = SIZE_ORDER.indexOf(b.size.toUpperCase());
        const weightA = sizeA === -1 ? 999 : sizeA;
        const weightB = sizeB === -1 ? 999 : sizeB;

        if (weightA !== weightB) return weightA - weightB;
        return a.color.localeCompare(b.color);
      });
    },
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

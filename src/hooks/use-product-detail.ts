import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/axios";
import type { ProductListItem } from "@/lib/api/products";

export type ProductDetail = ProductListItem & {
  description: string | null;
  variants: {
    id: string;
    sku: string;
    size: string;
    color: string;
    price: string;
    stock: number;
    isActive: boolean;
  }[];
};

export function useProductDetail(slug: string) {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      // 🔄 CHANGED: Point to the standard [id] route
      const { data } = await api.get(`/products/${slug}`);
      return data.data as ProductDetail;
    },
    enabled: !!slug,
  });
}

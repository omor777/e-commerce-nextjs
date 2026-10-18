import type { ListProductsQuery } from "@/schemas/product.schema";
import { queryOptions } from "@tanstack/react-query";

export type ProductListItem = {
  id: string;
  name: string;
  slug: string;
  images: string[];
  isActive: boolean;
  category: { id: string; name: string; slug: string } | null;
  cheapestPrice: string | null; // 👈 Matches your current API
  createdAt: string;
  updatedAt: string;
};

export type ProductListResponse = {
  success: true;
  data: ProductListItem[];
  meta: { page: number; limit: number; total: number };
};

export type ProductListParams = Partial<ListProductsQuery>;

function buildQueryString(params: ProductListParams) {
  const search = new URLSearchParams();
  if (params.page) search.set("page", String(params.page));
  if (params.limit) search.set("limit", String(params.limit));
  if (params.sort) search.set("sort", params.sort);
  if (params.minPrice !== undefined)
    search.set("minPrice", String(params.minPrice));
  if (params.maxPrice !== undefined)
    search.set("maxPrice", String(params.maxPrice));
  if (params.search) search.set("search", params.search);
  if (params.categoryId) search.set("categoryId", params.categoryId);
  if (params.isActive !== undefined)
    search.set("isActive", String(params.isActive));
  return search.toString();
}

export const productsQueryOptions = (params: ProductListParams) =>
  queryOptions({
    queryKey: ["products", params],
    queryFn: async (): Promise<ProductListResponse> => {
      const qs = buildQueryString(params);
      const res = await fetch(`/api/products?${qs}`);
      if (!res.ok) throw new Error("Failed to fetch products");
      return res.json();
    },
    staleTime: 30_000,
  });

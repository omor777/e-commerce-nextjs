import { queryOptions } from "@tanstack/react-query";
import { api } from "./axios";

export type CartVariantProduct = {
  id: string;
  name: string;
  slug: string;
  description: string;
  images: string[];
  categoryId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CartVariant = {
  id: string;
  sku: string;
  size: string;
  color: string;
  price: string;
  stock: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  product: CartVariantProduct;
};

export type CartItem = {
  id: string;
  cartId: string;
  variantId: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  variant: CartVariant;
};

export type Cart = {
  id: string;
  userId: string | null;
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
};

export type CartResponse = {
  success: true;
  data: Cart | null;
};

export const cartQueryOptions = () =>
  queryOptions({
    queryKey: ["cart"],
    queryFn: async (): Promise<CartResponse> => {
      const { data } = await api.get<CartResponse>("/cart");
      return data;
    },
    staleTime: 30_000,
  });

export async function addToCart(variantId: string, quantity = 1) {
  const { data } = await api.post<CartResponse>("/cart/items", {
    variantId,
    quantity,
  });
  return data;
}

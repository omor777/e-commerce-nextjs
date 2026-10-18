"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  useRemoveCartItem,
  useSwapCartItemVariant,
  useUpdateCartItem,
} from "@/hooks/use-cart-mutations";
import { useProductVariants } from "@/hooks/use-product-variants";
import { cartQueryOptions, type CartItem } from "@/lib/api/cart";
import { formatPrice } from "@/lib/format";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Loader2,
  Plus,
  RotateCcw,
  ShieldCheck,
  Trash2,
  Truck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { VariantPickerModal } from "../products/_components/variant-picker-modal";

// --- 1. Cart Item Component ---
function CartPageItem({ item }: { item: CartItem }) {
  const [isAddSizeOpen, setIsAddSizeOpen] = useState(false);

  const updateQuantityMutation = useUpdateCartItem();
  const removeItemMutation = useRemoveCartItem();
  const swapVariantMutation = useSwapCartItemVariant();

  const { data: productVariants } = useProductVariants(
    item.variant.product.id,
    true,
  );

  return (
    <div className="flex flex-col sm:flex-row gap-4 py-6 border-b border-border last:border-0">
      {/* Image */}
      <div className="relative w-24 h-32 shrink-0 bg-muted border border-border rounded-md overflow-hidden">
        <Image
          src={item.variant.product.images?.[0] ?? "/placeholder.svg"}
          alt={item.variant.product.name}
          fill
          className="object-cover"
        />
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col justify-between">
        {/* Top Row: Name & Price */}
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <h3 className="font-medium text-foreground text-base leading-snug">
              {item.variant.product.name}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Color: {item.variant.color}
            </p>
          </div>

          <div className="text-right shrink-0">
            {/* Original Price (Strikethrough) */}
            <p className="text-sm line-through text-muted-foreground">
              {formatPrice(Number(item.variant.price) * item.quantity)}
            </p>
            {/* Current Price */}
            <p className="font-semibold text-foreground">
              {formatPrice(Number(item.variant.price) * item.quantity)}
            </p>
          </div>
        </div>

        {/* Bottom Row: Selectors & Actions */}
        <div className="flex flex-wrap items-center gap-4 mt-4">
          {/* Size Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              Size
            </span>
            <Select
              value={item.variant.id}
              onValueChange={(newVariantId) => {
                if (newVariantId !== item.variant.id) {
                  swapVariantMutation.mutate({
                    oldItemId: item.id,
                    newVariantId,
                    quantity: item.quantity,
                  });
                }
              }}
              disabled={swapVariantMutation.isPending}
            >
              <SelectTrigger className="h-8 w-20 bg-card border-border">
                <SelectValue placeholder={item.variant.size}>
                  {item.variant.size}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {productVariants
                  ?.filter((v) => v.color === item.variant.color && v.isActive)
                  .map((v) => (
                    <SelectItem
                      key={v.id}
                      value={v.id}
                      disabled={v.stock === 0}
                    >
                      {v.size} {v.stock === 0 ? "(Out of stock)" : ""}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              Qty
            </span>
            <Select
              value={item.quantity.toString()}
              onValueChange={(val) => {
                updateQuantityMutation.mutate({
                  itemId: item.id,
                  quantity: parseInt(val as string),
                });
              }}
              disabled={updateQuantityMutation.isPending}
            >
              <SelectTrigger className="h-8 w-16 bg-card border-border">
                <SelectValue placeholder={item.quantity} />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: Math.max(10, item.variant.stock) }).map(
                  (_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      {i + 1}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:ml-auto">
            <Button variant="default" onClick={() => setIsAddSizeOpen(true)}>
              <Plus /> Add Size
            </Button>
            <Button
              variant="destructive"
              size="icon"
              className="h-8 w-8 rounded-sm bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
              onClick={() => removeItemMutation.mutate(item.id)}
              disabled={removeItemMutation.isPending}
            >
              {removeItemMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Trash2 className="size-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
      {/* 🔄 ADDED: Render the modal */}
      <VariantPickerModal
        product={{
          id: item.variant.product.id,
          name: item.variant.product.name,
          slug: item.variant.product.slug,
          images: item.variant.product.images,
          isActive: true,
          category: null, // Not needed for the modal UI
          cheapestPrice: item.variant.price, // Not used in modal, but required by type
          createdAt: "",
          updatedAt: "",
        }}
        open={isAddSizeOpen}
        onOpenChange={setIsAddSizeOpen}
      />
    </div>
  );
}

// --- 2. Main Cart Page ---
export default function CartPage() {
  const { data: cartRes, isPending } = useQuery(cartQueryOptions());

  const cart = cartRes?.data;
  const items = cart?.items ?? [];

  const subtotal = items.reduce((total, item) => {
    return total + Number(item.variant.price) * item.quantity;
  }, 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-semibold text-foreground">
            Your Shopping Cart
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            {items.length} items
          </p>
        </div>

        {isPending ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-muted-foreground size-10" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-6">
            <p className="text-muted-foreground">
              Your cart is currently empty.
            </p>
            <Button size="lg" render={<Link href="/products" />}>
              Continue Shopping
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-card border border-border rounded-lg px-6">
                <div className="py-4 border-b border-border">
                  <h2 className="font-semibold text-foreground">Cart Items</h2>
                </div>
                {items.map((item) => (
                  <CartPageItem key={item.id} item={item} />
                ))}
              </div>
            </div>

            {/* Right Column: Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-card border border-border rounded-lg p-6 sticky top-24">
                <h2 className="font-semibold text-foreground mb-6">
                  Order Summary
                </h2>

                <div className="space-y-4 text-sm">
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span>Subtotal ({items.length} items)</span>
                    <span className="text-foreground font-medium">
                      {formatPrice(subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span>Shipping</span>
                    <span className="text-foreground">
                      Calculated at checkout
                    </span>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="flex justify-between items-center mb-6">
                  <span className="font-semibold text-foreground">Total</span>
                  <span className="font-bold text-xl text-foreground">
                    {formatPrice(subtotal)}
                  </span>
                </div>

                <div className="space-y-3">
                  <Button
                    className="w-full bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900 h-11 text-base"
                    render={<Link href="/checkout" />}
                  >
                    Place Order <ArrowRight className="size-4 ml-2" />
                  </Button>
                  {/* 🔄 CHANGED: Fixed styling of Continue Shopping button */}
                  <Button
                    variant="outline"
                    className="w-full h-11"
                    render={<Link href="/products" />}
                  >
                    Continue Shopping
                  </Button>
                </div>

                <div className="mt-6 pt-6 border-t border-border space-y-4 text-xs text-muted-foreground">
                  <p>
                    For orders enquiries, please call{" "}
                    <strong className="text-foreground">+8801700000000</strong>{" "}
                    or email{" "}
                    <strong className="text-foreground">
                      support@store.com
                    </strong>
                  </p>
                  <div className="flex flex-wrap gap-4 pt-2">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="size-4 text-green-600" /> Secure
                      Checkout
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Truck className="size-4 text-green-600" /> Fast Delivery
                    </div>
                    <div className="flex items-center gap-1.5">
                      <RotateCcw className="size-4 text-green-600" /> Easy
                      Returns
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Section: You May Also Like (Placeholder) */}
        {items.length > 0 && (
          <div className="mt-20">
            <div className="text-center mb-8">
              <h2 className="text-xl font-semibold text-foreground">
                You May Also Like
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Explore more products based on your cart
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-card border border-border rounded-lg overflow-hidden flex flex-col"
                >
                  <div className="aspect-square bg-muted relative">
                    <Image
                      src="/placeholder.svg"
                      alt="Product"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4 flex flex-col flex-1 items-center text-center">
                    <h3 className="text-sm font-medium line-clamp-2">
                      Premium Essential Polo
                    </h3>
                    <p className="font-semibold mt-2 mb-4">
                      {formatPrice(1990)}
                    </p>
                    <Button
                      variant="outline"
                      className="w-full mt-auto bg-zinc-900 text-white hover:bg-zinc-800 border-0"
                    >
                      View Product
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

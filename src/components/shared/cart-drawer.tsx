"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { Plus, Trash2, Loader2, ChevronRight } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cartQueryOptions, type CartItem } from "@/lib/api/cart";
import { formatPrice } from "@/lib/format";
import {
  useUpdateCartItem,
  useRemoveCartItem,
  useSwapCartItemVariant,
} from "@/hooks/use-cart-mutations";
import { useProductVariants } from "@/hooks/use-product-variants";

type CartDrawerProps = {
  children: React.ReactNode;
};

// ─── NEW: Extracted CartItemRow component ──────────────
function CartItemRow({ item }: { item: CartItem }) {
  const updateQuantityMutation = useUpdateCartItem();
  const removeItemMutation = useRemoveCartItem();
  const swapVariantMutation = useSwapCartItemVariant();
  
  const { data: productVariants } = useProductVariants(item.variant.product.id, true);

  return (
    <div className="bg-card border border-border text-sm shadow-sm">
      
      {/* Top Row: Title & Image */}
      <div className="flex justify-between items-start p-3 pb-2 border-b border-border">
        <h4 className="font-medium text-foreground w-2/3 leading-snug">
          {item.variant.product.name} - {item.variant.color}
        </h4>
        <div className="relative w-16 h-20 shrink-0 border border-border bg-muted">
          <Image
            src={item.variant.product.images?.[0] ?? "/placeholder.svg"}
            alt={item.variant.product.name}
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* Details Grid */}
      <div className="p-3 space-y-3">
        
        {/* Price */}
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Price</span>
          <div className="font-medium text-foreground">
            {formatPrice(item.variant.price)}
          </div>
        </div>

        {/* Functional Size Dropdown */}
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground w-1/3">Size</span>
          <div className="w-2/3 flex justify-end">
            <Select
              value={item.variant.id}
              onValueChange={(newVariantId) => {
                if (newVariantId !== item.variant.id) {
                  swapVariantMutation.mutate({
                    oldItemId: item.id,
                    newVariantId,
                    quantity: item.quantity
                  });
                }
              }}
              disabled={swapVariantMutation.isPending}
            >
              <SelectTrigger className="h-8 bg-muted/50 text-foreground border-border w-full">
                {/* 🔄 CHANGED: Explicitly set the display text to item.variant.size */}
                <SelectValue placeholder={item.variant.size}>
                  {item.variant.size}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {productVariants?.filter(v => v.color === item.variant.color && v.isActive).map((v) => (
                  <SelectItem key={v.id} value={v.id} disabled={v.stock === 0}>
                    {/* 🔄 CHANGED: Ensure the dropdown shows the size string */}
                    {v.size} {v.stock === 0 ? "(Out of stock)" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Quantity Dropdown */}
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground w-1/3">Quantity</span>
          <div className="w-2/3 flex justify-end">
            <Select
              value={item.quantity.toString()}
              onValueChange={(val) => {
                updateQuantityMutation.mutate({
                  itemId: item.id,
                  quantity: parseInt(val),
                });
              }}
              disabled={updateQuantityMutation.isPending}
            >
              <SelectTrigger className="h-8 bg-muted/50 text-foreground border-border w-full">
                <SelectValue placeholder={item.quantity} />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: Math.max(10, item.variant.stock) }).map((_, i) => (
                  <SelectItem key={i + 1} value={(i + 1).toString()}>
                    {i + 1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Subtotal */}
        <div className="flex justify-between items-center pt-2">
          <span className="text-muted-foreground w-1/3">Subtotal</span>
          <div className="font-medium text-foreground w-2/3 flex justify-end">
             {formatPrice(Number(item.variant.price) * item.quantity)}
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="flex justify-between items-center p-3 pt-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="bg-zinc-900 dark:bg-zinc-950 text-white hover:bg-zinc-800 dark:hover:bg-zinc-900 hover:text-white border-0 h-8 px-3 rounded-sm"
        >
          <Plus className="size-4 mr-1.5" /> Add another Size
        </Button>
        
        <Button 
          variant="destructive" 
          size="icon" 
          className="h-8 w-8 rounded-sm"
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
  );
}

export function CartDrawer({ children }: CartDrawerProps) {
  const [open, setOpen] = useState(false);
  const { data: cartRes, isPending } = useQuery(cartQueryOptions());

  const cart = cartRes?.data;
  const items = cart?.items ?? [];


  const cartTotal = items.reduce((total, item) => {
    return total + Number(item.variant.price) * item.quantity;
  }, 0);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={children as React.ReactElement} />

      <SheetContent className="w-full sm:max-w-[420px] p-0 flex flex-col bg-muted/30 border-l">
        <SheetHeader className="bg-zinc-900 dark:bg-zinc-950 p-4 border-b">
          <SheetTitle className="text-white text-center font-semibold tracking-wide">
            CART
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isPending ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-muted-foreground size-8" />
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-4">
              <p>Your cart is empty.</p>
              <Button
                onClick={() => setOpen(false)}
                render={<Link href="/products" />}
              >
                Continue Shopping
              </Button>
            </div>
          ) : (
            items.map((item) => (
              // 🔄 CHANGED: Using the extracted component
              <CartItemRow key={item.id} item={item} />
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="bg-card border-t border-border p-0 flex items-center justify-between mt-auto">
            <div className="px-4 py-3">
              <p className="text-xs text-muted-foreground mb-1">Cart Total</p>
              <p className="font-bold text-lg text-foreground">
                {formatPrice(cartTotal)}
              </p>
            </div>
            <Button
              className="h-full rounded-none bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white font-semibold px-6 py-6 border-0"
              onClick={() => setOpen(false)}
              render={<Link href="/checkout" />}
            >
              Checkout <ChevronRight className="size-5 ml-1" />
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

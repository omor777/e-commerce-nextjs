"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cartQueryOptions } from "@/lib/api/cart";
import { formatPrice } from "@/lib/format";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, ChevronLeft, Loader2, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { CheckoutForm } from "./_components/checkout-form";

export default function CheckoutPage() {
  const { data: cartRes, isPending } = useQuery(cartQueryOptions());

  const cart = cartRes?.data;
  const items = cart?.items ?? [];

  const subtotal = items.reduce((total, item) => {
    return total + Number(item.variant.price) * item.quantity;
  }, 0);

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-muted-foreground size-10" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <h1 className="text-2xl font-semibold">Your cart is empty</h1>
        <Button render={<Link href="/products" />}>Return to Shop</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/10 pb-20">
      {/* Top Header Bar */}
      <div className="bg-background border-b border-border py-4 mb-8">
        <div className="mx-auto max-w-6xl px-4 flex justify-between items-center">
          <Link href="/" className="font-bold text-xl tracking-tight">
            FABRILIFE
          </Link>
          <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
            <ShieldCheck className="size-5" />
            Secure Checkout
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4">
        <Link
          href="/cart"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ChevronLeft className="size-4 mr-1" /> Back to Cart
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Form (Takes 7/12 of space on desktop) */}
          <div className="lg:col-span-7">
            <CheckoutForm cartTotal={subtotal} />
          </div>

          {/* Right Column: Order Summary (Takes 5/12 of space on desktop) */}
          <div className="lg:col-span-5 hidden lg:block">
            <div className="bg-card border border-border rounded-lg shadow-sm sticky top-24">
              {/* Scrollable Cart Items */}
              <div className="p-6 border-b border-border max-h-[300px] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-semibold text-lg">Order Summary</h2>
                  <Link
                    href="/cart"
                    className="text-sm underline text-muted-foreground hover:text-foreground"
                  >
                    Modify
                  </Link>
                </div>

                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="relative w-16 h-20 shrink-0 bg-muted border border-border rounded-md overflow-hidden">
                        <Image
                          src={
                            item.variant.product.images?.[0] ??
                            "/placeholder.svg"
                          }
                          alt={item.variant.product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex flex-1 justify-between text-sm">
                        <div className="flex flex-col justify-center">
                          <p className="font-medium text-foreground line-clamp-1">
                            {item.variant.product.name}
                          </p>
                          <p className="text-muted-foreground text-xs mt-1">
                            Size: {item.variant.size} • Qty: {item.quantity}
                          </p>
                        </div>
                        <p className="font-medium flex items-center">
                          {formatPrice(
                            Number(item.variant.price) * item.quantity,
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="p-6 space-y-3 text-sm border-b border-border bg-muted/5">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="text-foreground">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Free Shipping (Dhaka)</span>
                  <span className="text-green-600">{formatPrice(0)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between items-center font-semibold text-base">
                  <span>Total</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="px-6 py-4 border-b border-border">
                <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-500 bg-green-50 dark:bg-green-950/30 p-2 rounded-md border border-green-200 dark:border-green-900">
                  <CheckCircle2 className="size-4 shrink-0" />
                  Delivery within 2-3 days after confirmation
                </div>
              </div>

              {/* Coupon Code */}
              <div className="p-6 border-b border-border">
                <div className="flex gap-2">
                  <Input placeholder="Enter coupon code" className="h-10" />
                  <Button
                    variant="secondary"
                    className="h-10 px-6 bg-zinc-800 text-white hover:bg-zinc-700"
                  >
                    Apply
                  </Button>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="p-6 border-b border-border">
                <h3 className="font-semibold text-sm mb-4">Payment Method</h3>
                <div className="space-y-3">
                  {/* Cash on Delivery */}
                  <div className="flex items-start gap-3 p-3 border-2 border-foreground rounded-lg bg-muted/20 cursor-pointer">
                    <div className="mt-0.5 size-4 rounded-full border-2 border-foreground flex items-center justify-center">
                      <div className="size-2 bg-foreground rounded-full"></div>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-sm">
                          Cash on Delivery
                        </span>
                        <span className="text-[10px] font-bold bg-muted px-2 py-0.5 rounded uppercase">
                          Popular
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Pay when you receive your order
                      </p>
                    </div>
                  </div>

                  {/* Card */}
                  <div className="flex items-start gap-3 p-3 border border-border rounded-lg opacity-60 cursor-not-allowed">
                    <div className="mt-0.5 size-4 rounded-full border border-muted-foreground flex items-center justify-center"></div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-sm">
                          Card Payment
                        </span>
                        <span className="text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded uppercase">
                          Secure
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Visa, Mastercard, Amex
                      </p>
                    </div>
                  </div>

                  {/* bKash */}
                  <div className="flex items-start gap-3 p-3 border border-border rounded-lg opacity-60 cursor-not-allowed">
                    <div className="mt-0.5 size-4 rounded-full border border-muted-foreground flex items-center justify-center"></div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-sm">bKash</span>
                        <span className="text-[10px] font-bold bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400 px-2 py-0.5 rounded uppercase">
                          10% Cashback
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Pay with bKash mobile wallet
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Terms & Confirm */}
              <div className="p-6">
                <label className="flex items-start gap-2 cursor-pointer mb-6">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="mt-1 size-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <span className="text-xs text-muted-foreground leading-snug">
                    I agree to the{" "}
                    <span className="underline">Terms & Conditions</span>,{" "}
                    <span className="underline">Refund Policy</span> and{" "}
                    <span className="underline">Privacy Policy</span>
                  </span>
                </label>

                {/* Desktop Submit Button - Uses form="checkout-form" to submit the form on the left */}
                <Button
                  type="submit"
                  form="checkout-form"
                  size="lg"
                  className="w-full bg-zinc-900 text-white hover:bg-zinc-800 h-12 text-base"
                >
                  <CheckCircle2 className="mr-2 size-5" /> Confirm Order{" "}
                  {formatPrice(subtotal)}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

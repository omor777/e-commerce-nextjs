"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { api } from "@/lib/api/axios";
import { formatPrice } from "@/lib/format";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

// Type for the order data
type OrderDetails = {
  id: string;
  orderNumber: string;
  email: string;
  status: string;
  total: string;
  subtotal: string;
  shipping: string;
  createdAt: string;
  items: {
    id: string;
    productName: string;
    variantSize: string;
    variantColor: string;
    unitPrice: string;
    quantity: number;
    lineTotal: string;
  }[];
};

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  // Fetch the order details using the ID from the URL
  const {
    data: orderRes,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const { data } = await api.get(`/orders/${orderId}`);
      return data.data as OrderDetails;
    },
    enabled: !!orderId,
  });

  // If there's no orderId in the URL (e.g. they navigated directly), show a generic success
  if (!orderId) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center">
        <CheckCircle2 className="size-16 text-green-600 mb-6" />
        <h1 className="text-3xl font-semibold mb-2">Order Confirmed!</h1>
        <p className="text-muted-foreground mb-8">
          Thank you for your purchase.
        </p>
        <Button render={<Link href="/products" />} size="lg">
          Continue Shopping
        </Button>
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-muted-foreground size-10" />
      </div>
    );
  }

  if (isError || !orderRes) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-muted-foreground">
        <p>Could not load order details.</p>
        <Button variant="outline" className="mt-4" render={<Link href="/" />}>
          Return Home
        </Button>
      </div>
    );
  }

  const order = orderRes;

  return (
    <div className="min-h-screen bg-muted/10 py-12 px-4">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="mx-auto size-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="size-10 text-green-600 dark:text-green-500" />
          </div>
          <h1 className="text-3xl font-semibold mb-2">
            Thank you for your order!
          </h1>
          <p className="text-muted-foreground">
            Order{" "}
            <strong className="text-foreground">#{order.orderNumber}</strong>{" "}
            has been placed successfully.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            A confirmation email has been sent to {order.email}
          </p>
        </div>

        {/* Receipt Card */}
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="font-semibold text-lg mb-4">Order Details</h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="relative w-16 h-20 shrink-0 bg-muted border border-border rounded-md overflow-hidden">
                    <Image
                      src="/placeholder.svg"
                      alt={item.productName}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-1 justify-between text-sm">
                    <div>
                      <p className="font-medium text-foreground">
                        {item.productName}
                      </p>
                      <p className="text-muted-foreground mt-0.5">
                        {item.variantColor} / {item.variantSize}
                      </p>
                      <p className="text-muted-foreground mt-0.5">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium">{formatPrice(item.lineTotal)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 bg-muted/30">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="text-foreground">
                  {formatPrice(order.subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span className="text-foreground">
                  {formatPrice(order.shipping)}
                </span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between items-center font-semibold text-base">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            render={<Link href="/products" />}
            className="w-full sm:w-auto"
          >
            Continue Shopping <ArrowRight className="ml-2 size-4" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            render={<Link href="/" />}
            className="w-full sm:w-auto"
          >
            Return to Home
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="animate-spin size-8" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}

import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, Package, Truck, CreditCard } from "lucide-react";

export default async function CustomerOrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // 1. Secure the route
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/login");
  }

  // 2. Fetch order, ensuring it belongs to this user
  const order = await prisma.order.findFirst({
    where: { id, userId: session.user.id },
    include: { items: true },
  });

  if (!order) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-muted/10 py-12 px-4">
      <div className="mx-auto max-w-3xl space-y-8">
        {/* Header */}
        <div>
          <Link
            href="/account/orders"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ChevronLeft className="size-4 mr-1" /> Back to Orders
          </Link>
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-semibold">
              Order #{order.orderNumber}
            </h1>
            <Badge
              variant={order.status === "CANCELLED" ? "destructive" : "default"}
            >
              {order.status}
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Placed on {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>

        {/* Items */}
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border bg-muted/30 flex items-center gap-2 font-medium">
            <Package className="size-4 text-muted-foreground" /> Items
          </div>
          <div className="divide-y divide-border">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="p-4 flex justify-between items-center"
              >
                <div>
                  <p className="font-medium text-foreground">
                    {item.productName}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {item.variantColor} / {item.variantSize} (Qty:{" "}
                    {item.quantity})
                  </p>
                </div>
                <p className="font-medium">
                  {formatPrice(item.lineTotal.toString())}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Shipping Info */}
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/30 flex items-center gap-2 font-medium">
              <Truck className="size-4 text-muted-foreground" /> Shipping
              Address
            </div>
            <div className="p-4 text-sm text-muted-foreground space-y-1">
              <p className="font-medium text-foreground">
                {order.shippingFullName}
              </p>
              <p>{order.shippingLine1}</p>
              {order.shippingLine2 && <p>{order.shippingLine2}</p>}
              <p>
                {order.shippingCity}, {order.shippingState}{" "}
                {order.shippingPostalCode}
              </p>
              <p>{order.shippingCountry}</p>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/30 flex items-center gap-2 font-medium">
              <CreditCard className="size-4 text-muted-foreground" /> Payment
              Summary
            </div>
            <div className="p-4 space-y-3 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="text-foreground">
                  {formatPrice(order.subtotal.toString())}
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span className="text-foreground">
                  {formatPrice(order.shipping.toString())}
                </span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between items-center font-semibold text-base">
                <span>Total</span>
                <span>{formatPrice(order.total.toString())}</span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-border mt-4">
                <span className="text-muted-foreground">Payment Method</span>
                <span className="font-medium text-foreground">
                  Cash on Delivery
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/format";
import { getAdminOrderDetails } from "@/queries/order.queries";
import { ChevronLeft, CreditCard, Package, Truck, User } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function AdminOrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const order = await getAdminOrderDetails(id).catch(() => null);
  console.log("Fetched order details:", order); // Debugging log

  if (!order) {
    notFound();
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <Link
            href="/admin/orders"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ChevronLeft className="size-4 mr-1" /> Back to Orders
          </Link>
          <h1 className="text-2xl font-semibold flex items-center gap-3">
            Order #{order.orderNumber}
            <Badge
              variant={order.status === "CANCELLED" ? "destructive" : "default"}
            >
              {order.status}
            </Badge>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Placed on {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Items & Totals */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-card border border-border rounded-lg overflow-hidden">
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
                      SKU: {item.sku} • {item.variantColor} / {item.variantSize}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatPrice(item.unitPrice)} × {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatPrice(item.lineTotal)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/30 flex items-center gap-2 font-medium">
              <CreditCard className="size-4 text-muted-foreground" /> Payment
              Summary
            </div>
            <div className="p-4 space-y-3 text-sm">
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
              <div className="flex justify-between items-center pt-4 border-t border-border mt-4">
                <span className="text-muted-foreground">Payment Status</span>
                <Badge variant="outline">{order.paymentStatus}</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Customer & Shipping */}
        <div className="lg:col-span-1 space-y-8">
          {/* Customer Info */}
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/30 flex items-center gap-2 font-medium">
              <User className="size-4 text-muted-foreground" /> Customer
            </div>
            <div className="p-4 text-sm space-y-1">
              <p className="font-medium text-foreground">
                {order.shippingFullName}
              </p>
              <p className="text-muted-foreground">{order.email}</p>
              <p className="text-muted-foreground">{order.shippingPhone}</p>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/30 flex items-center gap-2 font-medium">
              <Truck className="size-4 text-muted-foreground" /> Shipping
              Address
            </div>
            <div className="p-4 text-sm text-muted-foreground space-y-1">
              <p>{order.shippingFullName}</p>
              <p>{order.shippingLine1}</p>
              {order.shippingLine2 && <p>{order.shippingLine2}</p>}
              <p>
                {order.shippingCity}, {order.shippingState}{" "}
                {order.shippingPostalCode}
              </p>
              <p>{order.shippingCountry}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getUserOrders } from "@/queries/customer.queries";
import { formatPrice } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, Package, ArrowRight } from "lucide-react";

export default async function AccountOrdersPage() {
  // 1. Secure the route on the server
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/login");
  }

  // 2. Fetch the orders for this specific user
  const orders = await getUserOrders(session.user.id);

  return (
    <div className="min-h-screen bg-muted/10 py-12 px-4">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ChevronLeft className="size-4 mr-1" /> Continue Shopping
          </Link>
          <h1 className="text-3xl font-semibold">Order History</h1>
          <p className="text-muted-foreground mt-2">
            View and track your past orders.
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center shadow-sm">
            <Package className="size-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h2 className="text-xl font-medium mb-2">No orders yet</h2>
            <p className="text-muted-foreground mb-6">
              When you place an order, it will appear here.
            </p>
            <Button render={<Link href="/products" />}>
              Start Shopping <ArrowRight className="size-4 ml-2" />
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-card border border-border rounded-xl shadow-sm overflow-hidden"
              >
                {/* Order Header */}
                <div className="bg-muted/50 p-4 border-b border-border flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Order Number
                    </p>
                    <p className="font-semibold">{order.orderNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date Placed</p>
                    <p className="font-medium">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="font-semibold">{formatPrice(order.total)}</p>
                  </div>
                  <div>
                    <Badge
                      variant={
                        order.status === "CANCELLED" ? "destructive" : "default"
                      }
                    >
                      {order.status}
                    </Badge>
                  </div>
                </div>

                {/* Order Items Summary */}
                <div className="p-4">
                  <div className="space-y-3">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between text-sm"
                      >
                        <div>
                          <p className="font-medium text-foreground">
                            {item.productName}
                          </p>
                          <p className="text-muted-foreground text-xs mt-0.5">
                            {item.variantColor} / {item.variantSize} (Qty:{" "}
                            {item.quantity})
                          </p>
                        </div>
                        <p className="font-medium">
                          {formatPrice(item.lineTotal)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Footer Actions */}
                <div className="p-4 border-t border-border bg-muted/10 flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    render={<Link href={`/account/orders/${order.id}`} />}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

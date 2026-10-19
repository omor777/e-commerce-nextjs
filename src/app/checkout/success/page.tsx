import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center">
      <CheckCircle2 className="size-16 text-green-600 mb-6" />
      <h1 className="text-3xl font-semibold mb-2">Order Confirmed!</h1>
      <p className="text-muted-foreground mb-8">
        Thank you for your purchase. We have received your order and will
        process it shortly.
      </p>
      <Button render={<Link href="/products" />} size="lg">
        Continue Shopping
      </Button>
    </div>
  );
}

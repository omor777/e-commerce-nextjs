"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  Plus,
  Minus,
  ShoppingBag,
  ChevronRight,
  Truck,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useProductDetail } from "@/hooks/use-product-detail";
import { useAddToCart } from "@/hooks/use-cart-mutations";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

// ─── NEW: Dummy Size Chart Data ────────────────────────
const SIZE_CHART_DATA = [
  { size: "M", chest: "39", length: "27.5", sleeve: "8.25" },
  { size: "L", chest: "40.5", length: "28.5", sleeve: "8.5" },
  { size: "XL", chest: "43", length: "29", sleeve: "9" },
  { size: "2XL", chest: "45", length: "30", sleeve: "9.5" },
];
// ───────────────────────────────────────────────────────

export default function ProductDetailPage() {
  const { slug } = useParams() as { slug: string };
  const { data: product, isPending } = useProductDetail(slug);

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const addToCartMutation = useAddToCart();

  const { sizes, selectedVariant } = useMemo(() => {
    if (!product) return { sizes: [], selectedVariant: null };
    return {
      sizes: Array.from(new Set(product.variants.map((v) => v.size))),
      selectedVariant: selectedSize
        ? (product.variants.find((v) => v.size === selectedSize) ?? null)
        : null,
    };
  }, [product, selectedSize]);

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin size-8" />
      </div>
    );
  }
  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Product not found.
      </div>
    );
  }

  const displayPrice = selectedVariant
    ? selectedVariant.price
    : product.cheapestPrice;
  const image = product.images?.[0] ?? "/placeholder.svg";
  const isOutOfStock = selectedVariant ? selectedVariant.stock === 0 : false;

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <ChevronRight className="size-4 mx-1" />
          <Link href="/products" className="hover:text-foreground">
            Products
          </Link>
          <ChevronRight className="size-4 mx-1" />
          <span className="text-foreground font-medium truncate">
            {product.name}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Left: Images */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-muted rounded-xl overflow-hidden border border-border">
              <Image
                src={image}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div className="relative aspect-square bg-muted rounded-lg border-2 border-primary overflow-hidden">
                <Image
                  src={image}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>

          {/* Right: Details */}
          <div className="space-y-8">
            {/* Header */}
            <div>
              <div className="flex justify-between items-start gap-4">
                <h1 className="text-2xl md:text-3xl font-semibold text-foreground">
                  {product.name}
                </h1>
                <Button
                  variant="outline"
                  size="icon"
                  className="shrink-0 rounded-full"
                >
                  <Heart className="size-5" />
                </Button>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <span className="text-2xl font-bold text-foreground">
                  {displayPrice ? formatPrice(displayPrice) : "Unavailable"}
                </span>
                <span className="text-muted-foreground line-through">
                  {displayPrice ? formatPrice(Number(displayPrice) * 1.2) : ""}
                </span>
                <span className="bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 text-xs font-bold px-2 py-1 rounded">
                  20% OFF
                </span>
              </div>
            </div>

            {/* Variant Selection */}
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium">Select Size</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {sizes.map((size) => (
                    <Button
                      key={size}
                      variant={selectedSize === size ? "default" : "outline"}
                      className={cn(
                        "w-14 h-10",
                        selectedSize === size &&
                          "ring-2 ring-primary ring-offset-2",
                      )}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                {/* Quantity */}
                <div className="flex items-center border border-border rounded-md h-12 w-full sm:w-32">
                  <Button
                    variant="ghost"
                    className="px-3 h-full rounded-none text-muted-foreground"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="size-4" />
                  </Button>
                  <span className="flex-1 text-center font-medium">
                    {quantity}
                  </span>
                  <Button
                    variant="ghost"
                    className="px-3 h-full rounded-none text-muted-foreground"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="size-4" />
                  </Button>
                </div>

                {/* Add to Cart */}
                <Button
                  className="h-12 flex-1 bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 text-base"
                  disabled={
                    !selectedVariant ||
                    isOutOfStock ||
                    addToCartMutation.isPending
                  }
                  onClick={() => {
                    if (selectedVariant) {
                      addToCartMutation.mutate(selectedVariant.id);
                    }
                  }}
                >
                  {addToCartMutation.isPending ? (
                    <Loader2 className="animate-spin mr-2 size-5" />
                  ) : (
                    <ShoppingBag className="mr-2 size-5" />
                  )}
                  {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                </Button>
              </div>
            </div>

            {/* Value Props */}
            <div className="bg-muted/30 border border-border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-3">
                <RotateCcw className="size-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Easy Returns & Exchange
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Valid within 7 days • Free return shipping
                  </p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <Truck className="size-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Fast Delivery
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Delivery within 2-3 days
                  </p>
                </div>
              </div>
            </div>

            {/* Accordion for Details */}
            <Accordion defaultValue={["description"]} className="w-full">
              <AccordionItem value="description">
                <AccordionTrigger className="text-base font-semibold">
                  Description
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {product.description ||
                    "No description available for this product."}
                  <br />
                  <br />
                  <strong className="text-foreground">
                    Detailed Specification:
                  </strong>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Organic Ring-spun Combed Cotton</li>
                    <li>100% Cotton</li>
                    <li>Regular Fit</li>
                    <li>Reactive Dyes, enzyme and silicon washed</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="size-guide">
                <AccordionTrigger className="text-base font-semibold">
                  Size Chart (Inches)
                </AccordionTrigger>
                <AccordionContent>
                  {/* 🔄 CHANGED: Replaced hardcoded grid with shadcn Table */}
                  <div className="rounded-md border border-border">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50 hover:bg-muted/50">
                          <TableHead className="w-[80px]">Size</TableHead>
                          <TableHead>Chest</TableHead>
                          <TableHead>Length</TableHead>
                          <TableHead>Sleeve</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {SIZE_CHART_DATA.map((row) => (
                          <TableRow key={row.size}>
                            <TableCell className="font-medium">
                              {row.size}
                            </TableCell>
                            <TableCell>{row.chest}</TableCell>
                            <TableCell>{row.length}</TableCell>
                            <TableCell>{row.sleeve}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>

        {/* "You May Also Like" Section (Mocked for UI) */}
        <div className="mt-24">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">You may also like</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-card border border-border rounded-lg overflow-hidden group"
              >
                <div className="aspect-square bg-muted relative">
                  <Image
                    src="/placeholder.svg"
                    alt="Product"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="p-3 text-center">
                  <p className="text-xs text-muted-foreground line-through">
                    {formatPrice(690)}
                  </p>
                  <p className="text-sm font-semibold mb-2">
                    {formatPrice(550)}
                  </p>
                  <Button
                    size="sm"
                    className="w-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-sm h-8 text-xs"
                  >
                    + Add to Cart
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

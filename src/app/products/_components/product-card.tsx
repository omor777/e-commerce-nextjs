"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { ProductListItem } from "@/lib/api/products";
import { formatPrice } from "@/lib/format";
import { Heart, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { VariantPickerModal } from "./variant-picker-modal";

// ─── NEW ───────────────────────────────────────────
// Extracted component props at the top
type ProductCardProps = {
  product: ProductListItem;
};
// ───────────────────────────────────────────────────

export function ProductCard({ product }: ProductCardProps) {
  const [wishlisted, setWishlisted] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const image = product.images?.[0] ?? "/placeholder.svg";
  // console.log(product);

  return (
    <>
      <Card className="group/card h-full overflow-hidden p-0 gap-0">
        <div className="relative aspect-square overflow-hidden bg-muted">
          <Link
            href={`/products/${product.slug}`}
            className="block h-full w-full"
          >
            <Image
              src={image}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover/card:scale-105"
            />
          </Link>

          <div className="absolute top-3 right-3 opacity-0 transition-opacity duration-200 group-hover/card:opacity-100">
            <Button
              size="icon"
              variant="secondary"
              aria-label={
                wishlisted ? "Remove from wishlist" : "Add to wishlist"
              }
              onClick={(e) => {
                e.preventDefault();
                setWishlisted((v) => !v);
              }}
            >
              <Heart className={`size-4 ${wishlisted ? "fill-current" : ""}`} />
            </Button>
          </div>
        </div>

        <CardContent className="flex flex-1 flex-col gap-3 p-4">
          <div className="space-y-1">
            <Link href={`/products/${product.slug}`} className="block">
              <h3 className="line-clamp-1 font-medium leading-tight">
                {product.name}
              </h3>
            </Link>
            {product.category && (
              <p className="text-sm text-muted-foreground">
                {product.category.name}
              </p>
            )}
          </div>

          <div className="mt-auto flex items-center justify-between gap-2">
            <span className="font-medium">
              {/* 🔄 CHANGED: back to cheapestPrice */}
              {product.cheapestPrice !== null
                ? `${formatPrice(product.cheapestPrice)}`
                : "Unavailable"}
            </span>

            <Button
              size="sm"
              variant="outline"
              className="gap-1.5"
              // 🔄 CHANGED: Open modal instead of direct add
              disabled={product.cheapestPrice === null}
              onClick={() => setModalOpen(true)}
            >
              <ShoppingBag className="size-4" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      <VariantPickerModal
        product={product}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </>
  );
}

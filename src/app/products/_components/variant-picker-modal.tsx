"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAddToCart } from "@/hooks/use-cart-mutations";
import { useProductVariants } from "@/hooks/use-product-variants";
import type { ProductListItem } from "@/lib/api/products";
import { formatPrice } from "@/lib/format";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";

type VariantPickerModalProps = {
  product: ProductListItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function VariantPickerModal({
  product,
  open,
  onOpenChange,
}: VariantPickerModalProps) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  // ─── QUERIES ───────────────────────────────────────
  // 🔄 Renamed variables for clarity
  const { data: productVariants = [], isPending: isVariantsLoading } =
    useProductVariants(product.id, open);

  // ─── MUTATIONS ─────────────────────────────────────
  // 🔄 Renamed to explicitly state what it does
  const addToCartMutation = useAddToCart(() => {
    // This runs after successful add
    onOpenChange(false);
    setSelectedSize(null);
    setSelectedColor(null);
  });

  // ─── DERIVED STATE ─────────────────────────────────
  const { availableSizes, availableColors } = useMemo(() => {
    if (!productVariants) return { availableSizes: [], availableColors: [] };
    return {
      availableSizes: Array.from(new Set(productVariants.map((v) => v.size))),
      availableColors: Array.from(
        new Set(productVariants.map((v) => v.color)),
      ).sort(),
    };
  }, [productVariants]);

  const selectedVariant = useMemo(() => {
    if (!productVariants || !selectedSize || !selectedColor) return null;
    return productVariants.find(
      (v) => v.size === selectedSize && v.color === selectedColor,
    );
  }, [productVariants, selectedSize, selectedColor]);

  const productImage = product.images?.[0] ?? "/placeholder.svg";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-175 p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2 border-b">
          <DialogTitle className="text-center">Select Options</DialogTitle>
        </DialogHeader>

        {isVariantsLoading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-4 text-muted-foreground">
            <Loader2 className="size-6 animate-spin" />
            <p className="text-sm">Loading options...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6">
            {/* Left Col: Image & Product Info */}
            <div className="flex flex-col gap-4">
              <div className="relative aspect-square overflow-hidden rounded-md bg-muted">
                <Image
                  src={productImage}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="text-center">
                <h3 className="font-medium text-lg">{product.name}</h3>
                {selectedVariant && (
                  <p className="text-muted-foreground">
                    {formatPrice(selectedVariant.price)}
                  </p>
                )}
              </div>
            </div>

            {/* Right Col: Size Guide & Selectors */}
            <div className="flex flex-col gap-6">
              <Tabs defaultValue="choose">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="choose">Choose</TabsTrigger>
                  <TabsTrigger value="size-guide">Size Guide</TabsTrigger>
                </TabsList>

                <TabsContent value="choose" className="space-y-6 pt-4">
                  {/* Colors */}
                  {availableColors.length > 1 && (
                    <div className="space-y-3">
                      <span className="text-sm font-medium">Choose Color</span>
                      <div className="flex flex-wrap gap-2">
                        {availableColors.map((color) => (
                          <Button
                            key={color}
                            variant={
                              selectedColor === color ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => setSelectedColor(color)}
                          >
                            {color}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sizes */}
                  <div className="space-y-3">
                    <span className="text-sm font-medium">Choose Size</span>
                    <div className="flex flex-wrap gap-2">
                      {availableSizes.map((size) => {
                        const variantForSize = productVariants?.find(
                          (v) =>
                            v.size === size &&
                            (!selectedColor || v.color === selectedColor),
                        );

                        console.log(variantForSize);

                        const isOutOfStock =
                          variantForSize && variantForSize.stock === 0;
                        const isUnavailable =
                          !variantForSize || !variantForSize.isActive;

                        return (
                          <Button
                            key={size}
                            variant={
                              selectedSize === size ? "default" : "outline"
                            }
                            className="w-12 h-12"
                            disabled={isOutOfStock || isUnavailable}
                            onClick={() => {
                              setSelectedSize(size);
                              if (availableColors.length === 1)
                                setSelectedColor(availableColors[0]);
                            }}
                          >
                            {size}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="size-guide" className="pt-4">
                  <div className="rounded-md border text-sm">
                    <div className="grid grid-cols-4 bg-muted p-2 font-medium text-center border-b">
                      <div>Size</div>
                      <div>Chest</div>
                      <div>Length</div>
                      <div>Sleeve</div>
                    </div>
                    {["M", "L", "XL", "2XL"].map((s) => (
                      <div
                        key={s}
                        className="grid grid-cols-4 p-2 text-center border-b last:border-0"
                      >
                        <div>{s}</div>
                        <div>-</div>
                        <div>-</div>
                        <div>-</div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-6 border-t bg-muted/20">
          <Button
            className="w-full"
            size="lg"
            disabled={
              !selectedVariant ||
              selectedVariant.stock === 0 ||
              addToCartMutation.isPending ||
              isVariantsLoading
            }
            onClick={() => {
              if (selectedVariant) addToCartMutation.mutate(selectedVariant.id);
            }}
          >
            {addToCartMutation.isPending ? (
              <Loader2 className="size-4 animate-spin mr-2" />
            ) : null}
            Add to Cart
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

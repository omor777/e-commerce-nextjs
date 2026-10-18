"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ProductSort } from "@/schemas/product.schema";

export type ProductFiltersState = {
  sort: ProductSort;
  minPrice: string;
  maxPrice: string;
};

export function ProductFilters({
  value,
  onChange,
}: {
  value: ProductFiltersState;
  onChange: (next: ProductFiltersState) => void;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
      <div className="space-y-2">
        <Label htmlFor="sort">Sort by</Label>
        <Select
          value={value.sort}
          onValueChange={(sort) =>
            onChange({ ...value, sort: sort as ProductSort })
          }
        >
          <SelectTrigger id="sort" className="w-45">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
            <SelectItem value="price_asc">Price: Low to High</SelectItem>
            <SelectItem value="price_desc">Price: High to Low</SelectItem>
            <SelectItem value="name_asc">Name: A–Z</SelectItem>
            <SelectItem value="name_desc">Name: Z–A</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="minPrice">Min price</Label>
        <Input
          id="minPrice"
          type="number"
          min="0"
          placeholder="0"
          value={value.minPrice}
          onChange={(e) => onChange({ ...value, minPrice: e.target.value })}
          className="w-30"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="maxPrice">Max price</Label>
        <Input
          id="maxPrice"
          type="number"
          min="0"
          placeholder="Any"
          value={value.maxPrice}
          onChange={(e) => onChange({ ...value, maxPrice: e.target.value })}
          className="w-30"
        />
      </div>
    </div>
  );
}

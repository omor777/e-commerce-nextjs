"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  productsQueryOptions,
  type ProductListParams,
} from "@/lib/api/products";
import { ProductCard } from "./product-card";
import { ProductFilters, type ProductFiltersState } from "./product-filters";
import { Button } from "@/components/ui/button";

const DEFAULT_FILTERS: ProductFiltersState = {
  sort: "newest",
  minPrice: "",
  maxPrice: "",
};

export function ProductGrid() {
  const [filters, setFilters] = useState<ProductFiltersState>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const limit = 12;

  const params: ProductListParams = {
    page,
    limit,
    sort: filters.sort,
    minPrice: filters.minPrice !== "" ? Number(filters.minPrice) : undefined,
    maxPrice: filters.maxPrice !== "" ? Number(filters.maxPrice) : undefined,
    isActive: true,
  };

  const { data, isPending, isError, error, isFetching } = useQuery(
    productsQueryOptions(params),
  );

  if (isPending) {
    return (
      <div className="space-y-6">
        <ProductFilters
          value={filters}
          onChange={(f) => {
            setFilters(f);
            setPage(1);
          }}
        />
        <p className="text-sm text-muted-foreground">Loading products…</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <ProductFilters
          value={filters}
          onChange={(f) => {
            setFilters(f);
            setPage(1);
          }}
        />
        <p className="text-sm text-destructive">
          Could not load products: {error.message}
        </p>
      </div>
    );
  }

  const { data: products, meta } = data;
  const totalPages = Math.max(1, Math.ceil(meta.total / limit));

  return (
    <div className="space-y-6">
      <ProductFilters
        value={filters}
        onChange={(f) => {
          setFilters(f);
          setPage(1); // reset to first page on filter change
        }}
      />

      {products.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          No products match your filters.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1 || isFetching}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages || isFetching}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

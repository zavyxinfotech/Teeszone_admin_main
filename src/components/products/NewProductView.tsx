"use client";

import { useSearchParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { useProduct } from "@/hooks/use-catalog";
import { ProductForm, productToValues } from "./ProductForm";

// /products/new?from=<id> pre-fills the form from an existing product.
export function NewProductView() {
  const from = useSearchParams().get("from") ?? undefined;
  const { data, isLoading } = useProduct(from);
  if (from && (isLoading || !data)) return <Skeleton className="h-96" />;
  return <ProductForm initial={data ? productToValues(data, true) : undefined} />;
}

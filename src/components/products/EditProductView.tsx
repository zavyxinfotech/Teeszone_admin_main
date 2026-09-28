"use client";

import { useParams } from "next/navigation";
import { Package } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { useProduct } from "@/hooks/use-catalog";
import { ProductForm } from "./ProductForm";

export function EditProductView() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = useProduct(id);
  if (isLoading) return <Skeleton className="h-96" />;
  if (isError || !data) {
    return <EmptyState icon={Package} title="Product not found" description="It may have been deleted." />;
  }
  return (
    <>
      <PageHeader title={data.name} description={`/products/${data.slug}`} />
      <ProductForm key={data.id} product={data} />
    </>
  );
}

"use client";

import { useParams } from "next/navigation";
import { BadgePercent } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { usePromotion } from "@/hooks/use-promotions";
import { PromotionForm } from "./PromotionForm";

export function EditPromotionView() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = usePromotion(id);
  if (isLoading) return <Skeleton className="h-96" />;
  if (isError || !data) return <EmptyState icon={BadgePercent} title="Promotion not found" />;
  return (
    <>
      <PageHeader title={data.name} actions={<StatusBadge status={data.status} />} />
      <PromotionForm key={data.id} promotion={data} />
    </>
  );
}

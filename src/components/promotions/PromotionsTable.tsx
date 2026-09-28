"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { BadgePercent, Pencil, Plus, Power, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table/DataTable";
import { RowActions } from "@/components/data-table/RowActions";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useDeletePromotion, usePromotions, useUpdatePromotion } from "@/hooks/use-promotions";
import { formatDate } from "@/lib/format";
import type { AdminPromotion, PromotionInput } from "@/lib/types";

export const promotionToInput = (p: AdminPromotion): PromotionInput => ({
  name: p.name,
  code: p.code,
  type: p.type,
  value: p.value,
  scope: p.scope,
  productSlugs: p.productSlugs,
  collectionSlugs: p.collectionSlugs,
  minQty: p.minQty,
  minOrderValue: p.minOrderValue,
  startsAt: p.startsAt,
  endsAt: p.endsAt,
  isActive: p.isActive,
  sortOrder: p.sortOrder,
});

export const describeValue = (p: { type: "PERCENT" | "FLAT"; value: number }) =>
  p.type === "PERCENT" ? `${p.value}% off` : `₹${p.value} off / pc`;

export const describeScope = (p: { scope: string; productSlugs: string[]; collectionSlugs: string[] }) =>
  p.scope === "ALL"
    ? "Whole store"
    : p.scope === "PRODUCTS"
      ? `${p.productSlugs.length} product${p.productSlugs.length === 1 ? "" : "s"}`
      : `${p.collectionSlugs.length} collection${p.collectionSlugs.length === 1 ? "" : "s"}`;

export function PromotionsTable() {
  const router = useRouter();
  const { data: promotions = [], isLoading } = usePromotions();
  const update = useUpdatePromotion();
  const remove = useDeletePromotion();
  const [pendingDelete, setPendingDelete] = useState<AdminPromotion | null>(null);

  const columns = useMemo<ColumnDef<AdminPromotion, unknown>[]>(
    () => [
      {
        id: "name",
        accessorFn: (p) => `${p.name} ${p.code ?? ""}`,
        header: "Promotion",
        cell: ({ row }) => (
          <Link href={`/promotions/${row.original.id}`} className="font-medium hover:text-primary">
            {row.original.name}
          </Link>
        ),
      },
      {
        accessorKey: "code",
        header: "Code",
        cell: ({ getValue }) => {
          const code = getValue<string | null>();
          return code ? (
            <Badge variant="outline" className="font-mono">{code}</Badge>
          ) : (
            <span className="text-xs text-muted-foreground">Automatic</span>
          );
        },
      },
      { id: "value", accessorFn: (p) => p.value, header: "Discount", cell: ({ row }) => describeValue(row.original) },
      { id: "scope", accessorFn: (p) => p.scope, header: "Applies to", cell: ({ row }) => describeScope(row.original) },
      {
        id: "conditions",
        header: "Conditions",
        enableSorting: false,
        cell: ({ row }) => {
          const p = row.original;
          const parts = [p.minQty ? `${p.minQty}+ pcs` : null, p.minOrderValue ? `₹${p.minOrderValue}+ order` : null].filter(Boolean);
          return <span className="text-xs text-muted-foreground">{parts.length ? parts.join(" · ") : "None"}</span>;
        },
      },
      {
        id: "window",
        accessorFn: (p) => p.startsAt ?? "",
        header: "Window",
        cell: ({ row }) => {
          const p = row.original;
          return (
            <span className="whitespace-nowrap text-xs text-muted-foreground">
              {p.startsAt || p.endsAt ? `${formatDate(p.startsAt)} → ${formatDate(p.endsAt)}` : "Always"}
            </span>
          );
        },
      },
      { accessorKey: "status", header: "Status", cell: ({ getValue }) => <StatusBadge status={getValue<string>()} /> },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        cell: ({ row }) => {
          const p = row.original;
          return (
            <RowActions
              actions={[
                { label: "Edit", icon: <Pencil />, onClick: () => router.push(`/promotions/${p.id}`) },
                {
                  label: p.isActive ? "Deactivate" : "Activate",
                  icon: <Power />,
                  onClick: () => update.mutate({ id: p.id, input: { ...promotionToInput(p), isActive: !p.isActive } }),
                },
                { label: "Delete", icon: <Trash2 />, destructive: true, onClick: () => setPendingDelete(p) },
              ]}
            />
          );
        },
      },
    ],
    [router, update],
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={promotions}
        loading={isLoading}
        searchPlaceholder="Search name or code…"
        empty={
          <EmptyState
            icon={BadgePercent}
            title="No promotions yet"
            description="Automatic promotions apply on the storefront cart by themselves; coupon codes are entered by the buyer."
            action={
              <Button asChild>
                <Link href="/promotions/new">
                  <Plus /> Create promotion
                </Link>
              </Button>
            }
          />
        }
      />
      <ConfirmDialog
        open={!!pendingDelete}
        onOpenChange={(o) => !o && setPendingDelete(null)}
        title={`Delete "${pendingDelete?.name}"?`}
        description="Buyers can no longer use this promotion."
        loading={remove.isPending}
        onConfirm={() => pendingDelete && remove.mutate(pendingDelete.id, { onSuccess: () => setPendingDelete(null) })}
      />
    </>
  );
}

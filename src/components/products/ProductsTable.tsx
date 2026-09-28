"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { Copy, Eye, EyeOff, Package, Pencil, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable } from "@/components/data-table/DataTable";
import { RowActions } from "@/components/data-table/RowActions";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { ProductImage } from "@/components/shared/ProductImage";
import { useCollections, useDeleteProduct, useProducts, useUpdateProduct } from "@/hooks/use-catalog";
import { formatINR, offPct, storeUrl } from "@/lib/format";
import { isVirtualCollection, type AdminProduct } from "@/lib/types";

const toInput = (p: AdminProduct) => ({
  name: p.name,
  slug: p.slug,
  description: p.description,
  fit: p.fit,
  fabric: p.fabric,
  gsm: p.gsm,
  mrp: p.mrp,
  price: p.price,
  sizes: p.sizes,
  features: p.features,
  colors: p.colors,
  qtyDiscounts: p.qtyDiscounts,
  collections: p.collections.filter((c) => !isVirtualCollection(c)),
  isNew: !!p.isNew,
  bestSeller: !!p.bestSeller,
  megaSale: !!p.megaSale,
  isActive: p.isActive,
  sortOrder: p.sortOrder,
});

export function ProductsTable() {
  const router = useRouter();
  const { data: products = [], isLoading } = useProducts();
  const { data: collections = [] } = useCollections();
  const update = useUpdateProduct();
  const remove = useDeleteProduct();
  const [collection, setCollection] = useState("all");
  const [status, setStatus] = useState("all");
  const [pendingDelete, setPendingDelete] = useState<AdminProduct | null>(null);

  const collectionName = useMemo(() => new Map(collections.map((c) => [c.slug, c.name])), [collections]);

  const filtered = useMemo(
    () =>
      products.filter(
        (p) =>
          (collection === "all" || p.collections.includes(collection)) &&
          (status === "all" || (status === "active" ? p.isActive : !p.isActive)),
      ),
    [products, collection, status],
  );

  const columns = useMemo<ColumnDef<AdminProduct, unknown>[]>(
    () => [
      {
        id: "product",
        accessorFn: (p) => `${p.name} ${p.slug} ${p.fabric}`,
        header: "Product",
        cell: ({ row }) => {
          const p = row.original;
          return (
            <Link href={`/products/${p.id}`} className="flex items-center gap-3">
              <ProductImage src={p.colors[0]?.image} alt={p.name} className="size-11 shrink-0 rounded border border-border" />
              <div className="min-w-0">
                <p className="truncate font-medium hover:text-primary">{p.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {p.fabric} · {p.gsm} GSM · {p.colors.length} colors
                </p>
              </div>
            </Link>
          );
        },
      },
      {
        id: "collections",
        accessorFn: (p) => p.collections.map((c) => collectionName.get(c) ?? c).join(" "),
        header: "Collections",
        enableSorting: false,
        cell: ({ row }) => {
          const real = row.original.collections.filter((c) => !isVirtualCollection(c));
          return (
            <div className="flex max-w-56 flex-wrap gap-1">
              {real.slice(0, 3).map((c) => (
                <Badge key={c} variant="outline" className="font-normal">
                  {collectionName.get(c) ?? c}
                </Badge>
              ))}
              {real.length > 3 && <span className="text-xs text-muted-foreground">+{real.length - 3}</span>}
            </div>
          );
        },
      },
      {
        accessorKey: "price",
        header: "Price",
        cell: ({ row }) => {
          const p = row.original;
          return (
            <div className="whitespace-nowrap">
              <span className="font-semibold">{formatINR(p.price)}</span>
              <span className="ml-1.5 text-xs text-muted-foreground line-through">{formatINR(p.mrp)}</span>
              <span className="ml-1.5 text-xs font-medium text-primary">{offPct(p.mrp, p.price)}% off</span>
            </div>
          );
        },
      },
      {
        id: "flags",
        header: "Flags",
        enableSorting: false,
        cell: ({ row }) => {
          const p = row.original;
          return (
            <div className="flex gap-1">
              {p.isNew && <Badge className="bg-ink text-white">New</Badge>}
              {p.bestSeller && <Badge className="bg-gold text-ink">Best</Badge>}
              {p.megaSale && <Badge>Sale</Badge>}
            </div>
          );
        },
      },
      {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) =>
          row.original.isActive ? (
            <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">Active</Badge>
          ) : (
            <Badge variant="outline" className="text-muted-foreground">Hidden</Badge>
          ),
      },
      { accessorKey: "sortOrder", header: "Pos.", cell: ({ getValue }) => <span className="text-muted-foreground">{getValue<number>()}</span> },
      {
        id: "actions",
        enableSorting: false,
        header: "",
        cell: ({ row }) => {
          const p = row.original;
          return (
            <RowActions
              actions={[
                { label: "Edit", icon: <Pencil />, onClick: () => router.push(`/products/${p.id}`) },
                {
                  label: "View on store",
                  icon: <Eye />,
                  onClick: () => window.open(storeUrl(`/products/${p.slug}`), "_blank"),
                  disabled: !p.isActive,
                },
                { label: "Duplicate", icon: <Copy />, onClick: () => router.push(`/products/new?from=${p.id}`) },
                {
                  label: p.isActive ? "Hide from store" : "Make active",
                  icon: p.isActive ? <EyeOff /> : <Eye />,
                  onClick: () => update.mutate({ id: p.id, input: { ...toInput(p), isActive: !p.isActive } }),
                },
                { label: "Delete", icon: <Trash2 />, destructive: true, onClick: () => setPendingDelete(p) },
              ]}
            />
          );
        },
      },
    ],
    [collectionName, router, update],
  );

  const realCollections = collections.filter((c) => !c.isVirtual);

  return (
    <>
      <DataTable
        columns={columns}
        data={filtered}
        loading={isLoading}
        searchPlaceholder="Search name, slug, fabric…"
        initialSorting={[{ id: "sortOrder", desc: false }]}
        toolbar={
          <>
            <Select value={collection} onValueChange={setCollection}>
              <SelectTrigger className="w-52">
                <SelectValue placeholder="Collection" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All collections</SelectItem>
                <SelectItem value="new-arrival">New Arrival (flag)</SelectItem>
                <SelectItem value="best-sellers">Best Sellers (flag)</SelectItem>
                <SelectItem value="mega-sale">Mega Sale (flag)</SelectItem>
                {realCollections.map((c) => (
                  <SelectItem key={c.slug} value={c.slug}>
                    {c.name} <span className="text-muted-foreground">· {c.segment}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Hidden</SelectItem>
              </SelectContent>
            </Select>
          </>
        }
        empty={
          products.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No products yet"
              description="Products you add here appear on the storefront within a few minutes."
              action={
                <Button asChild>
                  <Link href="/products/new">
                    <Plus /> Add product
                  </Link>
                </Button>
              }
            />
          ) : undefined
        }
      />
      <ConfirmDialog
        open={!!pendingDelete}
        onOpenChange={(o) => !o && setPendingDelete(null)}
        title={`Delete "${pendingDelete?.name}"?`}
        description="The product is removed from the storefront immediately. This can't be undone from the admin."
        loading={remove.isPending}
        onConfirm={() =>
          pendingDelete && remove.mutate(pendingDelete.id, { onSuccess: () => setPendingDelete(null) })
        }
      />
    </>
  );
}

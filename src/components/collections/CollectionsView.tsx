"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye, Layers, Lock, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DataTable } from "@/components/data-table/DataTable";
import { RowActions } from "@/components/data-table/RowActions";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { FormRow } from "@/components/shared/FormRow";
import { PageHeader } from "@/components/layout/PageHeader";
import { useCollections, useCreateCollection, useDeleteCollection, useUpdateCollection } from "@/hooks/use-catalog";
import { slugify, storeUrl } from "@/lib/format";
import type { AdminCollection, CollectionInput } from "@/lib/types";

const SEGMENTS = [
  { value: "unisex", label: "Unisex" },
  { value: "men", label: "Men" },
  { value: "women", label: "Women" },
  { value: "kids", label: "Kids" },
  { value: "shop-more", label: "Shop More (not in mega menu)" },
];

const schema = z.object({
  slug: z.string().min(1, "Required").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "kebab-case only"),
  name: z.string().min(1, "Required"),
  description: z.string(),
  segment: z.string().min(1, "Required"),
  group: z.string().min(1, "Required"),
  sortOrder: z.number({ invalid_type_error: "Required" }).int(),
});
type FormValues = z.infer<typeof schema>;

function CollectionDialog({
  open,
  onOpenChange,
  editing,
  all,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  editing: AdminCollection | null;
  all: AdminCollection[];
}) {
  const create = useCreateCollection(() => onOpenChange(false));
  const update = useUpdateCollection(() => onOpenChange(false));
  const [slugTouched, setSlugTouched] = useState(false);
  const { register, control, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { slug: "", name: "", description: "", segment: "unisex", group: "", sortOrder: 0 },
  });

  useEffect(() => {
    if (!open) return;
    setSlugTouched(!!editing);
    reset(
      editing
        ? { slug: editing.slug, name: editing.name, description: editing.description, segment: editing.segment, group: editing.group, sortOrder: editing.sortOrder }
        : { slug: "", name: "", description: "", segment: "unisex", group: "", sortOrder: 0 },
    );
  }, [open, editing, reset]);

  const name = watch("name");
  const segment = watch("segment");
  useEffect(() => {
    if (!slugTouched) setValue("slug", slugify(name));
  }, [name, slugTouched, setValue]);

  const groupSuggestions = useMemo(
    () => Array.from(new Set(all.filter((c) => c.segment === segment).map((c) => c.group))),
    [all, segment],
  );

  const busy = create.isPending || update.isPending;
  const onSubmit = (v: FormValues) => {
    const input: CollectionInput = v;
    if (editing) update.mutate({ id: editing.id, input });
    else create.mutate(input);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit collection" : "New collection"}</DialogTitle>
            <DialogDescription>Collections are the menu entries products are listed under.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormRow label="Name" htmlFor="c-name" required error={errors.name?.message} className="sm:col-span-2">
              <Input id="c-name" {...register("name")} />
            </FormRow>
            <FormRow label="Slug" htmlFor="c-slug" required error={errors.slug?.message} className="sm:col-span-2" hint="URL: /collections/<slug>">
              <Input id="c-slug" {...register("slug", { onChange: () => setSlugTouched(true) })} />
            </FormRow>
            <FormRow label="Segment" required error={errors.segment?.message}>
              <Controller
                control={control}
                name="segment"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SEGMENTS.map((s) => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormRow>
            <FormRow label="Menu group" htmlFor="c-group" required error={errors.group?.message} hint="Column heading; a new name creates a group">
              <>
                <Input id="c-group" list="group-options" {...register("group")} placeholder="Tops" />
                <datalist id="group-options">
                  {groupSuggestions.map((g) => <option key={g} value={g} />)}
                </datalist>
              </>
            </FormRow>
            <FormRow label="Description" htmlFor="c-desc" className="sm:col-span-2">
              <Textarea id="c-desc" rows={2} {...register("description")} />
            </FormRow>
            <FormRow label="Position in group" htmlFor="c-sort" error={errors.sortOrder?.message}>
              <Input id="c-sort" type="number" {...register("sortOrder", { valueAsNumber: true })} />
            </FormRow>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={busy}>{busy ? "Saving…" : editing ? "Save" : "Create"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function CollectionsView() {
  const { data: collections = [], isLoading } = useCollections();
  const remove = useDeleteCollection();
  const [dialog, setDialog] = useState<{ open: boolean; editing: AdminCollection | null }>({ open: false, editing: null });
  const [pendingDelete, setPendingDelete] = useState<AdminCollection | null>(null);

  const columns = useMemo<ColumnDef<AdminCollection, unknown>[]>(
    () => [
      {
        id: "name",
        accessorFn: (c) => `${c.name} ${c.slug}`,
        header: "Collection",
        cell: ({ row }) => (
          <div>
            <p className="flex items-center gap-1.5 font-medium">
              {row.original.name}
              {row.original.isVirtual && <Lock size={12} className="text-muted-foreground" />}
            </p>
            <p className="text-xs text-muted-foreground">/collections/{row.original.slug}</p>
          </div>
        ),
      },
      { accessorKey: "segment", header: "Segment", cell: ({ getValue }) => <Badge variant="outline" className="capitalize">{getValue<string>()}</Badge> },
      { accessorKey: "group", header: "Menu group" },
      { accessorKey: "productCount", header: "Products" },
      { accessorKey: "sortOrder", header: "Pos.", cell: ({ getValue }) => <span className="text-muted-foreground">{getValue<number>()}</span> },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        cell: ({ row }) => {
          const c = row.original;
          return (
            <RowActions
              actions={[
                { label: "Edit", icon: <Pencil />, onClick: () => setDialog({ open: true, editing: c }), disabled: c.isVirtual },
                { label: "View on store", icon: <Eye />, onClick: () => window.open(storeUrl(`/collections/${c.slug}`), "_blank") },
                { label: "Delete", icon: <Trash2 />, destructive: true, onClick: () => setPendingDelete(c), disabled: c.isVirtual },
              ]}
            />
          );
        },
      },
    ],
    [],
  );

  return (
    <>
      <PageHeader
        title="Collections"
        description="Menu taxonomy: segment › group › collection. New Arrival, Best Sellers and Mega Sale are automatic (driven by product flags)."
        actions={
          <Button onClick={() => setDialog({ open: true, editing: null })}>
            <Plus /> Add collection
          </Button>
        }
      />
      <DataTable
        columns={columns}
        data={collections}
        loading={isLoading}
        searchPlaceholder="Search collections…"
        pageSize={50}
        empty={<EmptyState icon={Layers} title="No collections" />}
      />
      <CollectionDialog open={dialog.open} onOpenChange={(o) => setDialog((d) => ({ ...d, open: o }))} editing={dialog.editing} all={collections} />
      <ConfirmDialog
        open={!!pendingDelete}
        onOpenChange={(o) => !o && setPendingDelete(null)}
        title={`Delete "${pendingDelete?.name}"?`}
        description={`${pendingDelete?.productCount ?? 0} product(s) will drop this collection from their listing. The products themselves stay.`}
        loading={remove.isPending}
        onConfirm={() => pendingDelete && remove.mutate(pendingDelete.id, { onSuccess: () => setPendingDelete(null) })}
      />
    </>
  );
}

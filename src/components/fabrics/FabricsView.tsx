"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Plus, Shirt, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DataTable } from "@/components/data-table/DataTable";
import { RowActions } from "@/components/data-table/RowActions";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { FormRow } from "@/components/shared/FormRow";
import { ImageField } from "@/components/shared/ImageField";
import { ProductImage } from "@/components/shared/ProductImage";
import { TagInput } from "@/components/shared/TagInput";
import { PageHeader } from "@/components/layout/PageHeader";
import { useCreateFabric, useDeleteFabric, useFabrics, useUpdateFabric } from "@/hooks/use-catalog";
import { slugify } from "@/lib/format";
import type { AdminFabric, FabricInput } from "@/lib/types";

const schema = z.object({
  key: z.string().min(1, "Required").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "kebab-case only"),
  name: z.string().min(1, "Required"),
  description: z.string().min(1, "Required"),
  fit: z.string().min(1, "Required"),
  highlights: z.array(z.string()),
  image: z.string().min(1, "Required"),
  sortOrder: z.number({ invalid_type_error: "Required" }).int(),
});
type FormValues = z.infer<typeof schema>;
const empty: FormValues = { key: "", name: "", description: "", fit: "", highlights: [], image: "", sortOrder: 0 };

function FabricDialog({ open, onOpenChange, editing }: { open: boolean; onOpenChange: (o: boolean) => void; editing: AdminFabric | null }) {
  const create = useCreateFabric(() => onOpenChange(false));
  const update = useUpdateFabric(() => onOpenChange(false));
  const [keyTouched, setKeyTouched] = useState(false);
  const { register, control, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: empty,
  });

  useEffect(() => {
    if (!open) return;
    setKeyTouched(!!editing);
    reset(editing ? { key: editing.key, name: editing.name, description: editing.description, fit: editing.fit, highlights: editing.highlights, image: editing.image, sortOrder: editing.sortOrder } : empty);
  }, [open, editing, reset]);

  const name = watch("name");
  useEffect(() => {
    if (!keyTouched) setValue("key", slugify(name));
  }, [name, keyTouched, setValue]);

  const busy = create.isPending || update.isPending;
  const onSubmit = (v: FormValues) => {
    const input: FabricInput = v;
    if (editing) update.mutate({ id: editing.id, input });
    else create.mutate(input);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit fabric" : "New fabric"}</DialogTitle>
            <DialogDescription>Shown in the storefront Fabric Library.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormRow label="Name" htmlFor="f-name" required error={errors.name?.message}>
              <Input id="f-name" {...register("name")} />
            </FormRow>
            <FormRow label="Key" htmlFor="f-key" required error={errors.key?.message}>
              <Input id="f-key" {...register("key", { onChange: () => setKeyTouched(true) })} />
            </FormRow>
            <FormRow label="Description" htmlFor="f-desc" required error={errors.description?.message} className="sm:col-span-2">
              <Textarea id="f-desc" rows={3} {...register("description")} />
            </FormRow>
            <FormRow label="Fit" htmlFor="f-fit" required error={errors.fit?.message} className="sm:col-span-2">
              <Input id="f-fit" {...register("fit")} />
            </FormRow>
            <FormRow label="Highlights" className="sm:col-span-2">
              <Controller control={control} name="highlights" render={({ field }) => <TagInput value={field.value} onChange={field.onChange} placeholder="e.g. Breathable" />} />
            </FormRow>
            <FormRow label="Image" error={errors.image?.message} className="sm:col-span-2">
              <Controller control={control} name="image" render={({ field }) => <ImageField value={field.value} onChange={field.onChange} />} />
            </FormRow>
            <FormRow label="Position" htmlFor="f-sort" error={errors.sortOrder?.message}>
              <Input id="f-sort" type="number" {...register("sortOrder", { valueAsNumber: true })} />
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

export function FabricsView() {
  const { data: fabrics = [], isLoading } = useFabrics();
  const remove = useDeleteFabric();
  const [dialog, setDialog] = useState<{ open: boolean; editing: AdminFabric | null }>({ open: false, editing: null });
  const [pendingDelete, setPendingDelete] = useState<AdminFabric | null>(null);

  const columns = useMemo<ColumnDef<AdminFabric, unknown>[]>(
    () => [
      {
        id: "name",
        accessorFn: (f) => `${f.name} ${f.key}`,
        header: "Fabric",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <ProductImage src={row.original.image} alt={row.original.name} className="size-11 rounded border border-border" />
            <div>
              <p className="font-medium">{row.original.name}</p>
              <p className="text-xs text-muted-foreground">{row.original.key}</p>
            </div>
          </div>
        ),
      },
      { accessorKey: "fit", header: "Fit", cell: ({ getValue }) => <span className="line-clamp-2 max-w-72 text-sm">{getValue<string>()}</span> },
      {
        id: "highlights",
        header: "Highlights",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex max-w-64 flex-wrap gap-1">
            {row.original.highlights.map((h) => <Badge key={h} variant="secondary" className="font-normal">{h}</Badge>)}
          </div>
        ),
      },
      { accessorKey: "sortOrder", header: "Pos." },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        cell: ({ row }) => (
          <RowActions
            actions={[
              { label: "Edit", icon: <Pencil />, onClick: () => setDialog({ open: true, editing: row.original }) },
              { label: "Delete", icon: <Trash2 />, destructive: true, onClick: () => setPendingDelete(row.original) },
            ]}
          />
        ),
      },
    ],
    [],
  );

  return (
    <>
      <PageHeader
        title="Fabrics"
        description="The Fabric Library on the storefront homepage."
        actions={<Button onClick={() => setDialog({ open: true, editing: null })}><Plus /> Add fabric</Button>}
      />
      <DataTable columns={columns} data={fabrics} loading={isLoading} searchPlaceholder="Search fabrics…" empty={<EmptyState icon={Shirt} title="No fabrics" />} />
      <FabricDialog open={dialog.open} onOpenChange={(o) => setDialog((d) => ({ ...d, open: o }))} editing={dialog.editing} />
      <ConfirmDialog
        open={!!pendingDelete}
        onOpenChange={(o) => !o && setPendingDelete(null)}
        title={`Delete "${pendingDelete?.name}"?`}
        loading={remove.isPending}
        onConfirm={() => pendingDelete && remove.mutate(pendingDelete.id, { onSuccess: () => setPendingDelete(null) })}
      />
    </>
  );
}

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { ColumnDef } from "@tanstack/react-table";
import { AlertTriangle, MessageSquareQuote, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { DataTable } from "@/components/data-table/DataTable";
import { RowActions } from "@/components/data-table/RowActions";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { FormRow } from "@/components/shared/FormRow";
import { PageHeader } from "@/components/layout/PageHeader";
import { useCreateReview, useDeleteReview, useReviews, useUpdateReview } from "@/hooks/use-catalog";
import { cn } from "@/lib/utils";
import type { AdminReview, ReviewInput } from "@/lib/types";

const schema = z.object({
  stars: z.number({ invalid_type_error: "Required" }).int().min(1).max(5),
  quote: z.string().min(1, "Required"),
  author: z.string().min(1, "Required"),
  product: z.string().min(1, "Required"),
  isPublished: z.boolean(),
  sortOrder: z.number({ invalid_type_error: "Required" }).int(),
});
type FormValues = z.infer<typeof schema>;
const empty: FormValues = { stars: 5, quote: "", author: "", product: "", isPublished: false, sortOrder: 0 };

const toInput = (r: AdminReview): ReviewInput => ({ stars: r.stars, quote: r.quote, author: r.author, product: r.product, isPublished: r.isPublished, sortOrder: r.sortOrder });
const looksSample = (r: AdminReview) => /sample|placeholder|lorem/i.test(`${r.author} ${r.quote}`);

function Stars({ value, onChange }: { value: number; onChange?: (n: number) => void }) {
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" disabled={!onChange} onClick={() => onChange?.(n)} aria-label={`${n} stars`} className={cn(!onChange && "cursor-default")}>
          <Star size={16} className={n <= value ? "fill-gold text-gold" : "text-border"} />
        </button>
      ))}
    </span>
  );
}

function ReviewDialog({ open, onOpenChange, editing }: { open: boolean; onOpenChange: (o: boolean) => void; editing: AdminReview | null }) {
  const create = useCreateReview(() => onOpenChange(false));
  const update = useUpdateReview(() => onOpenChange(false));
  const { register, control, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: empty });

  useEffect(() => {
    if (open) reset(editing ? toInput(editing) : empty);
  }, [open, editing, reset]);

  const busy = create.isPending || update.isPending;
  const onSubmit = (v: FormValues) => (editing ? update.mutate({ id: editing.id, input: v }) : create.mutate(v));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit review" : "New review"}</DialogTitle>
            <DialogDescription>Published reviews appear on the storefront homepage.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormRow label="Rating" error={errors.stars?.message}>
              <Controller control={control} name="stars" render={({ field }) => <Stars value={field.value} onChange={field.onChange} />} />
            </FormRow>
            <FormRow label="Position" htmlFor="r-sort" error={errors.sortOrder?.message}>
              <Input id="r-sort" type="number" {...register("sortOrder", { valueAsNumber: true })} />
            </FormRow>
            <FormRow label="Quote" htmlFor="r-quote" required error={errors.quote?.message} className="sm:col-span-2">
              <Textarea id="r-quote" rows={3} {...register("quote")} />
            </FormRow>
            <FormRow label="Author" htmlFor="r-author" required error={errors.author?.message} hint="Name, company or role">
              <Input id="r-author" {...register("author")} />
            </FormRow>
            <FormRow label="Product / order" htmlFor="r-product" required error={errors.product?.message}>
              <Input id="r-product" {...register("product")} placeholder="Corporate polos, 200 pcs" />
            </FormRow>
            <Controller
              control={control}
              name="isPublished"
              render={({ field }) => (
                <label className="flex items-center justify-between gap-3 text-sm sm:col-span-2">
                  <span className="font-medium">Published</span>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </label>
              )}
            />
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

export function ReviewsView() {
  const { data: reviews = [], isLoading } = useReviews();
  const update = useUpdateReview();
  const remove = useDeleteReview();
  const [dialog, setDialog] = useState<{ open: boolean; editing: AdminReview | null }>({ open: false, editing: null });
  const [pendingDelete, setPendingDelete] = useState<AdminReview | null>(null);

  const publishedSamples = reviews.filter((r) => r.isPublished && looksSample(r)).length;

  const columns = useMemo<ColumnDef<AdminReview, unknown>[]>(
    () => [
      {
        id: "quote",
        accessorFn: (r) => `${r.quote} ${r.author} ${r.product}`,
        header: "Review",
        cell: ({ row }) => (
          <div className="max-w-md">
            <p className="line-clamp-2 text-sm">“{row.original.quote}”</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {row.original.author} · {row.original.product}
              {looksSample(row.original) && <span className="ml-2 font-semibold text-amber-700">SAMPLE</span>}
            </p>
          </div>
        ),
      },
      { accessorKey: "stars", header: "Rating", cell: ({ getValue }) => <Stars value={getValue<number>()} /> },
      {
        accessorKey: "isPublished",
        header: "Published",
        cell: ({ row }) => (
          <Switch
            checked={row.original.isPublished}
            aria-label="Toggle published"
            onCheckedChange={(v) => update.mutate({ id: row.original.id, input: { ...toInput(row.original), isPublished: v } })}
          />
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
    [update],
  );

  return (
    <>
      <PageHeader
        title="Reviews"
        description="Customer quotes on the homepage. Only published ones are visible."
        actions={<Button onClick={() => setDialog({ open: true, editing: null })}><Plus /> Add review</Button>}
      />
      {publishedSamples > 0 && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <p>
            <strong>{publishedSamples} sample review{publishedSamples > 1 ? "s are" : " is"} published.</strong> Replace them with real customer quotes before launch (launch blocker R2.16).
          </p>
        </div>
      )}
      <DataTable columns={columns} data={reviews} loading={isLoading} searchPlaceholder="Search reviews…" empty={<EmptyState icon={MessageSquareQuote} title="No reviews yet" />} />
      <ReviewDialog open={dialog.open} onOpenChange={(o) => setDialog((d) => ({ ...d, open: o }))} editing={dialog.editing} />
      <ConfirmDialog
        open={!!pendingDelete}
        onOpenChange={(o) => !o && setPendingDelete(null)}
        title="Delete this review?"
        loading={remove.isPending}
        onConfirm={() => pendingDelete && remove.mutate(pendingDelete.id, { onSuccess: () => setPendingDelete(null) })}
      />
    </>
  );
}

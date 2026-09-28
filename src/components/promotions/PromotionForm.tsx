"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { FormRow } from "@/components/shared/FormRow";
import { MultiSelect } from "@/components/shared/MultiSelect";
import { useCollections, useProducts } from "@/hooks/use-catalog";
import { useCreatePromotion, useUpdatePromotion } from "@/hooks/use-promotions";
import { isoToLocalInput, localInputToIso } from "@/lib/format";
import type { AdminPromotion, PromotionInput } from "@/lib/types";

// Optional numbers/dates are kept as strings in the form and converted on
// submit; everything else mirrors backend promotions.schema.ts.
const schema = z
  .object({
    name: z.string().min(1, "Required").max(120),
    code: z.string().trim().toUpperCase().regex(/^$|^[A-Z0-9-]{3,20}$/, "3–20 chars: A-Z, 0-9, -"),
    type: z.enum(["PERCENT", "FLAT"]),
    value: z.number({ invalid_type_error: "Required" }).int().positive("Must be > 0"),
    scope: z.enum(["ALL", "PRODUCTS", "COLLECTIONS"]),
    productSlugs: z.array(z.string()),
    collectionSlugs: z.array(z.string()),
    minQty: z.string(),
    minOrderValue: z.string(),
    startsAt: z.string(),
    endsAt: z.string(),
    isActive: z.boolean(),
    sortOrder: z.number({ invalid_type_error: "Required" }).int(),
  })
  .superRefine((b, ctx) => {
    if (b.type === "PERCENT" && b.value > 90) ctx.addIssue({ code: "custom", path: ["value"], message: "Percent off must be 1–90" });
    if (b.scope === "PRODUCTS" && b.productSlugs.length === 0) ctx.addIssue({ code: "custom", path: ["productSlugs"], message: "Pick at least one product" });
    if (b.scope === "COLLECTIONS" && b.collectionSlugs.length === 0) ctx.addIssue({ code: "custom", path: ["collectionSlugs"], message: "Pick at least one collection" });
    if (b.startsAt && b.endsAt && new Date(b.endsAt) <= new Date(b.startsAt)) ctx.addIssue({ code: "custom", path: ["endsAt"], message: "End must be after start" });
    for (const k of ["minQty", "minOrderValue"] as const) {
      if (b[k] && !(Number(b[k]) > 0 && Number.isInteger(Number(b[k])))) ctx.addIssue({ code: "custom", path: [k], message: "Whole number > 0" });
    }
  });

type FormValues = z.infer<typeof schema>;

const defaults: FormValues = {
  name: "",
  code: "",
  type: "PERCENT",
  value: 10,
  scope: "ALL",
  productSlugs: [],
  collectionSlugs: [],
  minQty: "",
  minOrderValue: "",
  startsAt: "",
  endsAt: "",
  isActive: true,
  sortOrder: 0,
};

const toValues = (p: AdminPromotion): FormValues => ({
  name: p.name,
  code: p.code ?? "",
  type: p.type,
  value: p.value,
  scope: p.scope,
  productSlugs: p.productSlugs,
  collectionSlugs: p.collectionSlugs,
  minQty: p.minQty ? String(p.minQty) : "",
  minOrderValue: p.minOrderValue ? String(p.minOrderValue) : "",
  startsAt: isoToLocalInput(p.startsAt),
  endsAt: isoToLocalInput(p.endsAt),
  isActive: p.isActive,
  sortOrder: p.sortOrder,
});

const toInput = (v: FormValues): PromotionInput => ({
  name: v.name,
  code: v.code ? v.code : null,
  type: v.type,
  value: v.value,
  scope: v.scope,
  productSlugs: v.scope === "PRODUCTS" ? v.productSlugs : [],
  collectionSlugs: v.scope === "COLLECTIONS" ? v.collectionSlugs : [],
  minQty: v.minQty ? Number(v.minQty) : null,
  minOrderValue: v.minOrderValue ? Number(v.minOrderValue) : null,
  startsAt: localInputToIso(v.startsAt),
  endsAt: localInputToIso(v.endsAt),
  isActive: v.isActive,
  sortOrder: v.sortOrder,
});

export function PromotionForm({ promotion }: { promotion?: AdminPromotion }) {
  const router = useRouter();
  const { data: products = [] } = useProducts();
  const { data: collections = [] } = useCollections();
  const create = useCreatePromotion((id) => router.replace(`/promotions/${id}`));
  const update = useUpdatePromotion();

  const { register, control, handleSubmit, watch, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: promotion ? toValues(promotion) : defaults,
  });
  const { errors, isDirty } = formState;
  const type = watch("type");
  const scope = watch("scope");
  const code = watch("code");

  const productOptions = useMemo(
    () => products.map((p) => ({ value: p.slug, label: p.name, hint: p.isActive ? undefined : "hidden" })),
    [products],
  );
  const collectionOptions = useMemo(
    () =>
      collections.map((c) => ({
        value: c.slug,
        label: c.name,
        group: c.isVirtual ? "Automatic collections" : `${c.segment} › ${c.group}`,
        hint: `${c.productCount}`,
      })),
    [collections],
  );

  const busy = create.isPending || update.isPending;
  const onSubmit = (values: FormValues) => {
    const input = toInput(values);
    if (promotion) update.mutate({ id: promotion.id, input });
    else create.mutate(input);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href="/promotions">
            <ArrowLeft /> Promotions
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          {promotion && !isDirty && <span className="text-xs text-muted-foreground">All changes saved</span>}
          <Button type="submit" disabled={busy}>
            {busy ? "Saving…" : promotion ? "Save changes" : "Create promotion"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Offer</CardTitle>
              <CardDescription>Leave the code empty for an automatic promotion that applies to every eligible cart.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <FormRow label="Name" htmlFor="name" required error={errors.name?.message} className="sm:col-span-2" hint="Shown to buyers in the cart, e.g. “Monsoon bulk offer”">
                <Input id="name" {...register("name")} />
              </FormRow>
              <FormRow label="Coupon code" htmlFor="code" error={errors.code?.message} hint={code ? "Buyers must enter this code" : "Empty = automatic"}>
                <Input id="code" {...register("code")} placeholder="e.g. TEAM10" className="font-mono uppercase" />
              </FormRow>
              <div className="grid grid-cols-2 gap-3">
                <FormRow label="Type" error={errors.type?.message}>
                  <Controller
                    control={control}
                    name="type"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PERCENT">% off</SelectItem>
                          <SelectItem value="FLAT">₹ off per piece</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </FormRow>
                <FormRow label={type === "PERCENT" ? "Percent" : "Rupees"} htmlFor="value" required error={errors.value?.message}>
                  <Input id="value" type="number" {...register("value", { valueAsNumber: true })} />
                </FormRow>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Applies to</CardTitle>
              <CardDescription>The discount stacks on top of each product&apos;s bulk tier; only the single best promotion applies per order.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormRow label="Scope">
                <Controller
                  control={control}
                  name="scope"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full sm:w-72">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">Whole store</SelectItem>
                        <SelectItem value="PRODUCTS">Selected products</SelectItem>
                        <SelectItem value="COLLECTIONS">Selected collections</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormRow>
              {scope === "PRODUCTS" && (
                <FormRow label="Products" error={errors.productSlugs?.message}>
                  <Controller control={control} name="productSlugs" render={({ field }) => <MultiSelect options={productOptions} value={field.value} onChange={field.onChange} placeholder="Pick products" />} />
                </FormRow>
              )}
              {scope === "COLLECTIONS" && (
                <FormRow label="Collections" error={errors.collectionSlugs?.message} hint="Automatic collections (New Arrival, Best Sellers, Mega Sale) follow the product flags.">
                  <Controller control={control} name="collectionSlugs" render={({ field }) => <MultiSelect options={collectionOptions} value={field.value} onChange={field.onChange} placeholder="Pick collections" />} />
                </FormRow>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Conditions</CardTitle>
              <CardDescription>Both optional. Checked against the eligible lines of the cart.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <FormRow label="Minimum quantity" htmlFor="minQty" error={errors.minQty?.message} hint="pieces">
                <Input id="minQty" type="number" {...register("minQty")} placeholder="e.g. 50" />
              </FormRow>
              <FormRow label="Minimum order value" htmlFor="minOrderValue" error={errors.minOrderValue?.message} hint="rupees, after bulk tiers">
                <Input id="minOrderValue" type="number" {...register("minOrderValue")} placeholder="e.g. 10000" />
              </FormRow>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Controller
                control={control}
                name="isActive"
                render={({ field }) => (
                  <label className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium">Active</span>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </label>
                )}
              />
              <FormRow label="Starts" htmlFor="startsAt" error={errors.startsAt?.message} hint="Empty = immediately">
                <Input id="startsAt" type="datetime-local" {...register("startsAt")} />
              </FormRow>
              <FormRow label="Ends" htmlFor="endsAt" error={errors.endsAt?.message} hint="Empty = no end">
                <Input id="endsAt" type="datetime-local" {...register("endsAt")} />
              </FormRow>
              <FormRow label="Priority" htmlFor="sortOrder" error={errors.sortOrder?.message} hint="Lower first when listing">
                <Input id="sortOrder" type="number" {...register("sortOrder", { valueAsNumber: true })} />
              </FormRow>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}

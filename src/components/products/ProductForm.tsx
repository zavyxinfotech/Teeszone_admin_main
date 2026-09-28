"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { FormRow } from "@/components/shared/FormRow";
import { ImageField } from "@/components/shared/ImageField";
import { MultiSelect } from "@/components/shared/MultiSelect";
import { TagInput } from "@/components/shared/TagInput";
import { useCollections, useCreateProduct, useFabrics, useUpdateProduct } from "@/hooks/use-catalog";
import { formatINR, offPct, slugify } from "@/lib/format";
import { isVirtualCollection, type AdminProduct, type ProductInput } from "@/lib/types";

// Mirrors backend products.schema.ts upsertBody 1:1.
const schema = z.object({
  name: z.string().min(1, "Required"),
  slug: z.string().min(1, "Required").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "kebab-case only"),
  description: z.string().min(1, "Required"),
  fit: z.string().min(1, "Required"),
  fabric: z.string().min(1, "Required"),
  gsm: z.number({ invalid_type_error: "Required" }).int().positive("Must be > 0"),
  mrp: z.number({ invalid_type_error: "Required" }).int().positive("Must be > 0"),
  price: z.number({ invalid_type_error: "Required" }).int().positive("Must be > 0"),
  sizes: z.array(z.string().min(1)).min(1, "Add at least one size"),
  features: z.array(z.string()),
  colors: z
    .array(
      z.object({
        name: z.string().min(1, "Required"),
        hex: z.string().min(1, "Required"),
        image: z.string().min(1, "Required"),
      }),
    )
    .min(1, "Add at least one color"),
  qtyDiscounts: z.array(
    z.object({
      minQty: z.number({ invalid_type_error: "Required" }).int().positive(),
      offPct: z.number({ invalid_type_error: "Required" }).int().min(0).max(90),
    }),
  ),
  collections: z.array(z.string()),
  isNew: z.boolean(),
  bestSeller: z.boolean(),
  megaSale: z.boolean(),
  isActive: z.boolean(),
  sortOrder: z.number({ invalid_type_error: "Required" }).int(),
});

type FormValues = z.infer<typeof schema>;

const SIZE_PRESETS = ["XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL"];

const defaults: FormValues = {
  name: "",
  slug: "",
  description: "",
  fit: "",
  fabric: "",
  gsm: 180,
  mrp: 0,
  price: 0,
  sizes: ["S", "M", "L", "XL", "XXL"],
  features: [],
  colors: [{ name: "", hex: "#222222", image: "" }],
  qtyDiscounts: [
    { minQty: 25, offPct: 5 },
    { minQty: 50, offPct: 10 },
    { minQty: 100, offPct: 15 },
  ],
  collections: [],
  isNew: false,
  bestSeller: false,
  megaSale: false,
  isActive: true,
  sortOrder: 0,
};

export const productToValues = (p: AdminProduct, duplicate = false): FormValues => ({
  name: duplicate ? `${p.name} (copy)` : p.name,
  slug: duplicate ? `${p.slug}-copy` : p.slug,
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

export function ProductForm({ product, initial }: { product?: AdminProduct; initial?: FormValues }) {
  const router = useRouter();
  const { data: collections = [] } = useCollections();
  const { data: fabrics = [] } = useFabrics();
  const create = useCreateProduct((id) => router.replace(`/products/${id}`));
  const update = useUpdateProduct();
  const [slugTouched, setSlugTouched] = useState(!!product);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: initial ?? (product ? productToValues(product) : defaults),
  });
  const { register, control, handleSubmit, watch, setValue, formState } = form;
  const { errors, isDirty } = formState;
  const colors = useFieldArray({ control, name: "colors" });
  const tiers = useFieldArray({ control, name: "qtyDiscounts" });

  const name = watch("name");
  const mrp = watch("mrp");
  const price = watch("price");
  useEffect(() => {
    if (!slugTouched) setValue("slug", slugify(name), { shouldValidate: false });
  }, [name, slugTouched, setValue]);

  const collectionOptions = useMemo(
    () =>
      collections
        .filter((c) => !c.isVirtual)
        .map((c) => ({ value: c.slug, label: c.name, group: `${c.segment} › ${c.group}` })),
    [collections],
  );

  const busy = create.isPending || update.isPending;
  const onSubmit = (values: FormValues) => {
    const input: ProductInput = { ...values, qtyDiscounts: [...values.qtyDiscounts].sort((a, b) => a.minQty - b.minQty) };
    if (product) update.mutate({ id: product.id, input });
    else create.mutate(input);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href="/products">
            <ArrowLeft /> Products
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          {product && !isDirty && <span className="text-xs text-muted-foreground">All changes saved</span>}
          <Button type="submit" disabled={busy}>
            {busy ? "Saving…" : product ? "Save changes" : "Create product"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basics</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <FormRow label="Name" htmlFor="name" required error={errors.name?.message} className="sm:col-span-2">
                <Input id="name" {...register("name")} placeholder="Classic 180 GSM Unisex Round Neck" />
              </FormRow>
              <FormRow label="Slug" htmlFor="slug" required error={errors.slug?.message} hint="URL: /products/<slug>">
                <Input
                  id="slug"
                  {...register("slug", { onChange: () => setSlugTouched(true) })}
                />
              </FormRow>
              <FormRow label="Fabric" htmlFor="fabric" required error={errors.fabric?.message} hint="Pick a fabric from the library or type your own">
                <>
                  <Input id="fabric" list="fabric-options" {...register("fabric")} />
                  <datalist id="fabric-options">
                    {fabrics.map((f) => (
                      <option key={f.key} value={f.name} />
                    ))}
                  </datalist>
                </>
              </FormRow>
              <FormRow label="GSM" htmlFor="gsm" required error={errors.gsm?.message}>
                <Input id="gsm" type="number" {...register("gsm", { valueAsNumber: true })} />
              </FormRow>
              <FormRow label="Fit" htmlFor="fit" required error={errors.fit?.message} hint="One line shown in the FIT block">
                <Input id="fit" {...register("fit")} placeholder="Regular fit, true to size" />
              </FormRow>
              <FormRow label="Description" htmlFor="description" required error={errors.description?.message} className="sm:col-span-2">
                <Textarea id="description" rows={4} {...register("description")} />
              </FormRow>
              <FormRow label="Features" error={errors.features?.message} className="sm:col-span-2">
                <Controller
                  control={control}
                  name="features"
                  render={({ field }) => <TagInput value={field.value} onChange={field.onChange} placeholder="e.g. Bio-washed, pre-shrunk" />}
                />
              </FormRow>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
              <CardDescription>Rupees per piece. Bulk tiers give an extra % off the selling price on the storefront.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-3">
                <FormRow label="MRP" htmlFor="mrp" required error={errors.mrp?.message}>
                  <Input id="mrp" type="number" {...register("mrp", { valueAsNumber: true })} />
                </FormRow>
                <FormRow label="Selling price" htmlFor="price" required error={errors.price?.message}>
                  <Input id="price" type="number" {...register("price", { valueAsNumber: true })} />
                </FormRow>
                <FormRow label="Discount">
                  <div className="flex h-8 items-center text-sm">
                    <span className="font-semibold text-primary">{mrp > 0 && price > 0 ? `${offPct(mrp, price)}% off` : "—"}</span>
                    {price > mrp && mrp > 0 && <span className="ml-2 text-xs text-destructive">price is above MRP</span>}
                  </div>
                </FormRow>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Quantity discount ladder</p>
                  <Button type="button" variant="outline" size="sm" onClick={() => tiers.append({ minQty: 250, offPct: 20 })}>
                    <Plus /> Tier
                  </Button>
                </div>
                {tiers.fields.length === 0 && <p className="text-xs text-muted-foreground">No bulk tiers — every quantity pays the selling price.</p>}
                <div className="space-y-2">
                  {tiers.fields.map((f, i) => (
                    <div key={f.id} className="flex flex-wrap items-center gap-2">
                      <span className="w-12 text-xs text-muted-foreground">Tier {i + 1}</span>
                      <Input type="number" className="w-28" placeholder="Min qty" {...register(`qtyDiscounts.${i}.minQty`, { valueAsNumber: true })} />
                      <span className="text-xs text-muted-foreground">pcs →</span>
                      <Input type="number" className="w-24" placeholder="% off" {...register(`qtyDiscounts.${i}.offPct`, { valueAsNumber: true })} />
                      <span className="text-xs text-muted-foreground">% off</span>
                      <span className="text-xs text-muted-foreground">
                        {price > 0 && Number.isFinite(watch(`qtyDiscounts.${i}.offPct`))
                          ? `= ${formatINR(price * (1 - (watch(`qtyDiscounts.${i}.offPct`) || 0) / 100))}/pc`
                          : ""}
                      </span>
                      <Button type="button" variant="ghost" size="icon-sm" aria-label="Remove tier" onClick={() => tiers.remove(i)}>
                        <Trash2 />
                      </Button>
                      {(errors.qtyDiscounts?.[i]?.minQty || errors.qtyDiscounts?.[i]?.offPct) && (
                        <p className="w-full text-xs text-destructive">Min qty must be positive; % off between 0 and 90.</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Colors & images</CardTitle>
              <CardDescription>The first color&apos;s image is the product&apos;s cover. Image paths are storefront paths or S3 URLs.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {typeof errors.colors?.message === "string" && <p className="text-xs text-destructive">{errors.colors.message}</p>}
              {colors.fields.map((f, i) => (
                <div key={f.id} className="rounded-lg border border-border p-3">
                  <div className="grid gap-3 sm:grid-cols-[1fr_140px_auto]">
                    <FormRow label="Color name" error={errors.colors?.[i]?.name?.message}>
                      <Input placeholder="Black" {...register(`colors.${i}.name`)} />
                    </FormRow>
                    <FormRow label="Hex" error={errors.colors?.[i]?.hex?.message}>
                      <Controller
                        control={control}
                        name={`colors.${i}.hex`}
                        render={({ field }) => (
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={/^#[0-9a-fA-F]{6}$/.test(field.value) ? field.value : "#000000"}
                              onChange={(e) => field.onChange(e.target.value)}
                              className="size-8 cursor-pointer rounded border border-border bg-transparent p-0"
                              aria-label="Pick color"
                            />
                            <Input value={field.value} onChange={field.onChange} className="font-mono" />
                          </div>
                        )}
                      />
                    </FormRow>
                    <div className="flex items-end">
                      <Button type="button" variant="ghost" size="icon" aria-label="Remove color" disabled={colors.fields.length === 1} onClick={() => colors.remove(i)}>
                        <Trash2 />
                      </Button>
                    </div>
                  </div>
                  <FormRow label="Image" error={errors.colors?.[i]?.image?.message} className="mt-3">
                    <Controller
                      control={control}
                      name={`colors.${i}.image`}
                      render={({ field }) => <ImageField value={field.value} onChange={field.onChange} />}
                    />
                  </FormRow>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={() => colors.append({ name: "", hex: "#222222", image: "" })}>
                <Plus /> Add color
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sizes</CardTitle>
              <CardDescription>Shown in this order on the size split.</CardDescription>
            </CardHeader>
            <CardContent>
              <FormRow label="Sizes" error={errors.sizes?.message}>
                <Controller
                  control={control}
                  name="sizes"
                  render={({ field }) => <TagInput value={field.value} onChange={field.onChange} presets={SIZE_PRESETS} placeholder="Add a size" />}
                />
              </FormRow>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Visibility</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Controller
                control={control}
                name="isActive"
                render={({ field }) => (
                  <label className="flex items-center justify-between gap-3 text-sm">
                    <span>
                      <span className="font-medium">Active</span>
                      <span className="block text-xs text-muted-foreground">Hidden products stay editable but don&apos;t appear on the store.</span>
                    </span>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </label>
                )}
              />
              <FormRow label="Position" htmlFor="sortOrder" error={errors.sortOrder?.message} hint="Lower numbers appear first">
                <Input id="sortOrder" type="number" {...register("sortOrder", { valueAsNumber: true })} />
              </FormRow>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Highlights</CardTitle>
              <CardDescription>These flags place the product in the automatic collections.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {(
                [
                  ["isNew", "New Arrival"],
                  ["bestSeller", "Best Seller"],
                  ["megaSale", "Mega Sale"],
                ] as const
              ).map(([key, label]) => (
                <Controller
                  key={key}
                  control={control}
                  name={key}
                  render={({ field }) => (
                    <label className="flex items-center justify-between text-sm">
                      <span className="font-medium">{label}</span>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </label>
                  )}
                />
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Collections</CardTitle>
              <CardDescription>Where the product is listed in the menu. First one is the primary (breadcrumb).</CardDescription>
            </CardHeader>
            <CardContent>
              <Controller
                control={control}
                name="collections"
                render={({ field }) => (
                  <MultiSelect options={collectionOptions} value={field.value} onChange={field.onChange} placeholder="Pick collections" />
                )}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}

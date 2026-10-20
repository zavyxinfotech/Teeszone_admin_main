"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ImageIcon, Plus, Star, Trash2 } from "lucide-react";
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

type ColorSlotKey = "backImage" | "chestImage" | "detailImage" | "image4" | "image5";

const IMAGE_SLOTS = [
  { key: "image", label: "1. Main Front Image", shortLabel: "1. Front", desc: "Default product cover image", required: true },
  { key: "backImage", label: "2. Ref Image 1: Back View", shortLabel: "2. Back", desc: "Back angle perspective" },
  { key: "chestImage", label: "3. Ref Image 2: Chest View", shortLabel: "3. Chest", desc: "Close-up chest / logo print view" },
  { key: "detailImage", label: "4. Ref Image 3: Detail View", shortLabel: "4. Detail", desc: "Stitching / collar / hem details" },
  { key: "image4", label: "5. Ref Image 4: Fit / Model View", shortLabel: "5. Model", desc: "Model lifestyle / body fit view" },
  { key: "image5", label: "6. Ref Image 5: Zoom / Fabric View", shortLabel: "6. Fabric", desc: "High-res fabric texture / zoom" },
] as const;

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
        backImage: z.string().optional(),
        chestImage: z.string().optional(),
        detailImage: z.string().optional(),
        image4: z.string().optional(),
        image5: z.string().optional(),
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
  ordersDelivered: z.number({ invalid_type_error: "Must be a number" }).int().nonnegative().optional(),
  sizeChartImage: z.string().optional(),
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
  ordersDelivered: 850,
  sizeChartImage: "",
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
  ordersDelivered: p.ordersDelivered != null ? p.ordersDelivered : 850,
  sizeChartImage: p.sizeChartImage || "",
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

  const makeSlotMain = (colorIndex: number, targetKey: ColorSlotKey) => {
    const currentMain = watch(`colors.${colorIndex}.image`);
    const newMain = watch(`colors.${colorIndex}.${targetKey}`);
    if (!newMain) return;

    // Swap target with Slot 1 ('image')
    setValue(`colors.${colorIndex}.image`, newMain, { shouldDirty: true, shouldValidate: true });
    setValue(`colors.${colorIndex}.${targetKey}`, currentMain || "", { shouldDirty: true, shouldValidate: true });
  };

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
              <CardTitle>Colors &amp; images</CardTitle>
              <CardDescription>
                Align and organize product images below. The first color and Slot #1 are the default cover shown across the storefront and product cards.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {typeof errors.colors?.message === "string" && <p className="text-xs text-destructive">{errors.colors.message}</p>}
              {colors.fields.map((f, i) => {
                const isPrimaryColor = i === 0;

                return (
                  <div key={f.id} className="rounded-lg border border-border p-4 bg-card space-y-4">
                    {/* Color variant header with Primary toggle */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-border">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-foreground">Color Variant #{i + 1}</span>
                        {isPrimaryColor ? (
                          <span className="inline-flex items-center gap-1 rounded bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                            <Star className="size-3 fill-amber-500 text-amber-500" /> Primary Cover Color (Catalog Default)
                          </span>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            size="xs"
                            className="gap-1 text-xs text-primary hover:bg-primary hover:text-white"
                            onClick={() => colors.move(i, 0)}
                            title="Set this as the default display color on catalog cards"
                          >
                            <Star className="size-3" /> Set as Primary Color
                          </Button>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        aria-label="Remove color"
                        disabled={colors.fields.length === 1}
                        onClick={() => colors.remove(i)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-[1fr_160px]">
                      <FormRow label="Color name" error={errors.colors?.[i]?.name?.message}>
                        <Input placeholder="Black" {...register(`colors.${i}.name`)} />
                      </FormRow>
                      <FormRow label="Hex code" error={errors.colors?.[i]?.hex?.message}>
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
                              <Input value={field.value} onChange={field.onChange} className="font-mono text-xs" />
                            </div>
                          )}
                        />
                      </FormRow>
                    </div>

                    {/* Visual Image Alignment Bar */}
                    <div className="rounded-lg border border-border bg-muted/40 p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <p className="text-xs font-semibold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                          <Star className="size-3.5 fill-amber-500 text-amber-500" />
                          Image Alignment &amp; Main Cover Selector
                        </p>
                        <span className="text-[11px] text-muted-foreground">
                          Slot #1 is the active cover image shown on catalog &amp; cards
                        </span>
                      </div>

                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                        {IMAGE_SLOTS.map((slot, sIdx) => {
                          const val = watch(`colors.${i}.${slot.key}` as any) || "";
                          const isMain = slot.key === "image";
                          return (
                            <div
                              key={slot.key}
                              className={`relative flex flex-col items-center rounded-md border p-1.5 text-center transition-all ${
                                isMain
                                  ? "border-amber-500 bg-amber-500/10 ring-1 ring-amber-500"
                                  : val
                                  ? "border-border bg-background hover:border-primary/50"
                                  : "border-dashed border-border/60 bg-muted/20 opacity-60"
                              }`}
                            >
                              <div className="mb-1 w-full flex items-center justify-between px-0.5">
                                <span className="text-[10px] font-bold text-muted-foreground">#{sIdx + 1}</span>
                                {isMain ? (
                                  <span className="inline-flex items-center gap-0.5 rounded bg-amber-500 px-1 py-0.2 text-[9px] font-bold uppercase text-white shadow-xs">
                                    ★ MAIN
                                  </span>
                                ) : val ? (
                                  <button
                                    type="button"
                                    onClick={() => makeSlotMain(i, slot.key as ColorSlotKey)}
                                    className="text-[10px] font-semibold text-primary hover:underline"
                                    title="Make this the Main Image"
                                  >
                                    Set Main
                                  </button>
                                ) : (
                                  <span className="text-[9px] text-muted-foreground">Empty</span>
                                )}
                              </div>

                              <div className="relative size-12 overflow-hidden rounded bg-muted flex items-center justify-center border border-border/50">
                                {val ? (
                                  <img
                                    src={val}
                                    alt=""
                                    className="size-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLElement).style.display = "none";
                                    }}
                                  />
                                ) : (
                                  <ImageIcon className="size-4 text-muted-foreground/40" />
                                )}
                              </div>

                              <span className="mt-1 text-[10px] font-medium text-muted-foreground truncate max-w-full">
                                {slot.shortLabel}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Detailed 6 Image Upload / URL Fields */}
                    <div className="grid gap-3 sm:grid-cols-2">
                      {/* Slot 1: Main */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold text-foreground">
                            1. Main Front Image (Required)
                          </label>
                          <span className="inline-flex items-center gap-1 rounded bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 text-[10px] font-bold uppercase text-amber-700 dark:text-amber-400">
                            <Star className="size-2.5 fill-current" /> Storefront Cover
                          </span>
                        </div>
                        <Controller
                          control={control}
                          name={`colors.${i}.image`}
                          render={({ field }) => <ImageField value={field.value} onChange={field.onChange} />}
                        />
                        {errors.colors?.[i]?.image?.message && (
                          <p className="text-xs text-destructive">{errors.colors[i].image.message}</p>
                        )}
                      </div>

                      {/* Slots 2 to 6: Reference Views with "Set as Main" Button */}
                      {(
                        [
                          { key: "backImage", label: "2. Ref Image 1: Back View (Optional)" },
                          { key: "chestImage", label: "3. Ref Image 2: Chest View (Optional)" },
                          { key: "detailImage", label: "4. Ref Image 3: Detail View (Optional)" },
                          { key: "image4", label: "5. Ref Image 4: Fit / Model View (Optional)" },
                          { key: "image5", label: "6. Ref Image 5: Zoom / Fabric View (Optional)" },
                        ] as const
                      ).map((slot) => {
                        const hasVal = Boolean(watch(`colors.${i}.${slot.key}`));
                        return (
                          <div key={slot.key} className="space-y-1">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-medium text-muted-foreground truncate">
                                {slot.label}
                              </label>
                              {hasVal && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="xs"
                                  className="h-5 gap-1 px-1.5 text-[10px] font-semibold text-primary border-primary/30 hover:bg-primary hover:text-white transition-colors"
                                  onClick={() => makeSlotMain(i, slot.key)}
                                  title="Promote this image to Slot 1 (Main Cover)"
                                >
                                  <Star className="size-2.5 fill-current" /> Set as Main
                                </Button>
                              )}
                            </div>
                            <Controller
                              control={control}
                              name={`colors.${i}.${slot.key}`}
                              render={({ field }) => (
                                <ImageField value={field.value || ""} onChange={field.onChange} />
                              )}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              <Button type="button" variant="outline" onClick={() => colors.append({ name: "", hex: "#222222", image: "", backImage: "", chestImage: "", detailImage: "", image4: "", image5: "" })}>
                <Plus /> Add color
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sizes &amp; Size Chart</CardTitle>
              <CardDescription>Configure sizes and upload or select custom size chart image for this product.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormRow label="Sizes" error={errors.sizes?.message}>
                <Controller
                  control={control}
                  name="sizes"
                  render={({ field }) => <TagInput value={field.value} onChange={field.onChange} presets={SIZE_PRESETS} placeholder="Add a size" />}
                />
              </FormRow>

              <div className="border-t pt-4">
                <FormRow
                  label="Size Chart Image"
                  hint="WebP/PNG/JPG image stored in AWS S3 bucket. Displays in modal when customers click 'Size Chart' on the storefront product page."
                  error={errors.sizeChartImage?.message}
                >
                  <Controller
                    control={control}
                    name="sizeChartImage"
                    render={({ field }) => (
                      <ImageField
                        value={field.value || ""}
                        onChange={(url) => field.onChange(url)}
                        placeholder="https://teeszone-catalogue-images-2026.s3.ap-southeast-2.amazonaws.com/..."
                      />
                    )}
                  />
                </FormRow>
              </div>
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
              <CardTitle>Orders &amp; Social Proof</CardTitle>
              <CardDescription>
                Orders delivered metric shown on the storefront product details page.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormRow
                label="Orders Delivered Count"
                htmlFor="ordersDelivered"
                error={errors.ordersDelivered?.message}
                hint="Displayed as '{count}+ orders delivered' on product details"
              >
                <Input
                  id="ordersDelivered"
                  type="number"
                  min="0"
                  placeholder="e.g. 850"
                  {...register("ordersDelivered", { valueAsNumber: true })}
                />
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

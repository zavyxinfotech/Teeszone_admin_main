"use client";

import { CheckCircle2, AlertCircle, RefreshCw, Save, Search, Shirt, Trash2, Upload, ImageIcon, Eye } from "lucide-react";
import { useEffect, useMemo, useState, useRef } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ImageField } from "@/components/shared/ImageField";
import { PageHeader } from "@/components/layout/PageHeader";
import { useCustomization3DModels, useUpsertCustomization3DModel, useDeleteCustomization3DModel } from "@/hooks/use-catalog";
import { customization3DApi } from "@/lib/api";
import type { CustomizationColorModel } from "@/lib/types";
import defaultColors from "@/data/customizationColors.json";

export function Customization3DManagementView() {
  const { data: serverModels, isLoading, refetch } = useCustomization3DModels();
  const upsertMutation = useUpsertCustomization3DModel();
  const deleteMutation = useDeleteCustomization3DModel();

  const [models, setModels] = useState<CustomizationColorModel[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [savingSlug, setSavingSlug] = useState<string | null>(null);
  const [uploadingState, setUploadingState] = useState<{ slug: string; view: "front" | "back" } | null>(null);

  // File input refs for quick direct uploads
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeUploadTarget, setActiveUploadTarget] = useState<{ slug: string; view: "front" | "back" } | null>(null);

  useEffect(() => {
    const baseList: CustomizationColorModel[] = defaultColors.map((c, i) => ({
      id: `ccm-${c.slug}`,
      colorName: c.name,
      colorSlug: c.slug,
      colorHex: c.hex,
      modelImageUrl: c.s3FrontUrl || c.frontModelUrl,
      modelBackImageUrl: c.s3BackUrl || c.backModelUrl,
      s3FrontKey: c.s3FrontKey,
      s3BackKey: c.s3BackKey,
      isActive: c.isActive !== false,
      sortOrder: i,
    }));

    if (serverModels && serverModels.length > 0) {
      const merged = baseList.map((base) => {
        const found = serverModels.find(
          (m) => m.colorSlug === base.colorSlug || m.colorName.toLowerCase() === base.colorName.toLowerCase()
        );
        return found ? { ...base, ...found } : base;
      });
      // Also add any extra models from server not in base
      serverModels.forEach((m) => {
        if (!merged.some((x) => x.colorSlug === m.colorSlug)) {
          merged.push(m);
        }
      });
      setModels(merged);
    } else {
      setModels(baseList);
    }
  }, [serverModels]);

  const filteredModels = useMemo(() => {
    if (!searchQuery.trim()) return models;
    const q = searchQuery.toLowerCase();
    return models.filter((m) => m.colorName.toLowerCase().includes(q) || m.colorHex.toLowerCase().includes(q));
  }, [models, searchQuery]);

  const stats = useMemo(() => {
    const total = models.length;
    const complete = models.filter((m) => m.modelImageUrl && m.modelBackImageUrl).length;
    const active = models.filter((m) => m.isActive).length;
    return { total, complete, active };
  }, [models]);

  const updateModelField = (slug: string, field: keyof CustomizationColorModel, value: any) => {
    setModels((prev) =>
      prev.map((m) => (m.colorSlug === slug ? { ...m, [field]: value } : m))
    );
  };

  const handleSave = async (model: CustomizationColorModel) => {
    setSavingSlug(model.colorSlug);
    try {
      await upsertMutation.mutateAsync(model);
      toast.success(`${model.colorName} saved successfully`);
      refetch();
    } catch {
      toast.error(`Failed to save ${model.colorName}`);
    } finally {
      setSavingSlug(null);
    }
  };

  const handleDeleteImages = async (model: CustomizationColorModel) => {
    if (!confirm(`Are you sure you want to clear 3D images for ${model.colorName}?`)) return;
    setSavingSlug(model.colorSlug);
    try {
      await upsertMutation.mutateAsync({
        ...model,
        modelImageUrl: "",
        modelBackImageUrl: "",
      });
      updateModelField(model.colorSlug, "modelImageUrl", "");
      updateModelField(model.colorSlug, "modelBackImageUrl", "");
      toast.success(`Cleared images for ${model.colorName}`);
      refetch();
    } catch {
      toast.error("Failed to clear images");
    } finally {
      setSavingSlug(null);
    }
  };

  const triggerUpload = (slug: string, view: "front" | "back") => {
    setActiveUploadTarget({ slug, view });
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeUploadTarget) return;

    const { slug, view } = activeUploadTarget;
    setUploadingState({ slug, view });
    try {
      const { data } = await customization3DApi.adminUpload(file, slug, view);
      if (view === "front") {
        updateModelField(slug, "modelImageUrl", data.url);
        updateModelField(slug, "s3FrontKey", data.s3Key);
      } else {
        updateModelField(slug, "modelBackImageUrl", data.url);
        updateModelField(slug, "s3BackKey", data.s3Key);
      }
      toast.success(`${view === "front" ? "Front" : "Back"} view uploaded for ${slug}`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to upload image to S3");
    } finally {
      setUploadingState(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6">
      {/* Hidden file input for uploads */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/webp,image/jpeg"
        className="hidden"
        onChange={handleFileChange}
      />

      <PageHeader
        title="T-Shirt 3D Customization Models"
        description="Manage photorealistic 3D Front & Back view images for every available T-shirt colour variation from the spreadsheet."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
            className="gap-1.5 border-rose-200 text-[#80011F] hover:bg-rose-50"
          >
            <RefreshCw className={`size-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        }
      />

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-rose-100/60 bg-gradient-to-br from-white to-rose-50/20">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs uppercase font-semibold tracking-wider">
              Total Colours (Spreadsheet)
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-foreground">{stats.total}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-xs text-muted-foreground">
            All colors mapped from reference sheet
          </CardContent>
        </Card>

        <Card className="border-rose-100/60 bg-gradient-to-br from-white to-emerald-50/20">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs uppercase font-semibold tracking-wider text-emerald-800">
              Both Views Ready (Front &amp; Back)
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-emerald-700">{stats.complete} / {stats.total}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-xs text-muted-foreground">
            {stats.complete === stats.total ? "All 3D assets complete" : `${stats.total - stats.complete} pending`}
          </CardContent>
        </Card>

        <Card className="border-rose-100/60 bg-gradient-to-br from-white to-blue-50/20">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs uppercase font-semibold tracking-wider text-blue-800">
              Active in Customizer
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-blue-700">{stats.active}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-xs text-muted-foreground">
            Available to customers on storefront
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search color name or HEX code..."
            className="pl-9 h-9 text-sm"
          />
        </div>
        <div className="text-xs text-muted-foreground font-medium">
          Showing {filteredModels.length} of {models.length} colours
        </div>
      </div>

      {/* Color-wise Management Cards Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {filteredModels.map((model) => {
          const hasFront = Boolean(model.modelImageUrl);
          const hasBack = Boolean(model.modelBackImageUrl);
          const isComplete = hasFront && hasBack;
          const isSaving = savingSlug === model.colorSlug;

          return (
            <Card
              key={model.colorSlug}
              className={`transition-all border ${
                model.isActive
                  ? "border-border hover:border-rose-300 hover:shadow-xs"
                  : "border-border/50 bg-muted/20 opacity-75"
              }`}
            >
              <CardHeader className="p-4 pb-3 border-b bg-muted/10">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span
                      className="size-7 rounded-full border border-black/20 shadow-xs shrink-0"
                      style={{ backgroundColor: model.colorHex }}
                      title={`HEX: ${model.colorHex}`}
                    />
                    <div>
                      <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                        {model.colorName}
                        <code className="text-xs font-mono font-normal text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                          {model.colorHex}
                        </code>
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Status Badge */}
                    {isComplete ? (
                      <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-800 text-[10px] gap-1">
                        <CheckCircle2 className="size-3 text-emerald-600" /> Complete
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-800 text-[10px] gap-1">
                        <AlertCircle className="size-3 text-amber-600" />
                        {!hasFront && !hasBack ? "Missing Both" : !hasFront ? "Missing Front" : "Missing Back"}
                      </Badge>
                    )}

                    {/* Active Toggle */}
                    <label className="flex items-center gap-1.5 text-xs font-medium cursor-pointer">
                      <span className="text-[11px] text-muted-foreground">Active</span>
                      <Switch
                        checked={model.isActive}
                        onCheckedChange={(checked) => updateModelField(model.colorSlug, "isActive", checked)}
                      />
                    </label>

                    {/* Save Button */}
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={isSaving}
                      onClick={() => handleSave(model)}
                      className="h-7 px-2.5 text-xs font-semibold border-rose-200 text-[#80011F] hover:bg-rose-50"
                    >
                      {isSaving ? <RefreshCw className="size-3 animate-spin mr-1" /> : <Save className="size-3 mr-1" />}
                      Save
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* FRONT VIEW */}
                  <div className="space-y-2 rounded-lg border border-border/70 p-3 bg-card">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground">Front View 3D</span>
                      <span className="text-[10px] text-muted-foreground font-mono">front.png</span>
                    </div>

                    {/* Image Preview Box */}
                    <div className="relative aspect-square w-full rounded-md border border-border bg-white flex items-center justify-center overflow-hidden p-2 group">
                      {model.modelImageUrl ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={model.modelImageUrl}
                            alt={`${model.colorName} Front View`}
                            className="max-h-full max-w-full object-contain transition-transform group-hover:scale-105"
                          />
                          <a
                            href={model.modelImageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity text-xs gap-1 font-semibold"
                          >
                            <Eye size={14} /> Full View
                          </a>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-muted-foreground text-xs p-4 text-center">
                          <ImageIcon size={24} className="opacity-40 mb-1" />
                          <span>No Front View uploaded</span>
                        </div>
                      )}
                    </div>

                    {/* Actions: Upload / Replace */}
                    <div className="flex items-center gap-1.5 pt-1">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => triggerUpload(model.colorSlug, "front")}
                        disabled={uploadingState?.slug === model.colorSlug && uploadingState?.view === "front"}
                        className="w-full text-[11px] h-7"
                      >
                        {uploadingState?.slug === model.colorSlug && uploadingState?.view === "front" ? (
                          <RefreshCw className="size-3 animate-spin mr-1" />
                        ) : (
                          <Upload className="size-3 mr-1" />
                        )}
                        {model.modelImageUrl ? "Replace" : "Upload"}
                      </Button>
                    </div>

                    {/* URL Input */}
                    <Input
                      value={model.modelImageUrl}
                      onChange={(e) => updateModelField(model.colorSlug, "modelImageUrl", e.target.value)}
                      placeholder="Image URL or S3 path"
                      className="text-[10px] h-7 font-mono"
                    />
                  </div>

                  {/* BACK VIEW */}
                  <div className="space-y-2 rounded-lg border border-border/70 p-3 bg-card">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground">Back View 3D</span>
                      <span className="text-[10px] text-muted-foreground font-mono">back.png</span>
                    </div>

                    {/* Image Preview Box */}
                    <div className="relative aspect-square w-full rounded-md border border-border bg-white flex items-center justify-center overflow-hidden p-2 group">
                      {model.modelBackImageUrl ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={model.modelBackImageUrl}
                            alt={`${model.colorName} Back View`}
                            className="max-h-full max-w-full object-contain transition-transform group-hover:scale-105"
                          />
                          <a
                            href={model.modelBackImageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity text-xs gap-1 font-semibold"
                          >
                            <Eye size={14} /> Full View
                          </a>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-muted-foreground text-xs p-4 text-center">
                          <ImageIcon size={24} className="opacity-40 mb-1" />
                          <span>No Back View uploaded</span>
                        </div>
                      )}
                    </div>

                    {/* Actions: Upload / Replace */}
                    <div className="flex items-center gap-1.5 pt-1">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => triggerUpload(model.colorSlug, "back")}
                        disabled={uploadingState?.slug === model.colorSlug && uploadingState?.view === "back"}
                        className="w-full text-[11px] h-7"
                      >
                        {uploadingState?.slug === model.colorSlug && uploadingState?.view === "back" ? (
                          <RefreshCw className="size-3 animate-spin mr-1" />
                        ) : (
                          <Upload className="size-3 mr-1" />
                        )}
                        {model.modelBackImageUrl ? "Replace" : "Upload"}
                      </Button>
                    </div>

                    {/* URL Input */}
                    <Input
                      value={model.modelBackImageUrl || ""}
                      onChange={(e) => updateModelField(model.colorSlug, "modelBackImageUrl", e.target.value)}
                      placeholder="Image URL or S3 path"
                      className="text-[10px] h-7 font-mono"
                    />
                  </div>
                </div>

                {/* Footer Controls: S3 Key Info + Delete/Clear */}
                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t">
                  <span className="font-mono truncate max-w-[280px]">
                    S3: teeszone/customization/tshirts/{model.colorSlug}/
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteImages(model)}
                    className="text-destructive hover:underline text-[11px] flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="size-3" /> Clear Images
                  </button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

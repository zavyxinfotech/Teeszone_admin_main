"use client";

import { Box, Check, RefreshCw, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ImageField } from "@/components/shared/ImageField";
import { useProductColorModels, useSaveProductColorModel } from "@/hooks/use-catalog";
import type { ProductColorModel } from "@/lib/types";

const S3_BASE = "https://teeszone-catalogue-images-2026.s3.ap-southeast-2.amazonaws.com/products/aerosoft-polo-200/3d-models";

const DEFAULT_MODELS: ProductColorModel[] = [
  {
    colorName: "Black",
    colorHex: "#26282D",
    frontModelUrl: `${S3_BASE}/black/front.png`,
    backModelUrl: `${S3_BASE}/black/back.png`,
    isActive: true,
  },
  {
    colorName: "White",
    colorHex: "#FFFFFF",
    frontModelUrl: `${S3_BASE}/white/front.png`,
    backModelUrl: `${S3_BASE}/white/back.png`,
    isActive: true,
  },
  {
    colorName: "True Navy",
    colorHex: "#3F5277",
    frontModelUrl: `${S3_BASE}/true-navy/front.png`,
    backModelUrl: `${S3_BASE}/true-navy/back.png`,
    isActive: true,
  },
  {
    colorName: "Light Grey Melange",
    colorHex: "#CCCAC9",
    frontModelUrl: `${S3_BASE}/light-grey-melange/front.png`,
    backModelUrl: `${S3_BASE}/light-grey-melange/back.png`,
    isActive: true,
  },
];

interface Product3DModelsCardProps {
  slug: string;
}

export function Product3DModelsCard({ slug }: Product3DModelsCardProps) {
  const { data: serverModels, isLoading, refetch } = useProductColorModels(slug);
  const saveModelMutation = useSaveProductColorModel(slug);

  const [models, setModels] = useState<ProductColorModel[]>(DEFAULT_MODELS);
  const [savingColor, setSavingColor] = useState<string | null>(null);

  useEffect(() => {
    if (serverModels && serverModels.length > 0) {
      // Merge server models with default colors
      const merged = DEFAULT_MODELS.map((def) => {
        const found = serverModels.find(
          (m) => m.colorName.toLowerCase() === def.colorName.toLowerCase()
        );
        return found || def;
      });
      setModels(merged);
    }
  }, [serverModels]);

  const updateModelField = (index: number, field: keyof ProductColorModel, value: any) => {
    setModels((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleSave = async (model: ProductColorModel) => {
    setSavingColor(model.colorName);
    try {
      await saveModelMutation.mutateAsync({
        colorName: model.colorName,
        colorHex: model.colorHex,
        frontModelUrl: model.frontModelUrl,
        backModelUrl: model.backModelUrl,
        isActive: model.isActive ?? true,
      });
      toast.success(`3D Model for ${model.colorName} updated successfully`);
      refetch();
    } catch {
      toast.error(`Failed to save 3D model for ${model.colorName}`);
    } finally {
      setSavingColor(null);
    }
  };

  return (
    <Card className="border-rose-100">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Box className="h-5 w-5 text-[#80011F]" />
              3D Customization Models (Color-Specific)
            </CardTitle>
            <CardDescription>
              Manage high-resolution 3D garment models mapped to each colour swatch for the live Design Studio at{" "}
              <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">/products/{slug}</code>.
            </CardDescription>
          </div>
          <Badge variant="outline" className="border-rose-300 text-[#80011F] bg-rose-50/50">
            {models.length} Colors Configured
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center p-8 text-sm text-muted-foreground">
            <RefreshCw className="h-4 w-4 animate-spin mr-2" /> Loading 3D models...
          </div>
        ) : (
          <div className="space-y-5">
            {models.map((model, idx) => (
              <div
                key={model.colorName}
                className="rounded-xl border border-border bg-card p-4 transition-all hover:border-rose-200 hover:shadow-xs space-y-4"
              >
                {/* Header row: Color Swatch + Title + Active switch + Save */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
                  <div className="flex items-center gap-3">
                    <span
                      className="size-6 rounded-full border border-black/20 shadow-xs"
                      style={{ backgroundColor: model.colorHex }}
                    />
                    <div>
                      <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                        {model.colorName}
                        <span className="text-xs font-mono font-normal text-muted-foreground">
                          ({model.colorHex})
                        </span>
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground cursor-pointer">
                      <span>Active</span>
                      <Switch
                        checked={model.isActive !== false}
                        onCheckedChange={(checked) => updateModelField(idx, "isActive", checked)}
                      />
                    </label>

                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="border-rose-200 text-[#80011F] hover:bg-rose-50"
                      disabled={savingColor === model.colorName}
                      onClick={() => handleSave(model)}
                    >
                      {savingColor === model.colorName ? (
                        <RefreshCw className="size-3.5 animate-spin mr-1" />
                      ) : (
                        <Save className="size-3.5 mr-1" />
                      )}
                      Save
                    </Button>
                  </div>
                </div>

                {/* 3D Model Inputs: Front & Back with S3 Upload Support */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                      <span>Front 3D Model Image</span>
                      <span className="text-[10px] text-muted-foreground font-normal">Transparent PNG / WebP</span>
                    </label>
                    <ImageField
                      value={model.frontModelUrl}
                      onChange={(url) => updateModelField(idx, "frontModelUrl", url)}
                      placeholder={`${S3_BASE}/${model.colorName.toLowerCase().replace(/\s+/g, "-")}/front.png`}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                      <span>Back 3D Model Image</span>
                      <span className="text-[10px] text-muted-foreground font-normal">Transparent PNG / WebP</span>
                    </label>
                    <ImageField
                      value={model.backModelUrl}
                      onChange={(url) => updateModelField(idx, "backModelUrl", url)}
                      placeholder={`${S3_BASE}/${model.colorName.toLowerCase().replace(/\s+/g, "-")}/back.png`}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

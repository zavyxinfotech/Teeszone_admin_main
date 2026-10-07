"use client";

import { ImageIcon, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiError, uploadApi } from "@/lib/api";
import { ProductImage } from "./ProductImage";

// Image path/URL with an upload button. Uploads go to POST /upload/image,
// which answers 503 until S3 credentials are configured (Madhan's call:
// wait for S3, no local fallback) — the path stays editable meanwhile.
export function ImageField({
  value,
  onChange,
  id,
  placeholder = "/products/polo-black.svg or https://…",
}: {
  value: string;
  onChange: (next: string) => void;
  id?: string;
  placeholder?: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const upload = async (file: File) => {
    setBusy(true);
    try {
      const { url } = await uploadApi.image(file);
      onChange(url);
      toast.success("Image uploaded");
    } catch (err) {
      if (err instanceof ApiError && err.status === 503) {
        toast.warning("Uploads are unavailable until S3 is configured", {
          description: "Enter the image path manually for now.",
        });
      } else {
        toast.error(err instanceof Error ? err.message : "Upload failed");
      }
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded border border-border bg-muted">
        {value ? <ProductImage src={value} alt="" className="size-full" /> : <ImageIcon size={16} className="text-muted-foreground" />}
      </span>
      <Input id={id} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void upload(f);
        }}
      />
      <Button type="button" variant="outline" size="icon" aria-label="Upload image" disabled={busy} onClick={() => fileRef.current?.click()}>
        <Upload />
      </Button>
    </div>
  );
}

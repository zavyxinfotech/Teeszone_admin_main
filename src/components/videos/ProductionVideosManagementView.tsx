"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Plus, Pencil, Trash2, Video, Play, Upload, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { ImageField } from "@/components/shared/ImageField";
import { PageHeader } from "@/components/layout/PageHeader";
import { videosApi, ProductionVideoInput } from "@/lib/api";
import type { AdminProductionVideo } from "@/lib/types";

const CATEGORIES = [
  "Packing & Dispatch",
  "Apparel Packaging",
  "Uniform Packaging",
  "Quality Checking",
  "Factory Production",
  "In-House Manufacturing",
];

const emptyForm: ProductionVideoInput = {
  videoTitle: "",
  videoDescription: "",
  category: "Packing & Dispatch",
  videoUrl: "",
  thumbnailUrl: "/portfolio/01-zoho-crm.webp",
  displayOrder: 1,
  isActive: true,
};

function resolveAdminThumbnail(url: string): string {
  if (!url) return "/portfolio/01-zoho-crm.webp";
  if (url.startsWith("/")) return url;
  const match = url.match(/([0-9]{2}-[^/]+\.(webp|png))/i);
  if (match) return `/portfolio/${match[1]}`;
  return url;
}

export function ProductionVideosManagementView() {
  const [items, setItems] = useState<AdminProductionVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AdminProductionVideo | null>(null);
  const [formData, setFormData] = useState<ProductionVideoInput>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<AdminProductionVideo | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [videoUploading, setVideoUploading] = useState(false);

  const videoInputRef = useRef<HTMLInputElement>(null);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await videosApi.list();
      setItems(res.items || []);
    } catch (err: any) {
      toast.error(err?.message || "Failed to load production videos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const openAdd = () => {
    setEditingItem(null);
    setFormData({
      ...emptyForm,
      displayOrder: items.length + 1,
    });
    setDialogOpen(true);
  };

  const openEdit = (vid: AdminProductionVideo) => {
    setEditingItem(vid);
    setFormData({
      videoTitle: vid.videoTitle,
      videoDescription: vid.videoDescription,
      category: vid.category || "Screen Printing",
      videoUrl: vid.videoUrl || "",
      thumbnailUrl: vid.thumbnailUrl,
      displayOrder: vid.displayOrder,
      isActive: vid.isActive,
    });
    setDialogOpen(true);
  };

  const capture5sThumbnail = (videoUrl: string) => {
    if (!videoUrl) return;
    try {
      const vid = document.createElement("video");
      vid.crossOrigin = "anonymous";
      vid.src = videoUrl;
      vid.currentTime = 5;
      vid.onseeked = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = vid.videoWidth || 640;
          canvas.height = vid.videoHeight || 360;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(vid, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
            setFormData((prev) => ({ ...prev, thumbnailUrl: dataUrl }));
            toast.success("Captured 5th second frame as thumbnail");
          }
        } catch {
          // Fallback to video time hash
          setFormData((prev) => ({ ...prev, thumbnailUrl: `${videoUrl}#t=5` }));
        }
      };
      vid.onerror = () => {
        setFormData((prev) => ({ ...prev, thumbnailUrl: `${videoUrl}#t=5` }));
      };
    } catch {
      setFormData((prev) => ({ ...prev, thumbnailUrl: `${videoUrl}#t=5` }));
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setVideoUploading(true);
    try {
      const { url } = await videosApi.uploadVideo(file);
      setFormData((prev) => ({ ...prev, videoUrl: url }));
      capture5sThumbnail(url);
      toast.success("Production video uploaded to S3!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to upload video to S3. Enter URL manually.");
    } finally {
      setVideoUploading(false);
      if (videoInputRef.current) videoInputRef.current.value = "";
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.videoTitle.trim()) {
      toast.error("Video title is required.");
      return;
    }

    // Default to 5th second video frame or fallback thumbnail if admin does not provide one
    const submissionData = { ...formData };
    if (!submissionData.thumbnailUrl.trim()) {
      submissionData.thumbnailUrl = submissionData.videoUrl
        ? `${submissionData.videoUrl}#t=5`
        : "/portfolio/01-zoho-crm.webp";
    }

    setSubmitting(true);
    try {
      if (editingItem) {
        await videosApi.update(editingItem.id, submissionData);
        toast.success("Production video updated successfully");
      } else {
        await videosApi.create(submissionData);
        toast.success("Production video created successfully");
      }
      setDialogOpen(false);
      fetchItems();
    } catch (err: any) {
      toast.error(err?.message || "Failed to save video");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await videosApi.delete(deleteTarget.id);
      toast.success("Production video deleted");
      setDeleteTarget(null);
      fetchItems();
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete video");
    }
  };

  const toggleActive = async (vid: AdminProductionVideo) => {
    try {
      await videosApi.update(vid.id, { isActive: !vid.isActive });
      toast.success(`${vid.videoTitle} status updated`);
      fetchItems();
    } catch (err: any) {
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Production Videos"
        description="Manage authentic factory production footage, screen/DTF printing, embroidery, and QC inspection videos."
        actions={
          <Button onClick={openAdd} className="gap-2 bg-[#80011F] hover:bg-[#680119] text-white">
            <Plus size={16} />
            Add Video
          </Button>
        }
      />

      <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Video size={18} className="text-[#80011F]" />
            <h3 className="font-bold text-sm">Production Videos ({items.length})</h3>
          </div>
          <span className="text-xs text-muted-foreground">
            Factory footage & manufacturing processes
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading videos...</div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            No production videos found. Click &quot;Add Video&quot; to upload factory footage.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-muted/50 text-muted-foreground text-[11px] font-bold uppercase tracking-wider border-b border-border">
                <tr>
                  <th className="py-3 px-4 w-20">Thumbnail</th>
                  <th className="py-3 px-4">Title & Process</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 max-w-xs">Description</th>
                  <th className="py-3 px-4 w-24 text-center">Video File</th>
                  <th className="py-3 px-4 w-20 text-center">Order</th>
                  <th className="py-3 px-4 w-24 text-center">Status</th>
                  <th className="py-3 px-4 w-28 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="relative h-12 w-16 overflow-hidden rounded bg-slate-900 border border-border flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={resolveAdminThumbnail(item.thumbnailUrl)}
                          alt={item.videoTitle}
                          onError={(e) => {
                            const target = e.currentTarget;
                            if (target.src.includes(".webp")) {
                              target.src = target.src.replace(/\.webp$/i, ".png");
                            }
                          }}
                          className="h-full w-full object-cover opacity-80"
                        />
                        <Play size={14} className="absolute z-10 fill-white text-white pointer-events-none" />
                      </div>
                    </td>
                    <td className="py-3 px-4 font-bold text-foreground">
                      {item.videoTitle}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700 border border-slate-200">
                        {item.category || "General"}
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate text-muted-foreground" title={item.videoDescription}>
                      {item.videoDescription}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {item.videoUrl ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <Check size={11} /> Attached
                        </span>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">Pending</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-medium">
                      {item.displayOrder}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Switch
                        checked={item.isActive}
                        onCheckedChange={() => toggleActive(item)}
                        aria-label="Toggle active status"
                      />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEdit(item)}
                          className="h-8 w-8 p-0"
                          title="Edit video"
                        >
                          <Pencil size={15} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteTarget(item)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          title="Delete video"
                        >
                          <Trash2 size={15} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit Production Video" : "Add Production Video"}
            </DialogTitle>
            <DialogDescription>
              Upload or link real factory production videos and set poster thumbnails.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                Video Title *
              </label>
              <Input
                value={formData.videoTitle}
                onChange={(e) => setFormData({ ...formData, videoTitle: e.target.value })}
                placeholder="e.g. High-Density DTF Printing & Thermal Curing"
                required
              />
            </div>

            {/* Manufacturing Process Category (Display Order removed per request) */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                Manufacturing Process Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Video File / URL */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                Video Media (MP4 / WebM / S3 URL)
              </label>
              <div className="flex gap-2">
                <Input
                  value={formData.videoUrl || ""}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  placeholder="https://.../video.mp4 or S3 URL"
                />
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime"
                  onChange={handleVideoUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => videoInputRef.current?.click()}
                  disabled={videoUploading}
                  className="shrink-0 gap-1.5"
                >
                  <Upload size={14} />
                  {videoUploading ? "Uploading..." : "Upload MP4"}
                </Button>
              </div>
              <span className="text-[11px] text-muted-foreground mt-1 block">
                Direct MP4/WebM upload up to 50MB streams securely to AWS S3.
              </span>
            </div>

            {/* Thumbnail Image (defaults to 5th-second video frame if not provided) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Video Poster Thumbnail
                </label>
                {formData.videoUrl && (
                  <button
                    type="button"
                    onClick={() => capture5sThumbnail(formData.videoUrl || "")}
                    className="text-[11px] font-semibold text-[#80011F] hover:underline cursor-pointer"
                  >
                    Auto-grab 5th second frame
                  </button>
                )}
              </div>
              <ImageField
                value={formData.thumbnailUrl}
                onChange={(url) => setFormData({ ...formData, thumbnailUrl: url })}
                placeholder="Defaults to video 5th second frame if left empty"
              />
              <span className="text-[11px] text-muted-foreground mt-1 block">
                Leave empty to automatically use the 5th second frame of the video.
              </span>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                Process Notes (Optional)
              </label>
              <Textarea
                rows={2}
                value={formData.videoDescription}
                onChange={(e) => setFormData({ ...formData, videoDescription: e.target.value })}
                placeholder="Optional notes..."
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Visible on Storefront
              </span>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="bg-[#80011F] text-white">
                {submitting ? "Saving..." : editingItem ? "Update Video" : "Create Video"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title={`Delete ${deleteTarget?.videoTitle}?`}
        description="Are you sure you want to delete this production video? This action cannot be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
      />
    </div>
  );
}

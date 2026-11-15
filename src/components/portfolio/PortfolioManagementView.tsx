"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Plus, Pencil, Trash2, Camera, ExternalLink, Check, Eye } from "lucide-react";
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
import { portfolioApi, PortfolioClientInput } from "@/lib/api";
import type { AdminPortfolioClient } from "@/lib/types";

const SECTORS = [
  "Corporate Apparel",
  "School Uniforms",
  "College Uniforms",
  "Sports Uniforms",
  "Hospitality & Hotels",
  "Manufacturing & Industry",
  "Engineering & Electronics",
  "Construction & Workwear",
  "Salon & Wellness Uniforms",
  "Retail & Commercial Uniforms",
  "Services & Field Uniforms",
  "Events & Promotional Apparel",
];

const emptyForm: PortfolioClientInput = {
  clientName: "",
  companyName: "",
  businessSector: "Corporate Apparel",
  category: "",
  description: "",
  imageUrl: "",
  productDetails: "Custom Polo / T-Shirt | Bio-Washed Cotton | Embroidery & Print",
  displayOrder: 1,
  isActive: true,
};

function resolveAdminImage(url: string): string {
  if (!url) return "/portfolio/01-zoho-crm.webp";
  if (url.startsWith("/")) return url;
  const match = url.match(/([0-9]{2}-[^/]+\.(webp|png))/i);
  if (match) return `/portfolio/${match[1]}`;
  return url;
}

export function PortfolioManagementView() {
  const [items, setItems] = useState<AdminPortfolioClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AdminPortfolioClient | null>(null);
  const [formData, setFormData] = useState<PortfolioClientInput>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<AdminPortfolioClient | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await portfolioApi.list();
      setItems(res.items || []);
    } catch (err: any) {
      toast.error(err?.message || "Failed to load client portfolio");
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

  const openEdit = (client: AdminPortfolioClient) => {
    setEditingItem(client);
    setFormData({
      clientName: client.clientName,
      companyName: client.companyName,
      businessSector: client.businessSector,
      category: client.category || "",
      description: client.description,
      imageUrl: client.imageUrl,
      productDetails: client.productDetails || "",
      displayOrder: client.displayOrder,
      isActive: client.isActive,
    });
    setDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientName.trim() || !formData.imageUrl.trim()) {
      toast.error("Client name and photograph are required.");
      return;
    }

    setSubmitting(true);
    try {
      if (editingItem) {
        await portfolioApi.update(editingItem.id, formData);
        toast.success("Client portfolio updated successfully");
      } else {
        await portfolioApi.create(formData);
        toast.success("Client portfolio entry created successfully");
      }
      setDialogOpen(false);
      fetchItems();
    } catch (err: any) {
      toast.error(err?.message || "Failed to save portfolio entry");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await portfolioApi.delete(deleteTarget.id);
      toast.success("Client portfolio deleted");
      setDeleteTarget(null);
      fetchItems();
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete entry");
    }
  };

  const toggleActive = async (client: AdminPortfolioClient) => {
    try {
      await portfolioApi.update(client.id, { isActive: !client.isActive });
      toast.success(`${client.clientName} status updated`);
      fetchItems();
    } catch (err: any) {
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Real Client Portfolio"
        description="Manage authentic client photographs, corporate uniforms, and customized T-shirt case studies displayed on the storefront."
        actions={
          <Button onClick={openAdd} className="gap-2 bg-[#80011F] hover:bg-[#680119] text-white">
            <Plus size={16} />
            Add Client
          </Button>
        }
      />

      {/* Main Table / Grid */}
      <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera size={18} className="text-[#80011F]" />
            <h3 className="font-bold text-sm">Client Entries ({items.length})</h3>
          </div>
          <span className="text-xs text-muted-foreground">
            Original spreadsheet photographs synchronized
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading portfolio...</div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            No client portfolio entries found. Click &quot;Add Client&quot; to create one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-muted/50 text-muted-foreground text-[11px] font-bold uppercase tracking-wider border-b border-border">
                <tr>
                  <th className="py-3 px-4 w-16">Photo</th>
                  <th className="py-3 px-4">Client / Company</th>
                  <th className="py-3 px-4">Business Sector</th>
                  <th className="py-3 px-4 max-w-xs">Description</th>
                  <th className="py-3 px-4 w-20 text-center">Order</th>
                  <th className="py-3 px-4 w-24 text-center">Status</th>
                  <th className="py-3 px-4 w-28 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="relative h-12 w-10 overflow-hidden rounded bg-slate-900 border border-border">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={resolveAdminImage(item.imageUrl)}
                          alt={item.clientName}
                          onError={(e) => {
                            const target = e.currentTarget;
                            if (target.src.includes(".webp")) {
                              target.src = target.src.replace(/\.webp$/i, ".png");
                            }
                          }}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </td>
                    <td className="py-3 px-4 font-bold text-foreground">
                      {item.clientName}
                      {item.companyName && item.companyName !== item.clientName && (
                        <span className="block text-xs font-normal text-muted-foreground">
                          {item.companyName}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex rounded-full bg-rose-50 px-2.5 py-0.5 text-[11px] font-semibold text-[#80011F] border border-rose-200">
                        {item.businessSector}
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate text-muted-foreground" title={item.description}>
                      {item.description}
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
                          title="Edit client details"
                        >
                          <Pencil size={15} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteTarget(item)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          title="Delete client entry"
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
              {editingItem ? "Edit Client Portfolio Entry" : "Add Real Client Portfolio Entry"}
            </DialogTitle>
            <DialogDescription>
              Upload high-resolution client photos and enter business sector specifications.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                Client / Company Name *
              </label>
              <Input
                value={formData.clientName}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    clientName: e.target.value,
                    companyName: e.target.value,
                  })
                }
                placeholder="e.g. Zoho CRM"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  Business Sector *
                </label>
                <select
                  value={formData.businessSector}
                  onChange={(e) => setFormData({ ...formData, businessSector: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  {SECTORS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  Display Order
                </label>
                <Input
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) =>
                    setFormData({ ...formData, displayOrder: parseInt(e.target.value, 10) || 0 })
                  }
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                Client Photograph *
              </label>
              <ImageField
                value={formData.imageUrl}
                onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                placeholder="/portfolio/01-zoho-crm.webp or S3 URL"
              />
              <span className="text-[11px] text-muted-foreground mt-1 block">
                Upload original photograph to AWS S3 or provide relative path.
              </span>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                Custom Apparel Specifications
              </label>
              <Input
                value={formData.productDetails || ""}
                onChange={(e) => setFormData({ ...formData, productDetails: e.target.value })}
                placeholder="e.g. Custom Polo / T-Shirt | Bio-Washed Cotton | Embroidery & Print"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                Client Story / Description
              </label>
              <Textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the customized apparel delivered for this client..."
                required
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
                {submitting ? "Saving..." : editingItem ? "Update Client" : "Create Client"}
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
        title={`Delete ${deleteTarget?.clientName}?`}
        description="Are you sure you want to delete this client portfolio entry? This action cannot be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
      />
    </div>
  );
}

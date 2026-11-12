"use client";

import { useState } from "react";
import {
  CheckCircle,
  Clock,
  Download,
  ExternalLink,
  Eye,
  Layers,
  Mail,
  MessageCircle,
  Package,
  Palette,
  RefreshCw,
  Search,
  Shirt,
  ShoppingBag,
  Sparkles,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";
import { useAdminOrders } from "@/hooks/use-activity";
import { formatDateTime } from "@/lib/format";
import type { AdminOrder } from "@/lib/api";

export function OrdersView() {
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);

  const { data, isLoading, isFetching, refetch } = useAdminOrders({
    search: search.trim() || undefined,
    limit: 50,
  });

  const orders = data?.orders ?? [];

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
        <PageHeader
          title="Customer Orders"
          description="View and manage all customer wholesale orders, payment verification and manufacturing requests."
        />
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            size="sm"
            variant="outline"
            onClick={() => refetch()}
            disabled={isFetching}
            className="gap-1.5"
          >
            <RefreshCw size={13} className={isFetching ? "animate-spin" : ""} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between mb-4">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order #, customer name, email..."
            className="pl-9 text-xs sm:text-sm"
          />
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-80 rounded-xl" />
      ) : orders.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="No customer orders found"
          description="Paid customer orders and customization requests will appear here."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-background shadow-xs">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead>Order #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((ord) => (
                <TableRow
                  key={ord.id}
                  className="cursor-pointer transition-colors hover:bg-muted/30"
                  onClick={() => setSelectedOrder(ord)}
                >
                  <TableCell className="font-mono font-bold text-xs text-foreground">
                    {ord.orderNumber}
                  </TableCell>
                  <TableCell>
                    <p className="font-semibold text-xs text-foreground">
                      {ord.userName || "Customer"}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {ord.userEmail || ord.userPhone || "—"}
                    </p>
                  </TableCell>
                  <TableCell className="text-xs text-foreground font-medium">
                    {Array.isArray(ord.items) ? `${ord.items.length} line items` : "1 item"}
                  </TableCell>
                  <TableCell className="text-xs font-black text-[#80011F]">
                    ₹{ord.amount.toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                      {ord.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                    {formatDateTime(ord.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {ord.userPhone && (
                        <a
                          href={`https://wa.me/${ord.userPhone.replace(/\D/g, "")}?text=${encodeURIComponent(
                            `Hi ${ord.userName || "Customer"}! Regarding your TeesZone Order #${ord.orderNumber}: your order is confirmed and in production.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex h-7 w-7 items-center justify-center rounded-md text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                          title="Message Customer on WhatsApp"
                        >
                          <MessageCircle size={15} />
                        </a>
                      )}
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground">
                        <Eye size={14} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Order Details Slide-Over Sheet */}
      <Sheet open={Boolean(selectedOrder)} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          {selectedOrder && (
            <div className="space-y-6">
              <SheetHeader>
                <div className="flex items-center gap-2">
                  <Badge className="bg-emerald-600 text-white font-bold">{selectedOrder.status}</Badge>
                  <span className="text-xs text-muted-foreground font-mono">
                    {selectedOrder.orderNumber}
                  </span>
                </div>
                <SheetTitle className="text-xl font-heading font-black pt-1">
                  Order Details &amp; Manufacturing Specs
                </SheetTitle>
                <SheetDescription>
                  Placed on {formatDateTime(selectedOrder.createdAt)}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-5 text-xs sm:text-sm divide-y divide-border">
                {/* Customer */}
                <div className="pt-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold uppercase tracking-wider text-[11px] text-muted-foreground">
                      Customer Info
                    </span>
                    <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                      <Mail size={10} />
                      <span>Notified via info@teeszone.in</span>
                    </span>
                  </div>
                  <p className="font-semibold text-foreground text-sm">{selectedOrder.userName || "Customer"}</p>
                  <p className="text-muted-foreground">{selectedOrder.userEmail}</p>
                  {selectedOrder.userPhone && (
                    <div className="flex items-center gap-2 pt-1">
                      <p className="text-muted-foreground font-medium">{selectedOrder.userPhone}</p>
                      <a
                        href={`https://wa.me/${selectedOrder.userPhone.replace(/\D/g, "")}?text=${encodeURIComponent(
                          `Hi ${selectedOrder.userName || "Customer"}! Regarding your TeesZone Order #${selectedOrder.orderNumber}: your custom apparel order has been received and is being processed by our production team. Reach out if you need mockup changes!`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#25D366] px-2.5 py-1 text-xs font-bold text-white hover:bg-[#20ba5a] transition-all cursor-pointer shadow-2xs"
                      >
                        <MessageCircle size={13} />
                        <span>Chat on WhatsApp</span>
                      </a>
                    </div>
                  )}
                </div>

                {/* Items & Custom Mockups */}
                <div className="pt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-bold uppercase tracking-wider text-[11px] text-muted-foreground">
                      Purchased Items ({selectedOrder.items?.length || 0})
                    </span>
                  </div>

                  {(selectedOrder.items || []).map((it: any, idx: number) => {
                    const frontImg = it.frontPreviewUrl || it.customDesign?.frontPreviewUrl || it.image;
                    const backImg = it.backPreviewUrl || it.customDesign?.backPreviewUrl;
                    const frontLogo = it.frontLogoUrl || it.customDesign?.frontLogoUrl || it.customDesign?.logoUrl;
                    const backLogo = it.backLogoUrl || it.customDesign?.backLogoUrl;
                    const design = it.customDesign || null;
                    const frontElements = design?.frontElements || [];
                    const backElements = design?.backElements || [];

                    return (
                      <div key={idx} className="rounded-xl border border-border bg-card p-4 space-y-3.5 shadow-xs">
                        <div className="flex items-start justify-between gap-3 border-b border-border/60 pb-2.5">
                          <div>
                            <p className="font-extrabold text-foreground text-sm leading-snug">{it.name}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Color: <span className="font-semibold text-foreground">{it.color || it.colorName}</span> · Size: <span className="font-semibold text-foreground">{it.size}</span> · Quantity: <span className="font-bold text-[#80011F]">{it.qty} pcs</span>
                            </p>
                          </div>
                          {it.colorHex && (
                            <div
                              className="h-5 w-5 rounded-full border border-border shrink-0 shadow-2xs"
                              style={{ backgroundColor: it.colorHex }}
                              title={it.color || it.colorName}
                            />
                          )}
                        </div>

                        {it.customNote && (
                          <div className="rounded-lg bg-rose-50/80 border border-rose-200/80 p-2.5 text-xs text-[#80011F] font-medium leading-relaxed">
                            <span className="font-bold block mb-0.5">Customization Note:</span>
                            {it.customNote}
                          </div>
                        )}

                        {/* Front & Back 3D Mockup Previews */}
                        {(frontImg || backImg) && (
                          <div className="space-y-2 pt-1">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                              <Shirt size={13} className="text-[#80011F]" />
                              <span>Front &amp; Back 3D Customization Mockups</span>
                            </span>

                            <div className="grid grid-cols-2 gap-3">
                              {/* Front Mockup Card */}
                              <div className="flex flex-col items-center rounded-xl border border-border bg-muted/20 p-2 text-center group">
                                <span className="text-[10px] font-extrabold uppercase tracking-wide text-foreground mb-1 bg-background px-2 py-0.5 rounded-md border border-border/80">
                                  Front View
                                </span>
                                {frontImg ? (
                                  <div className="relative aspect-[1024/935] w-full max-h-48 flex items-center justify-center overflow-hidden rounded-lg bg-white/70 p-1">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      src={frontImg}
                                      alt="Front Mockup"
                                      className="h-full w-full object-contain filter drop-shadow-sm transition-transform duration-200 group-hover:scale-105"
                                    />
                                  </div>
                                ) : (
                                  <div className="h-32 w-full flex items-center justify-center text-xs text-muted-foreground">
                                    No Front Preview
                                  </div>
                                )}
                                {frontImg && (
                                  <a
                                    href={frontImg}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold text-[#80011F] hover:underline"
                                  >
                                    <span>View High-Res</span>
                                    <ExternalLink size={11} />
                                  </a>
                                )}
                              </div>

                              {/* Back Mockup Card */}
                              <div className="flex flex-col items-center rounded-xl border border-border bg-muted/20 p-2 text-center group">
                                <span className="text-[10px] font-extrabold uppercase tracking-wide text-foreground mb-1 bg-background px-2 py-0.5 rounded-md border border-border/80">
                                  Back View
                                </span>
                                {backImg ? (
                                  <div className="relative aspect-[1024/935] w-full max-h-48 flex items-center justify-center overflow-hidden rounded-lg bg-white/70 p-1">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      src={backImg}
                                      alt="Back Mockup"
                                      className="h-full w-full object-contain filter drop-shadow-sm transition-transform duration-200 group-hover:scale-105"
                                    />
                                  </div>
                                ) : (
                                  <div className="h-32 w-full flex items-center justify-center text-xs text-muted-foreground">
                                    No Back Preview
                                  </div>
                                )}
                                {backImg && (
                                  <a
                                    href={backImg}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold text-[#80011F] hover:underline"
                                  >
                                    <span>View High-Res</span>
                                    <ExternalLink size={11} />
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Uploaded Logos Inspection */}
                        {(frontLogo || backLogo) && (
                          <div className="space-y-1.5 pt-1 border-t border-border/50">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                              <Sparkles size={13} className="text-[#80011F]" />
                              <span>Customer Logo Assets</span>
                            </span>
                            <div className="grid grid-cols-2 gap-2.5">
                              {frontLogo && (
                                <div className="flex items-center gap-2 rounded-lg border border-border bg-background p-2">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={frontLogo}
                                    alt="Front Logo"
                                    className="h-10 w-10 object-contain rounded border border-border/80 bg-white p-0.5"
                                  />
                                  <div className="truncate flex-1">
                                    <p className="text-xs font-bold text-foreground truncate">Front Logo</p>
                                    <a
                                      href={frontLogo}
                                      download="front-logo"
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-[11px] font-semibold text-[#80011F] hover:underline inline-flex items-center gap-1"
                                    >
                                      <Download size={11} />
                                      <span>Download</span>
                                    </a>
                                  </div>
                                </div>
                              )}
                              {backLogo && (
                                <div className="flex items-center gap-2 rounded-lg border border-border bg-background p-2">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={backLogo}
                                    alt="Back Logo"
                                    className="h-10 w-10 object-contain rounded border border-border/80 bg-white p-0.5"
                                  />
                                  <div className="truncate flex-1">
                                    <p className="text-xs font-bold text-foreground truncate">Back Logo</p>
                                    <a
                                      href={backLogo}
                                      download="back-logo"
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-[11px] font-semibold text-[#80011F] hover:underline inline-flex items-center gap-1"
                                    >
                                      <Download size={11} />
                                      <span>Download</span>
                                    </a>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Detailed Design Elements Inspection */}
                        {design && (
                          <div className="space-y-1.5 pt-1 border-t border-border/50 text-[11px]">
                            <span className="font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                              <Layers size={13} className="text-[#80011F]" />
                              <span>Customization Specifications</span>
                            </span>
                            <div className="grid grid-cols-3 gap-2 bg-muted/30 p-2.5 rounded-lg border border-border/60">
                              <div>
                                <span className="text-muted-foreground block text-[10px]">Front Position</span>
                                <span className="font-bold text-foreground">{design.frontPositionPreset || "Left Chest"}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground block text-[10px]">Back Position</span>
                                <span className="font-bold text-foreground">{design.backPositionPreset || "Upper Back"}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground block text-[10px]">Print Type</span>
                                <span className="font-bold text-[#80011F]">{design.printType || "Full Colour"}</span>
                              </div>
                            </div>

                            {/* Elements List */}
                            {(frontElements.length > 0 || backElements.length > 0) && (
                              <div className="space-y-1 pt-1">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase">Design Elements:</span>
                                <div className="space-y-1">
                                  {frontElements.map((el: any, elIdx: number) => (
                                    <div key={`f-${elIdx}`} className="flex items-center justify-between bg-background border border-border/80 px-2 py-1 rounded text-[11px]">
                                      <span className="font-medium text-foreground truncate max-w-[220px]">
                                        [Front] {el.type === "logo" ? "Logo" : el.type === "text" ? `Text: "${el.text}"` : `Shape: ${el.shapeType || "Shape"}`}
                                      </span>
                                      <span className="text-muted-foreground font-mono text-[10px]">
                                        {el.width}%w · {el.rotation ? `${el.rotation}°` : "0°"}
                                      </span>
                                    </div>
                                  ))}
                                  {backElements.map((el: any, elIdx: number) => (
                                    <div key={`b-${elIdx}`} className="flex items-center justify-between bg-background border border-border/80 px-2 py-1 rounded text-[11px]">
                                      <span className="font-medium text-foreground truncate max-w-[220px]">
                                        [Back] {el.type === "logo" ? "Logo" : el.type === "text" ? `Text: "${el.text}"` : `Shape: ${el.shapeType || "Shape"}`}
                                      </span>
                                      <span className="text-muted-foreground font-mono text-[10px]">
                                        {el.width}%w · {el.rotation ? `${el.rotation}°` : "0°"}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Total */}
                <div className="pt-4 flex items-center justify-between">
                  <span className="font-bold uppercase tracking-wider text-xs text-muted-foreground">
                    Total Amount Paid
                  </span>
                  <span className="text-xl font-black text-[#80011F]">
                    ₹{selectedOrder.amount.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}

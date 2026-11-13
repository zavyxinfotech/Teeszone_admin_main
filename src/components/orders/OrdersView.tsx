"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  Eye,
  Layers,
  Loader2,
  Mail,
  MessageCircle,
  Package,
  Palette,
  RefreshCw,
  Search,
  Send,
  Shirt,
  ShoppingBag,
  Sparkles,
  Star,
  Truck,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { ordersApi, type AdminOrder } from "@/lib/api";

export function OrdersView() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);

  // Status update states inside Sheet
  const [targetStatus, setTargetStatus] = useState<"Order Placed" | "Processing" | "Dispatched">("Order Placed");
  const [trackingInput, setTrackingInput] = useState("");
  const [courierInput, setCourierInput] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const { data, isLoading, isFetching, refetch } = useAdminOrders({
    search: search.trim() || undefined,
    status: statusFilter === "ALL" ? undefined : statusFilter,
    limit: 50,
  });

  const orders = data?.orders ?? [];

  // Synchronize status form fields when selectedOrder changes
  useEffect(() => {
    if (selectedOrder) {
      const normalizedStatus =
        selectedOrder.status === "Processing"
          ? "Processing"
          : selectedOrder.status === "Dispatched"
          ? "Dispatched"
          : "Order Placed";
      setTargetStatus(normalizedStatus);
      setTrackingInput(selectedOrder.trackingId || "");
      setCourierInput(selectedOrder.courierName || "");
      setStatusFeedback(null);
    }
  }, [selectedOrder]);

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;
    setIsUpdatingStatus(true);
    setStatusFeedback(null);

    try {
      const res = await ordersApi.updateStatus(selectedOrder.id, {
        status: targetStatus,
        trackingId: trackingInput.trim() || undefined,
        courierName: courierInput.trim() || undefined,
      });

      if (res?.order) {
        setSelectedOrder(res.order);
        setStatusFeedback({
          type: "success",
          message: `Order status successfully updated to "${targetStatus}". Customer has been notified.`,
        });
        refetch();
      }
    } catch (err: any) {
      setStatusFeedback({
        type: "error",
        message: err.message || "Failed to update order status.",
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const renderStatusBadge = (status: string) => {
    if (status === "Order Placed" || status === "PAID") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 px-2.5 py-0.5 text-[11px] font-bold">
          <Clock size={12} className="text-sky-600" />
          <span>Order Placed</span>
        </span>
      );
    }
    if (status === "Processing") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 text-[11px] font-bold">
          <RefreshCw size={12} className="text-amber-600 animate-spin" />
          <span>Processing</span>
        </span>
      );
    }
    if (status === "Dispatched") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 text-[11px] font-bold">
          <Truck size={12} className="text-emerald-700" />
          <span>Dispatched</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5 text-[11px] font-bold">
        <span>{status}</span>
      </span>
    );
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
        <PageHeader
          title="Customer Orders"
          description="View and manage all customer wholesale orders, status transitions, and Google review feedback."
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

        {/* Status filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">Status:</span>
          <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val)}>
            <SelectTrigger className="w-[150px] text-xs h-9">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="Order Placed">Order Placed</SelectItem>
              <SelectItem value="Processing">Processing</SelectItem>
              <SelectItem value="Dispatched">Dispatched</SelectItem>
            </SelectContent>
          </Select>
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
                <TableHead>Review Status</TableHead>
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
                    {renderStatusBadge(ord.status)}
                  </TableCell>
                  <TableCell>
                    {ord.status === "Dispatched" ? (
                      <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-bold ${
                        ord.reviewStatus === "Review Acknowledged"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : ord.reviewStatus === "Review Requested"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-slate-50 text-slate-700 border border-slate-200"
                      }`}>
                        {ord.internalRating && <span>⭐ {ord.internalRating}/5</span>}
                        <span>{ord.reviewStatus || "Review Pending"}</span>
                      </span>
                    ) : (
                      <span className="text-[11px] text-muted-foreground italic">N/A</span>
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                    {formatDateTime(ord.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {ord.userPhone && (
                        <a
                          href={`https://wa.me/${ord.userPhone.replace(/\D/g, "")}?text=${encodeURIComponent(
                            `Hi ${ord.userName || "Customer"}! Regarding your TeesZone Order #${ord.orderNumber} (Status: ${ord.status}): We are manufacturing your custom apparel. Reach out if you need updates!`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1 text-emerald-600 hover:text-emerald-700 transition-colors"
                          title="WhatsApp Customer"
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

      {/* Order Details & Status Management Sheet */}
      <Sheet open={Boolean(selectedOrder)} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          {selectedOrder && (
            <div className="space-y-6">
              <SheetHeader>
                <div className="flex items-center gap-2">
                  {renderStatusBadge(selectedOrder.status)}
                  <span className="text-xs text-muted-foreground font-mono">
                    {selectedOrder.orderNumber}
                  </span>
                </div>
                <SheetTitle className="text-xl font-heading font-black pt-1">
                  Order Details &amp; Lifecycle Management
                </SheetTitle>
                <SheetDescription>
                  Placed on {formatDateTime(selectedOrder.createdAt)}
                </SheetDescription>
              </SheetHeader>

              {/* Status Update Management Card */}
              <div className="rounded-xl border border-[#80011F]/20 bg-rose-50/30 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold uppercase tracking-wider text-xs text-[#80011F] flex items-center gap-1.5">
                    <RefreshCw size={14} />
                    <span>Order Status Workflow</span>
                  </span>
                  {selectedOrder.statusUpdatedAt && (
                    <span className="text-[10px] text-muted-foreground">
                      Updated: {formatDateTime(selectedOrder.statusUpdatedAt)}
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-foreground block">
                    Change Order Status:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["Order Placed", "Processing", "Dispatched"] as const).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setTargetStatus(st)}
                        className={`rounded-lg px-2.5 py-2 text-xs font-bold transition-all border cursor-pointer ${
                          targetStatus === st
                            ? "bg-[#80011F] text-white border-[#80011F] shadow-xs"
                            : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Additional inputs when Dispatched */}
                {targetStatus === "Dispatched" && (
                  <div className="pt-2 space-y-2 border-t border-[#80011F]/15 animate-in fade-in duration-150">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                          Courier Partner
                        </label>
                        <Input
                          value={courierInput}
                          onChange={(e) => setCourierInput(e.target.value)}
                          placeholder="e.g. Delhivery, BlueDart, DTDC"
                          className="h-8 text-xs bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                          Tracking / AWB Number
                        </label>
                        <Input
                          value={trackingInput}
                          onChange={(e) => setTrackingInput(e.target.value)}
                          placeholder="e.g. AWB987654321"
                          className="h-8 text-xs bg-white font-mono"
                        />
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground italic">
                      * Updating to Dispatched will automatically trigger the Google Review notification workflow for the customer.
                    </p>
                  </div>
                )}

                {statusFeedback && (
                  <div className={`p-2.5 rounded-lg text-xs font-medium flex items-center gap-2 ${
                    statusFeedback.type === "success"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-rose-50 text-rose-800 border border-rose-200"
                  }`}>
                    {statusFeedback.type === "success" ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                    <span>{statusFeedback.message}</span>
                  </div>
                )}

                <Button
                  size="sm"
                  onClick={handleUpdateStatus}
                  disabled={isUpdatingStatus}
                  className="w-full bg-[#80011F] hover:bg-[#660119] text-white font-bold text-xs gap-1.5"
                >
                  {isUpdatingStatus ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                  <span>Save &amp; Notify Customer</span>
                </Button>
              </div>

              {/* Customer Review Management (Dispatched Orders) */}
              {selectedOrder.status === "Dispatched" && (
                <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold uppercase tracking-wider text-xs text-foreground flex items-center gap-1.5">
                      <Star size={14} className="text-[#80011F] fill-[#80011F]" />
                      <span>Customer Review Management</span>
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      selectedOrder.reviewStatus === "Review Acknowledged"
                        ? "bg-emerald-100 text-emerald-800"
                        : selectedOrder.reviewStatus === "Review Requested"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-slate-100 text-slate-800"
                    }`}>
                      {selectedOrder.reviewStatus || "Review Pending"}
                    </span>
                  </div>

                  <div className="space-y-1.5 bg-background p-3 rounded-lg border border-border/60">
                    <span className="text-[11px] font-semibold text-muted-foreground block">
                      Customer Internal Rating:
                    </span>
                    {selectedOrder.internalRating ? (
                      <div className="flex items-center gap-2">
                        <div className="flex text-amber-500">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={16}
                              className={star <= selectedOrder.internalRating! ? "fill-amber-400 text-amber-500" : "text-gray-300"}
                            />
                          ))}
                        </div>
                        <span className="text-xs font-bold text-foreground">
                          {selectedOrder.internalRating} / 5 Stars
                        </span>
                        <span className="text-[10px] text-muted-foreground italic">
                          (Internal customer feedback rating)
                        </span>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">
                        Rating Pending — Customer has not submitted internal star rating yet.
                      </p>
                    )}
                  </div>

                  <div className="text-[11px] text-muted-foreground space-y-1 border-t border-border/40 pt-2">
                    <p className="font-medium text-foreground">Google Review Link Configured:</p>
                    <a
                      href="https://g.page/r/CShjds2c7FPzEBI/review"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#80011F] hover:underline flex items-center gap-1 text-[11px]"
                    >
                      <span>https://g.page/r/CShjds2c7FPzEBI/review</span>
                      <ExternalLink size={10} />
                    </a>
                    <p className="text-[10px] text-muted-foreground italic">
                      * Internal feedback is stored separately from public Google reviews. Redirect clicks cannot be used to verify actual Google review publication without third-party proof.
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-5 text-xs sm:text-sm divide-y divide-border">
                {/* Customer Info */}
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
                          `Hi ${selectedOrder.userName || "Customer"}! Regarding your TeesZone Order #${selectedOrder.orderNumber}: your order status is "${selectedOrder.status}". Reach out to us if you have any questions!`
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

                {/* Tracking Details if present */}
                {(selectedOrder.trackingId || selectedOrder.courierName) && (
                  <div className="pt-4 space-y-1">
                    <span className="font-bold uppercase tracking-wider text-[11px] text-muted-foreground flex items-center gap-1.5">
                      <Truck size={13} className="text-[#80011F]" />
                      <span>Dispatch &amp; Tracking Information</span>
                    </span>
                    <div className="grid grid-cols-2 gap-2 bg-muted/40 p-2.5 rounded-lg border border-border/60">
                      <div>
                        <span className="text-muted-foreground block text-[10px]">Courier Service</span>
                        <span className="font-bold text-foreground">{selectedOrder.courierName || "Standard Courier"}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[10px]">Tracking Number</span>
                        <span className="font-mono font-bold text-[#80011F]">{selectedOrder.trackingId || "—"}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Items */}
                <div className="pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold uppercase tracking-wider text-xs text-muted-foreground">
                      Purchased Items ({selectedOrder.items?.length || 0})
                    </span>
                  </div>

                  {(selectedOrder.items || []).map((it: any, idx: number) => {
                    const frontImg = it.frontPreviewUrl || it.customDesign?.frontPreviewUrl || it.image;
                    const backImg = it.backPreviewUrl || it.customDesign?.backPreviewUrl;
                    const design = it.customDesign;
                    const frontElements = design?.frontElements || [];
                    const backElements = design?.backElements || [];

                    return (
                      <div
                        key={idx}
                        className="rounded-xl border border-border bg-card p-3 sm:p-4 space-y-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-0.5">
                            <h4 className="font-bold text-sm text-foreground">{it.name}</h4>
                            <p className="text-xs text-muted-foreground">
                              Color: <span className="font-semibold text-foreground">{it.color}</span> · Size:{" "}
                              <span className="font-semibold text-foreground">{it.size}</span>
                            </p>
                            {it.customNote && (
                              <p className="text-xs italic text-muted-foreground pt-0.5">
                                Note: &ldquo;{it.customNote}&rdquo;
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-xs text-foreground block">
                              {it.qty} pcs × ₹{it.unitPrice}
                            </span>
                            <span className="font-black text-sm text-[#80011F]">
                              ₹{(it.qty * it.unitPrice).toLocaleString("en-IN")}
                            </span>
                          </div>
                        </div>

                        {/* Front & Back Mockup Previews */}
                        {(frontImg || backImg) && (
                          <div className="space-y-1.5 pt-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                              <Sparkles size={11} className="text-[#80011F]" />
                              <span>Customer 3D Customized Mockups</span>
                            </span>
                            <div className="grid grid-cols-2 gap-2 sm:gap-3">
                              {frontImg && (
                                <div className="space-y-1">
                                  <div className="relative aspect-square rounded-lg border border-border bg-white flex items-center justify-center p-1.5 overflow-hidden group">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      src={frontImg}
                                      alt="Front Mockup"
                                      className="max-h-full max-w-full object-contain"
                                    />
                                    <a
                                      href={frontImg}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1.5 text-white font-bold text-xs transition-opacity"
                                    >
                                      <Download size={14} />
                                      <span>View Full</span>
                                    </a>
                                  </div>
                                  <div className="flex items-center justify-between text-[10px] px-1">
                                    <span className="font-bold text-muted-foreground">Front View</span>
                                    <a
                                      href={frontImg}
                                      download={`Order-${selectedOrder.orderNumber}-Front.png`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-[#80011F] hover:underline flex items-center gap-0.5"
                                    >
                                      <Download size={10} /> Save
                                    </a>
                                  </div>
                                </div>
                              )}

                              {backImg && (
                                <div className="space-y-1">
                                  <div className="relative aspect-square rounded-lg border border-border bg-white flex items-center justify-center p-1.5 overflow-hidden group">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      src={backImg}
                                      alt="Back Mockup"
                                      className="max-h-full max-w-full object-contain"
                                    />
                                    <a
                                      href={backImg}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1.5 text-white font-bold text-xs transition-opacity"
                                    >
                                      <Download size={14} />
                                      <span>View Full</span>
                                    </a>
                                  </div>
                                  <div className="flex items-center justify-between text-[10px] px-1">
                                    <span className="font-bold text-muted-foreground">Back View</span>
                                    <a
                                      href={backImg}
                                      download={`Order-${selectedOrder.orderNumber}-Back.png`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-[#80011F] hover:underline flex items-center gap-0.5"
                                    >
                                      <Download size={10} /> Save
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

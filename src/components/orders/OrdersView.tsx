"use client";

import { useState } from "react";
import {
  CheckCircle,
  Clock,
  Eye,
  Package,
  RefreshCw,
  Search,
  ShoppingBag,
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
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground">
                      <Eye size={14} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Order Details Slide-Over Sheet */}
      <Sheet open={Boolean(selectedOrder)} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          {selectedOrder && (
            <div className="space-y-6">
              <SheetHeader>
                <div className="flex items-center gap-2">
                  <Badge className="bg-emerald-600 text-white font-bold">{selectedOrder.status}</Badge>
                  <span className="text-xs text-muted-foreground font-mono">
                    {selectedOrder.orderNumber}
                  </span>
                </div>
                <SheetTitle className="text-lg font-heading font-black pt-1">
                  Order Details
                </SheetTitle>
                <SheetDescription>
                  Placed on {formatDateTime(selectedOrder.createdAt)}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-4 text-xs sm:text-sm divide-y divide-border">
                {/* Customer */}
                <div className="pt-2 space-y-1">
                  <span className="font-bold uppercase tracking-wider text-[11px] text-muted-foreground">
                    Customer Info
                  </span>
                  <p className="font-semibold text-foreground">{selectedOrder.userName || "Customer"}</p>
                  <p className="text-muted-foreground">{selectedOrder.userEmail}</p>
                  {selectedOrder.userPhone && <p className="text-muted-foreground">{selectedOrder.userPhone}</p>}
                </div>

                {/* Items */}
                <div className="pt-3 space-y-2">
                  <span className="font-bold uppercase tracking-wider text-[11px] text-muted-foreground">
                    Purchased Items
                  </span>
                  {(selectedOrder.items || []).map((it, idx) => (
                    <div key={idx} className="rounded-lg bg-muted/40 p-2.5 space-y-1">
                      <p className="font-bold text-foreground">{it.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Color: {it.color} · Size: {it.size} · Qty: {it.qty} pcs
                      </p>
                      {it.customNote && (
                        <p className="text-[11px] text-primary italic">Note: {it.customNote}</p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="pt-3 flex items-center justify-between">
                  <span className="font-bold uppercase tracking-wider text-xs text-muted-foreground">
                    Total Amount Paid
                  </span>
                  <span className="text-lg font-black text-[#80011F]">
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

"use client";

import { useState } from "react";
import {
  Activity,
  Calendar,
  CheckCircle,
  Clock,
  Eye,
  Filter,
  Layers,
  Package,
  RefreshCw,
  Search,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Tag,
  Upload,
  User,
  X,
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
import { useActivities } from "@/hooks/use-activity";
import { formatDateTime } from "@/lib/format";
import type { CustomerActivityItem } from "@/lib/api";

const ACTIVITY_TYPES = [
  { value: "ALL", label: "All Activities" },
  { value: "CART_ADD", label: "Cart Additions" },
  { value: "CART_QTY", label: "Cart Quantity Changes" },
  { value: "CART_REMOVE", label: "Cart Removals" },
  { value: "WISHLIST_ADD", label: "Wishlist Additions" },
  { value: "WISHLIST_REMOVE", label: "Wishlist Removals" },
  { value: "DESIGN_SAVE", label: "Saved Custom Designs" },
  { value: "LOGO_UPLOAD", label: "Uploaded Logos & Art" },
  { value: "CHECKOUT_START", label: "Checkout Starts" },
  { value: "ORDER_PLACED", label: "Orders Placed" },
  { value: "PAYMENT_SUCCESS", label: "Payment Success" },
  { value: "LOGIN", label: "Customer Logins" },
  { value: "REGISTER", label: "New Registrations" },
];

function getActivityBadge(type: string) {
  switch (type) {
    case "ORDER_PLACED":
    case "PAYMENT_SUCCESS":
      return <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">Order Placed</Badge>;
    case "CART_ADD":
      return <Badge className="bg-amber-600 hover:bg-amber-700 text-white font-bold">Cart Add</Badge>;
    case "CART_QTY":
      return <Badge className="bg-amber-500 hover:bg-amber-600 text-white">Cart Qty</Badge>;
    case "CART_REMOVE":
      return <Badge variant="destructive">Cart Remove</Badge>;
    case "DESIGN_SAVE":
      return <Badge className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold">Design Saved</Badge>;
    case "LOGO_UPLOAD":
      return <Badge className="bg-purple-600 hover:bg-purple-700 text-white font-bold">Logo Uploaded</Badge>;
    case "WISHLIST_ADD":
      return <Badge className="bg-rose-600 hover:bg-rose-700 text-white">Wishlist +</Badge>;
    case "WISHLIST_REMOVE":
      return <Badge variant="outline" className="text-gray-500">Wishlist -</Badge>;
    case "CHECKOUT_START":
      return <Badge className="bg-blue-600 hover:bg-blue-700 text-white font-bold">Checkout</Badge>;
    case "LOGIN":
      return <Badge variant="secondary" className="font-medium">User Login</Badge>;
    case "REGISTER":
      return <Badge className="bg-teal-600 hover:bg-teal-700 text-white font-bold">New Account</Badge>;
    default:
      return <Badge variant="outline">{type}</Badge>;
  }
}

export function ActivitiesView() {
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("ALL");
  const [selectedActivity, setSelectedActivity] = useState<CustomerActivityItem | null>(null);

  const { data, isLoading, isFetching, refetch } = useActivities({
    search: search.trim() || undefined,
    activityType: selectedType === "ALL" ? undefined : selectedType,
    limit: 100,
  });

  const items = data?.items ?? [];
  const typeSummary = data?.typeSummary ?? {};

  const cartCount =
    (typeSummary["CART_ADD"] || 0) +
    (typeSummary["CART_QTY"] || 0) +
    (typeSummary["CART_REMOVE"] || 0);

  const designCount =
    (typeSummary["DESIGN_SAVE"] || 0) + (typeSummary["LOGO_UPLOAD"] || 0);

  const orderCount =
    (typeSummary["ORDER_PLACED"] || 0) + (typeSummary["PAYMENT_SUCCESS"] || 0);

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
        <PageHeader
          title="Customer Activity Management"
          description="Centralized real-time monitoring of all customer cart, customization, wishlist, and checkout activities."
        />
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200 shadow-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            LIVE FEED
          </span>
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

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
        <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Events</span>
            <Activity size={16} className="text-primary" />
          </div>
          <p className="mt-2 text-2xl font-black text-foreground">{data?.total ?? 0}</p>
          <p className="text-[11px] text-muted-foreground">Active customer interactions</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Cart Actions</span>
            <ShoppingCart size={16} className="text-amber-500" />
          </div>
          <p className="mt-2 text-2xl font-black text-foreground">{cartCount}</p>
          <p className="text-[11px] text-muted-foreground">Adds, updates & removals</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Custom Designs</span>
            <Sparkles size={16} className="text-purple-500" />
          </div>
          <p className="mt-2 text-2xl font-black text-foreground">{designCount}</p>
          <p className="text-[11px] text-muted-foreground">Logos & custom T-shirts saved</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Orders & Checkout</span>
            <ShoppingBag size={16} className="text-emerald-500" />
          </div>
          <p className="mt-2 text-2xl font-black text-foreground">{orderCount}</p>
          <p className="text-[11px] text-muted-foreground">Successful customer orders</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between mb-4">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer name, email, product or order ID..."
            className="pl-9 text-xs sm:text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-48 text-xs font-medium">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ACTIVITY_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value} className="text-xs font-medium">
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {(search || selectedType !== "ALL") && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setSearch("");
                setSelectedType("ALL");
              }}
              className="text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Activity Table */}
      {isLoading ? (
        <Skeleton className="h-80 rounded-xl" />
      ) : items.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="No customer activities found"
          description="Customer actions like add to cart, design customization, and orders will appear here automatically in real time."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-background shadow-xs">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead>Customer</TableHead>
                <TableHead>Activity</TableHead>
                <TableHead>Product / Order</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Time</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((act) => {
                const details = act.details || {};
                const summary =
                  details.color || details.size
                    ? `${details.color || ""} ${details.size ? `(${details.size})` : ""}`
                    : details.amount
                    ? `₹${Number(details.amount).toLocaleString("en-IN")}`
                    : details.fileName
                    ? `File: ${details.fileName}`
                    : null;

                return (
                  <TableRow
                    key={act.id}
                    className="cursor-pointer transition-colors hover:bg-muted/30"
                    onClick={() => setSelectedActivity(act)}
                  >
                    <TableCell>
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground text-xs sm:text-sm">
                          {act.userName || "Guest Customer"}
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {act.userEmail || (act.userId ? `ID: ${act.userId.slice(0, 8)}...` : "Guest Session")}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{getActivityBadge(act.activityType)}</TableCell>
                    <TableCell>
                      {act.productName ? (
                        <p className="text-xs font-medium text-foreground max-w-56 truncate">
                          {act.productName}
                        </p>
                      ) : act.orderId ? (
                        <p className="text-xs font-mono font-bold text-accent">
                          {act.orderId}
                        </p>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {summary ? (
                        <span className="text-xs text-foreground/80 font-medium">{summary}</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                      {formatDateTime(act.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground">
                        <Eye size={14} />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Activity Details Slide-Over Sheet */}
      <Sheet open={Boolean(selectedActivity)} onOpenChange={(open) => !open && setSelectedActivity(null)}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          {selectedActivity && (
            <div className="space-y-6">
              <SheetHeader>
                <div className="flex items-center gap-2">
                  {getActivityBadge(selectedActivity.activityType)}
                  <span className="text-xs text-muted-foreground">
                    {formatDateTime(selectedActivity.createdAt)}
                  </span>
                </div>
                <SheetTitle className="text-lg font-heading font-black pt-1">
                  Customer Activity Details
                </SheetTitle>
                <SheetDescription>
                  Detailed activity record stored securely for administrative monitoring.
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-4 text-xs sm:text-sm divide-y divide-border">
                {/* Customer Info */}
                <div className="pt-2 space-y-1.5">
                  <span className="font-bold uppercase tracking-wider text-[11px] text-muted-foreground">
                    Customer Information
                  </span>
                  <p className="font-semibold text-foreground">
                    {selectedActivity.userName || "Guest Customer"}
                  </p>
                  <p className="text-muted-foreground">{selectedActivity.userEmail || "No email provided"}</p>
                  {selectedActivity.userId && (
                    <p className="text-[11px] font-mono text-muted-foreground">
                      User ID: {selectedActivity.userId}
                    </p>
                  )}
                  {selectedActivity.ipAddress && (
                    <p className="text-[11px] text-muted-foreground">
                      IP Address: {selectedActivity.ipAddress}
                    </p>
                  )}
                </div>

                {/* Target Entity */}
                <div className="pt-3 space-y-1.5">
                  <span className="font-bold uppercase tracking-wider text-[11px] text-muted-foreground">
                    Product / Order Reference
                  </span>
                  {selectedActivity.productName && (
                    <p className="font-semibold text-foreground">{selectedActivity.productName}</p>
                  )}
                  {selectedActivity.productId && (
                    <p className="text-xs text-muted-foreground font-mono">
                      Slug: {selectedActivity.productId}
                    </p>
                  )}
                  {selectedActivity.orderId && (
                    <p className="font-mono font-bold text-accent">Order ID: {selectedActivity.orderId}</p>
                  )}
                </div>

                {/* Event Details Payload */}
                <div className="pt-3 space-y-1.5">
                  <span className="font-bold uppercase tracking-wider text-[11px] text-muted-foreground">
                    Activity Metadata
                  </span>
                  <pre className="rounded-lg bg-muted p-3 text-[11px] font-mono whitespace-pre-wrap overflow-x-auto text-foreground">
                    {JSON.stringify(selectedActivity.details || {}, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}

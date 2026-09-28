"use client";

import Link from "next/link";
import {
  ArrowRight,
  BadgePercent,
  Inbox,
  Layers,
  Mail,
  MessageSquareQuote,
  Package,
  Plus,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useDashboard } from "@/hooks/use-people";
import { useAuth } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";

export function DashboardView() {
  const { user } = useAuth();
  const { data, isLoading } = useDashboard();

  const tiles = data
    ? [
        { label: "Active products", value: data.products.active, sub: `${data.products.inactive} inactive`, icon: Package, href: "/products" },
        { label: "Collections", value: data.collections, sub: "+ 3 automatic", icon: Layers, href: "/collections" },
        { label: "Live promotions", value: data.promotions.live, sub: `${data.promotions.total} total`, icon: BadgePercent, href: "/promotions" },
        { label: "New enquiries", value: data.enquiries.new, sub: `${data.enquiries.contacted} contacted · ${data.enquiries.closed} closed`, icon: Inbox, href: "/enquiries" },
        { label: "Customers", value: data.customers, sub: "registered accounts", icon: Users, href: "/customers" },
        { label: "Subscribers", value: data.subscribers, sub: "newsletter", icon: Mail, href: "/newsletter" },
        { label: "Published reviews", value: data.reviews.published, sub: `${data.reviews.unpublished} unpublished`, icon: MessageSquareQuote, href: "/reviews" },
      ]
    : [];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}</h2>
          <p className="mt-1 text-sm text-muted-foreground">Here&apos;s what&apos;s happening across the TeesZone store.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/promotions/new">
              <BadgePercent /> New promotion
            </Link>
          </Button>
          <Button asChild>
            <Link href="/products/new">
              <Plus /> New product
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {isLoading || !data
          ? Array.from({ length: 7 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)
          : tiles.map((t) => (
              <Link key={t.label} href={t.href} className="group">
                <Card className="h-full transition-colors group-hover:border-primary/40">
                  <CardContent className="flex items-start justify-between pt-1">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t.label}</p>
                      <p className="mt-2 font-heading text-3xl font-bold">{t.value}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{t.sub}</p>
                    </div>
                    <span className="flex size-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                      <t.icon size={18} />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent enquiries</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/enquiries">
                All enquiries <ArrowRight />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading || !data ? (
              <Skeleton className="h-40" />
            ) : data.recentEnquiries.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No enquiries yet — leads from the quote form land here.</p>
            ) : (
              <ul className="divide-y divide-border">
                {data.recentEnquiries.map((e) => (
                  <li key={e.id} className="flex items-start justify-between gap-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {e.name}
                        {e.company && <span className="text-muted-foreground"> · {e.company}</span>}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {e.productName ?? "General enquiry"}
                        {e.quantity && ` · ${e.quantity}`} · {formatDateTime(e.createdAt)}
                      </p>
                    </div>
                    <StatusBadge status={e.status} />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>New customers</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/customers">
                All customers <ArrowRight />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading || !data ? (
              <Skeleton className="h-40" />
            ) : data.recentCustomers.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No customer accounts yet.</p>
            ) : (
              <ul className="divide-y divide-border">
                {data.recentCustomers.map((c) => (
                  <li key={c.id} className="flex items-center justify-between gap-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{c.name || "—"}</p>
                      <p className="truncate text-xs text-muted-foreground">{c.email}</p>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">{formatDateTime(c.createdAt)}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

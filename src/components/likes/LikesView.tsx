"use client";

import { useMemo, useState } from "react";
import { Heart, Search, Users, Package, ExternalLink, Sparkles } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { useLikes } from "@/hooks/use-catalog";
import { formatDateTime, storeUrl } from "@/lib/format";
import type { UserProductLike } from "@/lib/types";

export function LikesView() {
  const { data: likes, isLoading, error } = useLikes();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!likes) return [];
    if (!query.trim()) return likes;
    const q = query.toLowerCase();
    return likes.filter(
      (l) =>
        l.userName.toLowerCase().includes(q) ||
        l.userEmail.toLowerCase().includes(q) ||
        l.productName.toLowerCase().includes(q) ||
        l.productSlug.toLowerCase().includes(q),
    );
  }, [likes, query]);

  const stats = useMemo(() => {
    if (!likes) return { totalLikes: 0, uniqueUsers: 0, uniqueProducts: 0, topProduct: "—" };
    const users = new Set(likes.map((l) => l.userId));
    const prods = new Set(likes.map((l) => l.productSlug));

    // calculate top product
    const counts: Record<string, { count: number; name: string }> = {};
    for (const l of likes) {
      if (!counts[l.productSlug]) counts[l.productSlug] = { count: 0, name: l.productName };
      counts[l.productSlug].count += 1;
    }
    const top = Object.values(counts).sort((a, b) => b.count - a.count)[0];

    return {
      totalLikes: likes.length,
      uniqueUsers: users.size,
      uniqueProducts: prods.size,
      topProduct: top ? `${top.name} (${top.count})` : "—",
    };
  }, [likes]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer Product Likes & Wishlists"
        description="Monitor which customers liked which products in real-time. Each customer sees only their own likes on the storefront."
      />

      {/* Summary KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Likes
            </CardTitle>
            <Heart className="size-4 text-red-500 fill-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLikes}</div>
            <p className="text-xs text-muted-foreground mt-1">Across all registered customers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Interested Customers
            </CardTitle>
            <Users className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uniqueUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">Unique shoppers with saved items</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Products Saved
            </CardTitle>
            <Package className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uniqueProducts}</div>
            <p className="text-xs text-muted-foreground mt-1">Catalog items added to wishlists</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Most Liked Item
            </CardTitle>
            <Sparkles className="size-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="truncate text-base font-bold text-foreground" title={stats.topProduct}>
              {stats.topProduct}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Leading wishlist favorite</p>
          </CardContent>
        </Card>
      </div>

      {/* Search Filter */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by customer name, email, or product..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        {query && (
          <button
            onClick={() => setQuery("")}
            className="text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            Clear
          </button>
        )}
      </div>

      {/* Data Table */}
      <div className="rounded-md border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Liked Product</TableHead>
              <TableHead className="w-[180px]">Date Liked</TableHead>
              <TableHead className="w-[100px] text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center">
                  <EmptyState
                    icon={Heart}
                    title="No customer likes found"
                    description={
                      query
                        ? "No results matched your search query."
                        : "Customers have not added products to their wishlists yet."
                    }
                  />
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((l: UserProductLike) => (
                <TableRow key={l.id}>
                  <TableCell>
                    <div className="font-medium text-foreground">{l.userName}</div>
                    {l.userCompany && l.userCompany !== "—" && (
                      <div className="text-xs text-muted-foreground">{l.userCompany}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{l.userEmail}</div>
                    {l.userPhone && l.userPhone !== "—" && (
                      <div className="text-xs text-muted-foreground">{l.userPhone}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Heart className="size-3.5 text-red-500 fill-red-500 shrink-0" />
                      <div>
                        <div className="font-medium text-foreground">{l.productName}</div>
                        <div className="text-xs text-muted-foreground">{l.productSlug}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDateTime(l.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <a
                      href={storeUrl(`/products/${l.productSlug}`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                    >
                      View
                      <ExternalLink className="size-3" />
                    </a>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

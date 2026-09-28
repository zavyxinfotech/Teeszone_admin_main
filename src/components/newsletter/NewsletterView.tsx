"use client";

import { Download, Mail } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ServerPagination } from "@/components/data-table/ServerPagination";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";
import { useSubscribers } from "@/hooks/use-people";
import { newsletterApi } from "@/lib/api";
import { formatDateTime } from "@/lib/format";

const LIMIT = 50;

export function NewsletterView() {
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState(false);
  const { data, isLoading } = useSubscribers({ page, limit: LIMIT });
  const items = data?.items ?? [];

  // Pull every page and hand the browser a CSV.
  const exportCsv = async () => {
    setExporting(true);
    try {
      const rows: string[] = ["email,subscribed_at"];
      let p = 1;
      for (;;) {
        const chunk = await newsletterApi.list({ page: p, limit: 200 });
        rows.push(...chunk.items.map((s) => `${s.email},${s.createdAt}`));
        if (p * 200 >= chunk.total) break;
        p += 1;
      }
      const blob = new Blob([rows.join("\n")], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `teeszone-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Newsletter"
        description="Emails collected by the storefront footer form."
        actions={
          <Button variant="outline" onClick={exportCsv} disabled={exporting || !data?.total}>
            <Download /> {exporting ? "Exporting…" : "Export CSV"}
          </Button>
        }
      />
      {isLoading ? (
        <Skeleton className="h-64" />
      ) : items.length === 0 ? (
        <EmptyState icon={Mail} title="No subscribers yet" />
      ) : (
        <div className="space-y-3">
          <div className="overflow-x-auto rounded-lg border border-border bg-background">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/60 hover:bg-muted/60">
                  <TableHead>Email</TableHead>
                  <TableHead>Subscribed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.email}</TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">{formatDateTime(s.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <ServerPagination page={page} limit={LIMIT} total={data?.total ?? 0} onPage={setPage} />
        </div>
      )}
    </>
  );
}

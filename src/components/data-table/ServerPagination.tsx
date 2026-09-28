"use client";

import { Button } from "@/components/ui/button";

// Pagination for endpoints that page server-side (enquiries, customers, newsletter).
export function ServerPagination({
  page,
  limit,
  total,
  onPage,
}: {
  page: number;
  limit: number;
  total: number;
  onPage: (page: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(total / limit));
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
      <p>
        {total === 0 ? "0 results" : `${(page - 1) * limit + 1}–${Math.min(page * limit, total)} of ${total}`}
      </p>
      <div className="flex items-center gap-2">
        <span>
          Page {page} of {pages}
        </span>
        <Button variant="outline" size="sm" onClick={() => onPage(page - 1)} disabled={page <= 1}>
          Previous
        </Button>
        <Button variant="outline" size="sm" onClick={() => onPage(page + 1)} disabled={page >= pages}>
          Next
        </Button>
      </div>
    </div>
  );
}

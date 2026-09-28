"use client";

import { Inbox, MessageCircle, Phone } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ServerPagination } from "@/components/data-table/ServerPagination";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PageHeader } from "@/components/layout/PageHeader";
import { useEnquiries, useUpdateEnquiryStatus } from "@/hooks/use-people";
import { formatDateTime } from "@/lib/format";
import type { Enquiry, EnquiryStatus } from "@/lib/types";

const LIMIT = 20;
const STATUSES: EnquiryStatus[] = ["NEW", "CONTACTED", "CLOSED"];

// Indian numbers: keep digits, add 91 when a bare 10-digit number was entered.
const waHref = (phone: string, e: Enquiry) => {
  const digits = phone.replace(/\D/g, "");
  const intl = digits.length === 10 ? `91${digits}` : digits;
  const text = `Hi ${e.name}, this is TeesZone. Thanks for your enquiry${e.productName ? ` about ${e.productName}` : ""}${e.quantity ? ` (${e.quantity})` : ""}.`;
  return `https://wa.me/${intl}?text=${encodeURIComponent(text)}`;
};

function StatusSelect({ enquiry }: { enquiry: Enquiry }) {
  const update = useUpdateEnquiryStatus();
  return (
    <Select value={enquiry.status} onValueChange={(v) => update.mutate({ id: enquiry.id, status: v as EnquiryStatus })}>
      <SelectTrigger size="sm" className="w-36" onClick={(e) => e.stopPropagation()}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STATUSES.map((s) => (
          <SelectItem key={s} value={s} className="capitalize">{s.toLowerCase()}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function EnquiriesView() {
  const [tab, setTab] = useState<"ALL" | EnquiryStatus>("NEW");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Enquiry | null>(null);
  const { data, isLoading } = useEnquiries({ status: tab === "ALL" ? undefined : tab, page, limit: LIMIT });
  const items = data?.items ?? [];

  return (
    <>
      <PageHeader title="Enquiries" description="Quote requests from the storefront contact form. Reply on WhatsApp and move them along." />
      <Tabs value={tab} onValueChange={(v) => { setTab(v as typeof tab); setPage(1); }} className="mb-4">
        <TabsList>
          <TabsTrigger value="NEW">New</TabsTrigger>
          <TabsTrigger value="CONTACTED">Contacted</TabsTrigger>
          <TabsTrigger value="CLOSED">Closed</TabsTrigger>
          <TabsTrigger value="ALL">All</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <Skeleton className="h-64" />
      ) : items.length === 0 ? (
        <EmptyState icon={Inbox} title={tab === "ALL" ? "No enquiries yet" : `No ${tab.toLowerCase()} enquiries`} description="Leads from the quote form show up here the moment they're submitted." />
      ) : (
        <div className="space-y-3">
          <div className="overflow-x-auto rounded-lg border border-border bg-background">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/60 hover:bg-muted/60">
                  <TableHead>Lead</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Received</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((e) => (
                  <TableRow key={e.id} className="cursor-pointer" onClick={() => setSelected(e)}>
                    <TableCell>
                      <p className="font-medium">{e.name}</p>
                      <p className="text-xs text-muted-foreground">{e.company ? `${e.company} · ` : ""}{e.phone}</p>
                    </TableCell>
                    <TableCell className="max-w-56 truncate">{e.productName ?? <span className="text-muted-foreground">General</span>}</TableCell>
                    <TableCell>{e.quantity ?? "—"}</TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">{formatDateTime(e.createdAt)}</TableCell>
                    <TableCell><StatusSelect enquiry={e} /></TableCell>
                    <TableCell>
                      <Button asChild size="sm" variant="outline" className="text-whatsapp" onClick={(ev) => ev.stopPropagation()}>
                        <a href={waHref(e.phone, e)} target="_blank" rel="noopener noreferrer"><MessageCircle /> WhatsApp</a>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <ServerPagination page={page} limit={LIMIT} total={data?.total ?? 0} onPage={setPage} />
        </div>
      )}

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle>{selected.name}</SheetTitle>
                <SheetDescription>{formatDateTime(selected.createdAt)}</SheetDescription>
              </SheetHeader>
              <div className="space-y-5 px-4 pb-6">
                <div className="flex items-center gap-2">
                  <StatusBadge status={selected.status} />
                  <StatusSelect enquiry={selected} />
                </div>
                <dl className="grid grid-cols-[110px_1fr] gap-y-2 text-sm">
                  <dt className="text-muted-foreground">Company</dt><dd>{selected.company ?? "—"}</dd>
                  <dt className="text-muted-foreground">Phone</dt><dd><a href={`tel:${selected.phone}`} className="inline-flex items-center gap-1 hover:text-primary"><Phone size={13} />{selected.phone}</a></dd>
                  <dt className="text-muted-foreground">Product</dt><dd>{selected.productName ?? "General enquiry"}{selected.productId ? <Badge variant="outline" className="ml-2">linked</Badge> : null}</dd>
                  <dt className="text-muted-foreground">Quantity</dt><dd>{selected.quantity ?? "—"}</dd>
                </dl>
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Message</p>
                  <p className="rounded-md border border-border bg-muted/40 p-3 text-sm whitespace-pre-wrap">{selected.message ?? "—"}</p>
                </div>
                <Button asChild className="w-full bg-whatsapp text-white hover:bg-whatsapp/90">
                  <a href={waHref(selected.phone, selected)} target="_blank" rel="noopener noreferrer"><MessageCircle /> Reply on WhatsApp</a>
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}

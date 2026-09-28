"use client";

import { KeyRound, MapPin, Search, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ServerPagination } from "@/components/data-table/ServerPagination";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";
import { useCustomer, useCustomers } from "@/hooks/use-people";
import { formatDate, formatDateTime } from "@/lib/format";
import type { Customer } from "@/lib/types";

const LIMIT = 20;

function useDebounced<T>(value: T, ms = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

function SignInMethods({ c }: { c: Pick<Customer, "hasPassword" | "googleLinked"> }) {
  return (
    <div className="flex gap-1">
      {c.hasPassword && <Badge variant="outline" className="font-normal">Password</Badge>}
      {c.googleLinked && <Badge variant="outline" className="font-normal">Google</Badge>}
      {!c.hasPassword && !c.googleLinked && <span className="text-xs text-muted-foreground">—</span>}
    </div>
  );
}

function CustomerSheet({ id, onClose }: { id: string | null; onClose: () => void }) {
  const { data, isLoading } = useCustomer(id ?? undefined);
  return (
    <Sheet open={!!id} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        {isLoading || !data ? (
          <div className="space-y-3 p-4"><Skeleton className="h-6 w-40" /><Skeleton className="h-4 w-64" /><Skeleton className="h-32" /></div>
        ) : (
          <>
            <SheetHeader>
              <SheetTitle>{data.name || "Unnamed customer"}</SheetTitle>
              <SheetDescription>Joined {formatDateTime(data.createdAt)}</SheetDescription>
            </SheetHeader>
            <div className="space-y-5 px-4 pb-6">
              <dl className="grid grid-cols-[100px_1fr] gap-y-2 text-sm">
                <dt className="text-muted-foreground">Email</dt><dd className="break-all">{data.email || "—"}</dd>
                <dt className="text-muted-foreground">Phone</dt><dd>{data.phone || "—"}</dd>
                <dt className="text-muted-foreground">Role</dt><dd><Badge variant={data.role === "ADMIN" ? "default" : "outline"}>{data.role}</Badge></dd>
                <dt className="text-muted-foreground">Sign-in</dt><dd><SignInMethods c={data} /></dd>
              </dl>
              <div>
                <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground"><MapPin size={13} /> Addresses ({data.addresses.length})</p>
                {data.addresses.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No saved addresses.</p>
                ) : (
                  <ul className="space-y-2">
                    {data.addresses.map((a) => (
                      <li key={a.id} className="rounded-md border border-border p-3 text-sm">
                        <p className="flex items-center justify-between font-medium">
                          {a.fullName}
                          <span className="flex gap-1">
                            <Badge variant="outline" className="font-normal capitalize">{a.type.toLowerCase()}</Badge>
                            {a.isDefault && <Badge className="font-normal">Default</Badge>}
                          </span>
                        </p>
                        <p className="mt-1 text-muted-foreground">{a.line1}{a.line2 ? `, ${a.line2}` : ""}</p>
                        <p className="text-muted-foreground">{a.city}, {a.state} {a.pincode} · {a.phone}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><KeyRound size={12} /> Passwords can&apos;t be viewed or changed here; customers reset them from the storefront.</p>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

export function CustomersView() {
  const [q, setQ] = useState("");
  const [role, setRole] = useState("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string | null>(null);
  const dq = useDebounced(q);
  const { data, isLoading } = useCustomers({ q: dq || undefined, role: role === "all" ? undefined : (role as "CUSTOMER" | "ADMIN"), page, limit: LIMIT });
  const items = data?.items ?? [];

  return (
    <>
      <PageHeader title="Customers" description="Accounts registered on the storefront (email/password or Google)." />
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-72">
          <Search size={15} className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search name, email, phone…" className="pl-8" />
        </div>
        <Select value={role} onValueChange={(v) => { setRole(v); setPage(1); }}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            <SelectItem value="CUSTOMER">Customers</SelectItem>
            <SelectItem value="ADMIN">Admins</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <Skeleton className="h-64" />
      ) : items.length === 0 ? (
        <EmptyState icon={Users} title="No customers found" description={dq ? "Try a different search." : "Accounts appear here once people register on the storefront."} />
      ) : (
        <div className="space-y-3">
          <div className="overflow-x-auto rounded-lg border border-border bg-background">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/60 hover:bg-muted/60">
                  <TableHead>Customer</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Sign-in</TableHead>
                  <TableHead>Addresses</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((c) => (
                  <TableRow key={c.id} className="cursor-pointer" onClick={() => setSelected(c.id)}>
                    <TableCell>
                      <p className="font-medium">{c.name || "—"}</p>
                      <p className="text-xs text-muted-foreground">{c.email}</p>
                    </TableCell>
                    <TableCell>{c.phone || "—"}</TableCell>
                    <TableCell><SignInMethods c={c} /></TableCell>
                    <TableCell>{c.addressCount}</TableCell>
                    <TableCell><Badge variant={c.role === "ADMIN" ? "default" : "outline"}>{c.role}</Badge></TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">{formatDate(c.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <ServerPagination page={page} limit={LIMIT} total={data?.total ?? 0} onPage={setPage} />
        </div>
      )}
      <CustomerSheet id={selected} onClose={() => setSelected(null)} />
    </>
  );
}

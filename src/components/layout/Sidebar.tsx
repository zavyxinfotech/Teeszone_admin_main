"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { storeUrl } from "@/lib/format";
import { NAV } from "./nav";

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-1 flex-col gap-5 overflow-y-auto px-3 py-4">
      {NAV.map((group) => (
        <div key={group.title}>
          <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            {group.title}
          </p>
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <item.icon size={17} className={cn(active ? "text-primary" : "text-muted-foreground")} />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
      <div className="mt-auto border-t border-sidebar-border pt-4">
        <a
          href={storeUrl("/")}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-sidebar-foreground hover:bg-muted hover:text-foreground"
        >
          <ExternalLink size={16} className="text-muted-foreground" />
          View storefront
        </a>
      </div>
    </nav>
  );
}

export function SidebarBrand() {
  return (
    <Link href="/" className="flex h-16 items-center gap-2 border-b border-sidebar-border px-5">
      <Image src="/logo.png" alt="TeesZone" width={120} height={36} className="h-8 w-auto" priority />
      <span className="rounded bg-ink px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
        Admin
      </span>
    </Link>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
      <SidebarBrand />
      <SidebarNav />
    </aside>
  );
}

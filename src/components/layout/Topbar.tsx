"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut, Menu, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useAuth } from "@/lib/auth";
import { pageTitle } from "./nav";
import { SidebarBrand, SidebarNav } from "./Sidebar";

export function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur sm:px-6">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
        <Menu />
      </Button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <div className="flex h-full flex-col bg-sidebar">
            <SidebarBrand />
            <SidebarNav onNavigate={() => setOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>

      <h1 className="text-base font-semibold sm:text-lg">{pageTitle(pathname)}</h1>

      <div className="ml-auto flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <span className="flex size-5 items-center justify-center rounded-full bg-accent text-accent-foreground">
                <UserRound size={12} />
              </span>
              <span className="hidden max-w-40 truncate sm:inline">{user?.name || user?.email}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <p className="text-sm font-medium">{user?.name || "Admin"}</p>
              <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                logout();
                router.replace("/login");
              }}
            >
              <LogOut />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

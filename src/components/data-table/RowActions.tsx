"use client";

import { MoreHorizontal } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface RowAction {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  destructive?: boolean;
  disabled?: boolean;
}

export function RowActions({ actions }: { actions: RowAction[] }) {
  const main = actions.filter((a) => !a.destructive);
  const danger = actions.filter((a) => a.destructive);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label="Row actions" onClick={(e) => e.stopPropagation()}>
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
        {main.map((a) => (
          <DropdownMenuItem key={a.label} onClick={a.onClick} disabled={a.disabled}>
            {a.icon}
            {a.label}
          </DropdownMenuItem>
        ))}
        {danger.length > 0 && main.length > 0 && <DropdownMenuSeparator />}
        {danger.map((a) => (
          <DropdownMenuItem key={a.label} variant="destructive" onClick={a.onClick} disabled={a.disabled}>
            {a.icon}
            {a.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

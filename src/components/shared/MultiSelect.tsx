"use client";

import { Check, ChevronsUpDown, X } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface MultiSelectOption {
  value: string;
  label: string;
  group?: string;
  hint?: string;
}

// Searchable multi-select (Popover + Command) for collections / products.
export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = "Select…",
  emptyText = "No matches.",
}: {
  options: MultiSelectOption[];
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  emptyText?: string;
}) {
  const [open, setOpen] = useState(false);
  const byValue = new Map(options.map((o) => [o.value, o]));
  const groups = Array.from(new Set(options.map((o) => o.group ?? "")));

  const toggle = (v: string) => onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between font-normal">
            <span className="truncate text-muted-foreground">
              {value.length ? `${value.length} selected` : placeholder}
            </span>
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] min-w-72 p-0" align="start">
          <Command>
            <CommandInput placeholder="Search…" />
            <CommandList>
              <CommandEmpty>{emptyText}</CommandEmpty>
              {groups.map((g) => (
                <CommandGroup key={g || "_"} heading={g || undefined}>
                  {options
                    .filter((o) => (o.group ?? "") === g)
                    .map((o) => {
                      const selected = value.includes(o.value);
                      return (
                        <CommandItem key={o.value} value={`${o.label} ${o.value}`} onSelect={() => toggle(o.value)}>
                          <span
                            className={cn(
                              "flex size-4 items-center justify-center rounded border border-border",
                              selected && "border-primary bg-primary text-primary-foreground",
                            )}
                          >
                            {selected && <Check size={11} />}
                          </span>
                          <span className="flex-1 truncate">{o.label}</span>
                          {o.hint && <span className="text-xs text-muted-foreground">{o.hint}</span>}
                        </CommandItem>
                      );
                    })}
                </CommandGroup>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((v) => (
            <Badge key={v} variant="secondary" className="gap-1 pr-1 font-medium">
              {byValue.get(v)?.label ?? v}
              <button
                type="button"
                aria-label={`Remove ${v}`}
                onClick={() => toggle(v)}
                className="rounded-full p-0.5 hover:bg-foreground/10"
              >
                <X size={12} />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

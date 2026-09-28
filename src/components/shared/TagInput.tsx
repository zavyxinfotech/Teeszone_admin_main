"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Ordered list of strings as removable chips. Enter / comma adds; presets
// offer one-click values (sizes).
export function TagInput({
  value,
  onChange,
  placeholder = "Type and press Enter",
  presets = [],
  id,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  presets?: string[];
  id?: string;
}) {
  const [draft, setDraft] = useState("");

  const add = (raw: string) => {
    const v = raw.trim();
    if (!v || value.includes(v)) return;
    onChange([...value, v]);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {value.map((v) => (
          <Badge key={v} variant="secondary" className="gap-1 pr-1 text-sm font-medium">
            {v}
            <button
              type="button"
              aria-label={`Remove ${v}`}
              onClick={() => onChange(value.filter((x) => x !== v))}
              className="rounded-full p-0.5 hover:bg-foreground/10"
            >
              <X size={12} />
            </button>
          </Badge>
        ))}
        {value.length === 0 && <span className="text-xs text-muted-foreground">Nothing added yet.</span>}
      </div>
      <div className="flex gap-2">
        <Input
          id={id}
          value={draft}
          placeholder={placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              add(draft);
              setDraft("");
            }
          }}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            add(draft);
            setDraft("");
          }}
        >
          Add
        </Button>
      </div>
      {presets.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {presets
            .filter((p) => !value.includes(p))
            .map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => add(p)}
                className="rounded border border-dashed border-border px-2 py-0.5 text-xs text-muted-foreground hover:border-primary hover:text-primary"
              >
                + {p}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}

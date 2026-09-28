import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const TONES: Record<string, string> = {
  live: "bg-emerald-50 text-emerald-700 border-emerald-200",
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  published: "bg-emerald-50 text-emerald-700 border-emerald-200",
  scheduled: "bg-sky-50 text-sky-700 border-sky-200",
  new: "bg-accent text-accent-foreground border-primary/20",
  contacted: "bg-gold-soft text-amber-800 border-amber-200",
  expired: "bg-muted text-muted-foreground border-border",
  inactive: "bg-muted text-muted-foreground border-border",
  closed: "bg-muted text-muted-foreground border-border",
  draft: "bg-muted text-muted-foreground border-border",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const key = status.toLowerCase();
  return (
    <Badge variant="outline" className={cn("font-medium capitalize", TONES[key], className)}>
      {key}
    </Badge>
  );
}

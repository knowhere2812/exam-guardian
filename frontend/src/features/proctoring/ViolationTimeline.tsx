import { cn } from "@/lib/utils";
import { violationLabels, type ViolationEvent } from "@/data/mockData";
import { formatTime } from "@/utils/format";
import { ShieldCheck } from "lucide-react";

export function ViolationTimeline({
  events,
  onSelect,
  selectedId,
  className,
}: {
  events: ViolationEvent[];
  onSelect?: ((event: ViolationEvent) => void) | undefined;
  selectedId?: string | undefined;
  className?: string | undefined;
}) {
  if (events.length === 0) {
    return (
      <div className={cn("flex items-center gap-3 rounded-xl border border-border bg-success-soft/60 p-4", className)}>
        <ShieldCheck className="size-5 text-success" />
        <p className="text-sm text-foreground">No potential violations recorded for this session.</p>
      </div>
    );
  }

  return (
    <ol className={cn("relative space-y-3 pl-6", className)}>
      <span className="absolute left-2 top-2 bottom-2 w-px bg-border" aria-hidden />
      {events.map((event) => {
        const dot =
          event.severity === "high" ? "bg-destructive" : event.severity === "medium" ? "bg-warning" : "bg-primary";
        const selected = selectedId === event.id;
        return (
          <li key={event.id} className="relative">
            <span className={cn("absolute -left-[18px] top-3 size-2.5 rounded-full ring-4 ring-card", dot)} />
            <button
              type="button"
              onClick={() => onSelect?.(event)}
              className={cn(
                "w-full rounded-xl border border-border bg-card p-3 text-left transition-colors",
                onSelect && "hover:border-primary/40 hover:bg-primary-soft/40",
                selected && "border-primary/50 bg-primary-soft/60",
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-foreground">{violationLabels[event.type]}</p>
                <span className="text-xs tabular-nums text-muted-foreground">{formatTime(event.at)}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{event.note}</p>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

import { FileText, ImageIcon, ScanFace } from "lucide-react";
import { cn } from "@/lib/utils";
import { violationLabels, type ViolationEvent } from "@/data/mockData";
import { formatDateTime } from "@/utils/format";

export function EvidenceViewer({ event, className }: { event?: ViolationEvent; className?: string }) {
  if (!event) {
    return (
      <div
        className={cn(
          "flex h-full min-h-56 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-surface p-6 text-center",
          className,
        )}
      >
        <ImageIcon className="size-6 text-muted-foreground" />
        <p className="text-sm font-medium text-foreground">No evidence selected</p>
        <p className="text-xs text-muted-foreground">Select an event from the timeline to inspect its evidence.</p>
      </div>
    );
  }

  const isSnapshot = event.evidence?.kind === "snapshot";

  return (
    <div className={cn("rounded-2xl border border-border bg-card p-4 shadow-card", className)}>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-foreground">{violationLabels[event.type]}</h3>
        <span className="text-xs text-muted-foreground">{formatDateTime(event.at)}</span>
      </div>

      <div className="mt-3 overflow-hidden rounded-xl border border-border bg-secondary">
        {isSnapshot ? (
          <div className="flex h-48 flex-col items-center justify-center gap-2 bg-[radial-gradient(circle_at_50%_35%,var(--muted),var(--secondary))] text-muted-foreground">
            <ScanFace className="size-8" />
            <p className="text-xs font-medium">Captured webcam frame (mock)</p>
          </div>
        ) : (
          <div className="flex h-48 flex-col items-center justify-center gap-2 text-muted-foreground">
            <FileText className="size-8" />
            <p className="text-xs font-medium">Browser event log (mock)</p>
          </div>
        )}
      </div>

      <dl className="mt-3 space-y-2 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">Evidence</dt>
          <dd className="text-right font-medium text-foreground">{event.evidence?.label ?? "Not available"}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">Detail</dt>
          <dd className="text-right text-foreground">{event.evidence?.detail ?? event.note}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">Severity</dt>
          <dd className="text-right font-medium capitalize text-foreground">{event.severity}</dd>
        </div>
      </dl>
    </div>
  );
}

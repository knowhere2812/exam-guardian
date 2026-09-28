import { AlertTriangle, Info, ShieldAlert, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { violationLabels, type ViolationType } from "@/data/mockData";

export function ViolationAlert({
  type,
  severity = "medium",
  note,
  onDismiss,
  className,
}: {
  type: ViolationType;
  severity?: "low" | "medium" | "high";
  note?: string;
  onDismiss?: () => void;
  className?: string;
}) {
  const tone =
    severity === "high"
      ? "border-destructive/30 bg-danger-soft text-destructive"
      : severity === "medium"
        ? "border-warning/35 bg-warning-soft text-warning-foreground"
        : "border-primary/25 bg-primary-soft text-primary";

  const Icon = severity === "high" ? ShieldAlert : severity === "medium" ? AlertTriangle : Info;

  return (
    <div className={cn("flex items-start gap-3 rounded-xl border p-3 text-sm", tone, className)}>
      <Icon className="mt-0.5 size-4 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="font-semibold">Potential violation · {violationLabels[type]}</p>
        <p className="mt-0.5 text-xs opacity-90">
          {note ?? "Recorded for review by your invigilator. Please return to the exam window."}
        </p>
      </div>
      {onDismiss ? (
        <button onClick={onDismiss} aria-label="Dismiss alert" className="rounded-md p-1 hover:bg-card/60">
          <X className="size-3.5" />
        </button>
      ) : null}
    </div>
  );
}

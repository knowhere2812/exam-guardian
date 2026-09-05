import { cn } from "@/lib/utils";
import type { RiskLevel } from "@/data/mockData";
import { riskCopy } from "@/utils/format";

type Tone = "neutral" | "primary" | "success" | "warning" | "danger";

const toneClasses: Record<Tone, string> = {
  neutral: "bg-muted text-muted-foreground border-border",
  primary: "bg-primary-soft text-primary border-primary/25",
  success: "bg-success-soft text-success border-success/30",
  warning: "bg-warning-soft text-warning-foreground border-warning/35",
  danger: "bg-danger-soft text-destructive border-destructive/30",
};

export function Pill({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

const statusTone: Record<string, Tone> = {
  upcoming: "primary",
  live: "success",
  completed: "neutral",
  draft: "warning",
  passed: "success",
  failed: "danger",
  in_progress: "primary",
  flagged: "danger",
  active: "success",
  inactive: "neutral",
};

const statusLabel: Record<string, string> = {
  upcoming: "Upcoming",
  live: "Live now",
  completed: "Completed",
  draft: "Draft",
  passed: "Passed",
  failed: "Not passed",
  in_progress: "In progress",
  flagged: "Under review",
  active: "Active",
  inactive: "Inactive",
};

export function StatusBadge({ status }: { status: string }) {
  return <Pill tone={statusTone[status] ?? "neutral"}>{statusLabel[status] ?? status}</Pill>;
}

export function RiskBadge({ level }: { level: RiskLevel }) {
  const tone: Tone = level === "high" ? "danger" : level === "medium" ? "warning" : level === "low" ? "primary" : "success";
  return <Pill tone={tone}>{riskCopy[level].label} risk</Pill>;
}

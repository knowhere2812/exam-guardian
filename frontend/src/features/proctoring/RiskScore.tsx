import { cn } from "@/lib/utils";
import type { RiskLevel } from "@/data/mockData";
import { riskCopy, riskLevelFromScore } from "@/utils/format";

export function RiskScore({
  score,
  level,
  compact = false,
  className,
}: {
  score: number;
  level?: RiskLevel;
  compact?: boolean;
  className?: string;
}) {
  const resolved = level ?? riskLevelFromScore(score);
  const bar =
    resolved === "high"
      ? "bg-destructive"
      : resolved === "medium"
        ? "bg-warning"
        : resolved === "low"
          ? "bg-primary"
          : "bg-success";

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
          <div className={cn("h-full rounded-full", bar)} style={{ width: `${score}%` }} />
        </div>
        <span className="text-xs font-semibold tabular-nums text-foreground">{score}</span>
      </div>
    );
  }

  return (
    <div className={cn("rounded-2xl border p-4", riskCopy[resolved].tone, className)}>
      <div className="flex items-baseline justify-between">
        <p className="text-sm font-medium text-foreground">Risk score</p>
        <p className={cn("text-2xl font-semibold tabular-nums", riskCopy[resolved].text)}>{score}/100</p>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-card">
        <div className={cn("h-full rounded-full transition-all", bar)} style={{ width: `${score}%` }} />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {riskCopy[resolved].label} risk · calculated from recorded proctoring signals. Requires human review before
        any action.
      </p>
    </div>
  );
}

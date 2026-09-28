import { Camera, Mic, MonitorCheck, ScanFace, ShieldCheck, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ProctoringChecks {
  camera: boolean;
  microphone: boolean;
  face: boolean;
  browser: boolean;
  monitoring: boolean;
}

const rows: { key: keyof ProctoringChecks; label: string; icon: LucideIcon; ok: string; bad: string }[] = [
  { key: "camera", label: "Camera", icon: Camera, ok: "Active", bad: "Blocked" },
  { key: "microphone", label: "Microphone", icon: Mic, ok: "Active", bad: "Muted" },
  { key: "face", label: "Face", icon: ScanFace, ok: "Detected", bad: "Not detected" },
  { key: "browser", label: "Browser", icon: ShieldCheck, ok: "Secure", bad: "Unsecured" },
  { key: "monitoring", label: "Monitoring", icon: MonitorCheck, ok: "Active", bad: "Paused" },
];

export function ProctoringStatus({
  checks,
  compact = false,
  className,
}: {
  checks: ProctoringChecks;
  compact?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("rounded-2xl border border-border bg-card p-4 shadow-card", className)}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Proctoring status</h3>
        <span className="flex items-center gap-1.5 text-[11px] font-medium text-success">
          <span className="size-1.5 rounded-full bg-success" /> Session secured
        </span>
      </div>
      <ul className={cn("space-y-2", compact && "space-y-1.5")}>
        {rows.map(({ key, label, icon: Icon, ok, bad }) => {
          const good = checks[key];
          return (
            <li key={key} className="flex items-center justify-between gap-3 text-sm">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Icon className="size-4" />
                {label}
              </span>
              <span
                className={cn(
                  "flex items-center gap-1.5 font-medium",
                  good ? "text-success" : "text-warning-foreground",
                )}
              >
                <span className={cn("size-1.5 rounded-full", good ? "bg-success" : "bg-warning")} />
                {good ? ok : bad}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

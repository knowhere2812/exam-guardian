import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/features/shared/PageHeader";
import { RiskBadge, StatusBadge } from "@/features/shared/StatusBadge";
import { WebcamPreview } from "@/features/proctoring/WebcamPreview";
import { ProctoringStatus } from "@/features/proctoring/ProctoringStatus";
import { ViolationTimeline } from "@/features/proctoring/ViolationTimeline";
import { RiskScore } from "@/features/proctoring/RiskScore";
import { EvidenceViewer } from "@/features/proctoring/EvidenceViewer";
import { attempts, type ViolationEvent } from "@/data/mockData";

export const Route = createFileRoute("/admin/proctoring")({
  head: () => ({
    meta: [
      { title: "Live proctoring — ProctorEdu admin" },
      { name: "description", content: "Review live exam sessions, camera status, risk signals and captured evidence." },
      { property: "og:title", content: "Live proctoring — ProctorEdu admin" },
      { property: "og:description", content: "Review live exam sessions, risk signals and evidence." },
    ],
  }),
  component: AdminProctoring,
});

function AdminProctoring() {
  const sessions = attempts.filter((a) => a.status === "in_progress" || a.riskLevel === "high");
  const [activeId, setActiveId] = useState(sessions[0]?.id ?? "");
  const [event, setEvent] = useState<ViolationEvent | undefined>(undefined);
  const active = sessions.find((s) => s.id === activeId) ?? sessions[0];

  return (
    <div>
      <PageHeader
        title="Proctoring review"
        description="Monitor active sessions and review potential violations before making a decision."
      />

      <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
        <div className="space-y-3">
          {sessions.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setActiveId(s.id);
                setEvent(undefined);
              }}
              className={cn(
                "w-full rounded-2xl border bg-card p-4 text-left shadow-card transition-colors",
                s.id === active?.id ? "border-primary" : "border-border hover:bg-secondary",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-foreground">{s.studentName}</p>
                <RiskBadge level={s.riskLevel} />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{s.examTitle}</p>
              <p className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <Clock className="size-3.5" />
                {s.status === "in_progress" ? `${s.timeRemainingMinutes} min remaining` : "Submitted · under review"}
              </p>
            </button>
          ))}
          {sessions.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              No sessions need review right now.
            </p>
          ) : null}
        </div>

        {active ? (
          <div className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{active.studentName}</p>
                    <p className="text-xs text-muted-foreground">{active.examTitle}</p>
                  </div>
                  <StatusBadge status={active.status} />
                </div>
                <WebcamPreview label={active.studentName} faceDetected={active.faceDetected ?? true} size="lg" />
              </div>
              <div className="space-y-4">
                <ProctoringStatus
                  checks={{
                    camera: active.cameraActive ?? true,
                    microphone: true,
                    face: active.faceDetected ?? true,
                    browser: true,
                    monitoring: true,
                  }}
                />
                <RiskScore score={active.riskScore} level={active.riskLevel} />
              </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
                <h2 className="mb-3 text-sm font-semibold text-foreground">Violation timeline</h2>
                <ViolationTimeline events={active.violations} onSelect={setEvent} selectedId={event?.id} />
              </div>
              <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
                <h2 className="mb-3 text-sm font-semibold text-foreground">Evidence</h2>
                <EvidenceViewer event={event} />
                <div className="mt-4 flex flex-wrap gap-2">
                  <button className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary">
                    Mark as reviewed
                  </button>
                  <button className="rounded-xl border border-destructive/30 bg-danger-soft px-4 py-2 text-sm font-medium text-destructive">
                    Escalate for investigation
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

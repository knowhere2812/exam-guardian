import { useState } from "react";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/features/shared/PageHeader";
import { RiskScore } from "@/features/proctoring/RiskScore";
import { ViolationTimeline } from "@/features/proctoring/ViolationTimeline";
import { EvidenceViewer } from "@/features/proctoring/EvidenceViewer";
import { attempts, violationLabels, type ViolationEvent } from "@/data/mockData";
import { formatDateTime } from "@/utils/format";

export const Route = createFileRoute("/student/report/$attemptId")({
  head: () => ({
    meta: [
      { title: "Proctoring report — ProctorEdu" },
      { name: "description", content: "Timeline of monitored signals recorded during your exam session." },
      { property: "og:title", content: "Proctoring report — ProctorEdu" },
      { property: "og:description", content: "Timeline of monitored signals recorded during your exam session." },
    ],
  }),
  component: ProctoringReport,
});

function ProctoringReport() {
  const { attemptId } = useParams({ from: "/student/report/$attemptId" });
  const attempt = attempts.find((a) => a.id === attemptId);
  const [selected, setSelected] = useState<ViolationEvent | undefined>(attempt?.violations[0]);

  if (!attempt) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-10 text-center">
        <p className="text-sm text-muted-foreground">This proctoring report could not be found.</p>
        <Link to="/student/results" className="mt-3 inline-block text-sm font-medium text-primary hover:underline">
          Back to my results
        </Link>
      </div>
    );
  }

  const counts = attempt.violations.reduce<Record<string, number>>((acc, v) => {
    acc[v.type] = (acc[v.type] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <Link
        to="/student/results/$attemptId"
        params={{ attemptId: attempt.id }}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to result
      </Link>

      <PageHeader
        title="Proctoring report"
        description={`${attempt.examTitle} · session ${formatDateTime(attempt.submittedAt)}`}
      />

      <section className="mb-6 flex gap-3 rounded-2xl border border-primary/25 bg-primary-soft p-5">
        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" />
        <p className="text-sm text-foreground/90">
          The events below are <strong>potential violations</strong> detected automatically. They are not an accusation
          of misconduct — an invigilator reviews the evidence before any decision is made.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <h2 className="mb-4 font-display text-base font-semibold text-foreground">Session timeline</h2>
            <ViolationTimeline events={attempt.violations} onSelect={setSelected} selectedId={selected?.id} />
          </section>

          {attempt.violations.length ? (
            <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <h2 className="font-display text-base font-semibold text-foreground">Event summary</h2>
              <ul className="mt-3 divide-y divide-border">
                {Object.entries(counts).map(([type, count]) => (
                  <li key={type} className="flex items-center justify-between py-2.5 text-sm">
                    <span className="text-foreground">{violationLabels[type as keyof typeof violationLabels]}</span>
                    <span className="font-semibold tabular-nums text-muted-foreground">{count}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        <aside className="space-y-6">
          <RiskScore score={attempt.riskScore} level={attempt.riskLevel} />
          <EvidenceViewer event={selected} />
        </aside>
      </div>
    </div>
  );
}

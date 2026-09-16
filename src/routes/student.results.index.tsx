import { createFileRoute, Link } from "@tanstack/react-router";
import { FileCheck2, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/features/shared/PageHeader";
import { StatusBadge, RiskBadge } from "@/features/shared/StatusBadge";
import { attempts } from "@/data/mockData";
import { formatDateTime, percentage } from "@/utils/format";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/student/results/")({
  head: () => ({
    meta: [
      { title: "My results — ProctorEdu" },
      { name: "description", content: "Scores, pass status and proctoring outcomes for every exam you submitted." },
      { property: "og:title", content: "My results — ProctorEdu" },
      { property: "og:description", content: "Scores and proctoring outcomes for your submitted exams." },
    ],
  }),
  component: StudentResults,
});

function StudentResults() {
  const { user } = useAuth();
  const mine = attempts.filter((a) => a.studentId === (user?.id ?? "u-1") && a.submittedAt);

  return (
    <div>
      <PageHeader title="My results" description="Every submitted attempt with its score and proctoring outcome." />

      {mine.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          You have not submitted any exams yet.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {mine.map((a) => (
            <article key={a.id} className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-base font-semibold text-foreground">{a.examTitle}</h2>
                  <p className="mt-1 text-xs text-muted-foreground">Submitted {formatDateTime(a.submittedAt)}</p>
                </div>
                <StatusBadge status={a.status} />
              </div>

              <div className="mt-4 flex items-end gap-4">
                <p className="text-3xl font-semibold tracking-tight text-foreground">
                  {a.score}
                  <span className="text-base font-medium text-muted-foreground">/{a.totalMarks}</span>
                </p>
                <p className="pb-1 text-sm font-medium text-success">{percentage(a.score, a.totalMarks)}%</p>
              </div>

              <div className="mt-3">
                <RiskBadge level={a.riskLevel} />
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <Link
                  to="/student/results/$attemptId"
                  params={{ attemptId: a.id }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  <FileCheck2 className="size-4" /> View result
                </Link>
                <Link
                  to="/student/report/$attemptId"
                  params={{ attemptId: a.id }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-sm font-medium text-foreground hover:bg-secondary"
                >
                  <ShieldCheck className="size-4" /> Proctoring report
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

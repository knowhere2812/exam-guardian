import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, ShieldCheck, XCircle } from "lucide-react";
import { PageHeader } from "@/features/shared/PageHeader";
import { StatusBadge } from "@/features/shared/StatusBadge";
import { examService } from "@/services/examService";
import { formatDateTime, percentage } from "@/utils/format";

export const Route = createFileRoute("/student/results/$attemptId")({
  head: () => ({
    meta: [
      { title: "Exam result — ProctorEdu" },
      { name: "description", content: "Score and outcome for a saved exam attempt." },
      { property: "og:title", content: "Exam result — ProctorEdu" },
      { property: "og:description", content: "Score and outcome for a saved exam attempt." },
    ],
  }),
  component: ExamResult,
});

function ExamResult() {
  const { attemptId } = useParams({ from: "/student/results/$attemptId" });
  const {
    data: attempts = [],
    isPending,
    isError,
  } = useQuery({
    queryKey: ["my-attempts"],
    queryFn: examService.listMyAttempts,
  });
  const attempt = attempts.find((item) => item.id === attemptId);

  if (isPending)
    return <p className="p-8 text-center text-sm text-muted-foreground">Loading result…</p>;
  if (isError || !attempt) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-10 text-center">
        <p className="text-sm text-muted-foreground">This saved result could not be found.</p>
        <Link
          to="/student/results"
          className="mt-3 inline-block text-sm font-medium text-primary hover:underline"
        >
          Back to my results
        </Link>
      </div>
    );
  }

  const hasScore = attempt.score !== null;
  const passed = attempt.status === "passed";
  const scorePercent = hasScore ? percentage(attempt.score ?? 0, attempt.totalMarks) : 0;

  return (
    <div>
      <Link
        to="/student/results"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> My results
      </Link>
      <PageHeader
        title={attempt.examTitle}
        description={
          attempt.submittedAt
            ? `Submitted ${formatDateTime(attempt.submittedAt)}`
            : "Attempt not submitted"
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-2xl border border-border bg-card p-6 shadow-card lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Recorded score</p>
              <p className="mt-1 text-4xl font-semibold text-foreground">
                {hasScore ? attempt.score : "—"}
                {hasScore ? (
                  <span className="text-lg font-medium text-muted-foreground">
                    /{attempt.totalMarks}
                  </span>
                ) : null}
              </p>
              {hasScore ? (
                <p className="mt-1 text-sm text-muted-foreground">{scorePercent}%</p>
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              {hasScore ? (
                passed ? (
                  <CheckCircle2 className="size-5 text-success" />
                ) : (
                  <XCircle className="size-5 text-destructive" />
                )
              ) : null}
              <StatusBadge status={attempt.status} />
            </div>
          </div>
          {hasScore ? (
            <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${scorePercent}%` }}
              />
            </div>
          ) : null}
        </section>

        <aside className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <ShieldCheck className="size-4" /> Attempt details
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Detailed answer review and proctoring records are not available for this attempt.
          </p>
        </aside>
      </div>
    </div>
  );
}

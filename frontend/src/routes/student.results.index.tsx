import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { FileCheck2 } from "lucide-react";
import { PageHeader } from "@/features/shared/PageHeader";
import { StatusBadge } from "@/features/shared/StatusBadge";
import { examService } from "@/services/examService";
import { formatDateTime, percentage } from "@/utils/format";

export const Route = createFileRoute("/student/results/")({
  head: () => ({
    meta: [
      { title: "My results — ProctorEdu" },
      { name: "description", content: "Scores and pass status for your submitted exams." },
      { property: "og:title", content: "My results — ProctorEdu" },
      { property: "og:description", content: "Scores and pass status for your submitted exams." },
    ],
  }),
  component: StudentResults,
});

function StudentResults() {
  const {
    data: attempts = [],
    isPending,
    isError,
  } = useQuery({
    queryKey: ["my-attempts"],
    queryFn: examService.listMyAttempts,
  });
  const submitted = attempts.filter(
    (attempt) => attempt.score !== null && attempt.status !== "in_progress",
  );

  return (
    <div>
      <PageHeader title="My results" description="Scores recorded for your submitted attempts." />

      {isPending ? (
        <p className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          Loading results…
        </p>
      ) : isError ? (
        <p className="rounded-2xl border border-destructive/30 p-10 text-center text-sm text-destructive">
          Could not load results. Check the API connection and try again.
        </p>
      ) : submitted.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No submitted results yet.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {submitted.map((attempt) => (
            <article
              key={attempt.id}
              className="rounded-2xl border border-border bg-card p-5 shadow-card"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-base font-semibold text-foreground">
                    {attempt.examTitle}
                  </h2>
                  {attempt.submittedAt ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Submitted {formatDateTime(attempt.submittedAt)}
                    </p>
                  ) : null}
                </div>
                <StatusBadge status={attempt.status} />
              </div>

              <div className="mt-4 flex items-end gap-4">
                <p className="text-3xl font-semibold text-foreground">
                  {attempt.score}
                  <span className="text-base font-medium text-muted-foreground">
                    /{attempt.totalMarks}
                  </span>
                </p>
                <p className="pb-1 text-sm font-medium text-muted-foreground">
                  {percentage(attempt.score ?? 0, attempt.totalMarks)}%
                </p>
              </div>

              <div className="mt-5">
                <Link
                  to="/student/results/$attemptId"
                  params={{ attemptId: attempt.id }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  <FileCheck2 className="size-4" /> View result
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

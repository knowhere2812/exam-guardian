import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { GraduationCap, Percent, Trophy } from "lucide-react";
import { PageHeader } from "@/features/shared/PageHeader";
import { StatCard } from "@/features/shared/StatCard";
import { examService } from "@/services/examService";
import { percentage } from "@/utils/format";

export const Route = createFileRoute("/admin/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — ProctorEdu admin" },
      { name: "description", content: "Performance summaries from saved attempts." },
      { property: "og:title", content: "Analytics — ProctorEdu admin" },
      { property: "og:description", content: "Performance summaries from saved attempts." },
    ],
  }),
  component: Analytics,
});

function Analytics() {
  const {
    data: attempts = [],
    isPending,
    isError,
  } = useQuery({
    queryKey: ["admin-attempts"],
    queryFn: examService.listAdminAttempts,
  });
  const graded = attempts.filter((attempt) => attempt.score !== null);
  const average = graded.length
    ? Math.round(
        graded.reduce(
          (sum, attempt) => sum + percentage(attempt.score ?? 0, attempt.totalMarks),
          0,
        ) / graded.length,
      )
    : null;
  const passRate = graded.length
    ? Math.round(
        (graded.filter((attempt) => attempt.status === "passed").length / graded.length) * 100,
      )
    : null;
  const byExam = Array.from(
    graded.reduce((groups, attempt) => {
      const group = groups.get(attempt.examTitle) ?? { count: 0, scoreSum: 0, marksSum: 0 };
      group.count += 1;
      group.scoreSum += attempt.score ?? 0;
      group.marksSum += attempt.totalMarks;
      groups.set(attempt.examTitle, group);
      return groups;
    }, new Map<string, { count: number; scoreSum: number; marksSum: number }>()),
  );

  return (
    <div>
      <PageHeader title="Analytics" description="Calculated from saved attempts for your exams." />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Graded attempts"
          value={isPending || isError ? "—" : graded.length}
          icon={GraduationCap}
        />
        <StatCard
          label="Average score"
          value={isPending || isError || average === null ? "—" : `${average}%`}
          icon={Percent}
          tone="success"
        />
        <StatCard
          label="Pass rate"
          value={isPending || isError || passRate === null ? "—" : `${passRate}%`}
          icon={Trophy}
        />
      </div>

      <section className="mt-5 rounded-2xl border border-border bg-card p-5 shadow-card">
        <h2 className="text-sm font-semibold text-foreground">Performance by exam</h2>
        {isPending ? (
          <p className="mt-4 text-sm text-muted-foreground">Loading saved attempts…</p>
        ) : null}
        {isError ? (
          <p className="mt-4 text-sm text-destructive">Could not load analytics.</p>
        ) : null}
        {!isPending && !isError && byExam.length ? (
          <div className="mt-3 divide-y divide-border">
            {byExam.map(([title, stats]) => (
              <div
                key={title}
                className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm"
              >
                <div>
                  <p className="font-medium text-foreground">{title}</p>
                  <p className="text-xs text-muted-foreground">
                    {stats.count} graded {stats.count === 1 ? "attempt" : "attempts"}
                  </p>
                </div>
                <p className="font-semibold text-foreground">
                  {Math.round((stats.scoreSum / stats.marksSum) * 100)}% average
                </p>
              </div>
            ))}
          </div>
        ) : null}
        {!isPending && !isError && byExam.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Analytics will appear when graded attempts are saved.
          </p>
        ) : null}
      </section>

      <p className="mt-4 text-sm text-muted-foreground">
        Proctoring and violation analytics are unavailable until those events are stored.
      </p>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { GraduationCap, Percent, Trophy } from "lucide-react";
import { PageHeader } from "@/features/shared/PageHeader";
import { StatCard } from "@/features/shared/StatCard";
import { StatusBadge } from "@/features/shared/StatusBadge";
import { examService } from "@/services/examService";
import { formatDate, percentage } from "@/utils/format";

export const Route = createFileRoute("/admin/results")({
  head: () => ({
    meta: [
      { title: "Results — ProctorEdu admin" },
      { name: "description", content: "Saved exam results for your examinations." },
      { property: "og:title", content: "Results — ProctorEdu admin" },
      { property: "og:description", content: "Saved exam results for your examinations." },
    ],
  }),
  component: AdminResults,
});

function AdminResults() {
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

  return (
    <div>
      <PageHeader title="Results" description="Scores saved for student attempts on your exams." />

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

      <div className="mt-5 overflow-hidden rounded-2xl border border-border bg-card shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">Student</th>
                <th className="px-5 py-3 font-medium">Exam</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Score</th>
                <th className="px-5 py-3 font-medium">Outcome</th>
              </tr>
            </thead>
            <tbody>
              {isPending ? (
                <tr>
                  <td className="px-5 py-8 text-center text-muted-foreground" colSpan={5}>
                    Loading results…
                  </td>
                </tr>
              ) : null}
              {isError ? (
                <tr>
                  <td className="px-5 py-8 text-center text-destructive" colSpan={5}>
                    Could not load results.
                  </td>
                </tr>
              ) : null}
              {!isPending &&
                !isError &&
                graded.map((attempt) => (
                  <tr key={attempt.id} className="border-t border-border">
                    <td className="px-5 py-4 font-medium text-foreground">{attempt.studentName}</td>
                    <td className="px-5 py-4 text-muted-foreground">{attempt.examTitle}</td>
                    <td className="px-5 py-4 text-muted-foreground">
                      {attempt.submittedAt ? formatDate(attempt.submittedAt) : "—"}
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">
                      {attempt.score}/{attempt.totalMarks} (
                      {percentage(attempt.score ?? 0, attempt.totalMarks)}%)
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={attempt.status} />
                    </td>
                  </tr>
                ))}
              {!isPending && !isError && graded.length === 0 ? (
                <tr>
                  <td className="px-5 py-8 text-center text-muted-foreground" colSpan={5}>
                    No saved results yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

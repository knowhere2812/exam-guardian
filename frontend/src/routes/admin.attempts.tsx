import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/features/shared/PageHeader";
import { StatusBadge } from "@/features/shared/StatusBadge";
import { examService } from "@/services/examService";
import { formatDateTime } from "@/utils/format";

export const Route = createFileRoute("/admin/attempts")({
  head: () => ({
    meta: [
      { title: "Exam attempts — ProctorEdu admin" },
      {
        name: "description",
        content: "Every submitted and in-progress exam attempt with score and risk signals.",
      },
      { property: "og:title", content: "Exam attempts — ProctorEdu admin" },
      {
        property: "og:description",
        content: "Submitted and in-progress attempts with risk signals.",
      },
    ],
  }),
  component: AdminAttempts,
});

const filters = ["all", "in_progress", "passed", "failed"] as const;

function AdminAttempts() {
  const [filter, setFilter] = useState<(typeof filters)[number]>("all");
  const {
    data: attempts = [],
    isPending,
    isError,
  } = useQuery({
    queryKey: ["admin-attempts"],
    queryFn: examService.listAdminAttempts,
  });
  const rows = attempts.filter((attempt) => filter === "all" || attempt.status === filter);

  return (
    <div>
      <PageHeader
        title="Exam attempts"
        description="Submissions, live sessions and the integrity signals attached to each."
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={
              filter === f
                ? "rounded-full bg-primary px-3.5 py-1.5 text-xs font-medium text-primary-foreground"
                : "rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-secondary"
            }
          >
            {f === "all" ? "All" : f.replace("_", " ")}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">Student</th>
                <th className="px-5 py-3 font-medium">Exam</th>
                <th className="px-5 py-3 font-medium">Submitted</th>
                <th className="px-5 py-3 font-medium">Score</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {isPending ? (
                <tr>
                  <td className="px-5 py-8 text-center text-muted-foreground" colSpan={5}>
                    Loading attempts…
                  </td>
                </tr>
              ) : null}
              {isError ? (
                <tr>
                  <td className="px-5 py-8 text-center text-destructive" colSpan={5}>
                    Could not load attempts.
                  </td>
                </tr>
              ) : null}
              {!isPending &&
                !isError &&
                rows.map((a) => (
                  <tr key={a.id} className="border-t border-border">
                    <td className="px-5 py-4 font-medium text-foreground">{a.studentName}</td>
                    <td className="px-5 py-4 text-muted-foreground">{a.examTitle}</td>
                    <td className="px-5 py-4 text-muted-foreground">
                      {a.submittedAt ? formatDateTime(a.submittedAt) : "In progress"}
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">
                      {a.score === null ? "—" : `${a.score}/${a.totalMarks}`}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={a.status} />
                    </td>
                  </tr>
                ))}
              {!isPending && !isError && rows.length === 0 ? (
                <tr>
                  <td className="px-5 py-8 text-center text-muted-foreground" colSpan={5}>
                    No attempts recorded yet.
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

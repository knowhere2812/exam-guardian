import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Clock } from "lucide-react";
import { PageHeader } from "@/features/shared/PageHeader";
import { StatusBadge } from "@/features/shared/StatusBadge";
import { examService } from "@/services/examService";
import { formatDateTime } from "@/utils/format";

export const Route = createFileRoute("/admin/proctoring")({
  head: () => ({
    meta: [
      { title: "Proctoring review — ProctorEdu admin" },
      { name: "description", content: "Review saved in-progress exam attempts." },
      { property: "og:title", content: "Proctoring review — ProctorEdu admin" },
      { property: "og:description", content: "Review saved in-progress exam attempts." },
    ],
  }),
  component: AdminProctoring,
});

function AdminProctoring() {
  const {
    data: attempts = [],
    isPending,
    isError,
  } = useQuery({
    queryKey: ["admin-attempts"],
    queryFn: examService.listAdminAttempts,
  });
  const active = attempts.filter((attempt) => attempt.status === "in_progress");

  return (
    <div>
      <PageHeader
        title="Proctoring review"
        description="In-progress attempts saved for your exams."
      />

      {isPending ? (
        <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Loading attempts…
        </p>
      ) : isError ? (
        <p className="rounded-2xl border border-destructive/30 p-8 text-center text-sm text-destructive">
          Could not load attempts.
        </p>
      ) : active.length ? (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-surface text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">Student</th>
                <th className="px-5 py-3 font-medium">Exam</th>
                <th className="px-5 py-3 font-medium">Started</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {active.map((attempt) => (
                <tr key={attempt.id} className="border-t border-border">
                  <td className="px-5 py-4 font-medium text-foreground">{attempt.studentName}</td>
                  <td className="px-5 py-4 text-muted-foreground">{attempt.examTitle}</td>
                  <td className="px-5 py-4 text-muted-foreground">
                    {attempt.submittedAt ? (
                      formatDateTime(attempt.submittedAt)
                    ) : (
                      <span className="inline-flex items-center gap-1">
                        <Clock className="size-3.5" /> In progress
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={attempt.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <section className="rounded-2xl border border-dashed border-border p-8 text-center">
          <p className="text-sm font-medium text-foreground">No in-progress attempts.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Camera feeds and violation events are not stored yet.
          </p>
        </section>
      )}
    </div>
  );
}

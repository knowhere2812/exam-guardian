import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/features/shared/PageHeader";
import { StatusBadge } from "@/features/shared/StatusBadge";
import { exams } from "@/data/mockData";
import { formatDateTime } from "@/utils/format";

export const Route = createFileRoute("/admin/exams/")({
  head: () => ({
    meta: [
      { title: "Exams — ProctorEdu admin" },
      { name: "description", content: "Create, schedule and manage proctored examinations for your cohorts." },
      { property: "og:title", content: "Exams — ProctorEdu admin" },
      { property: "og:description", content: "Create, schedule and manage proctored examinations." },
    ],
  }),
  component: AdminExams,
});

function AdminExams() {
  return (
    <div>
      <PageHeader
        title="Exams"
        description="Schedule examinations, configure proctoring and track participation."
        actions={
          <Link
            to="/admin/exams/new"
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="size-4" /> New exam
          </Link>
        }
      />

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">Exam</th>
                <th className="px-5 py-3 font-medium">Schedule</th>
                <th className="px-5 py-3 font-medium">Duration</th>
                <th className="px-5 py-3 font-medium">Participation</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {exams.map((exam) => (
                <tr key={exam.id} className="border-t border-border">
                  <td className="px-5 py-4">
                    <p className="font-medium text-foreground">{exam.title}</p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                      {exam.code}
                      {exam.proctored ? (
                        <span className="flex items-center gap-1 text-primary">
                          <ShieldCheck className="size-3.5" /> Proctored
                        </span>
                      ) : null}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">{formatDateTime(exam.date)}</td>
                  <td className="px-5 py-4 text-muted-foreground">{exam.durationMinutes} min</td>
                  <td className="px-5 py-4 text-muted-foreground">
                    {exam.attempted}/{exam.enrolled}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={exam.status} />
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      to="/admin/exams/$examId"
                      params={{ examId: exam.id }}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

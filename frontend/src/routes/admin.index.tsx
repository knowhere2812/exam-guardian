import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, FlagTriangleRight, GraduationCap, Users } from "lucide-react";
import { PageHeader } from "@/features/shared/PageHeader";
import { StatCard } from "@/features/shared/StatCard";
import { StatusBadge } from "@/features/shared/StatusBadge";
import { examService } from "@/services/examService";
import { formatDateTime } from "@/utils/format";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Admin dashboard — ProctorEdu" },
      { name: "description", content: "Manage examinations and review current exam activity." },
      { property: "og:title", content: "Admin dashboard — ProctorEdu" },
      { property: "og:description", content: "Manage examinations and review exam activity." },
    ],
  }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const {
    data: exams = [],
    isPending,
    isError,
  } = useQuery({
    queryKey: ["exams"],
    queryFn: examService.listExams,
  });
  const active = exams.filter((exam) => exam.status === "live" || exam.status === "upcoming");
  const completed = exams.filter((exam) => exam.status === "completed");

  return (
    <div>
      <PageHeader
        title="Examination control centre"
        description="Manage exams created by your faculty account."
        actions={
          <Link
            to="/admin/exams/new"
            className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Create exam
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total students"
          value="—"
          hint="Enrollment data unavailable"
          icon={Users}
        />
        <StatCard
          label="Active exams"
          value={isPending || isError ? "—" : active.length}
          hint="Published or scheduled"
          icon={BookOpen}
          tone="success"
        />
        <StatCard
          label="Completed exams"
          value={isPending || isError ? "—" : completed.length}
          hint="Archived examinations"
          icon={GraduationCap}
        />
        <StatCard
          label="Flagged attempts"
          value="—"
          hint="Review data unavailable"
          icon={FlagTriangleRight}
          tone="danger"
        />
      </div>

      <section className="mt-5 rounded-2xl border border-border bg-card p-5 shadow-card">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Your examinations</h2>
            <p className="text-xs text-muted-foreground">
              Exams saved to the database by your account
            </p>
          </div>
          <Link to="/admin/exams" className="text-sm font-medium text-primary hover:underline">
            View all
          </Link>
        </div>
        {isPending ? (
          <p className="mt-4 text-sm text-muted-foreground">Loading your exams…</p>
        ) : isError ? (
          <p className="mt-4 text-sm text-destructive">
            Could not load exams. Check the API connection and try again.
          </p>
        ) : exams.length ? (
          <ul className="mt-4 divide-y divide-border">
            {exams.slice(0, 5).map((exam) => (
              <li key={exam.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{exam.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {exam.code} · {formatDateTime(exam.date)}
                  </p>
                </div>
                <StatusBadge status={exam.status} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            No exams created yet.
          </p>
        )}
      </section>

      <p className="mt-5 rounded-xl bg-surface px-4 py-3 text-sm text-muted-foreground">
        Enrollment, performance and proctoring reports will appear when those records are available.
      </p>
    </div>
  );
}

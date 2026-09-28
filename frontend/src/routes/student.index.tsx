import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, CalendarClock, GraduationCap, ShieldCheck, TrendingUp } from "lucide-react";
import { PageHeader } from "@/features/shared/PageHeader";
import { StatCard } from "@/features/shared/StatCard";
import { StatusBadge } from "@/features/shared/StatusBadge";
import { useAuth } from "@/hooks/useAuth";
import { examService } from "@/services/examService";
import { formatDateTime, percentage } from "@/utils/format";

export const Route = createFileRoute("/student/")({
  head: () => ({
    meta: [
      { title: "Student dashboard — ProctorEdu" },
      {
        name: "description",
        content: "Upcoming proctored exams, recent results and your average score.",
      },
      { property: "og:title", content: "Student dashboard — ProctorEdu" },
      { property: "og:description", content: "Track upcoming exams, results and exam readiness." },
    ],
  }),
  component: StudentDashboard,
});

function StudentDashboard() {
  const { user } = useAuth();
  const examsQuery = useQuery({ queryKey: ["exams"], queryFn: examService.listExams });
  const attemptsQuery = useQuery({
    queryKey: ["my-attempts"],
    queryFn: examService.listMyAttempts,
  });
  const exams = examsQuery.data ?? [];
  const attempts = attemptsQuery.data ?? [];
  const upcoming = exams.filter((exam) => exam.status === "upcoming" || exam.status === "live");
  const submitted = attempts.filter(
    (attempt) => attempt.score !== null && attempt.status !== "in_progress",
  );
  const average = submitted.length
    ? Math.round(
        submitted.reduce(
          (sum, attempt) => sum + percentage(attempt.score ?? 0, attempt.totalMarks),
          0,
        ) / submitted.length,
      )
    : null;

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${user?.name?.split(" ")[0] ?? "student"}`}
        description="Your examination schedule and submitted results."
        actions={
          <Link
            to="/student/system-check"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <ShieldCheck className="size-4" /> Run system check
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Upcoming exams"
          value={examsQuery.isPending || examsQuery.isError ? "—" : upcoming.length}
          icon={CalendarClock}
          hint="Published and scheduled"
        />
        <StatCard
          label="Exams completed"
          value={attemptsQuery.isPending || attemptsQuery.isError ? "—" : submitted.length}
          icon={BookOpen}
          tone="success"
          hint="Based on your submitted attempts"
        />
        <StatCard
          label="Average score"
          value={
            attemptsQuery.isPending || attemptsQuery.isError || average === null
              ? "—"
              : `${average}%`
          }
          icon={TrendingUp}
          tone="success"
          hint="Across submitted attempts"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="rounded-2xl border border-border bg-card p-5 shadow-card lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-foreground">Upcoming exams</h2>
            <Link to="/student/exams" className="text-sm font-medium text-primary hover:underline">
              View all
            </Link>
          </div>
          {examsQuery.isPending ? (
            <p className="mt-4 text-sm text-muted-foreground">Loading your exam schedule…</p>
          ) : examsQuery.isError ? (
            <p className="mt-4 text-sm text-destructive">
              Could not load exams. Check the API connection and try again.
            </p>
          ) : upcoming.length ? (
            <ul className="mt-4 space-y-3">
              {upcoming.map((exam) => (
                <li key={exam.id} className="rounded-xl border border-border bg-surface p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-foreground">{exam.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {exam.code} · {formatDateTime(exam.date)} · {exam.durationMinutes} min ·{" "}
                        {exam.totalMarks} marks
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={exam.status} />
                      <Link
                        to="/student/exams/$examId"
                        params={{ examId: exam.id }}
                        className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary"
                      >
                        Details
                      </Link>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              No published or scheduled exams yet.
            </p>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-foreground">Recent results</h2>
            <Link
              to="/student/results"
              className="text-sm font-medium text-primary hover:underline"
            >
              All results
            </Link>
          </div>
          {attemptsQuery.isPending ? (
            <p className="mt-4 text-sm text-muted-foreground">Loading your results…</p>
          ) : attemptsQuery.isError ? (
            <p className="mt-4 text-sm text-destructive">Could not load results.</p>
          ) : submitted.length ? (
            <ul className="mt-4 space-y-3">
              {submitted.slice(0, 4).map((attempt) => (
                <li key={attempt.id} className="rounded-xl border border-border p-3">
                  <p className="text-sm font-medium text-foreground">{attempt.examTitle}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                      <GraduationCap className="size-4 text-muted-foreground" />
                      {attempt.score}/{attempt.totalMarks}
                    </span>
                    <StatusBadge status={attempt.status} />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              No submitted exam results yet.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}

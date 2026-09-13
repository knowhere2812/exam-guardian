import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, CalendarClock, GraduationCap, ShieldCheck, TrendingUp } from "lucide-react";
import { PageHeader } from "@/features/shared/PageHeader";
import { StatCard } from "@/features/shared/StatCard";
import { StatusBadge, RiskBadge } from "@/features/shared/StatusBadge";
import { attempts, exams } from "@/data/mockData";
import { formatDateTime, percentage } from "@/utils/format";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/student/")({
  head: () => ({
    meta: [
      { title: "Student dashboard — ProctorEdu" },
      { name: "description", content: "Upcoming proctored exams, recent results and your average score." },
      { property: "og:title", content: "Student dashboard — ProctorEdu" },
      { property: "og:description", content: "Track upcoming exams, results and exam readiness." },
    ],
  }),
  component: StudentDashboard,
});

function StudentDashboard() {
  const { user } = useAuth();
  const mine = attempts.filter((a) => a.studentId === (user?.id ?? "u-1") && a.submittedAt);
  const upcoming = exams.filter((e) => e.status === "upcoming" || e.status === "live");
  const average = mine.length
    ? Math.round(mine.reduce((sum, a) => sum + percentage(a.score, a.totalMarks), 0) / mine.length)
    : 0;

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${user?.name?.split(" ")[0] ?? "student"}`}
        description="Here is your examination schedule, recent performance and proctoring readiness."
        actions={
          <Link
            to="/student/system-check"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <ShieldCheck className="size-4" /> Run system check
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Upcoming exams" value={upcoming.length} icon={CalendarClock} hint="Next 30 days" />
        <StatCard label="Exams completed" value={mine.length} icon={BookOpen} tone="success" hint="This semester" />
        <StatCard label="Average score" value={`${average}%`} icon={TrendingUp} tone="success" hint="Across submitted exams" />
        <StatCard
          label="Sessions under review"
          value={mine.filter((a) => a.riskLevel === "high" || a.status === "flagged").length}
          icon={ShieldCheck}
          tone="warning"
          hint="Awaiting invigilator review"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2 rounded-2xl border border-border bg-card p-5 shadow-card">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-foreground">Upcoming exams</h2>
            <Link to="/student/exams" className="text-sm font-medium text-primary hover:underline">
              View all
            </Link>
          </div>
          <ul className="mt-4 space-y-3">
            {upcoming.map((exam) => (
              <li key={exam.id} className="rounded-xl border border-border bg-surface p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-foreground">{exam.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {exam.code} · {formatDateTime(exam.date)} · {exam.durationMinutes} min · {exam.totalMarks} marks
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
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-foreground">Recent results</h2>
            <Link to="/student/results" className="text-sm font-medium text-primary hover:underline">
              All results
            </Link>
          </div>
          <ul className="mt-4 space-y-3">
            {mine.map((a) => (
              <li key={a.id} className="rounded-xl border border-border p-3">
                <p className="text-sm font-medium text-foreground">{a.examTitle}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                    <GraduationCap className="size-4 text-muted-foreground" />
                    {a.score}/{a.totalMarks}
                  </span>
                  <StatusBadge status={a.status} />
                </div>
                <div className="mt-2">
                  <RiskBadge level={a.riskLevel} />
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

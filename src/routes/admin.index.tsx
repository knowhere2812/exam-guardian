import { createFileRoute, Link } from "@tanstack/react-router";
import { BarChart, Bar, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { BookOpen, FlagTriangleRight, GraduationCap, Users } from "lucide-react";
import { PageHeader } from "@/features/shared/PageHeader";
import { StatCard } from "@/features/shared/StatCard";
import { Pill } from "@/features/shared/StatusBadge";
import { analytics, attempts, exams, liveAlerts, studentRecords, violationLabels } from "@/data/mockData";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Admin dashboard — ProctorEdu" },
      { name: "description", content: "Cohort performance, exam activity and live proctoring alerts at a glance." },
      { property: "og:title", content: "Admin dashboard — ProctorEdu" },
      { property: "og:description", content: "Cohort performance and live proctoring alerts." },
    ],
  }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const flagged = attempts.filter((a) => a.status === "flagged" || a.riskLevel === "high").length;
  const active = exams.filter((e) => e.status === "live" || e.status === "upcoming").length;
  const completed = exams.filter((e) => e.status === "completed").length;

  return (
    <div>
      <PageHeader
        title="Examination control centre"
        description="Monitor cohorts, exam activity and proctoring integrity across the department."
        actions={
          <Link to="/admin/exams/new" className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            Create exam
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total students" value={studentRecords.length * 21} hint="Enrolled this semester" icon={Users} />
        <StatCard label="Active exams" value={active} hint="Live or scheduled" icon={BookOpen} tone="success" />
        <StatCard label="Completed exams" value={completed} hint="This semester" icon={GraduationCap} />
        <StatCard label="Flagged attempts" value={flagged} hint="Awaiting human review" icon={FlagTriangleRight} tone="danger" />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-card lg:col-span-2">
          <h2 className="text-sm font-semibold text-foreground">Exam performance</h2>
          <p className="text-xs text-muted-foreground">Average and highest score per exam</p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.examPerformance}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="exam" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                <YAxis tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12, border: "1px solid var(--border)" }} />
                <Bar dataKey="average" name="Average" fill="var(--primary)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="highest" name="Highest" fill="color-mix(in oklab, var(--primary) 35%, transparent)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Recent proctoring alerts</h2>
            <Link to="/admin/proctoring" className="text-xs font-medium text-primary hover:underline">
              View all
            </Link>
          </div>
          <ul className="mt-3 space-y-2.5">
            {liveAlerts.map((a) => (
              <li key={a.id} className="rounded-xl border border-border p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-foreground">{a.student}</p>
                  <Pill tone={a.severity === "high" ? "danger" : a.severity === "medium" ? "warning" : "primary"}>
                    {a.severity}
                  </Pill>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {violationLabels[a.type]} · {a.exam} · {a.at}
                </p>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[11px] text-muted-foreground">
            Alerts indicate potential violations only and require human review.
          </p>
        </div>
      </div>
    </div>
  );
}

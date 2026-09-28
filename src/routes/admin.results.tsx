import { createFileRoute } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageHeader } from "@/features/shared/PageHeader";
import { StatCard } from "@/features/shared/StatCard";
import { StatusBadge } from "@/features/shared/StatusBadge";
import { analytics, attempts } from "@/data/mockData";
import { formatDate, percentage } from "@/utils/format";
import { GraduationCap, Percent, Trophy } from "lucide-react";

export const Route = createFileRoute("/admin/results")({
  head: () => ({
    meta: [
      { title: "Results — ProctorEdu admin" },
      { name: "description", content: "Published exam results, pass rates and score distribution across cohorts." },
      { property: "og:title", content: "Results — ProctorEdu admin" },
      { property: "og:description", content: "Published results, pass rates and score distribution." },
    ],
  }),
  component: AdminResults,
});

function AdminResults() {
  const graded = attempts.filter((a) => a.status !== "in_progress");
  const avg = Math.round(graded.reduce((s, a) => s + percentage(a.score, a.totalMarks), 0) / (graded.length || 1));
  const passed = graded.filter((a) => a.status === "passed").length;

  return (
    <div>
      <PageHeader
        title="Results"
        description="Grade summaries per exam with distribution and export-ready tables."
        actions={
          <button className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary">
            <Download className="size-4" /> Export CSV
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Graded attempts" value={graded.length} icon={GraduationCap} />
        <StatCard label="Average score" value={`${avg}%`} icon={Percent} tone="success" />
        <StatCard label="Pass rate" value={`${Math.round((passed / (graded.length || 1)) * 100)}%`} icon={Trophy} />
      </div>

      <div className="mt-5 rounded-2xl border border-border bg-card p-5 shadow-card">
        <h2 className="text-sm font-semibold text-foreground">Score distribution</h2>
        <div className="mt-4 h-60">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics.scoreDistribution}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis dataKey="band" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
              <YAxis tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
              <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12, border: "1px solid var(--border)" }} />
              <Bar dataKey="students" name="Students" fill="var(--primary)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
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
              {graded.map((a) => (
                <tr key={a.id} className="border-t border-border">
                  <td className="px-5 py-4 font-medium text-foreground">{a.studentName}</td>
                  <td className="px-5 py-4 text-muted-foreground">{a.examTitle}</td>
                  <td className="px-5 py-4 text-muted-foreground">{formatDate(a.submittedAt)}</td>
                  <td className="px-5 py-4 text-muted-foreground">
                    {a.score}/{a.totalMarks} ({percentage(a.score, a.totalMarks)}%)
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={a.status} />
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

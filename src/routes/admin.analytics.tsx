import { createFileRoute } from "@tanstack/react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageHeader } from "@/features/shared/PageHeader";
import { analytics } from "@/data/mockData";

export const Route = createFileRoute("/admin/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — ProctorEdu admin" },
      { name: "description", content: "Score distribution, pass rate trends, exam performance and integrity analytics." },
      { property: "og:title", content: "Analytics — ProctorEdu admin" },
      { property: "og:description", content: "Score distribution, pass rates and integrity analytics." },
    ],
  }),
  component: Analytics,
});

const riskColors = ["var(--success)", "var(--primary)", "var(--warning)", "var(--destructive)"];
const tooltipStyle = { borderRadius: 12, fontSize: 12, border: "1px solid var(--border)" };

function Panel({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      {subtitle ? <p className="text-xs text-muted-foreground">{subtitle}</p> : null}
      <div className="mt-4 h-64">{children}</div>
    </div>
  );
}

function Analytics() {
  return (
    <div>
      <PageHeader title="Analytics" description="Academic performance and proctoring integrity across the semester." />

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Score distribution" subtitle="Students per score band">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics.scoreDistribution}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis dataKey="band" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
              <YAxis tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="students" fill="var(--primary)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Pass rate trend" subtitle="Percentage of students passing each month">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analytics.passRate}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
              <YAxis domain={[50, 100]} tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="rate" stroke="var(--primary)" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Exam performance" subtitle="Average vs highest score">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics.examPerformance}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis dataKey="exam" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
              <YAxis tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="average" name="Average" fill="var(--primary)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="highest" name="Highest" fill="color-mix(in oklab, var(--primary) 35%, transparent)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Potential violations" subtitle="Detected signals by type">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics.violationDistribution} layout="vertical" margin={{ left: 40 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
              <XAxis type="number" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
              <YAxis type="category" dataKey="type" width={120} tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" fill="var(--warning)" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Risk level distribution" subtitle="Sessions grouped by automated risk level">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={analytics.riskDistribution} dataKey="count" nameKey="level" innerRadius={55} outerRadius={90} paddingAngle={3}>
                {analytics.riskDistribution.map((entry, i) => (
                  <Cell key={entry.level} fill={riskColors[i % riskColors.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      <p className="mt-4 text-[11px] text-muted-foreground">
        Risk analytics summarise automated signals only; every flagged session is reviewed by a human examiner.
      </p>
    </div>
  );
}

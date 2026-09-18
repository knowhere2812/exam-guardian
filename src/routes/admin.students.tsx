import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search, UserPlus } from "lucide-react";
import { PageHeader } from "@/features/shared/PageHeader";
import { StatusBadge } from "@/features/shared/StatusBadge";
import { studentRecords } from "@/data/mockData";

export const Route = createFileRoute("/admin/students")({
  head: () => ({
    meta: [
      { title: "Students — ProctorEdu admin" },
      { name: "description", content: "Cohort roster with exam participation, average scores and review flags." },
      { property: "og:title", content: "Students — ProctorEdu admin" },
      { property: "og:description", content: "Cohort roster with participation and average scores." },
    ],
  }),
  component: AdminStudents,
});

function AdminStudents() {
  const [query, setQuery] = useState("");
  const rows = studentRecords.filter((s) =>
    `${s.name} ${s.email} ${s.rollNumber}`.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div>
      <PageHeader
        title="Students"
        description="Roster, participation and integrity flags for your department."
        actions={
          <button className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            <UserPlus className="size-4" /> Invite student
          </button>
        }
      />

      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          maxLength={80}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, roll number or email"
          className="w-full rounded-xl border border-border bg-card py-2.5 pl-9 pr-3 text-sm outline-none focus:border-primary"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">Student</th>
                <th className="px-5 py-3 font-medium">Roll number</th>
                <th className="px-5 py-3 font-medium">Programme</th>
                <th className="px-5 py-3 font-medium">Exams</th>
                <th className="px-5 py-3 font-medium">Average</th>
                <th className="px-5 py-3 font-medium">Flags</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => (
                <tr key={s.id} className="border-t border-border">
                  <td className="px-5 py-4">
                    <p className="font-medium text-foreground">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.email}</p>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">{s.rollNumber}</td>
                  <td className="px-5 py-4 text-muted-foreground">{s.program}</td>
                  <td className="px-5 py-4 text-muted-foreground">{s.examsTaken}</td>
                  <td className="px-5 py-4 font-medium text-foreground">{s.averageScore}%</td>
                  <td className="px-5 py-4">
                    <span className={s.flags > 1 ? "font-medium text-destructive" : "text-muted-foreground"}>{s.flags}</span>
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={s.status} />
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

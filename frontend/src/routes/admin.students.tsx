import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { PageHeader } from "@/features/shared/PageHeader";
import { examService } from "@/services/examService";

export const Route = createFileRoute("/admin/students")({
  head: () => ({
    meta: [
      { title: "Students — ProctorEdu admin" },
      {
        name: "description",
        content: "Cohort roster with exam participation, average scores and review flags.",
      },
      { property: "og:title", content: "Students — ProctorEdu admin" },
      {
        property: "og:description",
        content: "Cohort roster with participation and average scores.",
      },
    ],
  }),
  component: AdminStudents,
});

function AdminStudents() {
  const [query, setQuery] = useState("");
  const {
    data: students = [],
    isPending,
    isError,
  } = useQuery({
    queryKey: ["students"],
    queryFn: examService.listStudents,
  });
  const rows = students.filter((s) =>
    `${s.name} ${s.email} ${s.rollNumber}`.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div>
      <PageHeader
        title="Students"
        description="Student accounts and exam participation in your department."
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
                <th className="px-5 py-3 font-medium">Attempts</th>
                <th className="px-5 py-3 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {isPending ? (
                <tr>
                  <td className="px-5 py-8 text-center text-muted-foreground" colSpan={5}>
                    Loading students…
                  </td>
                </tr>
              ) : null}
              {isError ? (
                <tr>
                  <td className="px-5 py-8 text-center text-destructive" colSpan={5}>
                    Could not load students.
                  </td>
                </tr>
              ) : null}
              {!isPending &&
                !isError &&
                rows.map((s) => (
                  <tr key={s.id} className="border-t border-border">
                    <td className="px-5 py-4">
                      <p className="font-medium text-foreground">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.email}</p>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">{s.rollNumber}</td>
                    <td className="px-5 py-4 text-muted-foreground">{s.program}</td>
                    <td className="px-5 py-4 text-muted-foreground">{s.attempts}</td>
                    <td className="px-5 py-4 text-muted-foreground">
                      {new Date(s.joinedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              {!isPending && !isError && rows.length === 0 ? (
                <tr>
                  <td className="px-5 py-8 text-center text-muted-foreground" colSpan={5}>
                    No student accounts found.
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

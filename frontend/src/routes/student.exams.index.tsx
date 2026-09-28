import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { PageHeader } from "@/features/shared/PageHeader";
import { StatusBadge } from "@/features/shared/StatusBadge";
import type { ExamStatus } from "@/data/mockData";
import { examService } from "@/services/examService";
import { formatDateTime } from "@/utils/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/student/exams/")({
  head: () => ({
    meta: [
      { title: "My exams — ProctorEdu" },
      {
        name: "description",
        content: "Browse your scheduled, live and completed proctored examinations.",
      },
      { property: "og:title", content: "My exams — ProctorEdu" },
      { property: "og:description", content: "Your scheduled, live and completed examinations." },
    ],
  }),
  component: StudentExams,
});

const filters: { key: ExamStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "upcoming", label: "Upcoming" },
  { key: "live", label: "Live" },
  { key: "completed", label: "Completed" },
];

function StudentExams() {
  const [filter, setFilter] = useState<ExamStatus | "all">("all");
  const [query, setQuery] = useState("");
  const {
    data: exams = [],
    isPending,
    isError,
  } = useQuery({
    queryKey: ["exams"],
    queryFn: examService.listExams,
  });

  const visible = exams
    .filter((e) => e.status !== "draft")
    .filter((e) => (filter === "all" ? true : e.status === filter))
    .filter((e) => `${e.title} ${e.code}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <div>
      <PageHeader
        title="My exams"
        description="Every examination assigned to you, with proctoring requirements."
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                filter === f.key
                  ? "border-primary bg-primary-soft text-primary"
                  : "border-border bg-card text-muted-foreground hover:text-foreground",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search exams"
            className="w-full rounded-xl border border-input bg-card py-2.5 pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {isPending ? (
          <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Loading exams…
          </p>
        ) : isError ? (
          <p className="rounded-2xl border border-destructive/30 p-8 text-center text-sm text-destructive">
            Could not load exams. Check the API connection and try again.
          </p>
        ) : (
          visible.map((exam) => (
            <article
              key={exam.id}
              className="rounded-2xl border border-border bg-card p-5 shadow-card"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    {exam.code} · {exam.subject}
                  </p>
                  <h2 className="mt-1 font-display text-base font-semibold text-foreground">
                    {exam.title}
                  </h2>
                </div>
                <StatusBadge status={exam.status} />
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-xs text-muted-foreground">Scheduled</dt>
                  <dd className="font-medium text-foreground">{formatDateTime(exam.date)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Duration</dt>
                  <dd className="font-medium text-foreground">{exam.durationMinutes} minutes</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Marks</dt>
                  <dd className="font-medium text-foreground">{exam.totalMarks}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Proctoring</dt>
                  <dd className="font-medium text-foreground">
                    {exam.proctored ? "Required" : "Not required"}
                  </dd>
                </div>
              </dl>
              <div className="mt-5 flex gap-2">
                <Link
                  to="/student/exams/$examId"
                  params={{ examId: exam.id }}
                  className="rounded-xl border border-border bg-card px-3.5 py-2 text-sm font-medium text-foreground hover:bg-secondary"
                >
                  View details
                </Link>
                {exam.status !== "completed" && exam.totalQuestions > 0 ? (
                  <Link
                    to="/exam/$examId"
                    params={{ examId: exam.id }}
                    className="rounded-xl bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                  >
                    {exam.status === "live" ? "Enter exam" : "Start exam"}
                  </Link>
                ) : null}
              </div>
            </article>
          ))
        )}
        {!isPending && !isError && visible.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No exams match this filter.
          </p>
        ) : null}
      </div>
    </div>
  );
}

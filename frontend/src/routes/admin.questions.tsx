import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { PageHeader } from "@/features/shared/PageHeader";
import { Pill } from "@/features/shared/StatusBadge";
import { examService } from "@/services/examService";

export const Route = createFileRoute("/admin/questions")({
  head: () => ({
    meta: [
      { title: "Question bank — ProctorEdu admin" },
      {
        name: "description",
        content: "Browse, filter and curate multiple-choice questions across your exams.",
      },
      { property: "og:title", content: "Question bank — ProctorEdu admin" },
      { property: "og:description", content: "Browse and curate multiple-choice questions." },
    ],
  }),
  component: QuestionBank,
});

function QuestionBank() {
  const [query, setQuery] = useState("");
  const [examId, setExamId] = useState("all");
  const examsQuery = useQuery({ queryKey: ["exams"], queryFn: examService.listExams });
  const questionsQuery = useQuery({ queryKey: ["questions"], queryFn: examService.listQuestions });
  const exams = examsQuery.data ?? [];
  const questions = questionsQuery.data ?? [];

  const filtered = questions.filter(
    (q) =>
      (examId === "all" || q.examId === examId) &&
      (q.text.toLowerCase().includes(query.toLowerCase()) ||
        q.topic.toLowerCase().includes(query.toLowerCase())),
  );

  return (
    <div>
      <PageHeader title="Question bank" description="Questions saved to your exams." />

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-56">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            maxLength={80}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search questions or topics"
            className="w-full rounded-xl border border-border bg-card py-2.5 pl-9 pr-3 text-sm outline-none focus:border-primary"
          />
        </div>
        <select
          value={examId}
          onChange={(e) => setExamId(e.target.value)}
          className="rounded-xl border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary"
        >
          <option value="all">All exams</option>
          {exams.map((e) => (
            <option key={e.id} value={e.id}>
              {e.code}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        {questionsQuery.isPending || examsQuery.isPending ? (
          <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Loading questions…
          </p>
        ) : questionsQuery.isError || examsQuery.isError ? (
          <p className="rounded-2xl border border-destructive/30 p-8 text-center text-sm text-destructive">
            Could not load questions.
          </p>
        ) : (
          filtered.map((q) => (
            <div key={q.id} className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <p className="max-w-3xl text-sm font-medium text-foreground">{q.text}</p>
                <div className="flex items-center gap-2">
                  <Pill
                    tone={
                      q.difficulty === "hard"
                        ? "danger"
                        : q.difficulty === "medium"
                          ? "warning"
                          : "success"
                    }
                  >
                    {q.difficulty}
                  </Pill>
                  <Pill>{q.marks} marks</Pill>
                </div>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {q.options.map((opt, i) => (
                  <span
                    key={opt}
                    className={
                      i === q.correctIndex
                        ? "rounded-lg border border-success/30 bg-success-soft px-3 py-2 text-xs text-success"
                        : "rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground"
                    }
                  >
                    {String.fromCharCode(65 + i)}. {opt}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-[11px] text-muted-foreground">
                {q.topic || "No topic"} · {q.examCode ?? "Unknown exam"}
              </p>
            </div>
          ))
        )}
        {!questionsQuery.isPending && !questionsQuery.isError && filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            No questions match your filters.
          </div>
        ) : null}
      </div>
    </div>
  );
}

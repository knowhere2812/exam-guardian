import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatClock } from "@/utils/format";
import { examService, type ActiveExamAttempt } from "@/services/examService";

export const Route = createFileRoute("/exam/$examId")({
  head: () => ({
    meta: [
      { title: "Exam in progress — ProctorEdu" },
      { name: "description", content: "Answer the published questions in your proctored exam." },
      { property: "og:title", content: "Exam in progress — ProctorEdu" },
      {
        property: "og:description",
        content: "Answer the published questions in your proctored exam.",
      },
    ],
  }),
  component: ExamInterface,
});

function ExamInterface() {
  const { examId } = useParams({ from: "/exam/$examId" });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const examQuery = useQuery({
    queryKey: ["exams", examId],
    queryFn: () => examService.getExam(examId),
  });
  const questionsQuery = useQuery({
    queryKey: ["questions", examId],
    queryFn: () => examService.listExamQuestions(examId),
  });
  const exam = examQuery.data;
  const paper = questionsQuery.data ?? [];
  const [attempt, setAttempt] = useState<ActiveExamAttempt | null>(null);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [seconds, setSeconds] = useState(0);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!attempt) return;
    const updateClock = () =>
      setSeconds(Math.max(0, Math.ceil((Date.parse(attempt.expiresAt) - Date.now()) / 1000)));
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, [attempt]);

  useEffect(() => {
    if (!attempt || busy) return;
    const timer = setTimeout(() => {
      examService
        .saveAnswers(attempt.id, answers)
        .catch(() => setError("Answers could not be saved. Check your connection."));
    }, 600);
    return () => clearTimeout(timer);
  }, [attempt, answers, busy]);

  if (examQuery.isPending || questionsQuery.isPending) {
    return <p className="p-8 text-center text-sm text-muted-foreground">Loading exam…</p>;
  }

  if (examQuery.isError || questionsQuery.isError || !exam) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">This exam could not be loaded.</p>
          <Link
            to="/student/exams"
            className="mt-3 inline-block text-sm font-medium text-primary hover:underline"
          >
            Back to my exams
          </Link>
        </div>
      </div>
    );
  }

  if (paper.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="max-w-md text-center">
          <p className="text-lg font-semibold text-foreground">Questions are not available yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            This exam has no saved questions, so an attempt cannot be started.
          </p>
          <Link
            to="/student/exams/$examId"
            params={{ examId }}
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            <ArrowLeft className="size-4" /> Back to exam details
          </Link>
        </div>
      </div>
    );
  }

  const startAttempt = async () => {
    setBusy(true);
    setError("");
    try {
      const started = await examService.startAttempt(examId);
      setAttempt(started);
      setAnswers(started.answers);
    } catch (startError) {
      setError(startError instanceof Error ? startError.message : "Could not start this exam.");
    } finally {
      setBusy(false);
    }
  };

  const submitAttempt = async () => {
    if (!attempt) return;
    setBusy(true);
    setError("");
    try {
      await examService.saveAnswers(attempt.id, answers);
      const submitted = await examService.submitAttempt(attempt.id);
      await queryClient.invalidateQueries({ queryKey: ["my-attempts"] });
      navigate({ to: "/student/results/$attemptId", params: { attemptId: submitted.id } });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Could not submit this exam.");
      setBusy(false);
      setConfirm(false);
    }
  };

  const question = paper[index];
  const answeredCount = Object.keys(answers).length;
  const low = seconds < 300;

  if (!attempt) {
    return (
      <main className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-4 py-8">
        <section className="w-full rounded-2xl border border-border bg-card p-6 shadow-card">
          <Link
            to="/student/exams/$examId"
            params={{ examId }}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" /> Exam details
          </Link>
          <h1 className="mt-5 font-display text-2xl font-semibold text-foreground">{exam.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {exam.code} · {paper.length} questions · {exam.durationMinutes} minutes
          </p>
          <p className="mt-5 text-sm text-foreground">
            Your start time and deadline will be recorded by the server. Answers are saved as you
            work.
          </p>
          {error ? (
            <p className="mt-4 rounded-xl border border-destructive/30 bg-danger-soft px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}
          <button
            onClick={startAttempt}
            disabled={busy}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-70"
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : null} Start exam
          </button>
        </section>
      </main>
    );
  }

  if (!question) return null;

  return (
    <div className="min-h-screen bg-surface">
      <header className="sticky top-0 z-20 border-b border-border bg-card/90 px-4 py-3 backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-foreground">{exam.title}</p>
            <p className="text-[11px] text-muted-foreground">
              {exam.code} · Question {index + 1} of {paper.length} · {answeredCount} answered
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "flex items-center gap-2 rounded-xl border px-3 py-1.5 font-mono text-sm font-semibold",
                low
                  ? "border-destructive/30 bg-danger-soft text-destructive"
                  : "border-border bg-secondary text-foreground",
              )}
            >
              <Clock className="size-4" /> {formatClock(seconds)}
            </span>
            <button
              onClick={() => setConfirm(true)}
              disabled={busy}
              className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-70"
            >
              <Send className="size-4" /> Submit
            </button>
          </div>
        </div>
        <div className="mx-auto mt-3 h-1 max-w-7xl overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${((index + 1) / paper.length) * 100}%` }}
          />
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_300px]">
        <section className="rounded-2xl border border-border bg-card p-5 shadow-card sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <p className="text-base font-medium leading-relaxed text-foreground">{question.text}</p>
            <span className="shrink-0 text-xs text-muted-foreground">{question.marks} marks</span>
          </div>
          <div className="mt-5 space-y-2.5">
            {question.options.map((option, optionIndex) => {
              const selected = answers[question.id] === optionIndex;
              return (
                <button
                  key={`${question.id}-${optionIndex}`}
                  onClick={() =>
                    setAnswers((current) => ({ ...current, [question.id]: optionIndex }))
                  }
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors",
                    selected
                      ? "border-primary bg-primary-soft text-foreground"
                      : "border-border bg-card text-foreground hover:bg-secondary",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                      selected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border text-muted-foreground",
                    )}
                  >
                    {String.fromCharCode(65 + optionIndex)}
                  </span>
                  {option}
                </button>
              );
            })}
          </div>
          <div className="mt-6 flex items-center justify-between gap-3 border-t border-border pt-4">
            <button
              disabled={index === 0}
              onClick={() => setIndex((current) => Math.max(0, current - 1))}
              className="flex items-center gap-1.5 rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary disabled:opacity-40"
            >
              <ChevronLeft className="size-4" /> Previous
            </button>
            <button
              disabled={index === paper.length - 1}
              onClick={() => setIndex((current) => Math.min(paper.length - 1, current + 1))}
              className="flex items-center gap-1.5 rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary disabled:opacity-40"
            >
              Next <ChevronRight className="size-4" />
            </button>
          </div>
          {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}
        </section>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-border bg-card p-4 shadow-card">
            <h2 className="text-sm font-semibold text-foreground">Question navigator</h2>
            <div className="mt-3 grid grid-cols-6 gap-2">
              {paper.map((item, itemIndex) => (
                <button
                  key={item.id}
                  onClick={() => setIndex(itemIndex)}
                  className={cn(
                    "flex size-9 items-center justify-center rounded-lg border text-xs font-semibold",
                    itemIndex === index && "ring-2 ring-primary/40",
                    answers[item.id] !== undefined
                      ? "border-success/30 bg-success-soft text-success"
                      : "border-border bg-card text-muted-foreground",
                  )}
                >
                  {itemIndex + 1}
                </button>
              ))}
            </div>
            <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="size-3.5 text-success" /> {answeredCount} answers saved
              automatically
            </p>
          </section>
          <section className="rounded-xl border border-border bg-card p-4 text-xs text-muted-foreground">
            Started {new Date(attempt.startedAt).toLocaleString()}
          </section>
        </aside>
      </main>

      {confirm ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-foreground/40 px-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-lift">
            <h2 className="text-lg font-semibold text-foreground">Submit this exam?</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              You answered {answeredCount} of {paper.length} questions. The server will calculate
              and save your score.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setConfirm(false)}
                disabled={busy}
                className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary"
              >
                Keep working
              </button>
              <button
                onClick={submitAttempt}
                disabled={busy}
                className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-70"
              >
                {busy ? <Loader2 className="size-4 animate-spin" /> : null} Submit exam
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

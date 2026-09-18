import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { AlertTriangle, ChevronLeft, ChevronRight, Clock, Flag, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { exams, questions as allQuestions, type ViolationType } from "@/data/mockData";
import { formatClock } from "@/utils/format";
import { WebcamPreview } from "@/features/proctoring/WebcamPreview";
import { ProctoringStatus } from "@/features/proctoring/ProctoringStatus";
import { ViolationAlert } from "@/features/proctoring/ViolationAlert";

export const Route = createFileRoute("/exam/$examId")({
  head: () => ({
    meta: [
      { title: "Exam in progress — ProctorEdu" },
      { name: "description", content: "Distraction-free proctored exam interface with timer and question navigator." },
      { property: "og:title", content: "Exam in progress — ProctorEdu" },
      { property: "og:description", content: "Secure, proctored exam interface." },
    ],
  }),
  component: ExamInterface,
});

function ExamInterface() {
  const { examId } = useParams({ from: "/exam/$examId" });
  const navigate = useNavigate();
  const exam = exams.find((e) => e.id === examId);
  const paper = useMemo(() => {
    const list = allQuestions.filter((q) => q.examId === examId);
    return list.length ? list : allQuestions.slice(0, 5);
  }, [examId]);

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [review, setReview] = useState<Record<string, boolean>>({});
  const [seconds, setSeconds] = useState((exam?.durationMinutes ?? 60) * 60);
  const [confirm, setConfirm] = useState(false);
  const [alert, setAlert] = useState<{ type: ViolationType; note: string } | null>(null);

  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => (s <= 1 ? 0 : s - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const onHidden = () => {
      if (document.hidden) setAlert({ type: "tab_switch", note: "Please stay on the exam window until you submit." });
    };
    document.addEventListener("visibilitychange", onHidden);
    return () => document.removeEventListener("visibilitychange", onHidden);
  }, []);

  if (!exam) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">This exam could not be found.</p>
      </div>
    );
  }

  const q = paper[index]!;
  const answeredCount = Object.keys(answers).length;
  const low = seconds < 300;

  const submit = () => navigate({ to: "/student/results" });

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
                low ? "border-destructive/30 bg-danger-soft text-destructive" : "border-border bg-secondary text-foreground",
              )}
            >
              <Clock className="size-4" /> {formatClock(seconds)}
            </span>
            <button
              onClick={() => setConfirm(true)}
              className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Send className="size-4" /> Submit
            </button>
          </div>
        </div>
        <div className="mx-auto mt-3 h-1 max-w-7xl overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${((index + 1) / paper.length) * 100}%` }} />
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_300px]">
        <section className="space-y-4">
          {alert ? (
            <ViolationAlert type={alert.type} severity="medium" note={alert.note} onDismiss={() => setAlert(null)} />
          ) : null}

          <div className="rounded-2xl border border-border bg-card p-5 shadow-card sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <p className="text-base font-medium leading-relaxed text-foreground">{q.text}</p>
              <button
                onClick={() => setReview((r) => ({ ...r, [q.id]: !r[q.id] }))}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors",
                  review[q.id]
                    ? "border-warning/40 bg-warning-soft text-warning-foreground"
                    : "border-border text-muted-foreground hover:bg-secondary",
                )}
              >
                <Flag className="size-3.5" /> Mark for review
              </button>
            </div>

            <div className="mt-5 space-y-2.5">
              {q.options.map((opt, i) => {
                const selected = answers[q.id] === i;
                return (
                  <button
                    key={opt}
                    onClick={() => setAnswers((a) => ({ ...a, [q.id]: i }))}
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
                        selected ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground",
                      )}
                    >
                      {String.fromCharCode(65 + i)}
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex items-center justify-between gap-3 border-t border-border pt-4">
              <button
                disabled={index === 0}
                onClick={() => setIndex((i) => Math.max(0, i - 1))}
                className="flex items-center gap-1.5 rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-40"
              >
                <ChevronLeft className="size-4" /> Previous
              </button>
              <button
                disabled={index === paper.length - 1}
                onClick={() => setIndex((i) => Math.min(paper.length - 1, i + 1))}
                className="flex items-center gap-1.5 rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-40"
              >
                Next <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
            <h3 className="text-sm font-semibold text-foreground">Question navigator</h3>
            <div className="mt-3 grid grid-cols-6 gap-2">
              {paper.map((item, i) => {
                const answered = answers[item.id] !== undefined;
                const marked = review[item.id];
                return (
                  <button
                    key={item.id}
                    onClick={() => setIndex(i)}
                    className={cn(
                      "flex size-9 items-center justify-center rounded-lg border text-xs font-semibold transition-colors",
                      i === index && "ring-2 ring-primary/40",
                      marked
                        ? "border-warning/40 bg-warning-soft text-warning-foreground"
                        : answered
                          ? "border-success/30 bg-success-soft text-success"
                          : "border-border bg-card text-muted-foreground",
                    )}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
            <ul className="mt-4 space-y-1.5 text-[11px] text-muted-foreground">
              <li className="flex items-center gap-2"><span className="size-2 rounded-full bg-success" /> Answered</li>
              <li className="flex items-center gap-2"><span className="size-2 rounded-full bg-warning" /> Marked for review</li>
              <li className="flex items-center gap-2"><span className="size-2 rounded-full bg-muted-foreground/40" /> Not answered</li>
            </ul>
          </div>

          <WebcamPreview label="You" />
          <ProctoringStatus
            compact
            checks={{ camera: true, microphone: true, face: true, browser: true, monitoring: true }}
          />
        </aside>
      </main>

      {confirm ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-foreground/40 px-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-lift">
            <span className="flex size-10 items-center justify-center rounded-xl bg-warning-soft text-warning-foreground">
              <AlertTriangle className="size-5" />
            </span>
            <h2 className="mt-4 text-lg font-semibold text-foreground">Submit this exam?</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              You answered {answeredCount} of {paper.length} questions. Submissions are final and cannot be reopened.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setConfirm(false)}
                className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary"
              >
                Keep working
              </button>
              <button
                onClick={submit}
                className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Submit exam
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

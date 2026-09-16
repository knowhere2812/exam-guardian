import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, Clock, ShieldCheck, Target, XCircle } from "lucide-react";
import { PageHeader } from "@/features/shared/PageHeader";
import { StatusBadge } from "@/features/shared/StatusBadge";
import { RiskScore } from "@/features/proctoring/RiskScore";
import { attempts, exams, questions } from "@/data/mockData";
import { formatDateTime, percentage } from "@/utils/format";

export const Route = createFileRoute("/student/results/$attemptId")({
  head: () => ({
    meta: [
      { title: "Exam result — ProctorEdu" },
      { name: "description", content: "Score breakdown, topic performance and proctoring summary for your attempt." },
      { property: "og:title", content: "Exam result — ProctorEdu" },
      { property: "og:description", content: "Score breakdown and proctoring summary for your attempt." },
    ],
  }),
  component: ExamResult,
});

function ExamResult() {
  const { attemptId } = useParams({ from: "/student/results/$attemptId" });
  const attempt = attempts.find((a) => a.id === attemptId);

  if (!attempt) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-10 text-center">
        <p className="text-sm text-muted-foreground">This result could not be found.</p>
        <Link to="/student/results" className="mt-3 inline-block text-sm font-medium text-primary hover:underline">
          Back to my results
        </Link>
      </div>
    );
  }

  const exam = exams.find((e) => e.id === attempt.examId);
  const pct = percentage(attempt.score, attempt.totalMarks);
  const passed = attempt.status !== "failed";
  const topicRows = questions.filter((q) => q.examId === attempt.examId);

  return (
    <div>
      <Link
        to="/student/results"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> My results
      </Link>

      <PageHeader
        title={attempt.examTitle}
        description={`Submitted ${formatDateTime(attempt.submittedAt)}`}
        actions={
          <Link
            to="/student/report/$attemptId"
            params={{ attemptId: attempt.id }}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium hover:bg-secondary"
          >
            <ShieldCheck className="size-4" /> Proctoring report
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Final score</p>
                <p className="mt-1 text-4xl font-semibold tracking-tight text-foreground">
                  {attempt.score}
                  <span className="text-lg font-medium text-muted-foreground">/{attempt.totalMarks}</span>
                </p>
                <p className="mt-1 text-sm font-medium text-muted-foreground">{pct}% achieved</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <StatusBadge status={attempt.status} />
                <span
                  className={
                    passed
                      ? "flex items-center gap-1.5 text-sm font-medium text-success"
                      : "flex items-center gap-1.5 text-sm font-medium text-destructive"
                  }
                >
                  {passed ? <CheckCircle2 className="size-4" /> : <XCircle className="size-4" />}
                  {passed ? "Pass mark met" : "Pass mark not met"}
                </span>
              </div>
            </div>

            <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-muted">
              <div
                className={passed ? "h-full rounded-full bg-success" : "h-full rounded-full bg-destructive"}
                style={{ width: `${pct}%` }}
              />
            </div>

            <dl className="mt-5 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-border bg-surface p-4">
                <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Target className="size-3.5" /> Pass mark
                </dt>
                <dd className="mt-1 text-sm font-semibold text-foreground">
                  {exam ? `${exam.passingMarks}/${exam.totalMarks}` : "—"}
                </dd>
              </div>
              <div className="rounded-xl border border-border bg-surface p-4">
                <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="size-3.5" /> Duration
                </dt>
                <dd className="mt-1 text-sm font-semibold text-foreground">
                  {exam ? `${exam.durationMinutes} minutes` : "—"}
                </dd>
              </div>
              <div className="rounded-xl border border-border bg-surface p-4">
                <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <ShieldCheck className="size-3.5" /> Flagged events
                </dt>
                <dd className="mt-1 text-sm font-semibold text-foreground">{attempt.violations.length}</dd>
              </div>
            </dl>
          </section>

          {topicRows.length ? (
            <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <h2 className="font-display text-base font-semibold text-foreground">Topic coverage</h2>
              <ul className="mt-3 divide-y divide-border">
                {topicRows.map((q) => (
                  <li key={q.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                    <span className="text-foreground">{q.topic}</span>
                    <span className="flex items-center gap-3 text-muted-foreground">
                      <span className="capitalize">{q.difficulty}</span>
                      <span className="tabular-nums">{q.marks} marks</span>
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        <aside className="space-y-6">
          <RiskScore score={attempt.riskScore} level={attempt.riskLevel} />
          <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <h3 className="text-sm font-semibold text-foreground">Result release</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Scores are provisional until the proctoring review is closed by the examination office.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

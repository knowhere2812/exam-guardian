import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, CalendarClock, CheckCircle2, Clock, FileText, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/features/shared/PageHeader";
import { StatusBadge } from "@/features/shared/StatusBadge";
import { ProctoringStatus } from "@/features/proctoring/ProctoringStatus";
import { exams } from "@/data/mockData";
import { formatDateTime } from "@/utils/format";

export const Route = createFileRoute("/student/exams/$examId")({
  head: () => ({
    meta: [
      { title: "Exam details — ProctorEdu" },
      { name: "description", content: "Exam schedule, marking scheme and proctoring rules before you begin." },
      { property: "og:title", content: "Exam details — ProctorEdu" },
      { property: "og:description", content: "Schedule, marking scheme and proctoring rules for your exam." },
    ],
  }),
  component: ExamDetails,
});

function ExamDetails() {
  const { examId } = useParams({ from: "/student/exams/$examId" });
  const exam = exams.find((e) => e.id === examId);

  if (!exam) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-10 text-center">
        <p className="text-sm text-muted-foreground">This exam could not be found.</p>
        <Link to="/student/exams" className="mt-3 inline-block text-sm font-medium text-primary hover:underline">
          Back to my exams
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link
        to="/student/exams"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> My exams
      </Link>

      <PageHeader
        title={exam.title}
        description={`${exam.code} · ${exam.subject}`}
        actions={
          exam.status !== "completed" ? (
            <div className="flex gap-2">
              <Link
                to="/student/system-check"
                className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium hover:bg-secondary"
              >
                System check
              </Link>
              <Link
                to="/exam/$examId"
                params={{ examId: exam.id }}
                className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Start exam
              </Link>
            </div>
          ) : (
            <StatusBadge status={exam.status} />
          )
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { icon: CalendarClock, label: "Scheduled", value: formatDateTime(exam.date) },
              { icon: Clock, label: "Duration", value: `${exam.durationMinutes} min` },
              { icon: FileText, label: "Questions", value: `${exam.totalQuestions}` },
              { icon: CheckCircle2, label: "Pass mark", value: `${exam.passingMarks}/${exam.totalMarks}` },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-2xl border border-border bg-card p-4 shadow-card">
                <Icon className="size-4 text-muted-foreground" />
                <p className="mt-2 text-xs text-muted-foreground">{label}</p>
                <p className="text-sm font-semibold text-foreground">{value}</p>
              </div>
            ))}
          </section>

          <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <h2 className="font-display text-base font-semibold text-foreground">Instructions</h2>
            <ul className="mt-3 space-y-2.5">
              {(exam.instructions.length ? exam.instructions : ["Instructions will be published before the exam."]).map(
                (line) => (
                  <li key={line} className="flex gap-2.5 text-sm text-foreground">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                    {line}
                  </li>
                ),
              )}
            </ul>
          </section>

          <section className="rounded-2xl border border-warning/35 bg-warning-soft p-5">
            <h2 className="flex items-center gap-2 font-display text-base font-semibold text-foreground">
              <ShieldCheck className="size-4" /> How proctoring works
            </h2>
            <p className="mt-2 text-sm text-foreground/90">
              During the exam we record camera and microphone activity, face presence, tab focus and fullscreen state.
              Anything unusual is logged as a <strong>potential violation</strong> and reviewed by a human invigilator —
              it is never treated as proof of misconduct on its own.
            </p>
          </section>
        </div>

        <aside className="space-y-6">
          <ProctoringStatus
            checks={{ camera: true, microphone: true, face: true, browser: true, monitoring: exam.proctored }}
          />
          <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <h3 className="text-sm font-semibold text-foreground">Enrolment</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {exam.enrolled} students enrolled · {exam.attempted} attempts recorded
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

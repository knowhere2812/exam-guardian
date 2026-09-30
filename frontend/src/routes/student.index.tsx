import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BookOpen,
  BookOpenCheck,
  CalendarDays,
  ChartNoAxesColumnIncreasing,
  Check,
  Clock3,
  FileText,
  GraduationCap,
  ShieldCheck,
} from "lucide-react";
import { StatusBadge } from "@/features/shared/StatusBadge";
import { useAuth } from "@/hooks/useAuth";
import { examService } from "@/services/examService";
import { formatDateTime, percentage } from "@/utils/format";

export const Route = createFileRoute("/student/")({
  head: () => ({
    meta: [
      { title: "Student dashboard — ProctorEdu" },
      {
        name: "description",
        content: "Upcoming proctored exams, recent results and your average score.",
      },
      { property: "og:title", content: "Student dashboard — ProctorEdu" },
      { property: "og:description", content: "Track upcoming exams, results and exam readiness." },
    ],
  }),
  component: StudentDashboard,
});

function StudentDashboard() {
  const { user } = useAuth();
  const examsQuery = useQuery({ queryKey: ["exams"], queryFn: examService.listExams });
  const attemptsQuery = useQuery({
    queryKey: ["my-attempts"],
    queryFn: examService.listMyAttempts,
  });
  const exams = examsQuery.data ?? [];
  const attempts = attemptsQuery.data ?? [];
  const upcoming = exams.filter((exam) => exam.status === "upcoming" || exam.status === "live");
  const submitted = attempts.filter(
    (attempt) => attempt.score !== null && attempt.status !== "in_progress",
  );
  const average = submitted.length
    ? Math.round(
        submitted.reduce(
          (sum, attempt) => sum + percentage(attempt.score ?? 0, attempt.totalMarks),
          0,
        ) / submitted.length,
      )
    : null;
  const firstName = user?.name?.split(" ")[0] ?? "student";
  const stats = [
    {
      label: "Upcoming exams",
      value: examsQuery.isPending || examsQuery.isError ? "—" : upcoming.length,
      hint: "Published and scheduled",
      icon: CalendarDays,
      iconColor: "bg-blue-50 text-blue-600",
    },
    {
      label: "Exams completed",
      value: attemptsQuery.isPending || attemptsQuery.isError ? "—" : submitted.length,
      hint: "Based on your submitted attempts",
      icon: BookOpen,
      iconColor: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Average score",
      value:
        attemptsQuery.isPending || attemptsQuery.isError || average === null ? "—" : `${average}%`,
      hint: "Across submitted attempts",
      icon: ChartNoAxesColumnIncreasing,
      iconColor: "bg-amber-50 text-amber-600",
    },
  ];

  return (
    <div className="relative -mx-4 -my-6 min-h-[calc(100vh-4rem)] overflow-hidden bg-[radial-gradient(ellipse_at_top_right,rgba(167,243,208,0.28),transparent_38%),#f3faf7] px-4 py-7 sm:-mx-6 sm:-my-8 sm:px-6 sm:py-9">
      <div className="relative">
        <div className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-700">
              Welcome back <span className="text-amber-500">✦</span>
            </p>
            <h1 className="mt-2 font-display text-3xl font-medium leading-tight text-slate-950 sm:text-[2.55rem]">
              Welcome back, <span className="font-semibold text-emerald-700">{firstName}</span>
            </h1>
            <p className="mt-2 text-sm text-slate-600 sm:text-base">
              Your examination schedule and submitted results.
            </p>
          </div>
          <Link
            to="/student/system-check"
            className="inline-flex min-h-11 items-center gap-2 self-start rounded-xl border border-emerald-100 bg-emerald-50 px-4 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100 sm:self-auto"
          >
            <ShieldCheck className="size-4" /> Run system check <ArrowRight className="size-4" />
          </Link>
        </div>

        <section aria-label="Exam overview" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {stats.map(({ label, value, hint, icon: Icon, iconColor }) => (
            <article
              key={label}
              className="relative isolate min-h-32 overflow-hidden rounded-2xl border border-emerald-950/6 bg-white px-5 py-5 shadow-[0_12px_35px_-26px_rgba(17,74,55,0.28)] sm:px-6"
            >
              <div className="flex items-center gap-4">
                <span
                  className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${iconColor}`}
                >
                  <Icon className="size-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm text-slate-600">{label}</p>
                  <p className="mt-0.5 font-display text-3xl font-bold leading-none text-slate-950">
                    {value}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">{hint}</p>
                </div>
              </div>
            </article>
          ))}
        </section>

        <div className="mt-6 grid gap-5 xl:grid-cols-[1.8fr_1fr]">
          <section className="rounded-2xl border border-emerald-950/[0.07] bg-white p-4 shadow-[0_14px_36px_-28px_rgba(17,74,55,0.3)] sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <CalendarDays className="size-5" />
                </span>
                <div>
                  <h2 className="font-display text-base font-semibold text-slate-950">
                    Upcoming exams
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Your schedule. Be prepared and start on time.
                  </p>
                </div>
              </div>
              <Link
                to="/student/exams"
                className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-900"
              >
                View all <ArrowRight className="size-3.5" />
              </Link>
            </div>
            {examsQuery.isPending ? (
              <p className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
                Loading your exam schedule…
              </p>
            ) : examsQuery.isError ? (
              <p
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700"
              >
                Could not load exams. Check the API connection and try again.
              </p>
            ) : upcoming.length ? (
              <ul className="space-y-2.5">
                {upcoming.map((exam, index) => (
                  <li
                    key={exam.id}
                    className="flex flex-col gap-3 rounded-xl border border-emerald-950/8 bg-white p-3 sm:flex-row sm:items-center sm:justify-between sm:px-3.5"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${index % 2 === 0 ? "bg-blue-50 text-blue-600" : "bg-violet-50 text-violet-600"}`}
                      >
                        <FileText className="size-5" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {exam.title}
                        </p>
                        <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-500">
                          <span className="inline-flex items-center gap-1">
                            <BookOpenCheck className="size-3.5" /> {exam.code}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <CalendarDays className="size-3.5" /> {formatDateTime(exam.date)}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Clock3 className="size-3.5" /> {exam.durationMinutes} min
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <FileText className="size-3.5" /> {exam.totalMarks} marks
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-2 pl-14 sm:justify-end sm:pl-0">
                      <StatusBadge status={exam.status} />
                      <Link
                        to="/student/exams/$examId"
                        params={{ examId: exam.id }}
                        className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"
                      >
                        Details <ArrowRight className="size-3.5" />
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="rounded-xl border border-dashed border-slate-200 p-7 text-center text-sm text-slate-500">
                No published or scheduled exams yet.
              </p>
            )}
          </section>

          <section className="rounded-2xl border border-emerald-950/[0.07] bg-white p-4 shadow-[0_14px_36px_-28px_rgba(17,74,55,0.3)] sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <FileText className="size-5" />
                </span>
                <div>
                  <h2 className="font-display text-base font-semibold text-slate-950">
                    Recent results
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Your latest exam results and performance.
                  </p>
                </div>
              </div>
              <Link
                to="/student/results"
                className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-900"
              >
                All results <ArrowRight className="size-3.5" />
              </Link>
            </div>
            {attemptsQuery.isPending ? (
              <p className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
                Loading your results…
              </p>
            ) : attemptsQuery.isError ? (
              <p
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700"
              >
                Could not load results.
              </p>
            ) : submitted.length ? (
              <>
                <ul className="space-y-2.5">
                  {submitted.slice(0, 4).map((attempt) => (
                    <li
                      key={attempt.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-emerald-950/8 p-3"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                          <FileText className="size-5" />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold text-slate-900">
                            {attempt.examTitle}
                          </span>
                          <span className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                            <GraduationCap className="size-3.5" /> {attempt.score}/
                            {attempt.totalMarks}
                          </span>
                        </span>
                      </div>
                      <StatusBadge status={attempt.status} />
                    </li>
                  ))}
                </ul>
                {average !== null ? (
                  <div className="mt-3 rounded-xl bg-[#f3faf7] p-3.5">
                    <div className="flex items-center justify-between text-xs font-medium text-slate-700">
                      <span>Overall progress</span>
                      <span className="text-emerald-700">{average}%</span>
                    </div>
                    <div
                      role="progressbar"
                      aria-label="Average exam score"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={average}
                      className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-emerald-100"
                    >
                      <div
                        className="h-full rounded-full bg-emerald-600 transition-[width]"
                        style={{ width: `${average}%` }}
                      />
                    </div>
                    <p className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500">
                      <Check className="size-3.5 text-emerald-600" /> Keep learning. You’re making
                      progress.
                    </p>
                  </div>
                ) : null}
              </>
            ) : (
              <p className="rounded-xl border border-dashed border-slate-200 p-7 text-center text-sm text-slate-500">
                No submitted exam results yet.
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

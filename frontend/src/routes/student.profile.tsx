import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Mail, UserRound } from "lucide-react";
import { PageHeader } from "@/features/shared/PageHeader";
import { useAuth } from "@/hooks/useAuth";
import { examService } from "@/services/examService";
import { formatDate, percentage } from "@/utils/format";

export const Route = createFileRoute("/student/profile")({
  head: () => ({
    meta: [
      { title: "My profile — ProctorEdu" },
      { name: "description", content: "View your student account and exam summary." },
      { property: "og:title", content: "My profile — ProctorEdu" },
      { property: "og:description", content: "View your student account and exam summary." },
    ],
  }),
  component: StudentProfile,
});

function StudentProfile() {
  const { user } = useAuth();
  const {
    data: attempts = [],
    isPending,
    isError,
  } = useQuery({
    queryKey: ["my-attempts"],
    queryFn: examService.listMyAttempts,
  });
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
  const field = "rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground";

  return (
    <div>
      <PageHeader
        title="My profile"
        description="Your account details and recorded exam activity."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-card lg:col-span-2">
          <h2 className="flex items-center gap-2 font-display text-base font-semibold text-foreground">
            <UserRound className="size-4" /> Account details
          </h2>
          <dl className="grid gap-4 sm:grid-cols-2">
            {[
              ["Full name", user?.name],
              ["Email", user?.email],
              ["Programme", user?.program],
              ["Roll number", user?.rollNumber],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="mb-1.5 text-xs font-medium text-muted-foreground">{label}</dt>
                <dd className={field}>{value || "Not provided"}</dd>
              </div>
            ))}
          </dl>
        </section>

        <aside className="space-y-5">
          <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-card">
            <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary-soft text-xl font-semibold text-primary">
              {user?.avatarInitials ?? ""}
            </span>
            <p className="mt-3 font-display text-base font-semibold text-foreground">
              {user?.name}
            </p>
            <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <Mail className="size-3.5" /> {user?.email}
            </p>
            <p className="mt-3 text-xs text-muted-foreground">
              Joined {formatDate(user?.joinedAt ?? "")}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <h3 className="text-sm font-semibold text-foreground">Exam summary</h3>
            {isPending ? (
              <p className="mt-3 text-sm text-muted-foreground">Loading attempts…</p>
            ) : null}
            {isError ? (
              <p className="mt-3 text-sm text-destructive">Could not load your attempts.</p>
            ) : null}
            {!isPending && !isError ? (
              <dl className="mt-3 space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Submitted exams</dt>
                  <dd className="font-semibold text-foreground">{submitted.length}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Average score</dt>
                  <dd className="font-semibold text-foreground">
                    {average === null ? "—" : `${average}%`}
                  </dd>
                </div>
              </dl>
            ) : null}
          </div>
        </aside>
      </div>
    </div>
  );
}

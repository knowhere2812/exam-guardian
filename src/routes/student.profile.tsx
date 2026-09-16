import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Bell, Mail, Save, ShieldCheck, UserRound } from "lucide-react";
import { PageHeader } from "@/features/shared/PageHeader";
import { useAuth } from "@/hooks/useAuth";
import { attempts } from "@/data/mockData";
import { formatDate, percentage } from "@/utils/format";

export const Route = createFileRoute("/student/profile")({
  head: () => ({
    meta: [
      { title: "My profile — ProctorEdu" },
      { name: "description", content: "Manage your student details, contact email and exam notifications." },
      { property: "og:title", content: "My profile — ProctorEdu" },
      { property: "og:description", content: "Manage your student details and exam notifications." },
    ],
  }),
  component: StudentProfile,
});

function StudentProfile() {
  const { user } = useAuth();
  const mine = attempts.filter((a) => a.studentId === (user?.id ?? "u-1") && a.submittedAt);
  const average = mine.length
    ? Math.round(mine.reduce((s, a) => s + percentage(a.score, a.totalMarks), 0) / mine.length)
    : 0;

  const [form, setForm] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    program: user?.program ?? "",
    rollNumber: user?.rollNumber ?? "",
  });
  const [notify, setNotify] = useState({ examReminders: true, resultAlerts: true, proctoringUpdates: false });
  const [saved, setSaved] = useState(false);

  const field = "w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

  return (
    <div>
      <PageHeader title="My profile" description="Your academic details and notification preferences." />

      <div className="grid gap-6 lg:grid-cols-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
          }}
          className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-card lg:col-span-2"
        >
          <h2 className="flex items-center gap-2 font-display text-base font-semibold text-foreground">
            <UserRound className="size-4" /> Personal details
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-muted-foreground">Full name</span>
              <input className={field} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-muted-foreground">Email</span>
              <input
                type="email"
                className={field}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-muted-foreground">Programme</span>
              <input
                className={field}
                value={form.program}
                onChange={(e) => setForm({ ...form, program: e.target.value })}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-muted-foreground">Roll number</span>
              <input
                className={field}
                value={form.rollNumber}
                onChange={(e) => setForm({ ...form, rollNumber: e.target.value })}
              />
            </label>
          </div>

          <h2 className="flex items-center gap-2 border-t border-border pt-5 font-display text-base font-semibold text-foreground">
            <Bell className="size-4" /> Notifications
          </h2>
          <div className="space-y-3">
            {(
              [
                ["examReminders", "Exam reminders", "24 hours before every scheduled exam"],
                ["resultAlerts", "Result alerts", "When a score is published"],
                ["proctoringUpdates", "Proctoring updates", "When a session review is closed"],
              ] as const
            ).map(([key, label, hint]) => (
              <label key={key} className="flex items-start justify-between gap-4 rounded-xl border border-border bg-surface p-3.5">
                <span>
                  <span className="block text-sm font-medium text-foreground">{label}</span>
                  <span className="block text-xs text-muted-foreground">{hint}</span>
                </span>
                <input
                  type="checkbox"
                  checked={notify[key]}
                  onChange={(e) => setNotify({ ...notify, [key]: e.target.checked })}
                  className="mt-1 size-4 accent-[var(--primary)]"
                />
              </label>
            ))}
          </div>

          <div className="flex items-center gap-3 border-t border-border pt-5">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              <Save className="size-4" /> Save changes
            </button>
            {saved ? <span className="text-sm font-medium text-success">Profile updated</span> : null}
          </div>
        </form>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-card">
            <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary-soft text-xl font-semibold text-primary">
              {user?.avatarInitials ?? "ST"}
            </span>
            <p className="mt-3 font-display text-base font-semibold text-foreground">{user?.name}</p>
            <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <Mail className="size-3.5" /> {user?.email}
            </p>
            <p className="mt-3 text-xs text-muted-foreground">Joined {formatDate(user?.joinedAt ?? "")}</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <h3 className="text-sm font-semibold text-foreground">Academic summary</h3>
            <dl className="mt-3 space-y-2.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Exams submitted</dt>
                <dd className="font-semibold text-foreground">{mine.length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Average score</dt>
                <dd className="font-semibold text-foreground">{average}%</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Sessions under review</dt>
                <dd className="font-semibold text-foreground">
                  {mine.filter((a) => a.status === "flagged").length}
                </dd>
              </div>
            </dl>
          </div>

          <div className="flex gap-3 rounded-2xl border border-primary/25 bg-primary-soft p-4">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
            <p className="text-xs text-foreground/90">
              Your proctoring recordings are retained for 90 days and accessible only to examination staff.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

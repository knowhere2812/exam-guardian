import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/features/shared/PageHeader";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({
    meta: [
      { title: "Settings — ProctorEdu admin" },
      { name: "description", content: "Institution profile, proctoring sensitivity and exam policy defaults." },
      { property: "og:title", content: "Settings — ProctorEdu admin" },
      { property: "og:description", content: "Institution profile and proctoring policy defaults." },
    ],
  }),
  component: AdminSettings,
});

const field = "mt-1.5 w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-primary";
const label = "text-xs font-medium text-muted-foreground";

function Toggle({ title, desc, defaultOn = true }: { title: string; desc: string; defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-start justify-between gap-4 border-t border-border py-4 first:border-t-0 first:pt-0">
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>
      </div>
      <button
        type="button"
        onClick={() => setOn((v) => !v)}
        aria-pressed={on}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${on ? "bg-primary" : "bg-muted"}`}
      >
        <span className={`absolute top-0.5 size-5 rounded-full bg-card shadow transition-all ${on ? "left-[22px]" : "left-0.5"}`} />
      </button>
    </div>
  );
}

function AdminSettings() {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);

  return (
    <div>
      <PageHeader title="Settings" description="Institution details, proctoring sensitivity and exam policy defaults." />

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <h2 className="text-sm font-semibold text-foreground">Institution profile</h2>
          <div className="mt-4 space-y-4">
            <div>
              <span className={label}>Institution name</span>
              <input className={field} defaultValue="Lovelace Institute of Technology" maxLength={120} />
            </div>
            <div>
              <span className={label}>Department</span>
              <input className={field} defaultValue={user?.department ?? "Department of Computer Science"} maxLength={120} />
            </div>
            <div>
              <span className={label}>Examination contact email</span>
              <input type="email" className={field} defaultValue={user?.email ?? "exams@exam.edu"} maxLength={255} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <h2 className="text-sm font-semibold text-foreground">Proctoring policy</h2>
          <div className="mt-4">
            <Toggle title="Require camera" desc="Students cannot start an exam without granting camera access." />
            <Toggle title="Require microphone" desc="Detects sustained background conversation during exams." />
            <Toggle title="Enforce fullscreen" desc="Prompts the student to return to fullscreen when they exit." />
            <Toggle title="Auto-flag high risk" desc="Sessions above 70 risk are queued for human review." />
            <Toggle title="Email alerts" desc="Notify invigilators when a high-severity signal occurs." defaultOn={false} />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <h2 className="text-sm font-semibold text-foreground">Exam defaults</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <span className={label}>Default duration (minutes)</span>
              <input type="number" min={5} max={300} className={field} defaultValue={60} />
            </div>
            <div>
              <span className={label}>Default pass percentage</span>
              <input type="number" min={1} max={100} className={field} defaultValue={40} />
            </div>
            <div>
              <span className={label}>Result visibility</span>
              <select className={field} defaultValue="after_review">
                <option value="immediate">Immediately after submission</option>
                <option value="after_review">After proctoring review</option>
                <option value="manual">Manual publish</option>
              </select>
            </div>
            <div>
              <span className={label}>Grace period (minutes)</span>
              <input type="number" min={0} max={30} className={field} defaultValue={5} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <h2 className="text-sm font-semibold text-foreground">Save changes</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Settings are held in local state for now and will persist once the API is connected.
          </p>
          {saved ? (
            <p className="mt-3 rounded-xl border border-success/30 bg-success-soft px-3 py-2 text-xs text-success">
              Preferences saved for this session.
            </p>
          ) : null}
          <button
            onClick={() => setSaved(true)}
            className="mt-4 w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Save settings
          </button>
        </div>
      </div>
    </div>
  );
}

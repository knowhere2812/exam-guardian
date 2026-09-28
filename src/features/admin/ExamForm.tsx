import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Save } from "lucide-react";
import type { Exam } from "@/data/mockData";

const field = "mt-1.5 w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-primary";
const label = "text-xs font-medium text-muted-foreground";

/** Presentational form. Wire `onSubmit` to examService once a real API exists. */
export function ExamForm({ exam }: { exam?: Exam | undefined }) {
  const [saved, setSaved] = useState(false);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSaved(true);
      }}
      className="grid gap-5 lg:grid-cols-[1fr_320px]"
    >
      <div className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-card">
        <div>
          <span className={label}>Exam title</span>
          <input className={field} defaultValue={exam?.title ?? ""} placeholder="e.g. Data Structures — Mid Term" required maxLength={120} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <span className={label}>Course code</span>
            <input className={field} defaultValue={exam?.code ?? ""} placeholder="CS201" required maxLength={12} />
          </div>
          <div>
            <span className={label}>Subject</span>
            <input className={field} defaultValue={exam?.subject ?? ""} placeholder="Computer Science" maxLength={60} />
          </div>
          <div>
            <span className={label}>Date &amp; time</span>
            <input type="datetime-local" className={field} defaultValue={exam ? exam.date.slice(0, 16) : ""} />
          </div>
          <div>
            <span className={label}>Duration (minutes)</span>
            <input type="number" min={5} max={300} className={field} defaultValue={exam?.durationMinutes ?? 60} />
          </div>
          <div>
            <span className={label}>Total marks</span>
            <input type="number" min={1} max={500} className={field} defaultValue={exam?.totalMarks ?? 50} />
          </div>
          <div>
            <span className={label}>Passing marks</span>
            <input type="number" min={1} max={500} className={field} defaultValue={exam?.passingMarks ?? 20} />
          </div>
        </div>
        <div>
          <span className={label}>Instructions (one per line)</span>
          <textarea
            className={field}
            rows={5}
            maxLength={1000}
            defaultValue={(exam?.instructions ?? []).join("\n")}
            placeholder="Camera and microphone must stay enabled."
          />
        </div>
      </div>

      <aside className="space-y-4">
        <div className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-card">
          <div>
            <span className={label}>Status</span>
            <select className={field} defaultValue={exam?.status ?? "draft"}>
              <option value="draft">Draft</option>
              <option value="upcoming">Upcoming</option>
              <option value="live">Live</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <label className="flex items-center gap-2.5 text-sm text-foreground">
            <input type="checkbox" defaultChecked={exam?.proctored ?? true} className="size-4 accent-primary" />
            Enable AI-assisted proctoring
          </label>
          <label className="flex items-center gap-2.5 text-sm text-foreground">
            <input type="checkbox" defaultChecked className="size-4 accent-primary" />
            Shuffle question order
          </label>
          <label className="flex items-center gap-2.5 text-sm text-foreground">
            <input type="checkbox" defaultChecked className="size-4 accent-primary" />
            Auto-submit when timer ends
          </label>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          {saved ? (
            <p className="mb-3 rounded-xl border border-success/30 bg-success-soft px-3 py-2 text-xs text-success">
              Saved locally. Connect the API to persist this exam.
            </p>
          ) : null}
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Save className="size-4" /> {exam ? "Save changes" : "Create exam"}
          </button>
          <Link
            to="/admin/exams"
            className="mt-2 flex w-full items-center justify-center rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-secondary"
          >
            Cancel
          </Link>
        </div>
      </aside>
    </form>
  );
}

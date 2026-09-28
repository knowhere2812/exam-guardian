import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Save } from "lucide-react";
import type { Exam, ExamStatus } from "@/data/mockData";
import { examService } from "@/services/examService";

const field =
  "mt-1.5 w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-primary";
const label = "text-xs font-medium text-muted-foreground";

export function ExamForm({ exam }: { exam?: Exam | undefined }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setBusy(true);

    const formData = new FormData(event.currentTarget);
    const startsAt = String(formData.get("startsAt") ?? "");
    const payload = {
      title: String(formData.get("title") ?? "").trim(),
      code: String(formData.get("code") ?? "").trim(),
      subject: String(formData.get("subject") ?? "").trim(),
      startsAt: startsAt ? new Date(startsAt).toISOString() : null,
      durationMinutes: Number(formData.get("durationMinutes")),
      totalMarks: Number(formData.get("totalMarks")),
      passingMarks: Number(formData.get("passingMarks")),
      instructions: String(formData.get("instructions") ?? "")
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
      status: String(formData.get("status")) as ExamStatus,
      proctored: formData.has("proctored"),
    };

    try {
      if (exam) await examService.updateExam(exam.id, payload);
      else await examService.createExam(payload);
      await queryClient.invalidateQueries({ queryKey: ["exams"] });
      navigate({ to: "/admin/exams" });
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save this exam.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <div className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-card">
        <div>
          <span className={label}>Exam title</span>
          <input
            name="title"
            className={field}
            defaultValue={exam?.title ?? ""}
            placeholder="e.g. Data Structures — Mid Term"
            required
            maxLength={120}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <span className={label}>Course code</span>
            <input
              name="code"
              className={field}
              defaultValue={exam?.code ?? ""}
              placeholder="CS201"
              required
              maxLength={12}
            />
          </div>
          <div>
            <span className={label}>Subject</span>
            <input
              name="subject"
              className={field}
              defaultValue={exam?.subject ?? ""}
              placeholder="Computer Science"
              required
              maxLength={60}
            />
          </div>
          <div>
            <span className={label}>Date &amp; time</span>
            <input
              name="startsAt"
              type="datetime-local"
              className={field}
              defaultValue={exam ? exam.date.slice(0, 16) : ""}
            />
          </div>
          <div>
            <span className={label}>Duration (minutes)</span>
            <input
              name="durationMinutes"
              type="number"
              min={5}
              max={300}
              className={field}
              defaultValue={exam?.durationMinutes ?? 60}
              required
            />
          </div>
          <div>
            <span className={label}>Total marks</span>
            <input
              name="totalMarks"
              type="number"
              min={1}
              max={500}
              className={field}
              defaultValue={exam?.totalMarks ?? 50}
              required
            />
          </div>
          <div>
            <span className={label}>Passing marks</span>
            <input
              name="passingMarks"
              type="number"
              min={1}
              max={500}
              className={field}
              defaultValue={exam?.passingMarks ?? 20}
              required
            />
          </div>
        </div>
        <div>
          <span className={label}>Instructions (one per line)</span>
          <textarea
            className={field}
            name="instructions"
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
            <select name="status" className={field} defaultValue={exam?.status ?? "upcoming"}>
              <option value="draft">Draft</option>
              <option value="upcoming">Scheduled</option>
              <option value="live">Published</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <label className="flex items-center gap-2.5 text-sm text-foreground">
            <input
              name="proctored"
              type="checkbox"
              defaultChecked={exam?.proctored ?? true}
              className="size-4 accent-primary"
            />
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
          {error ? (
            <p className="mb-3 rounded-xl border border-destructive/30 bg-danger-soft px-3 py-2 text-xs text-destructive">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-70"
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            {exam ? "Save changes" : "Create exam"}
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

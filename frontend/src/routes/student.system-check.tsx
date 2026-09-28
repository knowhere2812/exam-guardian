import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Loader2, RefreshCw, ShieldCheck, XCircle } from "lucide-react";
import { PageHeader } from "@/features/shared/PageHeader";
import { WebcamPreview } from "@/features/proctoring/WebcamPreview";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/student/system-check")({
  head: () => ({
    meta: [
      { title: "System check — ProctorEdu" },
      { name: "description", content: "Verify camera, microphone, browser and connection before a proctored exam." },
      { property: "og:title", content: "System check — ProctorEdu" },
      { property: "og:description", content: "Verify your device readiness before a proctored exam." },
    ],
  }),
  component: SystemCheck,
});

interface CheckItem {
  key: string;
  label: string;
  detail: string;
}

const checkList: CheckItem[] = [
  { key: "camera", label: "Camera access", detail: "A working webcam is required for face monitoring." },
  { key: "microphone", label: "Microphone access", detail: "Audio levels are monitored for background voices." },
  { key: "face", label: "Face detection", detail: "Your face must stay centred and clearly visible." },
  { key: "browser", label: "Secure browser mode", detail: "Fullscreen and focus tracking must be permitted." },
  { key: "network", label: "Network stability", detail: "A stable connection prevents lost answers." },
  { key: "screen", label: "Single display", detail: "Additional monitors must be disconnected." },
];

type State = "idle" | "running" | "pass" | "fail";

function SystemCheck() {
  const [states, setStates] = useState<Record<string, State>>(() =>
    Object.fromEntries(checkList.map((c) => [c.key, "idle"])),
  );
  const [running, setRunning] = useState(false);

  const run = () => {
    setStates(Object.fromEntries(checkList.map((c) => [c.key, "idle"])));
    setRunning(true);
  };

  useEffect(() => {
    if (!running) return;
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    checkList.forEach((c, i) => {
      timers.push(
        setTimeout(() => {
          if (cancelled) return;
          setStates((prev) => ({ ...prev, [c.key]: "running" }));
        }, i * 700),
      );
      timers.push(
        setTimeout(() => {
          if (cancelled) return;
          setStates((prev) => ({ ...prev, [c.key]: c.key === "screen" ? "fail" : "pass" }));
          if (i === checkList.length - 1) setRunning(false);
        }, i * 700 + 550),
      );
    });

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [running]);

  useEffect(() => {
    run();
  }, []);

  const passed = checkList.filter((c) => states[c.key] === "pass").length;
  const failed = checkList.filter((c) => states[c.key] === "fail").length;
  const ready = !running && failed === 0 && passed === checkList.length;

  return (
    <div>
      <PageHeader
        title="System check"
        description="Confirm your device meets the proctoring requirements before entering an exam."
        actions={
          <button
            onClick={run}
            disabled={running}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium hover:bg-secondary disabled:opacity-60"
          >
            <RefreshCw className={cn("size-4", running && "animate-spin")} /> Run again
          </button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-2xl border border-border bg-card p-5 shadow-card lg:col-span-2">
          <ul className="divide-y divide-border">
            {checkList.map((c) => {
              const state = states[c.key];
              return (
                <li key={c.key} className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0">
                  <div>
                    <p className="text-sm font-medium text-foreground">{c.label}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{c.detail}</p>
                  </div>
                  <span className="mt-0.5 shrink-0 text-xs font-medium">
                    {state === "pass" ? (
                      <span className="flex items-center gap-1.5 text-success">
                        <CheckCircle2 className="size-4" /> Ready
                      </span>
                    ) : state === "fail" ? (
                      <span className="flex items-center gap-1.5 text-warning-foreground">
                        <XCircle className="size-4" /> Action needed
                      </span>
                    ) : state === "running" ? (
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <Loader2 className="size-4 animate-spin" /> Checking
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Queued</span>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
            <h3 className="mb-3 text-sm font-semibold text-foreground">Camera preview</h3>
            <WebcamPreview size="lg" label="You" faceDetected />
            <p className="mt-3 text-xs text-muted-foreground">
              Sit in a well-lit room, facing the camera, with no one else in the frame.
            </p>
          </div>

          <div
            className={cn(
              "rounded-2xl border p-5",
              ready ? "border-success/30 bg-success-soft" : "border-warning/35 bg-warning-soft",
            )}
          >
            <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <ShieldCheck className="size-4" />
              {ready ? "Your device is exam ready" : `${failed} item needs your attention`}
            </p>
            <p className="mt-1.5 text-xs text-foreground/80">
              {ready
                ? "You can now enter your scheduled exam."
                : "Disconnect additional displays, then run the check again."}
            </p>
            <Link
              to="/student/exams"
              className="mt-4 inline-flex rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Go to my exams
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

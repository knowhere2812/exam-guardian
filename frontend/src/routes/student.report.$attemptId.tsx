import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { PageHeader } from "@/features/shared/PageHeader";

export const Route = createFileRoute("/student/report/$attemptId")({
  head: () => ({
    meta: [
      { title: "Proctoring report — ProctorEdu" },
      { name: "description", content: "Proctoring records for your exam attempt." },
      { property: "og:title", content: "Proctoring report — ProctorEdu" },
      { property: "og:description", content: "Proctoring records for your exam attempt." },
    ],
  }),
  component: ProctoringReport,
});

function ProctoringReport() {
  return (
    <div>
      <PageHeader title="Proctoring report" description="Recorded events for this exam attempt." />
      <section className="rounded-2xl border border-dashed border-border p-8 text-center">
        <ShieldCheck className="mx-auto size-6 text-muted-foreground" />
        <p className="mt-3 text-sm font-medium text-foreground">
          No proctoring report is available.
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Proctoring events are not being stored yet.
        </p>
        <Link
          to="/student/results"
          className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
        >
          Back to my results
        </Link>
      </section>
    </div>
  );
}

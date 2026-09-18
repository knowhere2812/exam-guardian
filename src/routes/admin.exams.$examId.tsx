import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { PageHeader } from "@/features/shared/PageHeader";
import { ExamForm } from "@/features/admin/ExamForm";
import { exams } from "@/data/mockData";

export const Route = createFileRoute("/admin/exams/$examId")({
  head: () => ({
    meta: [
      { title: "Edit exam — ProctorEdu admin" },
      { name: "description", content: "Update schedule, marking scheme and proctoring rules for this examination." },
      { property: "og:title", content: "Edit exam — ProctorEdu admin" },
      { property: "og:description", content: "Update schedule and proctoring rules for this examination." },
    ],
  }),
  component: EditExam,
});

function EditExam() {
  const { examId } = useParams({ from: "/admin/exams/$examId" });
  const exam = exams.find((e) => e.id === examId);

  if (!exam) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-10 text-center">
        <p className="text-sm text-muted-foreground">This exam could not be found.</p>
        <Link to="/admin/exams" className="mt-3 inline-block text-sm font-medium text-primary hover:underline">
          Back to exams
        </Link>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Edit exam" description={`${exam.code} · ${exam.title}`} />
      <ExamForm exam={exam} />
    </div>
  );
}

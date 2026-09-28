import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/features/shared/PageHeader";
import { ExamForm } from "@/features/admin/ExamForm";
import { examService } from "@/services/examService";

export const Route = createFileRoute("/admin/exams/$examId")({
  head: () => ({
    meta: [
      { title: "Edit exam — ProctorEdu admin" },
      {
        name: "description",
        content: "Update schedule, marking scheme and proctoring rules for this examination.",
      },
      { property: "og:title", content: "Edit exam — ProctorEdu admin" },
      {
        property: "og:description",
        content: "Update schedule and proctoring rules for this examination.",
      },
    ],
  }),
  component: EditExam,
});

function EditExam() {
  const { examId } = useParams({ from: "/admin/exams/$examId" });
  const {
    data: exam,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["exams", examId],
    queryFn: () => examService.getExam(examId),
  });

  if (isPending) {
    return <p className="p-8 text-center text-sm text-muted-foreground">Loading exam…</p>;
  }

  if (isError || !exam) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-10 text-center">
        <p className="text-sm text-muted-foreground">This exam could not be found.</p>
        <Link
          to="/admin/exams"
          className="mt-3 inline-block text-sm font-medium text-primary hover:underline"
        >
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

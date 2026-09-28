import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/features/shared/PageHeader";
import { ExamForm } from "@/features/admin/ExamForm";

export const Route = createFileRoute("/admin/exams/new")({
  head: () => ({
    meta: [
      { title: "Create exam — ProctorEdu admin" },
      { name: "description", content: "Set up a new proctored examination with schedule, marking scheme and rules." },
      { property: "og:title", content: "Create exam — ProctorEdu admin" },
      { property: "og:description", content: "Set up a new proctored examination." },
    ],
  }),
  component: CreateExam,
});

function CreateExam() {
  return (
    <div>
      <PageHeader title="Create exam" description="Define the paper, schedule and proctoring rules." />
      <ExamForm />
    </div>
  );
}

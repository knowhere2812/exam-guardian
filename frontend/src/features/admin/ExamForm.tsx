import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import type { Exam, ExamStatus } from "@/data/mockData";
import { examService } from "@/services/examService";
import type { ExamQuestionInput } from "@/services/examService";

const field =
  "mt-1.5 w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-primary";
const label = "text-xs font-medium text-muted-foreground";

function emptyQuestion(): ExamQuestionInput {
  return {
    text: "",
    options: ["", "", "", ""],
    correctIndex: 0,
    marks: 1,
    difficulty: "medium",
    topic: "",
  };
}

export function ExamForm({ exam }: { exam?: Exam | undefined }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [questions, setQuestions] = useState<ExamQuestionInput[]>([emptyQuestion()]);
  const existingQuestions = useQuery({
    queryKey: ["questions", exam?.id],
    queryFn: () => examService.listExamQuestions(exam!.id),
    enabled: Boolean(exam),
  });

  useEffect(() => {
    if (!existingQuestions.data) return;
    setQuestions(
      existingQuestions.data.map((question) => ({
        text: question.text,
        options: question.options,
        correctIndex: question.correctIndex ?? 0,
        marks: question.marks,
        difficulty: question.difficulty as ExamQuestionInput["difficulty"],
        topic: question.topic,
      })),
    );
  }, [existingQuestions.data]);

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
      questions: questions.map((question) => ({
        ...question,
        text: question.text.trim(),
        options: question.options.map((option) => option.trim()),
        topic: question.topic.trim(),
      })),
    };

    try {
      if (exam && existingQuestions.isError)
        throw new Error("Could not load this exam's existing questions.");
      if (exam && existingQuestions.isPending)
        throw new Error("Wait for the existing questions to finish loading.");
      if (
        payload.questions.some(
          (question) => !question.text || question.options.some((option) => !option),
        )
      ) {
        throw new Error("Enter the question text and all four answer choices for every question.");
      }
      if (
        payload.questions.reduce((total, question) => total + question.marks, 0) !==
        payload.totalMarks
      ) {
        throw new Error("Question marks must add up to the exam total marks.");
      }
      if (exam) await examService.updateExam(exam.id, payload);
      else await examService.createExam(payload);
      await queryClient.invalidateQueries({ queryKey: ["exams"] });
      if (exam) await queryClient.invalidateQueries({ queryKey: ["questions", exam.id] });
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
        <section className="space-y-4 border-t border-border pt-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Exam questions</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Add multiple-choice questions and mark the correct answer.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setQuestions((current) => [...current, emptyQuestion()])}
              className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary"
            >
              <Plus className="size-4" /> Add question
            </button>
          </div>
          {existingQuestions.isPending && exam ? (
            <p className="text-sm text-muted-foreground">Loading saved questions…</p>
          ) : null}
          {questions.map((question, questionIndex) => (
            <fieldset key={questionIndex} className="space-y-4 rounded-xl border border-border p-4">
              <div className="flex items-center justify-between gap-3">
                <legend className="text-sm font-medium text-foreground">
                  Question {questionIndex + 1}
                </legend>
                <button
                  type="button"
                  aria-label={`Remove question ${questionIndex + 1}`}
                  title="Remove question"
                  disabled={questions.length === 1}
                  onClick={() =>
                    setQuestions((current) => current.filter((_, index) => index !== questionIndex))
                  }
                  className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-destructive disabled:opacity-40"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
              <label className="block">
                <span className={label}>Question text</span>
                <textarea
                  value={question.text}
                  onChange={(event) =>
                    setQuestions((current) =>
                      current.map((item, index) =>
                        index === questionIndex ? { ...item, text: event.target.value } : item,
                      ),
                    )
                  }
                  className={field}
                  rows={3}
                  maxLength={2000}
                  placeholder="Enter the question"
                  required
                />
              </label>
              <div className="space-y-2">
                <span className={label}>Answer choices (select the correct answer)</span>
                {question.options.map((option, optionIndex) => (
                  <label key={optionIndex} className="flex items-center gap-3">
                    <input
                      type="radio"
                      name={`correct-answer-${questionIndex}`}
                      checked={question.correctIndex === optionIndex}
                      onChange={() =>
                        setQuestions((current) =>
                          current.map((item, index) =>
                            index === questionIndex ? { ...item, correctIndex: optionIndex } : item,
                          ),
                        )
                      }
                      className="size-4 shrink-0 accent-primary"
                      aria-label={`Mark choice ${optionIndex + 1} as correct`}
                    />
                    <input
                      value={option}
                      onChange={(event) =>
                        setQuestions((current) =>
                          current.map((item, index) =>
                            index === questionIndex
                              ? {
                                  ...item,
                                  options: item.options.map((value, choiceIndex) =>
                                    choiceIndex === optionIndex ? event.target.value : value,
                                  ),
                                }
                              : item,
                          ),
                        )
                      }
                      className={field}
                      maxLength={500}
                      placeholder={`Choice ${optionIndex + 1}`}
                      required
                    />
                  </label>
                ))}
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <label className="block">
                  <span className={label}>Marks</span>
                  <input
                    type="number"
                    min={1}
                    max={500}
                    value={question.marks}
                    onChange={(event) =>
                      setQuestions((current) =>
                        current.map((item, index) =>
                          index === questionIndex
                            ? { ...item, marks: Number(event.target.value) }
                            : item,
                        ),
                      )
                    }
                    className={field}
                    required
                  />
                </label>
                <label className="block">
                  <span className={label}>Topic</span>
                  <input
                    value={question.topic}
                    onChange={(event) =>
                      setQuestions((current) =>
                        current.map((item, index) =>
                          index === questionIndex ? { ...item, topic: event.target.value } : item,
                        ),
                      )
                    }
                    className={field}
                    maxLength={100}
                    placeholder="Optional"
                  />
                </label>
                <label className="block">
                  <span className={label}>Difficulty</span>
                  <select
                    value={question.difficulty}
                    onChange={(event) =>
                      setQuestions((current) =>
                        current.map((item, index) =>
                          index === questionIndex
                            ? {
                                ...item,
                                difficulty: event.target.value as ExamQuestionInput["difficulty"],
                              }
                            : item,
                        ),
                      )
                    }
                    className={field}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </label>
              </div>
            </fieldset>
          ))}
        </section>
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
            disabled={busy || (Boolean(exam) && existingQuestions.isPending)}
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

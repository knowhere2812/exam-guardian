import {
  attempts,
  exams,
  questions,
  studentRecords,
  analytics,
  liveAlerts,
  type Attempt,
  type Exam,
  type Question,
} from "@/data/mockData";
import { request } from "./apiClient";

export const examService = {
  listExams: () => request<Exam[]>("/exams", exams),
  getExam: (id: string) => request<Exam | undefined>(`/exams/${id}`, exams.find((e) => e.id === id)),
  listQuestions: (examId: string) =>
    request<Question[]>(`/exams/${examId}/questions`, questions.filter((q) => q.examId === examId)),
  listAllQuestions: () => request<Question[]>("/questions", questions),
  listAttempts: () => request<Attempt[]>("/attempts", attempts),
  listStudentAttempts: (studentId: string) =>
    request<Attempt[]>(`/students/${studentId}/attempts`, attempts.filter((a) => a.studentId === studentId)),
  getAttempt: (id: string) => request<Attempt | undefined>(`/attempts/${id}`, attempts.find((a) => a.id === id)),
  listStudents: () => request("/students", studentRecords),
  getAnalytics: () => request("/analytics", analytics),
  getLiveAlerts: () => request("/proctoring/alerts", liveAlerts),
  submitAttempt: (payload: { examId: string; answers: Record<string, number> }) =>
    request("/attempts", { ...payload, id: `a-${Date.now()}`, submittedAt: new Date().toISOString() }),
};

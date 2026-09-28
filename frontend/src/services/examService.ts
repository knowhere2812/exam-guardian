import type { Exam, ExamStatus } from "@/data/mockData";
import { fetchJson } from "./apiClient";

export interface ExamInput {
  title: string;
  code: string;
  subject: string;
  startsAt: string | null;
  durationMinutes: number;
  totalMarks: number;
  passingMarks: number;
  instructions: string[];
  status: ExamStatus;
  proctored: boolean;
}

export interface StudentAttempt {
  id: string;
  examId: string;
  examTitle: string;
  submittedAt: string | null;
  score: number | null;
  totalMarks: number;
  status: "passed" | "failed" | "in_progress";
}

export interface AdminAttempt extends StudentAttempt {
  studentName: string;
  studentEmail: string;
}

export interface StudentRecord {
  id: string;
  name: string;
  email: string;
  rollNumber: string | null;
  program: string | null;
  attempts: number;
  joinedAt: string;
}

export interface ExamQuestion {
  id: string;
  examId: string;
  text: string;
  options: string[];
  correctIndex?: number;
  marks: number;
  difficulty: string;
  topic: string;
  examTitle?: string;
  examCode?: string;
}

export interface ActiveExamAttempt {
  id: string;
  startedAt: string;
  expiresAt: string;
  answers: Record<string, number>;
}

export interface SubmittedAttempt {
  id: string;
  score: number;
  totalMarks: number;
}

export const examService = {
  listExams(): Promise<Exam[]> {
    return fetchJson<Exam[]>("/exams");
  },

  listMyAttempts(): Promise<StudentAttempt[]> {
    return fetchJson<StudentAttempt[]>("/attempts/mine");
  },

  listAdminAttempts(): Promise<AdminAttempt[]> {
    return fetchJson<AdminAttempt[]>("/attempts");
  },

  listStudents(): Promise<StudentRecord[]> {
    return fetchJson<StudentRecord[]>("/students");
  },

  listQuestions(): Promise<ExamQuestion[]> {
    return fetchJson<ExamQuestion[]>("/questions");
  },

  listExamQuestions(examId: string): Promise<ExamQuestion[]> {
    return fetchJson<ExamQuestion[]>(`/exams/${encodeURIComponent(examId)}/questions`);
  },

  startAttempt(examId: string): Promise<ActiveExamAttempt> {
    return fetchJson<ActiveExamAttempt>("/attempts", {
      method: "POST",
      body: JSON.stringify({ examId }),
    });
  },

  saveAnswers(attemptId: string, answers: Record<string, number>): Promise<{ saved: number }> {
    return fetchJson<{ saved: number }>(`/attempts/${encodeURIComponent(attemptId)}/answers`, {
      method: "PUT",
      body: JSON.stringify({
        answers: Object.entries(answers).map(([questionId, selectedIndex]) => ({
          questionId,
          selectedIndex,
        })),
      }),
    });
  },

  submitAttempt(attemptId: string): Promise<SubmittedAttempt> {
    return fetchJson<SubmittedAttempt>(`/attempts/${encodeURIComponent(attemptId)}/submit`, {
      method: "POST",
    });
  },

  getExam(id: string): Promise<Exam> {
    return fetchJson<Exam>(`/exams/${encodeURIComponent(id)}`);
  },

  createExam(input: ExamInput): Promise<Exam> {
    return fetchJson<Exam>("/exams", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  updateExam(id: string, input: ExamInput): Promise<Exam> {
    return fetchJson<Exam>(`/exams/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify(input),
    });
  },
};

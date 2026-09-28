import { Router, type Request } from "express";
import { ExamStatus } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { ApiError } from "../middleware/errors.js";
import { requireAuth } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";

const questionInputSchema = z.object({
  text: z.string().trim().min(1).max(2000),
  options: z.array(z.string().trim().min(1).max(500)).length(4),
  correctIndex: z.number().int().min(0).max(3),
  marks: z.number().int().min(1).max(500),
  difficulty: z.enum(["easy", "medium", "hard"]),
  topic: z.string().trim().max(100),
});

const examInputSchema = z
  .object({
    title: z.string().trim().min(1).max(120),
    code: z.string().trim().min(1).max(12),
    subject: z.string().trim().min(1).max(60),
    startsAt: z.string().datetime().nullable(),
    durationMinutes: z.number().int().min(5).max(300),
    totalMarks: z.number().int().min(1).max(500),
    passingMarks: z.number().int().min(1).max(500),
    instructions: z.array(z.string().trim().min(1)).max(20),
    status: z.enum(["draft", "upcoming", "live", "completed"]),
    proctored: z.boolean(),
    questions: z.array(questionInputSchema).min(1).max(200),
  })
  .superRefine((exam, context) => {
    const questionMarks = exam.questions.reduce(
      (total, question) => total + question.marks,
      0,
    );
    if (questionMarks !== exam.totalMarks) {
      context.addIssue({
        code: "custom",
        path: ["questions"],
        message: "Question marks must add up to the exam total marks",
      });
    }
  });

type RequestUser = { id: string; role: string };

function getUser(req: Request): RequestUser {
  const user = (req as Request & { user?: RequestUser }).user;
  if (!user) throw new ApiError(401, "Authentication required");
  return user;
}

function requireAdmin(req: Request): RequestUser {
  const user = getUser(req);
  if (user.role !== "ADMIN") throw new ApiError(403, "Admin access required");
  return user;
}

function getExamId(req: Request): string {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  if (!id) throw new ApiError(400, "Exam ID is required");
  return id;
}

function databaseStatus(
  status: z.infer<typeof examInputSchema>["status"],
): ExamStatus {
  const statusMap = {
    draft: ExamStatus.DRAFT,
    upcoming: ExamStatus.SCHEDULED,
    live: ExamStatus.PUBLISHED,
    completed: ExamStatus.ARCHIVED,
  };
  return statusMap[status];
}

function toApiExam(exam: {
  id: string;
  title: string;
  code: string;
  subject: string;
  instructions: string[];
  durationMinutes: number;
  totalMarks: number;
  passingMarks: number;
  startsAt: Date | null;
  createdAt: Date;
  status: ExamStatus;
  proctored: boolean;
  _count?: { questions: number; attempts: number };
}) {
  const statusMap: Record<
    ExamStatus,
    "draft" | "upcoming" | "live" | "completed"
  > = {
    [ExamStatus.DRAFT]: "draft",
    [ExamStatus.SCHEDULED]: "upcoming",
    [ExamStatus.PUBLISHED]: "live",
    [ExamStatus.ARCHIVED]: "completed",
  };

  return {
    id: exam.id,
    title: exam.title,
    code: exam.code,
    subject: exam.subject,
    date: (exam.startsAt ?? exam.createdAt).toISOString(),
    durationMinutes: exam.durationMinutes,
    totalQuestions: exam._count?.questions ?? 0,
    totalMarks: exam.totalMarks,
    passingMarks: exam.passingMarks,
    status: statusMap[exam.status],
    proctored: exam.proctored,
    enrolled: exam._count?.attempts ?? 0,
    attempted: exam._count?.attempts ?? 0,
    instructions: exam.instructions,
  };
}

function examData(input: z.infer<typeof examInputSchema>) {
  const startsAt = input.startsAt ? new Date(input.startsAt) : null;
  return {
    title: input.title,
    code: input.code,
    subject: input.subject,
    instructions: input.instructions,
    durationMinutes: input.durationMinutes,
    totalMarks: input.totalMarks,
    passingMarks: input.passingMarks,
    startsAt,
    endsAt: startsAt
      ? new Date(startsAt.getTime() + input.durationMinutes * 60_000)
      : null,
    status: databaseStatus(input.status),
    proctored: input.proctored,
  };
}

function questionData(questions: z.infer<typeof questionInputSchema>[]) {
  return questions.map((question) => ({
    ...question,
    topic: question.topic || null,
  }));
}

export const examsRouter = Router();

examsRouter.get("/", requireAuth, async (req, res, next) => {
  try {
    const user = getUser(req);
    const exams = await prisma.exam.findMany({
      where:
        user.role === "ADMIN"
          ? { createdById: user.id }
          : {
              status: {
                in: [
                  ExamStatus.SCHEDULED,
                  ExamStatus.PUBLISHED,
                  ExamStatus.ARCHIVED,
                ],
              },
            },
      include: { _count: { select: { questions: true, attempts: true } } },
      orderBy: [{ startsAt: "asc" }, { createdAt: "desc" }],
    });
    res.json(exams.map(toApiExam));
  } catch (error) {
    next(error);
  }
});

examsRouter.get("/:id", requireAuth, async (req, res, next) => {
  try {
    const user = getUser(req);
    const exam = await prisma.exam.findFirst({
      where: {
        id: getExamId(req),
        ...(user.role === "ADMIN"
          ? { createdById: user.id }
          : {
              status: {
                in: [
                  ExamStatus.SCHEDULED,
                  ExamStatus.PUBLISHED,
                  ExamStatus.ARCHIVED,
                ],
              },
            }),
      },
      include: { _count: { select: { questions: true, attempts: true } } },
    });
    if (!exam) throw new ApiError(404, "Exam not found");
    res.json(toApiExam(exam));
  } catch (error) {
    next(error);
  }
});

examsRouter.get("/:id/questions", requireAuth, async (req, res, next) => {
  try {
    const user = getUser(req);
    const examId = getExamId(req);
    const exam = await prisma.exam.findFirst({
      where: {
        id: examId,
        ...(user.role === "ADMIN"
          ? { createdById: user.id }
          : { status: { in: [ExamStatus.SCHEDULED, ExamStatus.PUBLISHED] } }),
      },
      select: { id: true },
    });
    if (!exam) throw new ApiError(404, "Exam not found");

    const questions = await prisma.question.findMany({
      where: { examId },
      select: {
        id: true,
        examId: true,
        text: true,
        options: true,
        correctIndex: true,
        marks: true,
        difficulty: true,
        topic: true,
      },
      orderBy: { createdAt: "asc" },
    });
    res.json(
      questions.map((question) => ({
        ...question,
        ...(user.role === "ADMIN"
          ? { correctIndex: question.correctIndex }
          : {}),
      })),
    );
  } catch (error) {
    next(error);
  }
});

examsRouter.post(
  "/",
  requireAuth,
  validateBody(examInputSchema),
  async (req, res, next) => {
    try {
      const user = requireAdmin(req);
      const exam = await prisma.exam.create({
        data: {
          ...examData(req.body),
          createdById: user.id,
          questions: { create: questionData(req.body.questions) },
        },
        include: { _count: { select: { questions: true, attempts: true } } },
      });
      res.status(201).json(toApiExam(exam));
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        return next(
          new ApiError(409, "An exam with this course code already exists"),
        );
      }
      next(error);
    }
  },
);

examsRouter.put(
  "/:id",
  requireAuth,
  validateBody(examInputSchema),
  async (req, res, next) => {
    try {
      const user = requireAdmin(req);
      const existing = await prisma.exam.findFirst({
        where: { id: getExamId(req), createdById: user.id },
        include: { _count: { select: { attempts: true } } },
      });
      if (!existing) throw new ApiError(404, "Exam not found");
      if (existing._count.attempts > 0) {
        throw new ApiError(
          409,
          "Questions cannot be changed after students start this exam",
        );
      }

      const exam = await prisma.exam.update({
        where: { id: existing.id },
        data: {
          ...examData(req.body),
          questions: {
            deleteMany: {},
            create: questionData(req.body.questions),
          },
        },
        include: { _count: { select: { questions: true, attempts: true } } },
      });
      res.json(toApiExam(exam));
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        return next(
          new ApiError(409, "An exam with this course code already exists"),
        );
      }
      next(error);
    }
  },
);

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

export default examsRouter;

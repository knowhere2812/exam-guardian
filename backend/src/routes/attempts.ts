import { Router } from "express";
import { AttemptStatus, ExamStatus, ViolationType } from "@prisma/client";
import type { Request } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { ApiError } from "../middleware/errors.js";
import { requireAuth } from "../middleware/auth.js";

const startSchema = z.object({ examId: z.string().min(1) });
const answersSchema = z.object({
  answers: z
    .array(
      z.object({
        questionId: z.string().min(1),
        selectedIndex: z.number().int().min(0),
      }),
    )
    .max(500),
});
const proctorEventSchema = z.object({
  type: z.nativeEnum(ViolationType),
});
const proctorEventsSchema = z.object({
  sessionId: z.string().min(1),
  events: z.array(proctorEventSchema).min(1).max(100),
});

function routeId(req: Request): string {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  if (!id) throw new ApiError(400, "Attempt ID is required");
  return id;
}

export const attemptsRouter = Router();

attemptsRouter.post("/", requireAuth, async (req, res, next) => {
  try {
    const user = (req as Request & { user?: { id: string; role: string } })
      .user;
    if (!user) throw new ApiError(401, "Authentication required");
    if (user.role !== "STUDENT")
      throw new ApiError(403, "Student access required");
    const { examId } = startSchema.parse(req.body);
    const existing = await prisma.attempt.findUnique({
      where: { examId_studentId: { examId, studentId: user.id } },
      include: { answers: true },
    });

    if (existing) {
      if (
        existing.status !== AttemptStatus.IN_PROGRESS ||
        existing.expiresAt <= new Date()
      ) {
        throw new ApiError(409, "An attempt for this exam already exists");
      }
      return res.json({
        id: existing.id,
        startedAt: existing.startedAt.toISOString(),
        expiresAt: existing.expiresAt.toISOString(),
        answers: Object.fromEntries(
          existing.answers.flatMap((answer) =>
            answer.selectedIndex === null
              ? []
              : [[answer.questionId, answer.selectedIndex]],
          ),
        ),
      });
    }

    const exam = await prisma.exam.findFirst({
      where: {
        id: examId,
        status: { in: [ExamStatus.SCHEDULED, ExamStatus.PUBLISHED] },
      },
      include: { _count: { select: { questions: true } } },
    });
    if (!exam) throw new ApiError(404, "Exam not found or not available");
    if (exam._count.questions === 0)
      throw new ApiError(409, "This exam has no questions yet");

    const startedAt = new Date();
    const attempt = await prisma.attempt.create({
      data: {
        examId,
        studentId: user.id,
        startedAt,
        expiresAt: new Date(
          startedAt.getTime() + exam.durationMinutes * 60_000,
        ),
      },
    });
    res.status(201).json({
      id: attempt.id,
      startedAt: attempt.startedAt.toISOString(),
      expiresAt: attempt.expiresAt.toISOString(),
      answers: {},
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return next(new ApiError(409, "An attempt for this exam already exists"));
    }
    next(error);
  }
});

attemptsRouter.put("/:id/answers", requireAuth, async (req, res, next) => {
  try {
    const user = (req as Request & { user?: { id: string; role: string } })
      .user;
    if (!user) throw new ApiError(401, "Authentication required");
    if (user.role !== "STUDENT")
      throw new ApiError(403, "Student access required");
    const { answers } = answersSchema.parse(req.body);
    const attempt = await prisma.attempt.findFirst({
      where: { id: routeId(req), studentId: user.id },
    });
    if (!attempt) throw new ApiError(404, "Attempt not found");
    if (
      attempt.status !== AttemptStatus.IN_PROGRESS ||
      attempt.expiresAt <= new Date()
    ) {
      throw new ApiError(409, "This attempt is no longer accepting answers");
    }

    const questions = await prisma.question.findMany({
      where: {
        examId: attempt.examId,
        id: { in: answers.map((answer) => answer.questionId) },
      },
      select: { id: true, options: true },
    });
    const questionById = new Map(
      questions.map((question) => [question.id, question]),
    );
    if (
      questionById.size !==
      new Set(answers.map((answer) => answer.questionId)).size
    ) {
      throw new ApiError(
        400,
        "One or more questions do not belong to this exam",
      );
    }
    for (const answer of answers) {
      if (
        answer.selectedIndex >=
        (questionById.get(answer.questionId)?.options.length ?? 0)
      ) {
        throw new ApiError(400, "Selected answer is invalid");
      }
    }

    await prisma.$transaction(
      answers.map((answer) =>
        prisma.answer.upsert({
          where: {
            attemptId_questionId: {
              attemptId: attempt.id,
              questionId: answer.questionId,
            },
          },
          create: { attemptId: attempt.id, ...answer },
          update: { selectedIndex: answer.selectedIndex },
        }),
      ),
    );
    res.json({ saved: answers.length });
  } catch (error) {
    next(error);
  }
});

attemptsRouter.post("/:id/submit", requireAuth, async (req, res, next) => {
  try {
    const user = (req as Request & { user?: { id: string; role: string } })
      .user;
    if (!user) throw new ApiError(401, "Authentication required");
    if (user.role !== "STUDENT")
      throw new ApiError(403, "Student access required");
    const attempt = await prisma.attempt.findFirst({
      where: { id: routeId(req), studentId: user.id },
      include: { answers: { include: { question: true } }, exam: true },
    });
    if (!attempt) throw new ApiError(404, "Attempt not found");
    if (attempt.status === AttemptStatus.SUBMITTED && attempt.score !== null) {
      return res.json({
        id: attempt.id,
        score: attempt.score,
        totalMarks: attempt.exam.totalMarks,
      });
    }
    if (attempt.status !== AttemptStatus.IN_PROGRESS)
      throw new ApiError(409, "This attempt cannot be submitted");

    const score = attempt.answers.reduce(
      (total, answer) =>
        total +
        (answer.selectedIndex === answer.question.correctIndex
          ? answer.question.marks
          : 0),
      0,
    );
    const submittedAt = new Date();
    const submitted = await prisma.$transaction(async (transaction) => {
      const updatedAttempt = await transaction.attempt.update({
        where: { id: attempt.id },
        data: { score, submittedAt, status: AttemptStatus.SUBMITTED },
      });
      await transaction.proctoringSession.updateMany({
        where: { attemptId: attempt.id, endedAt: null },
        data: { endedAt: submittedAt },
      });
      return updatedAttempt;
    });
    res.json({ id: submitted.id, score, totalMarks: attempt.exam.totalMarks });
  } catch (error) {
    next(error);
  }
});

attemptsRouter.post(
  "/:id/proctoring/session",
  requireAuth,
  async (req, res, next) => {
    try {
      const user = (req as Request & { user?: { id: string; role: string } })
        .user;
      if (!user) throw new ApiError(401, "Authentication required");
      if (user.role !== "STUDENT")
        throw new ApiError(403, "Student access required");

      const attempt = await prisma.attempt.findFirst({
        where: { id: routeId(req), studentId: user.id },
        include: { exam: true },
      });
      if (!attempt) throw new ApiError(404, "Attempt not found");
      if (
        attempt.status !== AttemptStatus.IN_PROGRESS ||
        attempt.expiresAt <= new Date()
      ) {
        throw new ApiError(409, "This attempt is no longer being proctored");
      }
      if (!attempt.exam.proctored)
        throw new ApiError(409, "Proctoring is not required for this exam");

      const activeSession = await prisma.proctoringSession.findFirst({
        where: { attemptId: attempt.id, endedAt: null },
        orderBy: { startedAt: "desc" },
      });
      const session =
        activeSession ??
        (await prisma.proctoringSession.create({
          data: { attemptId: attempt.id },
        }));
      res.status(activeSession ? 200 : 201).json({ id: session.id });
    } catch (error) {
      next(error);
    }
  },
);

attemptsRouter.post(
  "/:id/proctoring/events",
  requireAuth,
  async (req, res, next) => {
    try {
      const user = (req as Request & { user?: { id: string; role: string } })
        .user;
      if (!user) throw new ApiError(401, "Authentication required");
      if (user.role !== "STUDENT")
        throw new ApiError(403, "Student access required");
      const { sessionId, events } = proctorEventsSchema.parse(req.body);

      const attempt = await prisma.attempt.findFirst({
        where: { id: routeId(req), studentId: user.id },
        select: { id: true, status: true, expiresAt: true },
      });
      if (!attempt) throw new ApiError(404, "Attempt not found");
      if (
        attempt.status !== AttemptStatus.IN_PROGRESS ||
        attempt.expiresAt <= new Date()
      ) {
        throw new ApiError(
          409,
          "This attempt is no longer accepting proctoring events",
        );
      }
      const session = await prisma.proctoringSession.findFirst({
        where: { id: sessionId, attemptId: attempt.id, endedAt: null },
        select: { id: true },
      });
      if (!session)
        throw new ApiError(404, "Active proctoring session not found");

      const result = await prisma.proctoringEvent.createMany({
        data: events.map(({ type }) => ({ sessionId: session.id, type })),
      });
      res.status(201).json({ saved: result.count });
    } catch (error) {
      next(error);
    }
  },
);

attemptsRouter.get("/", requireAuth, async (req, res, next) => {
  try {
    const user = (req as Request & { user?: { id: string; role: string } })
      .user;
    if (!user) throw new ApiError(401, "Authentication required");
    if (user.role !== "ADMIN") throw new ApiError(403, "Admin access required");

    const attempts = await prisma.attempt.findMany({
      where: { exam: { createdById: user.id } },
      include: { exam: true, student: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    });

    res.json(
      attempts.map((attempt) => ({
        id: attempt.id,
        studentName: attempt.student.name,
        studentEmail: attempt.student.email,
        examTitle: attempt.exam.title,
        submittedAt: attempt.submittedAt?.toISOString() ?? null,
        score: attempt.score,
        totalMarks: attempt.exam.totalMarks,
        status:
          attempt.status === AttemptStatus.IN_PROGRESS
            ? "in_progress"
            : attempt.score !== null &&
                attempt.score >= attempt.exam.passingMarks
              ? "passed"
              : "failed",
      })),
    );
  } catch (error) {
    next(error);
  }
});

attemptsRouter.get("/mine", requireAuth, async (req, res, next) => {
  try {
    const user = (req as Request & { user?: { id: string; role: string } })
      .user;
    if (!user) throw new ApiError(401, "Authentication required");
    if (user.role !== "STUDENT")
      throw new ApiError(403, "Student access required");

    const attempts = await prisma.attempt.findMany({
      where: { studentId: user.id },
      include: { exam: true },
      orderBy: { createdAt: "desc" },
    });

    res.json(
      attempts.map((attempt) => ({
        id: attempt.id,
        examId: attempt.examId,
        examTitle: attempt.exam.title,
        submittedAt: attempt.submittedAt?.toISOString() ?? null,
        score: attempt.score,
        totalMarks: attempt.exam.totalMarks,
        status:
          attempt.status === AttemptStatus.IN_PROGRESS
            ? "in_progress"
            : attempt.score !== null &&
                attempt.score >= attempt.exam.passingMarks
              ? "passed"
              : "failed",
      })),
    );
  } catch (error) {
    next(error);
  }
});

export default attemptsRouter;

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

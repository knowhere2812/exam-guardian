import { Router } from "express";
import type { Request } from "express";
import { prisma } from "../lib/prisma.js";
import { ApiError } from "../middleware/errors.js";
import { requireAuth } from "../middleware/auth.js";

export const questionsRouter = Router();

questionsRouter.get("/", requireAuth, async (req, res, next) => {
  try {
    const user = (req as Request & { user?: { id: string; role: string } })
      .user;
    if (!user) throw new ApiError(401, "Authentication required");
    if (user.role !== "ADMIN") throw new ApiError(403, "Admin access required");

    const questions = await prisma.question.findMany({
      where: { exam: { createdById: user.id } },
      include: { exam: { select: { title: true, code: true } } },
      orderBy: { createdAt: "desc" },
    });

    res.json(
      questions.map((question) => ({
        id: question.id,
        examId: question.examId,
        text: question.text,
        options: question.options,
        correctIndex: question.correctIndex,
        marks: question.marks,
        difficulty: question.difficulty ?? "medium",
        topic: question.topic ?? "",
        examTitle: question.exam.title,
        examCode: question.exam.code,
      })),
    );
  } catch (error) {
    next(error);
  }
});

export default questionsRouter;

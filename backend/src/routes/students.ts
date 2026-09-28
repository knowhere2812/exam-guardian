import { Router } from "express";
import { Role } from "@prisma/client";
import type { Request } from "express";
import { prisma } from "../lib/prisma.js";
import { ApiError } from "../middleware/errors.js";
import { requireAuth } from "../middleware/auth.js";

export const studentsRouter = Router();

studentsRouter.get("/", requireAuth, async (req, res, next) => {
  try {
    const user = (req as Request & { user?: { role: string } }).user;
    if (!user) throw new ApiError(401, "Authentication required");
    if (user.role !== "ADMIN") throw new ApiError(403, "Admin access required");

    const students = await prisma.user.findMany({
      where: { role: Role.STUDENT },
      select: {
        id: true,
        name: true,
        email: true,
        rollNumber: true,
        program: true,
        createdAt: true,
        _count: { select: { attempts: true } },
      },
      orderBy: { name: "asc" },
    });

    res.json(
      students.map((student) => ({
        id: student.id,
        name: student.name,
        email: student.email,
        rollNumber: student.rollNumber,
        program: student.program,
        attempts: student._count.attempts,
        joinedAt: student.createdAt.toISOString(),
      })),
    );
  } catch (error) {
    next(error);
  }
});

export default studentsRouter;

import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import {
  comparePasswordHash,
  hashPassword,
  normalizeRole,
  signJwt,
  toBackendRole,
} from "../lib/auth.js";
import { requireAuth } from "../middleware/auth.js";
import { ApiError } from "../middleware/errors.js";
import { validateBody } from "../middleware/validate.js";

const registerSchema = z
  .object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(["student", "admin"]).optional(),
    rollNumber: z.string().optional(),
    department: z.string().optional(),
  })
  .superRefine((value, context) => {
    if (value.role === "admin" && !value.department?.trim()) {
      context.addIssue({
        code: "custom",
        path: ["department"],
        message: "Department is required",
      });
    }
  });

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["student", "admin"]).optional(),
});

function buildPublicUser(user: {
  id: string;
  name: string;
  email: string;
  role: "STUDENT" | "ADMIN";
  program: string | null;
  rollNumber: string | null;
  department: string | null;
  createdAt: Date;
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: normalizeRole(user.role),
    program: user.program,
    rollNumber: user.rollNumber,
    department: user.department,
    avatarInitials: user.name
      .split(" ")
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase(),
    joinedAt: user.createdAt.toISOString(),
  };
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

export const authRouter = Router();

authRouter.post(
  "/register",
  validateBody(registerSchema),
  async (req, res, next) => {
    try {
      const { name, email, password, role, rollNumber, department } = req.body;
      const accountRole = role ?? "student";
      const user = await prisma.user.create({
        data: {
          name,
          email: email.toLowerCase(),
          passwordHash: await hashPassword(password),
          role: toBackendRole(accountRole),
          ...(accountRole === "admin"
            ? { department: department?.trim() }
            : { rollNumber, program: "B.Tech Computer Science" }),
        },
      });

      const token = signJwt({
        id: user.id,
        email: user.email,
        role: user.role,
      });
      res.status(201).json({ user: buildPublicUser(user), token });
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        return next(
          new ApiError(
            409,
            "An account with this email or roll number already exists",
          ),
        );
      }
      next(error);
    }
  },
);

authRouter.post("/login", validateBody(loginSchema), async (req, res, next) => {
  try {
    const { email, password, role } = req.body;
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user || (role && normalizeRole(user.role) !== role)) {
      throw new ApiError(401, "Invalid credentials");
    }

    const valid = await comparePasswordHash(password, user.passwordHash);
    if (!valid) throw new ApiError(401, "Invalid credentials");

    const token = signJwt({ id: user.id, email: user.email, role: user.role });
    res.json({ user: buildPublicUser(user), token });
  } catch (error) {
    next(error);
  }
});

authRouter.get("/me", requireAuth, async (req, res, next) => {
  try {
    const authUser = (req as typeof req & { user?: { id: string } }).user;
    if (!authUser) throw new ApiError(401, "Authentication required");

    const user = await prisma.user.findUnique({ where: { id: authUser.id } });
    if (!user) throw new ApiError(404, "User not found");

    res.json({ user: buildPublicUser(user) });
  } catch (error) {
    next(error);
  }
});

export default authRouter;

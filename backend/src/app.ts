import cors from "cors";
import express from "express";
import { isIP } from "node:net";
import { env } from "./config/env.js";
import authRouter from "./routes/auth.js";
import examsRouter from "./routes/exams.js";
import attemptsRouter from "./routes/attempts.js";
import studentsRouter from "./routes/students.js";
import questionsRouter from "./routes/questions.js";
import { errorHandler, notFoundHandler } from "./middleware/errors.js";

export const app = express();

function isDevelopmentOrigin(origin: string | undefined): boolean {
  if (env.NODE_ENV !== "development" || !origin) return false;

  let hostname: string;
  try {
    const url = new URL(origin);
    if (url.protocol !== "http:" && url.protocol !== "https:") return false;
    hostname = url.hostname.replace(/^\[|\]$/g, "");
  } catch {
    return false;
  }

  if (
    hostname === "localhost" ||
    hostname === "::1" ||
    /^127(?:\.\d{1,3}){3}$/.test(hostname)
  ) {
    return true;
  }
  if (isIP(hostname) !== 4) return false;

  const [first, second] = hostname.split(".").map(Number);
  return (
    first === 10 ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168)
  );
}

app.disable("x-powered-by");
app.use(
  cors({
    origin(origin, callback) {
      if (
        !origin ||
        origin === env.FRONTEND_ORIGIN ||
        isDevelopmentOrigin(origin)
      ) {
        return callback(null, true);
      }
      return callback(new Error("Origin not allowed by CORS"));
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRouter);
app.use("/api/exams", examsRouter);
app.use("/api/attempts", attemptsRouter);
app.use("/api/students", studentsRouter);
app.use("/api/questions", questionsRouter);

app.use(notFoundHandler);
app.use(errorHandler);

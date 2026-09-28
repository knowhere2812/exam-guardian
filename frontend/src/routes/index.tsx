import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { GraduationCap, Loader2, Lock, Mail, ShieldCheck, Video } from "lucide-react";
import { Brand } from "@/components/layouts/AppShell";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import type { Role } from "@/data/mockData";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sign in — ProctorEdu Secure Exam Platform" },
      {
        name: "description",
        content:
          "Sign in to ProctorEdu to take proctored university examinations or to monitor exam sessions as faculty.",
      },
      { property: "og:title", content: "Sign in — ProctorEdu Secure Exam Platform" },
      {
        property: "og:description",
        content:
          "Secure, proctored online examinations for universities. Student and faculty sign-in.",
      },
    ],
  }),
  component: LoginPage,
});

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-primary p-10 text-primary-foreground lg:flex">
        <span className="flex items-center gap-2 font-display text-lg font-semibold">
          <ShieldCheck className="size-6" /> ProctorEdu
        </span>
        <div className="max-w-md">
          <h2 className="font-display text-3xl font-semibold leading-tight">
            Examinations your institution can stand behind.
          </h2>
          <p className="mt-3 text-sm text-primary-foreground/80">
            Live invigilation signals, transparent violation records and human review before any
            decision is taken. No accusations — only evidence.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-primary-foreground/90">
            {[
              { icon: Video, text: "Camera, microphone and face presence checks" },
              { icon: ShieldCheck, text: "Secure browser and fullscreen monitoring" },
              { icon: GraduationCap, text: "Result analytics for every cohort" },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <span className="flex size-8 items-center justify-center rounded-lg bg-primary-foreground/15">
                  <Icon className="size-4" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-primary-foreground/70">Secure university examination platform</p>
      </div>
      <div className="flex items-center justify-center bg-surface px-4 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden">
            <Brand />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const pick = (next: Role) => {
    setRole(next);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) return setError("Enter your email and password to continue.");
    setBusy(true);
    try {
      const user = await login({ email, password, role });
      navigate({ to: user.role === "admin" ? "/admin" : "/student" });
    } catch {
      setError("We could not verify those details. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout>
      <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-card sm:p-8 lg:mt-0">
        <h1 className="font-display text-2xl font-semibold text-foreground">Sign in</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose your role and continue to the exam portal.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-2 rounded-xl bg-secondary p-1">
          {(["student", "admin"] as Role[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => pick(r)}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium capitalize transition-colors",
                role === r
                  ? "bg-card text-foreground shadow-card"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {r === "admin" ? "Admin / Teacher" : "Student"}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-foreground">Email</span>
            <span className="relative mt-1.5 block">
              <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-input bg-background py-2.5 pl-9 pr-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="you@university.edu"
              />
            </span>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-foreground">Password</span>
            <span className="relative mt-1.5 block">
              <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-input bg-background py-2.5 pl-9 pr-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="••••••••"
              />
            </span>
          </label>

          {error ? (
            <p className="rounded-xl border border-destructive/30 bg-danger-soft px-3 py-2 text-xs text-destructive">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-70"
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : null}
            Sign in as {role === "admin" ? "admin" : "student"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          New student?{" "}
          <Link to="/register" className="font-medium text-primary hover:underline">
            Create a student account
          </Link>
        </p>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Faculty member?{" "}
          <Link to="/register/admin" className="font-medium text-primary hover:underline">
            Create a teacher account
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

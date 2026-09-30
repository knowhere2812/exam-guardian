import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  GraduationCap,
  Loader2,
  LockKeyhole,
  Mail,
  UsersRound,
} from "lucide-react";
import { AuthLayout } from "@/components/layouts/AuthLayout";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import type { Role } from "@/data/mockData";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — ProctorEdu Secure Exam Platform" },
      {
        name: "description",
        content: "Sign in to take a proctored examination or manage exam sessions as faculty.",
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

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
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
      <Link
        to="/"
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 transition hover:text-emerald-800"
      >
        <ArrowLeft className="size-4" /> Back to home
      </Link>
      <div className="text-center">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-950">
          Sign in
        </h1>
        <p className="mt-1.5 text-sm text-slate-600">
          Choose your role and continue to the exam portal.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-1.5 rounded-xl bg-slate-100/80 p-1">
        {(
          [
            { value: "student", label: "Student", icon: GraduationCap },
            { value: "admin", label: "Admin / Teacher", icon: UsersRound },
          ] as const
        ).map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => setRole(value)}
            aria-pressed={role === value}
            className={cn(
              "flex min-h-11 items-center justify-center gap-2 rounded-lg px-2 text-xs font-semibold transition sm:text-sm",
              role === value
                ? "bg-white text-emerald-800 shadow-sm ring-1 ring-emerald-100"
                : "text-slate-500 hover:text-slate-800",
            )}
          >
            <Icon className="size-4" /> {label}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="mt-6 space-y-4">
        <label className="block">
          <span className="text-sm font-semibold text-slate-900">Email</span>
          <span className="relative mt-1.5 block">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4.5 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-11 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
              placeholder="you@university.edu"
            />
          </span>
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-slate-900">Password</span>
          <span className="relative mt-1.5 block">
            <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 size-4.5 -translate-y-1/2 text-slate-400" />
            <input
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-11 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              {showPassword ? <EyeOff className="size-4.5" /> : <Eye className="size-4.5" />}
            </button>
          </span>
        </label>

        {error ? (
          <p
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
          >
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={busy}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 text-sm font-semibold text-white shadow-[0_10px_22px_-12px_rgba(4,120,87,0.75)] transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {busy ? <Loader2 className="size-4 animate-spin" /> : null}
          Sign in as {role === "admin" ? "admin" : "student"}
          {!busy ? <ArrowRight className="size-4" /> : null}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs text-slate-500">
        <span className="h-px flex-1 bg-slate-200" />
        <span>New to ProctorEdu?</span>
        <span className="h-px flex-1 bg-slate-200" />
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <Link
          to="/register"
          className="flex min-h-12 items-center justify-between gap-2 rounded-xl border border-emerald-200 bg-emerald-50/50 px-3.5 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-50"
        >
          <span className="flex items-center gap-2">
            <GraduationCap className="size-4" /> Create student account
          </span>
          <ArrowRight className="size-4 shrink-0" />
        </Link>
        <Link
          to="/register/admin"
          className="flex min-h-12 items-center justify-between gap-2 rounded-xl border border-sky-200 bg-sky-50/50 px-3.5 text-xs font-semibold text-sky-800 transition hover:bg-sky-50"
        >
          <span className="flex items-center gap-2">
            <UsersRound className="size-4" /> Create teacher account
          </span>
          <ArrowRight className="size-4 shrink-0" />
        </Link>
      </div>
    </AuthLayout>
  );
}

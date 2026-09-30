import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="auth-backdrop relative isolate flex min-h-screen items-center justify-center overflow-hidden px-4 py-8 sm:px-6">
      <div className="relative w-full max-w-lg">
        <div className="rounded-[1.75rem] border border-white/90 bg-white/85 px-6 py-7 shadow-[0_24px_70px_-32px_rgba(15,61,48,0.3)] backdrop-blur-xl sm:px-10 sm:py-9">
          <Link
            to="/"
            className="mx-auto flex w-fit items-center gap-2.5"
            aria-label="ProctorEdu home"
          >
            <span className="flex size-11 items-center justify-center rounded-2xl bg-emerald-700 text-white shadow-sm">
              <ShieldCheck className="size-6" />
            </span>
            <span className="font-display text-2xl font-bold tracking-tight text-slate-950">
              Proctor<span className="text-emerald-700">Edu</span>
            </span>
          </Link>
          <div className="mt-6">{children}</div>
        </div>
        <p className="mt-5 text-center text-xs text-slate-500">
          Secure university examinations, with people at the center.
        </p>
      </div>
    </main>
  );
}

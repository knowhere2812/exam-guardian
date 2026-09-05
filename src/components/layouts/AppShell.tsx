import { useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  BookOpen,
  ClipboardList,
  FileCheck2,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  Settings,
  Users,
  UserRound,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import type { Role } from "@/data/mockData";

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

const studentNav: NavItem[] = [
  { to: "/student", label: "Dashboard", icon: LayoutDashboard },
  { to: "/student/exams", label: "My Exams", icon: BookOpen },
  { to: "/student/results", label: "Results", icon: FileCheck2 },
  { to: "/student/system-check", label: "System Check", icon: ShieldCheck },
  { to: "/student/profile", label: "Profile", icon: UserRound },
];

const adminNav: NavItem[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/exams", label: "Exams", icon: BookOpen },
  { to: "/admin/questions", label: "Question Bank", icon: ClipboardList },
  { to: "/admin/students", label: "Students", icon: Users },
  { to: "/admin/attempts", label: "Exam Attempts", icon: FileCheck2 },
  { to: "/admin/results", label: "Results", icon: GraduationCap },
  { to: "/admin/proctoring", label: "Proctoring", icon: ShieldCheck },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

export function Brand({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
        <ShieldCheck className="size-5" />
      </span>
      <span className="leading-tight">
        <span className="block font-display text-base font-semibold text-foreground">ProctorEdu</span>
        <span className="block text-[11px] text-muted-foreground">Secure Exam Platform</span>
      </span>
    </span>
  );
}

export function AppShell({ role, children }: { role: Role; children: ReactNode }) {
  const nav = role === "admin" ? adminNav : studentNav;
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  const isActive = (to: string) => (to.endsWith("/student") || to.endsWith("/admin") ? pathname === to : pathname.startsWith(to));

  const navList = (
    <nav className="space-y-1">
      {nav.map(({ to, label, icon: Icon }) => (
        <Link
          key={to}
          to={to}
          onClick={() => setOpen(false)}
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
            isActive(to)
              ? "bg-primary-soft text-primary"
              : "text-muted-foreground hover:bg-secondary hover:text-foreground",
          )}
        >
          <Icon className="size-4" />
          {label}
        </Link>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-border bg-card px-4 py-5 lg:flex">
        <Brand className="px-1" />
        <div className="mt-7 flex-1 overflow-y-auto">{navList}</div>
        <div className="mt-4 rounded-xl border border-border bg-surface p-3">
          <p className="text-xs font-medium text-foreground">{user?.name}</p>
          <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{user?.email}</p>
          <button
            onClick={() => {
              logout();
              navigate({ to: "/" });
            }}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
          >
            <LogOut className="size-3.5" /> Sign out
          </button>
        </div>
      </aside>

      {open ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-foreground/30" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-72 flex-col bg-card px-4 py-5 shadow-lift">
            <div className="flex items-center justify-between">
              <Brand />
              <button onClick={() => setOpen(false)} aria-label="Close menu" className="rounded-lg p-2 hover:bg-secondary">
                <X className="size-4" />
              </button>
            </div>
            <div className="mt-6 flex-1 overflow-y-auto">{navList}</div>
            <button
              onClick={() => {
                logout();
                navigate({ to: "/" });
              }}
              className="mt-3 flex items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-medium"
            >
              <LogOut className="size-3.5" /> Sign out
            </button>
          </div>
        </div>
      ) : null}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border bg-card/85 px-4 py-3 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              className="rounded-lg border border-border p-2 lg:hidden"
            >
              <Menu className="size-4" />
            </button>
            <span className="text-sm font-medium text-muted-foreground">
              {role === "admin" ? "Examination Control Centre" : "Student Portal"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-right sm:block">
              <span className="block text-sm font-medium text-foreground">{user?.name}</span>
              <span className="block text-[11px] capitalize text-muted-foreground">{role}</span>
            </span>
            <span className="flex size-9 items-center justify-center rounded-full bg-primary-soft text-sm font-semibold text-primary">
              {user?.avatarInitials ?? "U"}
            </span>
          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      </div>
    </div>
  );
}

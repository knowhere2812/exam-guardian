import { useEffect, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import type { Role } from "@/data/mockData";
import { AppShell } from "./AppShell";

/**
 * Mock route guard. When a real API/session exists, swap the localStorage-backed
 * `useAuth` for a server-validated session check.
 */
export function RequireRole({ role, children }: { role: Role; children: ReactNode }) {
  const { user, ready } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!ready) return;
    if (!user) navigate({ to: "/login" });
    else if (user.role !== role) navigate({ to: user.role === "admin" ? "/admin" : "/student" });
  }, [ready, user, role, navigate]);

  if (!ready || !user || user.role !== role) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <AppShell role={role}>{children}</AppShell>;
}

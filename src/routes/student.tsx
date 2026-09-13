import { createFileRoute, Outlet } from "@tanstack/react-router";
import { RequireRole } from "@/components/layouts/RequireRole";

export const Route = createFileRoute("/student")({
  component: () => (
    <RequireRole role="student">
      <Outlet />
    </RequireRole>
  ),
});

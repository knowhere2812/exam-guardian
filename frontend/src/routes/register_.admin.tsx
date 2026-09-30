import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { AuthLayout } from "@/components/layouts/AuthLayout";

export const Route = createFileRoute("/register_/admin")({
  head: () => ({
    meta: [
      { title: "Create a teacher account — ProctorEdu" },
      {
        name: "description",
        content:
          "Register as an admin or teacher to manage exams, review attempts and monitor proctored sessions.",
      },
      { property: "og:title", content: "Create a teacher account — ProctorEdu" },
      {
        property: "og:description",
        content: "Create a faculty account to manage examinations and proctoring workflows.",
      },
    ],
  }),
  component: RegisterAdminPage,
});

function RegisterAdminPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    department: "",
    password: "",
    confirm: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.name || !form.email || !form.department || !form.password) {
      return setError("Please fill in your full name, institution email, department and password.");
    }

    if (form.password.length < 6) return setError("Use a password of at least 6 characters.");
    if (form.password !== form.confirm) return setError("The two passwords do not match.");

    setBusy(true);
    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        role: "admin",
        department: form.department,
      });
      navigate({ to: "/admin" });
    } catch (registrationError) {
      setError(
        registrationError instanceof Error
          ? registrationError.message
          : "Teacher account creation failed. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  };

  const field = (label: string, key: keyof typeof form, type = "text", placeholder = "") => (
    <label className="block">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <input
        type={type}
        value={form[key]}
        onChange={set(key)}
        placeholder={placeholder}
        className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
    </label>
  );

  return (
    <AuthLayout>
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground">
          Create your teacher account
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Faculty members can create accounts to manage examinations and monitor student sessions.
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          {field("Full name", "name", "text", "Dr. Neha Verma")}
          {field("Institution email", "email", "email", "faculty@university.edu")}
          {field("Department", "department", "text", "Department of Computer Science")}
          <div className="grid gap-4 sm:grid-cols-2">
            {field("Password", "password", "password")}
            {field("Confirm password", "confirm", "password")}
          </div>

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
            Create teacher account
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          Already registered?{" "}
          <Link to="/login" className="font-medium text-emerald-700 hover:underline">
            Sign in
          </Link>
        </p>
        <p className="mt-3 text-center text-sm text-muted-foreground">
          Need a student account?{" "}
          <Link to="/register" className="font-medium text-emerald-700 hover:underline">
            Create one here
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

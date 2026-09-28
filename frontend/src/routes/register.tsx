import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { AuthLayout } from "./index";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create a student account — ProctorEdu" },
      {
        name: "description",
        content:
          "Register as a student to take proctored examinations on the ProctorEdu secure exam platform.",
      },
      { property: "og:title", content: "Create a student account — ProctorEdu" },
      {
        property: "og:description",
        content: "Register for proctored university examinations on ProctorEdu.",
      },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    rollNumber: "",
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
    if (!form.name || !form.email || !form.password)
      return setError("Please fill in your name, email and password.");
    if (form.password.length < 6) return setError("Use a password of at least 6 characters.");
    if (form.password !== form.confirm) return setError("The two passwords do not match.");
    setBusy(true);
    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        ...(form.rollNumber ? { rollNumber: form.rollNumber } : {}),
      });
      navigate({ to: "/student" });
    } catch (registrationError) {
      setError(
        registrationError instanceof Error
          ? registrationError.message
          : "Registration failed. Please try again.",
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
      <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-card sm:p-8 lg:mt-0">
        <h1 className="font-display text-2xl font-semibold text-foreground">Create your account</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Students register here. Faculty accounts are issued by the exam office.
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          {field("Full name", "name", "text", "Aarav Mehta")}
          {field("University email", "email", "email", "you@university.edu")}
          {field("Roll number", "rollNumber", "text", "CS21B045")}
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
            Create account
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          Already registered?{" "}
          <Link to="/" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  AudioLines,
  BarChart3,
  BookOpenCheck,
  Check,
  CircleDot,
  FileText,
  Fingerprint,
  LockKeyhole,
  Shield,
  ShieldCheck,
  UsersRound,
  Video,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ProctorEdu | Secure online exams, wherever learning happens" },
      {
        name: "description",
        content:
          "A fairer way to run online exams, with live proctoring, thoughtful behavior analysis and clear reporting.",
      },
      { property: "og:title", content: "ProctorEdu | Secure online exams" },
      {
        property: "og:description",
        content: "Secure, proctored online examinations for universities, students and faculty.",
      },
    ],
  }),
  component: HomePage,
});

const features = [
  {
    icon: Video,
    title: "Live proctoring",
    description: "Monitor exam sessions with camera, audio and presence signals in real time.",
    color: "bg-emerald-100 text-emerald-700",
  },
  {
    icon: Fingerprint,
    title: "Behavior insights",
    description: "Bring unusual activity into view, with clear context for human review.",
    color: "bg-sky-100 text-sky-700",
  },
  {
    icon: BarChart3,
    title: "Useful reporting",
    description: "Review attempts, outcomes and session signals from one organized workspace.",
    color: "bg-amber-100 text-amber-700",
  },
  {
    icon: LockKeyhole,
    title: "Secure by design",
    description: "Keep assessments and student records within a focused exam experience.",
    color: "bg-rose-100 text-rose-700",
  },
];

function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-white text-slate-950">
      <header className="relative z-10 border-b border-emerald-950/5 bg-white/85 backdrop-blur">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-5 px-5 sm:px-8">
          <a
            href="#home"
            className="flex shrink-0 items-center gap-2.5"
            aria-label="ProctorEdu home"
          >
            <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-sm">
              <ShieldCheck className="size-5" />
            </span>
            <span className="font-display text-xl font-bold tracking-tight text-slate-950">
              Proctor<span className="text-emerald-700">Edu</span>
            </span>
          </a>

          <nav
            className="hidden items-center gap-7 text-[13px] font-medium text-slate-600 lg:flex"
            aria-label="Main navigation"
          >
            <a className="text-emerald-700" href="#home">
              Home
            </a>
            <a className="transition hover:text-emerald-700" href="#about">
              About
            </a>
            <a className="transition hover:text-emerald-700" href="#features">
              Features
            </a>
            <a className="transition hover:text-emerald-700" href="#how-it-works">
              How it works
            </a>
            <a className="transition hover:text-emerald-700" href="#institutions">
              For institutions
            </a>
            <a className="transition hover:text-emerald-700" href="#contact">
              Contact
            </a>
          </nav>

          <div className="flex shrink-0 items-center gap-2.5">
            <Link
              to="/login"
              className="hidden rounded-lg border border-emerald-700 px-4 py-2 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-50 sm:inline-flex"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800"
            >
              Get started <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </header>

      <section id="home" className="relative isolate scroll-mt-20">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_75%_20%,rgba(167,243,208,0.45),transparent_42%),linear-gradient(115deg,#f0fdfa_0%,#ffffff_48%,#ecfdf5_100%)]" />
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 pb-14 pt-12 sm:px-8 sm:pt-16 lg:grid-cols-[0.94fr_1.06fr] lg:gap-8 lg:pb-20 lg:pt-20">
          <div id="about" className="scroll-mt-24">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/80 px-3.5 py-1.5 text-xs font-semibold text-emerald-800">
              <Shield className="size-3.5" /> AI-assisted online exam proctoring
            </span>
            <h1 className="mt-6 max-w-2xl font-display text-4xl font-extrabold leading-[1.08] text-slate-950 sm:text-5xl lg:text-[3.65rem]">
              Secure online exams,{" "}
              <span className="text-emerald-700">wherever learning happens.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
              A calmer, clearer way to run remote assessments, with live monitoring, thoughtful
              behavior insights and reports your team can act on.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-700 px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_-12px_rgba(4,120,87,0.7)] transition hover:bg-emerald-800"
              >
                Get started <ArrowRight className="size-4" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-lg border border-emerald-300 bg-white/80 px-5 py-3 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-50"
              >
                Login to dashboard
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-xs font-medium text-slate-600 sm:text-sm">
              <span className="inline-flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <Video className="size-3.5" />
                </span>
                Live monitoring
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <Fingerprint className="size-3.5" />
                </span>
                Behavior insights
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <FileText className="size-3.5" />
                </span>
                Clear reports
              </span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-155 pb-7 pl-2 pr-1 pt-2 sm:px-6 sm:pb-8 sm:pt-5">
            <div className="pointer-events-none absolute inset-8 -z-10 rotate-[-5deg] rounded-[2.5rem] bg-emerald-200/60 blur-2xl" />
            <div className="relative aspect-[1.22/1] overflow-hidden rounded-[1.6rem] border-[5px] border-white bg-emerald-100 shadow-[0_24px_65px_-30px_rgba(15,61,48,0.45)] sm:rounded-[2rem]">
              <img
                src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=85"
                alt="Student focused on a laptop during an online learning session"
                className="size-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-linear-to-t from-slate-950/55 via-transparent to-slate-950/10" />
              <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-slate-950/65 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur sm:bottom-5 sm:left-5">
                <span className="size-2 rounded-full bg-red-400" /> Session in progress
              </div>
              <div className="absolute right-4 top-4 flex size-10 items-center justify-center rounded-full border border-white/50 bg-emerald-600/90 text-white shadow-lg backdrop-blur sm:right-5 sm:top-5 sm:size-12">
                <ShieldCheck className="size-5 sm:size-6" />
              </div>
            </div>

            <div className="absolute left-0 top-[18%] w-[min(48%,205px)] rounded-xl border border-white/80 bg-white/95 p-3 shadow-xl backdrop-blur sm:left-0 sm:p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-900 sm:text-sm">
                  Proctoring status
                </span>
                <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-700">
                  <CircleDot className="size-3 fill-emerald-500 text-emerald-500" /> Live
                </span>
              </div>
              <div className="mt-3 space-y-2.5 text-[10px] text-slate-600 sm:text-xs">
                <span className="flex items-center gap-2">
                  <Check className="size-3.5 text-emerald-600" /> Face presence
                </span>
                <span className="flex items-center gap-2">
                  <Check className="size-3.5 text-emerald-600" /> Screen activity
                </span>
                <span className="flex items-center gap-2">
                  <AudioLines className="size-3.5 text-emerald-600" /> Audio signals
                </span>
              </div>
            </div>

            <div className="absolute bottom-0 right-0 w-[min(48%,210px)] rounded-xl border border-white/80 bg-white/95 p-3 shadow-xl backdrop-blur sm:p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 sm:text-sm">
                <BookOpenCheck className="size-4 text-emerald-700" /> Exam session
              </div>
              <div className="mt-2 flex items-end justify-between gap-2">
                <span className="font-display text-xl font-bold text-emerald-800 sm:text-2xl">
                  In progress
                </span>
                <span className="mb-1 text-[10px] text-slate-500">Responses saved</span>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-emerald-100">
                <div className="h-full w-2/3 rounded-full bg-emerald-500" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="institutions" className="scroll-mt-20 px-5 sm:px-8">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-y-5 rounded-2xl border border-slate-100 bg-slate-50/80 px-5 py-6 sm:grid-cols-4 sm:px-8">
          {[
            { icon: UsersRound, title: "For every cohort", detail: "Student-first exam access" },
            { icon: Video, title: "Live oversight", detail: "Signals while exams run" },
            { icon: FileText, title: "Clear records", detail: "Reviewable session reports" },
            { icon: ShieldCheck, title: "Fair review", detail: "Context before decisions" },
          ].map(({ icon: Icon, title, detail }) => (
            <div
              key={title}
              className="flex items-center gap-3 sm:justify-center sm:border-r sm:border-slate-200 last:sm:border-r-0"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <Icon className="size-5" />
              </span>
              <span>
                <span className="block text-sm font-bold text-slate-900">{title}</span>
                <span className="mt-0.5 block text-xs text-slate-500">{detail}</span>
              </span>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="scroll-mt-20 px-5 pb-16 pt-20 sm:px-8 sm:pb-20 sm:pt-24">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex rounded-full bg-emerald-50 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-emerald-800">
              Made for better assessments
            </span>
            <h2 className="mt-4 font-display text-3xl font-extrabold leading-tight text-slate-950 sm:text-4xl">
              Everything you need for a secure exam
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
              A connected toolkit for exam teams, with a considered experience for students taking
              the test.
            </p>
          </div>
          <div className="mt-9 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {features.map(({ icon: Icon, title, description, color }) => (
              <article
                key={title}
                className="group rounded-xl border border-slate-200/80 bg-white p-5 transition duration-200 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-[0_16px_38px_-24px_rgba(15,61,48,0.28)]"
              >
                <span className={`flex size-11 items-center justify-center rounded-xl ${color}`}>
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-4 font-display text-base font-bold text-slate-950">{title}</h3>
                <p className="mt-2 min-h-12 text-sm leading-5 text-slate-600">{description}</p>
                <a
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800"
                  href="#how-it-works"
                >
                  Learn more{" "}
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        className="scroll-mt-20 border-y border-emerald-100 bg-emerald-50/60 px-5 py-16 sm:px-8 sm:py-20"
      >
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.12em] text-emerald-800">
              A clear process
            </span>
            <h2 className="mt-3 font-display text-3xl font-extrabold leading-tight text-slate-950">
              From exam setup to confident review.
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-6 text-slate-600">
              Keep the exam experience straightforward for students and the review workflow useful
              for faculty.
            </p>
            <a
              href="#contact"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-emerald-800"
            >
              Talk with our team <ArrowRight className="size-4" />
            </a>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { number: "01", title: "Prepare", text: "Set up assessments, questions and access." },
              {
                number: "02",
                title: "Monitor",
                text: "Follow session signals as students take exams.",
              },
              {
                number: "03",
                title: "Review",
                text: "Use clear reports to understand each attempt.",
              },
            ].map((step) => (
              <article
                key={step.number}
                className="rounded-xl border border-emerald-100 bg-white p-5"
              >
                <span className="font-display text-sm font-bold text-emerald-700">
                  {step.number}
                </span>
                <h3 className="mt-4 font-display text-lg font-bold text-slate-950">{step.title}</h3>
                <p className="mt-2 text-sm leading-5 text-slate-600">{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer id="contact" className="scroll-mt-20 px-5 py-8 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <a href="#home" className="flex items-center gap-2 font-display font-bold text-slate-950">
            <ShieldCheck className="size-5 text-emerald-700" /> ProctorEdu
          </a>
          <p className="text-xs text-slate-500">
            Secure, thoughtful online assessment for education.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-800"
          >
            Sign in <ArrowRight className="size-4" />
          </Link>
        </div>
      </footer>
    </main>
  );
}

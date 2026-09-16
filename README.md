# Exam Guardian

Build a modern, professional Online Exam Proctoring System frontend using React + Vite + Tailwind CSS + React Router + Lucide icons + Recharts.

This is frontend-only for now. Use mock data/local state. Do not build backend, database, or real AI models. Keep the code modular and API-ready for a future Node.js/Express + MongoDB + AI service integration.

Design Style

Create a clean, premium EdTech/SaaS UI focused on security, trust, simplicity, and academic professionalism.

Light theme with white/light-gray backgrounds

One primary accent color

Subtle shadows and borders

Modern typography

Rounded cards and buttons

Minimal animations

Responsive desktop/tablet/mobile design

Use green for success, amber for warnings, red only for violations/errors

Avoid excessive gradients, colors, and animations

User Roles

Student

Pages:

Login / Register

Dashboard

My Exams

Exam Details

System Check

Exam Interface

Exam Result

Proctoring Report

Profile

Student dashboard should show upcoming exams, recent results, average score, and exam status.

Admin/Teacher

Pages:

Dashboard

Exams

Create/Edit Exam

Question Bank

Students

Exam Attempts

Results

Proctoring

Analytics

Settings

Admin dashboard should show total students, active/completed exams, flagged attempts, performance charts, and recent proctoring alerts.

Exam Interface

Create a distraction-free exam screen without the normal sidebar.

Include:

Exam title

Countdown timer

Question number/progress

MCQ question and options

Previous/Next buttons

Mark for Review

Question navigator

Answered/unanswered/review states

Submit confirmation modal

Proctoring UI

Add a compact Proctoring Status panel showing:

Camera: Active

Microphone: Active

Face: Detected

Browser: Secure

Monitoring: Active

Create reusable components:

WebcamPreview

ProctoringStatus

ViolationAlert

ViolationTimeline

RiskScore

EvidenceViewer

Use mock proctoring events such as:

Tab switch

Face not detected

Multiple faces

Fullscreen exit

Do not accuse the student of cheating; display these as potential violations.

Admin Proctoring

Create a monitoring/review interface showing:

Student

Exam

Time remaining

Camera/face status

Risk level

Violation timeline

Mock evidence

Risk score

Use risk levels:

Normal / Low / Medium / High

Analytics

Use Recharts for:

Score distribution

Pass rate

Exam performance

Violation distribution

Risk-level distribution

Frontend Structure

Keep components modular:

src/

components/

layouts/

pages/

features/

auth/

student/

admin/

exam/

proctoring/

services/

hooks/

utils/

data/

Create mock authentication with Student/Admin roles and make the service layer ready for future Axios API integration.

The final UI should feel like a production-quality university examination platform with an AI-ready proctoring experience, not a generic dashboard template.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/e990cb3e-ada6-4eda-864f-41e10a898483).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

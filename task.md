# Exam Guardian — Backend Integration Tasks

## Tech Stack

- Frontend: React + Vite + TypeScript + TanStack Query
- Backend: Node.js + Express + TypeScript
- Database: Neon PostgreSQL + Prisma
- Authentication: JWT + bcrypt
- Real-time: Socket.IO
- Storage: AWS S3
- Future AI: Python + FastAPI + OpenCV + MediaPipe + PyTorch + YOLO

---

## 1. Backend Setup

- [ ] Create Express + TypeScript backend
- [ ] Configure environment variables
- [ ] Configure CORS
- [ ] Add centralized error handling
- [ ] Add request validation
- [ ] Configure Prisma + Neon PostgreSQL
- [ ] Create database schema

## 2. Authentication

- [ ] Register API
- [ ] Login API
- [ ] Logout/session handling
- [ ] Get current user API
- [ ] JWT authentication middleware
- [ ] Role-based authorization: Student/Admin
- [ ] Connect existing `authService.ts`

## 3. Users

- [ ] Student profile API
- [ ] Update profile API
- [ ] Admin student list/details API
- [ ] Connect student/admin user pages

## 4. Exams & Questions

- [ ] Create exam
- [ ] Update/delete exam
- [ ] Publish/schedule exam
- [ ] Get exam list/details
- [ ] Create/update/delete questions
- [ ] Question bank API
- [ ] Connect existing `examService.ts`

## 5. Exam Attempts

- [ ] Start exam API
- [ ] Return server-side `startedAt` and `expiresAt`
- [ ] Save answers API
- [ ] Auto-save answers
- [ ] Submit exam API
- [ ] Server-side score calculation
- [ ] Results API

## 6. Proctoring

- [ ] Create proctoring session
- [ ] Record proctoring events
- [ ] Support:
  - `tab_switch`
  - `face_not_detected`
  - `multiple_faces`
  - `fullscreen_exit`
  - `audio_detected`
- [ ] Proctoring history API
- [ ] Admin monitoring/review API
- [ ] Connect existing proctoring UI

## 7. Socket.IO

- [ ] Real-time exam/proctoring connection
- [ ] Send violation events
- [ ] Send exam status updates
- [ ] Update admin monitoring dashboard in real time

## 8. AWS S3

- [ ] Configure secure S3 access on backend
- [ ] Create presigned upload URL API
- [ ] Upload evidence directly from frontend to S3
- [ ] Store S3 object key/metadata in PostgreSQL
- [ ] Connect EvidenceViewer

## 9. Analytics

- [ ] Exam performance API
- [ ] Score distribution
- [ ] Pass/completion rate
- [ ] Violation distribution
- [ ] Risk distribution
- [ ] Connect existing Recharts dashboards

## 10. Frontend Integration

Keep the existing architecture:

Pages
↓
Hooks
↓
Services
↓
Axios
↓
Express API
↓
Prisma
↓
Neon PostgreSQL

- [ ] Add `VITE_API_URL`
- [ ] Keep centralized `apiClient.ts`
- [ ] Replace mock services gradually
- [ ] Use TanStack Query for API state
- [ ] Add loading/error/empty states
- [ ] Remove mock data after verification
- [ ] Do not redesign existing UI

## 11. Security

- [ ] Never expose database credentials
- [ ] Never expose JWT secrets
- [ ] Never expose AWS secret keys
- [ ] Backend validates roles and permissions
- [ ] Backend calculates authoritative scores
- [ ] Never send correct answers during an active exam

## 12. Future AI Integration

Keep AI separate from the main backend:

React
↓
Node/Express
↓
Proctoring Engine
↓
Python/FastAPI
↓
OpenCV / MediaPipe / YOLO / PyTorch

Future AI modules:

- [ ] Face detection
- [ ] Face verification/recognition
- [ ] Gaze/head-pose analysis
- [ ] Multiple-person detection
- [ ] Phone/object detection
- [ ] Behavior analysis
- [ ] AI-assisted risk scoring

Do not implement the AI service during the initial backend integration.

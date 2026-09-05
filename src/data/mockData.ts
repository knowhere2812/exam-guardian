/**
 * Mock data layer. Shapes mirror the future REST API responses so that
 * `src/services/*` can swap `mockData` for Axios calls without UI changes.
 */

export type Role = "student" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  program?: string;
  rollNumber?: string;
  department?: string;
  avatarInitials: string;
  joinedAt: string;
}

export type ExamStatus = "upcoming" | "live" | "completed" | "draft";

export interface Exam {
  id: string;
  title: string;
  code: string;
  subject: string;
  date: string;
  durationMinutes: number;
  totalQuestions: number;
  totalMarks: number;
  passingMarks: number;
  status: ExamStatus;
  proctored: boolean;
  enrolled: number;
  attempted: number;
  instructions: string[];
}

export interface Question {
  id: string;
  examId: string;
  text: string;
  options: string[];
  correctIndex: number;
  marks: number;
  difficulty: "easy" | "medium" | "hard";
  topic: string;
}

export type RiskLevel = "normal" | "low" | "medium" | "high";

export type ViolationType =
  | "tab_switch"
  | "face_not_detected"
  | "multiple_faces"
  | "fullscreen_exit"
  | "audio_detected"
  | "copy_attempt";

export interface ViolationEvent {
  id: string;
  type: ViolationType;
  at: string;
  severity: "low" | "medium" | "high";
  note: string;
  evidence?: { kind: "snapshot" | "log"; label: string; detail: string };
}

export interface Attempt {
  id: string;
  examId: string;
  examTitle: string;
  studentId: string;
  studentName: string;
  submittedAt: string;
  score: number;
  totalMarks: number;
  status: "passed" | "failed" | "in_progress" | "flagged";
  riskScore: number;
  riskLevel: RiskLevel;
  violations: ViolationEvent[];
  timeRemainingMinutes?: number;
  cameraActive?: boolean;
  faceDetected?: boolean;
}

export const violationLabels: Record<ViolationType, string> = {
  tab_switch: "Tab switch detected",
  face_not_detected: "Face not detected",
  multiple_faces: "Multiple faces in frame",
  fullscreen_exit: "Fullscreen exited",
  audio_detected: "Background voice detected",
  copy_attempt: "Copy shortcut used",
};

export const users: User[] = [
  {
    id: "u-1",
    name: "Aarav Mehta",
    email: "student@exam.edu",
    role: "student",
    program: "B.Tech Computer Science",
    rollNumber: "CS21B045",
    avatarInitials: "AM",
    joinedAt: "2023-08-01",
  },
  {
    id: "u-2",
    name: "Dr. Neha Verma",
    email: "admin@exam.edu",
    role: "admin",
    department: "Department of Computer Science",
    avatarInitials: "NV",
    joinedAt: "2019-06-12",
  },
];

export const exams: Exam[] = [
  {
    id: "e-1",
    title: "Data Structures & Algorithms — Mid Term",
    code: "CS201",
    subject: "Computer Science",
    date: "2026-09-08T10:00:00Z",
    durationMinutes: 60,
    totalQuestions: 5,
    totalMarks: 50,
    passingMarks: 20,
    status: "upcoming",
    proctored: true,
    enrolled: 128,
    attempted: 0,
    instructions: [
      "The exam is fully proctored. Camera and microphone must stay enabled.",
      "Do not leave fullscreen or switch tabs during the exam.",
      "Only one person may be visible in the camera frame.",
      "The exam auto-submits when the timer ends.",
    ],
  },
  {
    id: "e-2",
    title: "Operating Systems — Unit Test 2",
    code: "CS305",
    subject: "Computer Science",
    date: "2026-09-05T08:30:00Z",
    durationMinutes: 45,
    totalQuestions: 30,
    totalMarks: 30,
    passingMarks: 12,
    status: "live",
    proctored: true,
    enrolled: 96,
    attempted: 74,
    instructions: [
      "Keep your face centred in the camera frame.",
      "A stable internet connection is required throughout.",
    ],
  },
  {
    id: "e-3",
    title: "Database Management Systems — Final",
    code: "CS304",
    subject: "Computer Science",
    date: "2026-08-22T09:00:00Z",
    durationMinutes: 90,
    totalQuestions: 40,
    totalMarks: 100,
    passingMarks: 40,
    status: "completed",
    proctored: true,
    enrolled: 120,
    attempted: 118,
    instructions: ["Closed book examination."],
  },
  {
    id: "e-4",
    title: "Computer Networks — Quiz 1",
    code: "CS306",
    subject: "Computer Science",
    date: "2026-08-10T11:00:00Z",
    durationMinutes: 30,
    totalQuestions: 20,
    totalMarks: 20,
    passingMarks: 8,
    status: "completed",
    proctored: false,
    enrolled: 110,
    attempted: 107,
    instructions: ["Open notes quiz."],
  },
  {
    id: "e-5",
    title: "Machine Learning — Practice Set",
    code: "CS410",
    subject: "Computer Science",
    date: "2026-09-20T09:30:00Z",
    durationMinutes: 75,
    totalQuestions: 35,
    totalMarks: 70,
    passingMarks: 28,
    status: "draft",
    proctored: true,
    enrolled: 0,
    attempted: 0,
    instructions: [],
  },
];

export const questions: Question[] = [
  {
    id: "q-1",
    examId: "e-1",
    text: "What is the average-case time complexity of searching in a balanced binary search tree with n nodes?",
    options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
    correctIndex: 1,
    marks: 10,
    difficulty: "easy",
    topic: "Trees",
  },
  {
    id: "q-2",
    examId: "e-1",
    text: "Which data structure is most appropriate for implementing an undo feature in a text editor?",
    options: ["Queue", "Stack", "Min-heap", "Hash table"],
    correctIndex: 1,
    marks: 10,
    difficulty: "easy",
    topic: "Stacks & Queues",
  },
  {
    id: "q-3",
    examId: "e-1",
    text: "A hash table uses separate chaining. With n keys and m buckets, what is the expected search cost?",
    options: ["O(n)", "O(m)", "O(1 + n/m)", "O(log m)"],
    correctIndex: 2,
    marks: 10,
    difficulty: "medium",
    topic: "Hashing",
  },
  {
    id: "q-4",
    examId: "e-1",
    text: "Which algorithm finds shortest paths in a graph containing negative edge weights but no negative cycles?",
    options: ["Dijkstra", "Prim", "Bellman-Ford", "Kruskal"],
    correctIndex: 2,
    marks: 10,
    difficulty: "medium",
    topic: "Graphs",
  },
  {
    id: "q-5",
    examId: "e-1",
    text: "What is the worst-case time complexity of quicksort when the pivot is always the smallest element?",
    options: ["O(n log n)", "O(n²)", "O(n)", "O(log n)"],
    correctIndex: 1,
    marks: 10,
    difficulty: "hard",
    topic: "Sorting",
  },
  {
    id: "q-6",
    examId: "e-2",
    text: "Which scheduling policy can cause starvation of long-running processes?",
    options: ["FCFS", "Round Robin", "Shortest Job First", "Multilevel with aging"],
    correctIndex: 2,
    marks: 1,
    difficulty: "medium",
    topic: "Scheduling",
  },
  {
    id: "q-7",
    examId: "e-3",
    text: "A relation in 3NF is guaranteed to have no…",
    options: [
      "Partial dependencies only",
      "Transitive dependencies on the primary key",
      "Multivalued dependencies",
      "Candidate keys",
    ],
    correctIndex: 1,
    marks: 2,
    difficulty: "medium",
    topic: "Normalisation",
  },
];

export const violationSets = {
  "a-1": [
    {
      id: "v-1",
      type: "face_not_detected",
      at: "2026-08-22T09:14:00Z",
      severity: "medium",
      note: "No face in frame for 12 seconds.",
      evidence: { kind: "snapshot", label: "Webcam snapshot 09:14", detail: "Frame captured — empty chair" },
    },
    {
      id: "v-2",
      type: "tab_switch",
      at: "2026-08-22T09:31:00Z",
      severity: "high",
      note: "Exam window lost focus for 8 seconds.",
      evidence: { kind: "log", label: "Focus log 09:31", detail: "visibilitychange → hidden (8.2s)" },
    },
    {
      id: "v-3",
      type: "fullscreen_exit",
      at: "2026-08-22T09:47:00Z",
      severity: "medium",
      note: "Fullscreen mode exited, restored after prompt.",
      evidence: { kind: "log", label: "Browser log 09:47", detail: "fullscreenchange → exited" },
    },
  ],
  "a-2": [
    {
      id: "v-4",
      type: "multiple_faces",
      at: "2026-09-05T08:52:00Z",
      severity: "high",
      note: "Two faces detected in the camera frame.",
      evidence: { kind: "snapshot", label: "Webcam snapshot 08:52", detail: "Second person visible behind candidate" },
    },
    {
      id: "v-5",
      type: "audio_detected",
      at: "2026-09-05T08:58:00Z",
      severity: "medium",
      note: "Sustained background conversation detected.",
      evidence: { kind: "log", label: "Audio log 08:58", detail: "Speech energy above threshold for 15s" },
    },
  ],
  "a-3": [
    {
      id: "v-6",
      type: "tab_switch",
      at: "2026-09-05T08:40:00Z",
      severity: "low",
      note: "Brief window focus loss (2 seconds).",
      evidence: { kind: "log", label: "Focus log 08:40", detail: "visibilitychange → hidden (2.1s)" },
    },
  ],
  "a-4": [],
};

export const attempts: Attempt[] = [
  {
    id: "a-1",
    examId: "e-3",
    examTitle: "Database Management Systems — Final",
    studentId: "u-1",
    studentName: "Aarav Mehta",
    submittedAt: "2026-08-22T10:28:00Z",
    score: 78,
    totalMarks: 100,
    status: "passed",
    riskScore: 46,
    riskLevel: "medium",
    violations: violationSets["a-1"] as ViolationEvent[],
  },
  {
    id: "a-2",
    examId: "e-2",
    examTitle: "Operating Systems — Unit Test 2",
    studentId: "u-3",
    studentName: "Ishita Rao",
    submittedAt: "",
    score: 0,
    totalMarks: 30,
    status: "in_progress",
    riskScore: 81,
    riskLevel: "high",
    violations: violationSets["a-2"] as ViolationEvent[],
    timeRemainingMinutes: 14,
    cameraActive: true,
    faceDetected: true,
  },
  {
    id: "a-3",
    examId: "e-2",
    examTitle: "Operating Systems — Unit Test 2",
    studentId: "u-4",
    studentName: "Rohan Kapoor",
    submittedAt: "",
    score: 0,
    totalMarks: 30,
    status: "in_progress",
    riskScore: 22,
    riskLevel: "low",
    violations: violationSets["a-3"] as ViolationEvent[],
    timeRemainingMinutes: 21,
    cameraActive: true,
    faceDetected: false,
  },
  {
    id: "a-4",
    examId: "e-4",
    examTitle: "Computer Networks — Quiz 1",
    studentId: "u-1",
    studentName: "Aarav Mehta",
    submittedAt: "2026-08-10T11:26:00Z",
    score: 17,
    totalMarks: 20,
    status: "passed",
    riskScore: 6,
    riskLevel: "normal",
    violations: [],
  },
  {
    id: "a-5",
    examId: "e-4",
    examTitle: "Computer Networks — Quiz 1",
    studentId: "u-5",
    studentName: "Meera Nair",
    submittedAt: "2026-08-10T11:24:00Z",
    score: 9,
    totalMarks: 20,
    status: "failed",
    riskScore: 34,
    riskLevel: "low",
    violations: violationSets["a-3"] as ViolationEvent[],
  },
  {
    id: "a-6",
    examId: "e-3",
    examTitle: "Database Management Systems — Final",
    studentId: "u-6",
    studentName: "Kabir Shah",
    submittedAt: "2026-08-22T10:31:00Z",
    score: 64,
    totalMarks: 100,
    status: "flagged",
    riskScore: 72,
    riskLevel: "high",
    violations: violationSets["a-2"] as ViolationEvent[],
  },
];

export interface StudentRecord {
  id: string;
  name: string;
  email: string;
  rollNumber: string;
  program: string;
  examsTaken: number;
  averageScore: number;
  flags: number;
  status: "active" | "inactive";
}

export const studentRecords: StudentRecord[] = [
  { id: "u-1", name: "Aarav Mehta", email: "aarav.m@exam.edu", rollNumber: "CS21B045", program: "B.Tech CSE", examsTaken: 12, averageScore: 82, flags: 1, status: "active" },
  { id: "u-3", name: "Ishita Rao", email: "ishita.r@exam.edu", rollNumber: "CS21B012", program: "B.Tech CSE", examsTaken: 11, averageScore: 74, flags: 3, status: "active" },
  { id: "u-4", name: "Rohan Kapoor", email: "rohan.k@exam.edu", rollNumber: "CS21B088", program: "B.Tech CSE", examsTaken: 12, averageScore: 68, flags: 1, status: "active" },
  { id: "u-5", name: "Meera Nair", email: "meera.n@exam.edu", rollNumber: "CS21B023", program: "B.Tech CSE", examsTaken: 10, averageScore: 59, flags: 0, status: "active" },
  { id: "u-6", name: "Kabir Shah", email: "kabir.s@exam.edu", rollNumber: "CS21B070", program: "B.Tech CSE", examsTaken: 12, averageScore: 71, flags: 2, status: "inactive" },
  { id: "u-7", name: "Sara Iyer", email: "sara.i@exam.edu", rollNumber: "CS21B031", program: "B.Tech CSE", examsTaken: 12, averageScore: 89, flags: 0, status: "active" },
];

export const analytics = {
  scoreDistribution: [
    { band: "0-20", students: 4 },
    { band: "21-40", students: 11 },
    { band: "41-60", students: 28 },
    { band: "61-80", students: 46 },
    { band: "81-100", students: 33 },
  ],
  passRate: [
    { month: "Apr", rate: 74 },
    { month: "May", rate: 79 },
    { month: "Jun", rate: 71 },
    { month: "Jul", rate: 83 },
    { month: "Aug", rate: 86 },
    { month: "Sep", rate: 88 },
  ],
  examPerformance: [
    { exam: "CS201", average: 68, highest: 94 },
    { exam: "CS304", average: 72, highest: 97 },
    { exam: "CS305", average: 61, highest: 89 },
    { exam: "CS306", average: 79, highest: 100 },
    { exam: "CS410", average: 66, highest: 92 },
  ],
  violationDistribution: [
    { type: "Tab switch", count: 42 },
    { type: "Face not detected", count: 31 },
    { type: "Multiple faces", count: 12 },
    { type: "Fullscreen exit", count: 24 },
    { type: "Background voice", count: 18 },
  ],
  riskDistribution: [
    { level: "Normal", count: 148 },
    { level: "Low", count: 52 },
    { level: "Medium", count: 21 },
    { level: "High", count: 9 },
  ],
};

export const liveAlerts = [
  { id: "al-1", student: "Ishita Rao", exam: "CS305", type: "multiple_faces" as ViolationType, at: "2 min ago", severity: "high" as const },
  { id: "al-2", student: "Rohan Kapoor", exam: "CS305", type: "face_not_detected" as ViolationType, at: "6 min ago", severity: "medium" as const },
  { id: "al-3", student: "Meera Nair", exam: "CS305", type: "tab_switch" as ViolationType, at: "11 min ago", severity: "low" as const },
  { id: "al-4", student: "Kabir Shah", exam: "CS305", type: "fullscreen_exit" as ViolationType, at: "18 min ago", severity: "medium" as const },
];

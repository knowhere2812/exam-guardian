import type { RiskLevel } from "@/data/mockData";

export function formatDate(iso: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export function formatDateTime(iso: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatTime(iso: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

export function formatClock(totalSeconds: number) {
  const s = Math.max(0, totalSeconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`;
}

export function percentage(score: number, total: number) {
  if (!total) return 0;
  return Math.round((score / total) * 100);
}

export function riskLevelFromScore(score: number): RiskLevel {
  if (score >= 70) return "high";
  if (score >= 40) return "medium";
  if (score >= 15) return "low";
  return "normal";
}

export const riskCopy: Record<RiskLevel, { label: string; tone: string; text: string }> = {
  normal: { label: "Normal", tone: "bg-success-soft border-success/30", text: "text-success" },
  low: { label: "Low", tone: "bg-primary-soft border-primary/25", text: "text-primary" },
  medium: { label: "Medium", tone: "bg-warning-soft border-warning/35", text: "text-warning-foreground" },
  high: { label: "High", tone: "bg-danger-soft border-destructive/30", text: "text-destructive" },
};

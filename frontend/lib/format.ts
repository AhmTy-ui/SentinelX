import type { RiskLevel } from "./types";

export const RISK_META: Record<
  RiskLevel,
  { color: string; bg: string; border: string; text: string; label: string }
> = {
  SAFE: {
    color: "var(--color-safe)",
    bg: "rgba(46,204,113,0.12)",
    border: "rgba(46,204,113,0.4)",
    text: "#7ee2a8",
    label: "Safe",
  },
  CAUTION: {
    color: "var(--color-caution)",
    bg: "rgba(201,209,31,0.12)",
    border: "rgba(201,209,31,0.4)",
    text: "#e2e87a",
    label: "Caution",
  },
  WARNING: {
    color: "var(--color-warning)",
    bg: "rgba(245,166,35,0.12)",
    border: "rgba(245,166,35,0.4)",
    text: "#fac974",
    label: "Warning",
  },
  "HIGH RISK": {
    color: "var(--color-danger)",
    bg: "rgba(255,77,79,0.12)",
    border: "rgba(255,77,79,0.45)",
    text: "#ff8a8b",
    label: "High Risk",
  },
  MALICIOUS: {
    color: "var(--color-malicious)",
    bg: "rgba(255,45,85,0.15)",
    border: "rgba(255,45,85,0.5)",
    text: "#ff7a96",
    label: "Malicious",
  },
};

export function riskMeta(level: RiskLevel) {
  return RISK_META[level] ?? RISK_META.SAFE;
}

export function shortAddr(addr: string, lead = 6, tail = 4) {
  if (!addr) return "";
  if (addr.length <= lead + tail) return addr;
  return `${addr.slice(0, lead)}…${addr.slice(-tail)}`;
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.max(0, Math.floor(diff / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export function fmtNum(n: number): string {
  return n.toLocaleString("en-US");
}

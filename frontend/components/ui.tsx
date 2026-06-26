import type { ReactNode } from "react";
import type { RiskLevel } from "@/lib/types";
import { riskMeta } from "@/lib/format";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`card p-5 ${className}`}>{children}</div>;
}

export function SectionTitle({
  children,
  sub,
  right,
}: {
  children: ReactNode;
  sub?: ReactNode;
  right?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-ink-muted">
          {children}
        </h2>
        {sub && <p className="mt-1 text-xs text-ink-faint">{sub}</p>}
      </div>
      {right}
    </div>
  );
}

export function RiskBadge({
  level,
  size = "md",
}: {
  level: RiskLevel;
  size?: "sm" | "md";
}) {
  const m = riskMeta(level);
  const pad = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold uppercase tracking-wide ${pad}`}
      style={{ background: m.bg, color: m.text, border: `1px solid ${m.border}` }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: m.color }}
      />
      {level}
    </span>
  );
}

export function ChainBadge({ chain }: { chain: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-border bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-ink-muted">
      <span className="h-1.5 w-1.5 rounded-full bg-brand-bright" />
      {chain}
    </span>
  );
}

export function ConfidenceMeter({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-surface-3">
        <div
          className="h-full rounded-full"
          style={{
            width: `${value}%`,
            background:
              "linear-gradient(90deg, var(--color-brand-dim), var(--color-brand-bright))",
          }}
        />
      </div>
      <span className="font-mono text-[11px] text-ink-muted">{value}%</span>
    </div>
  );
}

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "outline" | "danger";
}) {
  const variants: Record<string, string> = {
    primary:
      "bg-brand text-white hover:bg-brand-bright border border-transparent shadow-[0_8px_24px_-12px_rgba(47,129,247,0.8)]",
    ghost: "text-ink-muted hover:text-ink hover:bg-surface-2 border border-transparent",
    outline:
      "border border-border-strong text-ink hover:border-brand hover:text-brand-bright bg-transparent",
    danger:
      "border border-[rgba(255,77,79,0.4)] text-[#ff8a8b] hover:bg-[rgba(255,77,79,0.12)] bg-transparent",
  };
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Spinner({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
    />
  );
}

export function EmptyState({
  title,
  hint,
  icon,
}: {
  title: string;
  hint?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border py-14 text-center">
      {icon && <div className="text-ink-faint">{icon}</div>}
      <p className="text-sm font-medium text-ink-muted">{title}</p>
      {hint && <p className="max-w-sm text-xs text-ink-faint">{hint}</p>}
    </div>
  );
}

export function Stat({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  accent?: string;
}) {
  return (
    <div className="card-2 p-4">
      <p className="text-[11px] uppercase tracking-wider text-ink-faint">{label}</p>
      <p
        className="mt-2 font-mono text-2xl font-semibold"
        style={accent ? { color: accent } : undefined}
      >
        {value}
      </p>
      {sub && <p className="mt-1 text-xs text-ink-muted">{sub}</p>}
    </div>
  );
}

export function Pill({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: "default" | "brand" | "success" | "danger";
}) {
  const tones: Record<string, string> = {
    default: "border-border bg-surface-2 text-ink-muted",
    brand: "border-[rgba(47,129,247,0.4)] bg-[rgba(47,129,247,0.12)] text-brand-bright",
    success: "border-[rgba(46,204,113,0.4)] bg-[rgba(46,204,113,0.12)] text-[#7ee2a8]",
    danger: "border-[rgba(255,77,79,0.4)] bg-[rgba(255,77,79,0.12)] text-[#ff8a8b]",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
